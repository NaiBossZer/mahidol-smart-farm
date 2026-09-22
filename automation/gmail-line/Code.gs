/**
 * Smart Farm: Gmail (NVR Snapshot) → Supabase Storage → LINE Group
 * V2: Supabase Storage PRIMARY upload; GitHub fallback.
 * CCTV2 and CCTV3 only. One LINE alert per completed 5-minute window.
 *
 * ─── Script Properties ───────────────────────────────────────────────
 * GMAIL_QUERY_FROM        NVR sender email (e.g. apsun.0144@gmail.com)
 * SUPABASE_URL            https://<project-ref>.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY  service_role key (server-side only)
 * GITHUB_TOKEN            Fine-grained token, Contents: Read+Write (fallback)
 * GITHUB_OWNER            NaiBossZer
 * GITHUB_REPO             mahidol-smart-farm
 * GITHUB_BRANCH           main
 * LINE_CHANNEL_ID         LINE OAuth Channel ID
 * LINE_CHANNEL_SECRET     LINE OAuth Channel Secret
 * LINE_GROUP_ID           Target LINE Group ID
 * BATCH_MINUTES           5
 * TIMEZONE                Asia/Bangkok
 * ─────────────────────────────────────────────────────────────────────
 */

// ─── Configuration ────────────────────────────────────────────────────
const CFG = {
  cameras: [2, 3],
  defaultBatchMinutes: 5,
  supabaseBucket: "cctv-snapshots",
  supabaseStoragePath: "/storage/v1/object",
  githubApi: "https://api.github.com",
  lineTokenUrl: "https://api.line.me/oauth2/v3/token",
  linePushUrl: "https://api.line.me/v2/bot/message/push",
};

// ─── Web app health check ─────────────────────────────────────────────
function doGet() {
  return ContentService.createTextOutput("SMART FARM GMAIL LINE OK v2");
}

