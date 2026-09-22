/**
 * Smart Farm: Gmail (NVR Snapshot) -> GitHub public image -> LINE Group
 * V1: CCTV2 and CCTV3 only; one LINE alert per completed 5-minute window.
 *
 * Script Properties:
 * GMAIL_QUERY_FROM
 * GITHUB_TOKEN
 * GITHUB_OWNER
 * GITHUB_REPO
 * GITHUB_BRANCH
 * LINE_CHANNEL_ID
 * LINE_CHANNEL_SECRET
 * LINE_GROUP_ID
 * BATCH_MINUTES
 * TIMEZONE
 */

const CFG = {
  cameras: [2, 3],
  defaultBatchMinutes: 5,
  githubApi: "https://api.github.com",
  lineTokenUrl: "https://api.line.me/oauth2/v3/token",
  linePushUrl: "https://api.line.me/v2/bot/message/push",
};

function doGet() {
  return ContentService.createTextOutput("SMART FARM GMAIL LINE OK");
}

function processNvrSnapshots() {
  const props = PropertiesService.getScriptProperties();
  const batchMinutes = Number(props.getProperty("BATCH_MINUTES") || CFG.defaultBatchMinutes);
  const tz = props.getProperty("TIMEZONE") || Session.getScriptTimeZone() || "Asia/Bangkok";

  const now = new Date();
  const bucketMs = batchMinutes * 60 * 1000;
  const currentBucket = Math.floor(now.getTime() / bucketMs);
  const targetBucket = currentBucket - 1;

  const lastProcessed = Number(props.getProperty("LAST_SENT_BUCKET") || "-1");
  if (targetBucket <= lastProcessed) return;

  const start = new Date(targetBucket * bucketMs);
  const end = new Date((targetBucket + 1) * bucketMs);
  const candidate = findBestSnapshot(start, end);

  props.setProperty("LAST_SENT_BUCKET", String(targetBucket));

  if (!candidate) {
    console.log("No supported snapshot for " + formatDate(start, tz) + " - " + formatDate(end, tz));
    return;
  }

  const github = uploadImageToGitHub(candidate.attachment, candidate.filename);

  const text =
    "🚨 SMART FARM ALERT\n\n" +
    "กล้อง: CCTV" + candidate.camera + "\n" +
    "เหตุการณ์: " + (candidate.eventType || "NVR Event") + "\n" +
    "เวลา: " + formatDate(candidate.date, tz) + "\n" +
    "ช่วงเวลา: " + formatDate(start, tz) + " - " + formatDate(end, tz);

  sendLineTextAndImage(text, github.publicUrl);

  console.log(JSON.stringify({
    bucket: targetBucket,
    camera: candidate.camera,
    eventType: candidate.eventType,
    emailDate: candidate.date.toISOString(),
    filename: candidate.filename,
    publicUrl: github.publicUrl
  }));
}

function testSendLatestImageToLine() {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  const candidate = findBestSnapshot(start, now);

  if (!candidate) {
    throw new Error("ไม่พบภาพ JPG/JPEG/PNG จาก CCTV2/CCTV3 ใน 1 ชั่วโมงล่าสุด");
  }

  const github = uploadImageToGitHub(candidate.attachment, "TEST_" + candidate.filename);
  const tz = PropertiesService.getScriptProperties().getProperty("TIMEZONE") ||
             Session.getScriptTimeZone() || "Asia/Bangkok";

  const text =
    "🚨 SMART FARM TEST\n\n" +
    "กล้อง: CCTV" + candidate.camera + "\n" +
    "เหตุการณ์: " + (candidate.eventType || "NVR Event") + "\n" +
    "เวลา: " + formatDate(candidate.date, tz);

  sendLineTextAndImage(text, github.publicUrl);
  console.log("TEST SENT: " + github.publicUrl);
}

function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "processNvrSnapshots") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("processNvrSnapshots")
    .timeBased()
    .everyMinutes(1)
    .create();

  console.log("Installed 1-minute trigger.");
}

