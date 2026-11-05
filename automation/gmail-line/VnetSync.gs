/**
 * Smart Farm: V-NET2.0 API connector
 * Separate module; does not modify or call the Gmail → CCTV → LINE workflow.
 *
 * Required Script Properties (set in Apps Script > Project Settings):
 *   VNET_API_ALIAS       Third-party account alias issued by WECON
 *   VNET_PASSWORD_MD5    MD5 hash of the third-party account password (32 hex chars)
 *   VNET_API_BASE        Optional; defaults to ASEAN endpoint
 *
 * Start with testVnetConnection() after WECON approves the third-party account
 * and binds both HMI devices. This module intentionally does not create triggers
 * or poll continuously; API quota is 10,000 requests/month.
 */

var VNET_CFG = {
  baseUrl: "https://api.asean.v-iec.com/m16/",
  key: "5cee621329f24e5cbdc43daa959ce9a1",
  common: {
    cuid: "123456789",
    sv: "1.0",
    mt: "255",
    lan: "zh",
    pid: "1",
    dap: ""
  },
  sessionProperty: "VNET_SESSION_ID",
  sessionExpiryProperty: "VNET_SESSION_EXPIRES_AT"
};

/**
 * Safe setup check. Does not display secrets.
 */
function checkVnetConfiguration() {
  var props = PropertiesService.getScriptProperties();
  var alias = props.getProperty("VNET_API_ALIAS");
  var passwordMd5 = props.getProperty("VNET_PASSWORD_MD5");
  if (!alias || !passwordMd5) {
    throw new Error("Set VNET_API_ALIAS and VNET_PASSWORD_MD5 in Script Properties first.");
  }
  if (!/^[a-f0-9]{32}$/i.test(passwordMd5)) {
    throw new Error("VNET_PASSWORD_MD5 must be a 32-character MD5 hex string.");
  }
  var base = props.getProperty("VNET_API_BASE") || VNET_CFG.baseUrl;
  if (!/^https:\/\//i.test(base)) throw new Error("VNET_API_BASE must use HTTPS.");
  console.log("V-NET configuration OK. Alias is present; password is not logged.");
  return { configured: true, apiBase: base };
}

/**
 * First connection test: login, retrieve device list, log only safe device metadata.
 * No sensor values are fetched and no Supabase rows are written.
 */
function testVnetConnection() {
  checkVnetConfiguration();
  var login = vnetLogin_();
  var listResponse = vnetRequest_("we-data/device/getList", {}, login.sid);
  var devices = vnetExtractList_(listResponse.result);
  console.log("WECON API login: OK");
  console.log("Device-list response count: " + devices.length);
  devices.forEach(function(d, i) {
    console.log(JSON.stringify({
      index: i,
      id: d.id || d.boxId || null,
      machineCode: d.machineCode || d.code || null,
      name: d.name || d.deviceName || null,
      model: d.model || null,
      state: d.state === undefined ? null : d.state,
      type: d.type === undefined ? null : d.type
    }));
  });
  console.log("Do not share credentials or session IDs. Share only the sanitized device metadata.");
  return { ok: true, deviceCount: devices.length };
}

/**
 * WECON login. Password property must already be MD5(password).
 * Session ID is cached for at most 11h 50m (WECON validity: 12h).
 */
function vnetLogin_() {
  var props = PropertiesService.getScriptProperties();
  var alias = props.getProperty("VNET_API_ALIAS");
  var passwordMd5 = props.getProperty("VNET_PASSWORD_MD5");
  if (!alias || !passwordMd5) throw new Error("Missing WECON credentials in Script Properties.");

  var cachedSid = props.getProperty(VNET_CFG.sessionProperty);
  var expiresAt = Number(props.getProperty(VNET_CFG.sessionExpiryProperty) || 0);
  if (cachedSid && Date.now() < expiresAt) return { sid: cachedSid };

  var result = vnetRequest_("we-data/sign/login", {
    alias: alias,
    password: passwordMd5
  }, null);

  var sid = result && result.result && result.result.sid;
  if (!sid) throw new Error("WECON login response did not contain result.sid.");
  props.setProperty(VNET_CFG.sessionProperty, sid);
  props.setProperty(VNET_CFG.sessionExpiryProperty, String(Date.now() + 11 * 60 * 60 * 1000 + 50 * 60 * 1000));
  return { sid: sid };
}

/**
 * Signed WECON request. The wcommon header carries the signed common parameters.
 */
function vnetRequest_(acturl, businessParams, sid) {
  var props = PropertiesService.getScriptProperties();
  var base = (props.getProperty("VNET_API_BASE") || VNET_CFG.baseUrl).replace(/\/$/, "") + "/";
  var ts = String(Date.now());
  var common = {};
  Object.keys(VNET_CFG.common).forEach(function(k) {
    if (k !== "dap") common[k] = VNET_CFG.common[k];
  });
  common.ts = ts;
  if (sid) common.sid = sid;

  var signParams = {};
  Object.keys(common).forEach(function(k) { signParams[k] = String(common[k]); });
  Object.keys(businessParams || {}).forEach(function(k) {
    signParams[k] = String(businessParams[k]);
  });

  var keys = Object.keys(signParams).sort();
  var signText = keys.map(function(k) {
    return k + "=" + signParams[k];
  }).join("&") + "&key=" + VNET_CFG.key;
  var sign = vnetMd5_(signText);

  var wcommon = {
    dap: "",
    cuid: common.cuid,
    sv: common.sv,
    mt: common.mt,
    lan: common.lan,
    sign: sign,
    pid: common.pid,
    ts: Number(ts)
  };
  if (sid) wcommon.sid = sid;

  var response = UrlFetchApp.fetch(base + acturl, {
    method: "post",
    contentType: "application/json",
    headers: { wcommon: JSON.stringify(wcommon) },
    payload: JSON.stringify(businessParams || {}),
    muteHttpExceptions: true
  });

  var httpCode = response.getResponseCode();
  var body = response.getContentText();
  if (httpCode < 200 || httpCode >= 300) {
    throw new Error("WECON HTTP " + httpCode + " for " + acturl + ": " + body.substring(0, 500));
  }

  var parsed;
  try { parsed = JSON.parse(body); }
  catch (e) { throw new Error("WECON returned non-JSON for " + acturl); }

  if (String(parsed.code) !== "200") {
    if (String(parsed.code).toLowerCase().indexOf("session") >= 0 ||
        String(parsed.msg || "").toLowerCase().indexOf("session") >= 0) {
      props.deleteProperty(VNET_CFG.sessionProperty);
      props.deleteProperty(VNET_CFG.sessionExpiryProperty);
    }
    throw new Error("WECON API error for " + acturl + ": code=" + parsed.code + ", msg=" + (parsed.msg || "unknown"));
  }
  return parsed;
}

function vnetMd5_(value) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    value,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");
}

function vnetExtractList_(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.list)) return result.list;
  if (Array.isArray(result.deviceList)) return result.deviceList;
  return [];
}

/**
 * Clear cached session after password reset or permission changes.
 */
function resetVnetSession() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty(VNET_CFG.sessionProperty);
  props.deleteProperty(VNET_CFG.sessionExpiryProperty);
  console.log("Cached V-NET session cleared.");
}