// ─── Main entry point (runs every 1 minute via trigger) ───────────────
function processNvrSnapshots() {
  const props = PropertiesService.getScriptProperties();
  const batchMinutes = Number(props.getProperty("BATCH_MINUTES") || CFG.defaultBatchMinutes);
  const tz = props.getProperty("TIMEZONE") || Session.getScriptTimeZone() || "Asia/Bangkok";

  const now = new Date();
  const bucketMs = batchMinutes * 60 * 1000;
  const currentBucket = Math.floor(now.getTime() / bucketMs);
  const targetBucket = currentBucket - 1; // Only process COMPLETED batches

  const lastProcessed = Number(props.getProperty("LAST_SENT_BUCKET") || "-1");
  if (targetBucket <= lastProcessed) {
    console.log("Batch " + targetBucket + " already processed. Skipping.");
    return;
  }

  const start = new Date(targetBucket * bucketMs);
  const end   = new Date((targetBucket + 1) * bucketMs);

  const candidate = findBestSnapshot(start, end);

  // Always mark batch as processed to prevent re-processing
  props.setProperty("LAST_SENT_BUCKET", String(targetBucket));

  if (!candidate) {
    console.log("[BATCH] No supported snapshot for " + formatDate(start, tz) + " – " + formatDate(end, tz));
    return;
  }

  // ── Upload: Supabase primary, GitHub fallback ──────────────────────
  let imageUrl = null;
  let uploadedTo = null;
  let cctvEventId = null;

  const storagePath = makeSupabasePath(candidate.camera, candidate.date, candidate.filename);

  try {
    const supabase = uploadImageToSupabase(candidate.attachment, storagePath);
    imageUrl   = supabase.publicUrl;
    uploadedTo = "supabase";
    console.log("[UPLOAD] Supabase OK: " + imageUrl);
  } catch (supabaseErr) {
    console.warn("[UPLOAD] Supabase failed: " + supabaseErr.message + " — falling back to GitHub");
    try {
      const github = uploadImageToGitHub(candidate.attachment, candidate.filename);
      imageUrl   = github.publicUrl;
      uploadedTo = "github";
      console.log("[UPLOAD] GitHub fallback OK: " + imageUrl);
    } catch (githubErr) {
      console.error("[UPLOAD] GitHub fallback also failed: " + githubErr.message);
      return; // Cannot send LINE without an image URL
    }
  }

  // ── Record event in Supabase ──────────────────────────────────────
  try {
    cctvEventId = insertCctvEvent({
      cameraId: candidate.camera,
      eventType: candidate.eventType || "NVR Event",
      eventTime: candidate.date,
      batchStart: start,
      batchEnd: end,
      snapshotPath: storagePath,
      snapshotUrl: imageUrl,
      emailMessageId: candidate.messageId
    });
    console.log("[DB] cctv_events INSERT OK: " + cctvEventId);
  } catch (dbErr) {
    console.error("[DB] cctv_events INSERT failed: " + dbErr.message);
    return;
  }

  // ── LINE notification ──────────────────────────────────────────────
  const text =
    "🚨 SMART FARM ALERT\n\n" +
    "กล้อง: CCTV" + candidate.camera + "\n" +
    "เหตุการณ์: " + (candidate.eventType || "NVR Event") + "\n" +
    "เวลา: " + formatDate(candidate.date, tz) + "\n" +
    "ช่วงเวลา: " + formatDate(start, tz) + " – " + formatDate(end, tz) + "\n" +
    "[" + uploadedTo.toUpperCase() + "]";

  try {
    sendLineTextAndImage(text, imageUrl);
    if (cctvEventId) updateCctvEventStatus(cctvEventId, "sent", null);
  } catch (lineErr) {
    console.error("[LINE] Push failed: " + lineErr.message);
    if (cctvEventId) updateCctvEventStatus(cctvEventId, "failed", lineErr.message);
    return;
  }

  console.log(JSON.stringify({
    batch: targetBucket,
    camera: candidate.camera,
    eventType: candidate.eventType,
    emailDate: candidate.date.toISOString(),
    filename: candidate.filename,
    imageUrl: imageUrl,
    uploadedTo: uploadedTo
  }));
}

// ─── Test Functions ───────────────────────────────────────────────────

/**
 * TEST MODE: Upload ONE snapshot to Supabase only.
 * Does NOT send LINE. Opens the URL in the log — paste it in a browser to verify.
 *
 * Run this in Apps Script editor to verify PHASE 1.
 */
function testSupabaseUpload() {
  console.log("=== TEST MODE: testSupabaseUpload() ===");

  const now   = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000); // Last 1 hour
  const candidate = findBestSnapshot(start, now);

  if (!candidate) {
    throw new Error("ไม่พบภาพ JPG/JPEG/PNG จาก CCTV2/CCTV3 ใน 1 ชั่วโมงล่าสุด");
  }

  const storagePath = "test/" + makeSupabasePath(candidate.camera, candidate.date, candidate.filename);
  console.log("[TEST] Uploading to path: " + storagePath);

  const result = uploadImageToSupabase(candidate.attachment, storagePath);

  console.log("=== SUPABASE UPLOAD OK ===");
  console.log("Public URL: " + result.publicUrl);
  console.log("Open this URL in a browser to verify the image is accessible.");
  console.log("========================");

  return result.publicUrl;
}

/**
 * TEST MODE: Find latest snapshot and send text + image to LINE.
 * Uses Supabase primary, GitHub fallback.
 */