function findBestSnapshot(start, end) {
  const props = PropertiesService.getScriptProperties();
  const sender = requireProperty(props, "GMAIL_QUERY_FROM");
  const query = "from:" + sender + " has:attachment newer_than:1h";
  const threads = GmailApp.search(query, 0, 100);

  let best = null;

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(message) {
      const date = message.getDate();
      if (date < start || date >= end) return;

      const body = message.getPlainBody() || "";
      const cameraMatch = body.match(/<Input1>\s*([0-9]+)\s*<\/Input1>/i);
      if (!cameraMatch) return;

      const camera = Number(cameraMatch[1]);
      if (CFG.cameras.indexOf(camera) === -1) return;

      const eventMatch = body.match(/<EventType>\s*([^<]+?)\s*<\/EventType>/i);
      const eventType = eventMatch ? eventMatch[1].trim() : "";

      const attachments = message.getAttachments({
        includeInlineImages: false,
        includeAttachments: true
      });

      attachments.forEach(function(attachment) {
        const mime = String(attachment.getContentType() || "").toLowerCase();
        const name = String(attachment.getName() || "").toLowerCase();

        const supported =
          mime === "image/jpeg" ||
          mime === "image/jpg" ||
          mime === "image/png" ||
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png");

        if (!supported) return;

        const candidate = {
          camera: camera,
          eventType: eventType,
          date: date,
          attachment: attachment.copyBlob(),
          attachmentSize: Number(attachment.getSize() || 0),
          filename: makeFilename(camera, date, name)
        };

        if (!best ||
            candidate.date.getTime() > best.date.getTime() ||
            (candidate.date.getTime() === best.date.getTime() &&
             candidate.attachmentSize > best.attachmentSize)) {
          best = candidate;
        }
      });
    });
  });

  return best;
}

function makeFilename(camera, date, originalName) {
  const tz = PropertiesService.getScriptProperties().getProperty("TIMEZONE") ||
             Session.getScriptTimeZone() || "Asia/Bangkok";
  let extension = ".jpg";
  if (String(originalName).toLowerCase().endsWith(".png")) extension = ".png";

  return "CCTV" + camera + "_" +
         Utilities.formatDate(date, tz, "yyyyMMdd_HHmmss") +
         extension;
}

function uploadImageToGitHub(blob, filename) {
  const props = PropertiesService.getScriptProperties();
  const token = requireProperty(props, "GITHUB_TOKEN");
  const owner = requireProperty(props, "GITHUB_OWNER");
  const repo = requireProperty(props, "GITHUB_REPO");
  const branch = props.getProperty("GITHUB_BRANCH") || "main";

  const safeFilename = filename.replace(/[^A-Za-z0-9_.-]/g, "_");
  const path = "snapshots/" + safeFilename;
  const apiUrl = CFG.githubApi + "/repos/" + encodeURIComponent(owner) +
                 "/" + encodeURIComponent(repo) + "/contents/" + path;

  const payload = {
    message: "smart-farm: add " + safeFilename,
    branch: branch,
    content: Utilities.base64Encode(blob.getBytes())
  };

  const response = UrlFetchApp.fetch(apiUrl, {
    method: "put",
    contentType: "application/json",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200 && code !== 201) {
    throw new Error("GitHub upload failed: HTTP " + code + " " + body);
  }

  return {
    publicUrl: "https://raw.githubusercontent.com/" +
               owner + "/" + repo + "/" + branch + "/" + path
  };
}

function sendLineTextAndImage(text, imageUrl) {
  const token = issueStatelessLineToken();
  const groupId = requireProperty(PropertiesService.getScriptProperties(), "LINE_GROUP_ID");

  const payload = {
    to: groupId,
    messages: [
      { type: "text", text: text },
      { type: "image", originalContentUrl: imageUrl, previewImageUrl: imageUrl }
    ]
  };

  const response = UrlFetchApp.fetch(CFG.linePushUrl, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200) {
    throw new Error("LINE push failed: HTTP " + code + " " + body);
  }

  console.log("LINE push OK");
}

function issueStatelessLineToken() {
  const props = PropertiesService.getScriptProperties();
  const channelId = requireProperty(props, "LINE_CHANNEL_ID");
  const channelSecret = requireProperty(props, "LINE_CHANNEL_SECRET");

  const response = UrlFetchApp.fetch(CFG.lineTokenUrl, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "client_credentials",
      client_id: channelId,
      client_secret: channelSecret
    },
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200) {
    throw new Error("LINE token issue failed: HTTP " + code + " " + body);
  }

  const data = JSON.parse(body);
  if (!data.access_token) throw new Error("LINE token response missing access_token");
  return data.access_token;
}

function requireProperty(props, name) {
  const value = props.getProperty(name);
  if (!value) throw new Error("Missing Script Property: " + name);
  return value;
}

function formatDate(date, timezone) {
  return Utilities.formatDate(date, timezone, "yyyy-MM-dd HH:mm:ss");
}