function testSendLatestImageToLine() {
  const now   = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  const candidate = findBestSnapshot(start, now);

  if (!candidate) {
    throw new Error("ไม่พบภาพ JPG/JPEG/PNG จาก CCTV2/CCTV3 ใน 1 ชั่วโมงล่าสุด");
  }

  const tz = PropertiesService.getScriptProperties().getProperty("TIMEZONE") ||
             Session.getScriptTimeZone() || "Asia/Bangkok";

  let imageUrl;
  let uploadedTo;

  const storagePath = "test/" + makeSupabasePath(candidate.camera, candidate.date, candidate.filename);

  try {
    const r = uploadImageToSupabase(candidate.attachment, storagePath);
    imageUrl   = r.publicUrl;
    uploadedTo = "supabase";
    console.log("[TEST] Supabase upload OK: " + imageUrl);
  } catch (e) {
    console.warn("[TEST] Supabase failed: " + e.message + " — using GitHub fallback");
    const r = uploadImageToGitHub(candidate.attachment, "TEST_" + candidate.filename);
    imageUrl   = r.publicUrl;
    uploadedTo = "github";
  }

  const text =
    "🚨 SMART FARM TEST\n\n" +
    "กล้อง: CCTV" + candidate.camera + "\n" +
    "เหตุการณ์: " + (candidate.eventType || "NVR Event") + "\n" +
    "เวลา: " + formatDate(candidate.date, tz) + "\n" +
    "[" + uploadedTo.toUpperCase() + "]";

  sendLineTextAndImage(text, imageUrl);
  console.log("TEST SENT: " + imageUrl);
}

// ─── Trigger installer ────────────────────────────────────────────────
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

  console.log("Installed 1-minute trigger for processNvrSnapshots.");
}

// ─── Snapshot finder ──────────────────────────────────────────────────
function findBestSnapshot(start, end) {
  const props  = PropertiesService.getScriptProperties();
  const sender = requireProperty(props, "GMAIL_QUERY_FROM");
  const query  = "from:" + sender + " has:attachment newer_than:1h";
  const threads = GmailApp.search(query, 0, 100);

  let best = null;

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(message) {
      const date = message.getDate();
      if (date < start || date >= end) return;

      const body = message.getPlainBody() || "";

      // ── Camera detection (XML-based) ──────────────────────────────
      const cameraMatch = body.match(/<Input1>\s*([0-9]+)\s*<\/Input1>/i);
      if (!cameraMatch) {
        console.log("[SKIP] Cannot identify camera in email from " + date.toISOString() + ". Skipping.");
        return;
      }

      const camera = Number(cameraMatch[1]);
      if (CFG.cameras.indexOf(camera) === -1) {
        console.log("[SKIP] Camera " + camera + " not in scope (only CCTV2/CCTV3). Skipping.");
        return;
      }

      const eventMatch = body.match(/<EventType>\s*([^<]+?)\s*<\/EventType>/i);
      const eventType  = eventMatch ? eventMatch[1].trim() : "";

      const attachments = message.getAttachments({
        includeInlineImages: false,
        includeAttachments: true
      });

      attachments.forEach(function(attachment) {
        const mime = String(attachment.getContentType() || "").toLowerCase();
        const name = String(attachment.getName() || "").toLowerCase();

        const supported =
          mime === "image/jpeg" ||
          mime === "image/jpg"  ||
          mime === "image/png"  ||
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg")||
          name.endsWith(".png");

        if (!supported) {
          console.log("[WARN] Unsupported image format: " + attachment.getName() + " (type: " + mime + "). Skipping.");
          return;
        }

        const candidate = {
          camera:         camera,
          eventType:      eventType,
          date:           date,
          attachment:     attachment.copyBlob(),
          attachmentSize: Number(attachment.getSize() || 0),
          filename:       makeFilename(camera, date, name),
          messageId:       message.getId()
        };

        // Select newest; on tie, prefer largest file (likely higher quality)
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

// ─── Supabase Storage upload ──────────────────────────────────────────
/**
 * Upload blob to Supabase Storage via REST API.
 * Uses service_role key stored in Script Properties (server-side only).
 *
 * @param {GoogleAppsScript.Base.Blob} blob  Image blob
 * @param {string} storagePath               Path inside bucket, e.g. "2026/09/22/CCTV2/20260922_220000.jpg"
 * @returns {{ publicUrl: string }}
 */
function uploadImageToSupabase(blob, storagePath) {
  const props      = PropertiesService.getScriptProperties();
  const baseUrl    = requireProperty(props, "SUPABASE_URL").replace(/\/$/, "");
  const serviceKey = requireProperty(props, "SUPABASE_SERVICE_ROLE_KEY");

  const url = baseUrl + CFG.supabaseStoragePath + "/" + CFG.supabaseBucket + "/" + storagePath;

  const contentType = blob.getContentType() || "image/jpeg";

  const response = UrlFetchApp.fetch(url, {
    method: "PUT",
    contentType: contentType,
    headers: {
      "Authorization": "Bearer " + serviceKey,
      "x-upsert": "true"   // overwrite if same path exists (idempotent re-uploads)
    },
    payload: blob.getBytes(),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200 && code !== 201) {
    throw new Error("Supabase upload failed: HTTP " + code + " — " + body);
  }

  // Build public URL
  const publicUrl = baseUrl + "/storage/v1/object/public/" + CFG.supabaseBucket + "/" + storagePath;

  return { publicUrl: publicUrl };
}

// ─── GitHub Storage upload (fallback) ────────────────────────────────
function uploadImageToGitHub(blob, filename) {
  const props  = PropertiesService.getScriptProperties();
  const token  = requireProperty(props, "GITHUB_TOKEN");
  const owner  = requireProperty(props, "GITHUB_OWNER");
  const repo   = requireProperty(props, "GITHUB_REPO");
  const branch = props.getProperty("GITHUB_BRANCH") || "main";

  const safeFilename = filename.replace(/[^A-Za-z0-9_.-]/g, "_");
  const path         = "snapshots/" + safeFilename;
  const apiUrl       = CFG.githubApi + "/repos/" + encodeURIComponent(owner) +
                       "/" + encodeURIComponent(repo) + "/contents/" + path;

  const payload = {
    message: "smart-farm: add " + safeFilename,
    branch:  branch,
    content: Utilities.base64Encode(blob.getBytes())
  };

  const response = UrlFetchApp.fetch(apiUrl, {
    method:      "put",
    contentType: "application/json",
    headers: {
      Accept:               "application/vnd.github+json",
      Authorization:        "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28"
    },
    payload:           JSON.stringify(payload),
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

// ─── LINE messaging ───────────────────────────────────────────────────
function sendLineTextAndImage(text, imageUrl) {
  const token   = issueStatelessLineToken();
  const groupId = requireProperty(PropertiesService.getScriptProperties(), "LINE_GROUP_ID");

  const payload = {
    to: groupId,
    messages: [
      { type: "text",  text: text },
      { type: "image", originalContentUrl: imageUrl, previewImageUrl: imageUrl }
    ]
  };

  const response = UrlFetchApp.fetch(CFG.linePushUrl, {
    method:      "post",
    contentType: "application/json",
    headers:     { Authorization: "Bearer " + token },
    payload:     JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200) {
    throw new Error("LINE push failed: HTTP " + code + " " + body);
  }

  console.log("[LINE] Push OK");
}

function issueStatelessLineToken() {
  const props        = PropertiesService.getScriptProperties();
  const channelId    = requireProperty(props, "LINE_CHANNEL_ID");
  const channelSecret = requireProperty(props, "LINE_CHANNEL_SECRET");

  const response = UrlFetchApp.fetch(CFG.lineTokenUrl, {
    method:      "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type:    "client_credentials",
      client_id:     channelId,
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

// ─── Helpers ──────────────────────────────────────────────────────────
function makeFilename(camera, date, originalName) {
  const tz = PropertiesService.getScriptProperties().getProperty("TIMEZONE") ||
             Session.getScriptTimeZone() || "Asia/Bangkok";
  const ext = String(originalName).toLowerCase().endsWith(".png") ? ".png" : ".jpg";
  return "CCTV" + camera + "_" + Utilities.formatDate(date, tz, "yyyyMMdd_HHmmss") + ext;
}

/**
 * Build Supabase Storage path: YYYY/MM/DD/CCTV{N}/YYYYMMDD_HHmmss.jpg
 */
function makeSupabasePath(camera, date, filename) {
  const tz   = PropertiesService.getScriptProperties().getProperty("TIMEZONE") ||
               Session.getScriptTimeZone() || "Asia/Bangkok";
  const yyyy = Utilities.formatDate(date, tz, "yyyy");
  const mm   = Utilities.formatDate(date, tz, "MM");
  const dd   = Utilities.formatDate(date, tz, "dd");
  const ext  = filename.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
  const ts   = Utilities.formatDate(date, tz, "yyyyMMdd_HHmmss");

  return yyyy + "/" + mm + "/" + dd + "/CCTV" + camera + "/" + ts + ext;
}

function requireProperty(props, name) {
  const value = props.getProperty(name);
  if (!value) throw new Error("Missing Script Property: " + name);
  return value;
}

function formatDate(date, timezone) {
  return Utilities.formatDate(date, timezone, "yyyy-MM-dd HH:mm:ss");
}


// ─── cctv_events persistence ─────────────────────────────────────────
function insertCctvEvent(data) {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = requireProperty(props, "SUPABASE_URL").replace(/\\/$/, "");
  const serviceKey = requireProperty(props, "SUPABASE_SERVICE_ROLE_KEY");

  const payload = {
    camera_id: data.cameraId,
    event_type: data.eventType || null,
    event_time: data.eventTime ? data.eventTime.toISOString() : null,
    batch_start: data.batchStart ? data.batchStart.toISOString() : null,
    batch_end: data.batchEnd ? data.batchEnd.toISOString() : null,
    snapshot_path: data.snapshotPath || null,
    snapshot_url: data.snapshotUrl || null,
    email_message_id: data.emailMessageId || null,
    processed_at: null,
    notification_status: "pending"
  };

  const response = UrlFetchApp.fetch(baseUrl + "/rest/v1/cctv_events", {
    method: "post",
    contentType: "application/json",
    headers: {
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
      Prefer: "return=representation"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error("cctv_events insert failed: HTTP " + code + " " + body);
  }

  const rows = JSON.parse(body);
  if (!rows || !rows.length || !rows[0].id) {
    throw new Error("cctv_events insert returned no id");
  }
  return rows[0].id;
}

function updateCctvEventStatus(eventId, status, errorMessage) {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = requireProperty(props, "SUPABASE_URL").replace(/\\/$/, "");
  const serviceKey = requireProperty(props, "SUPABASE_SERVICE_ROLE_KEY");

  const payload = {
    notification_status: status,
    notification_error: errorMessage || null,
    processed_at: new Date().toISOString()
  };

  const response = UrlFetchApp.fetch(
    baseUrl + "/rest/v1/cctv_events?id=eq." + encodeURIComponent(eventId),
    {
      method: "patch",
      contentType: "application/json",
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
        Prefer: "return=minimal"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    }
  );

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    console.error("[DB] cctv_events status update failed: HTTP " + code + " " + response.getContentText());
  } else {
    console.log("[DB] cctv_events status: " + status);
  }
}

function testInsertCctvEvent() {
  const now = new Date();
  const id = insertCctvEvent({
    cameraId: 2,
    eventType: "TEST",
    eventTime: now,
    batchStart: new Date(now.getTime() - 5 * 60 * 1000),
    batchEnd: now,
    snapshotPath: "test/smart-farm-test.txt",
    snapshotUrl: "https://rdnbodadxvvykfrxmeqn.supabase.co/storage/v1/object/public/cctv-snapshots/test/smart-farm-test.txt",
    emailMessageId: "TEST-" + now.getTime()
  });
  updateCctvEventStatus(id, "sent", null);
  console.log("=== CCTV EVENT TEST OK ===");
  console.log("Event ID: " + id);
  return id;
}
