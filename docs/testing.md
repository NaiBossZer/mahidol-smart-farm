# Smart Farm CCTV Alert System — Testing Guide

---

## PHASE 1 — Supabase Storage Test

### Function: `testSupabaseUpload()`

**What it does:**
- Searches Gmail for the newest CCTV2/CCTV3 snapshot in the last 1 hour
- Uploads it to `cctv-snapshots/test/...` in Supabase Storage
- Logs the public URL
- Does **NOT** send LINE

**Expected log:**
```
=== TEST MODE: testSupabaseUpload() ===
[TEST] Uploading to path: test/2026/09/22/CCTV2/20260922_220000.jpg
=== SUPABASE UPLOAD OK ===
Public URL: https://abcdefgh.supabase.co/storage/v1/object/public/cctv-snapshots/test/...
Open this URL in a browser to verify the image is accessible.
========================
```

**Verification:**
- ✅ Log shows `SUPABASE UPLOAD OK`
- ✅ URL is accessible in a browser and shows the CCTV image
- ✅ File appears in Supabase → Storage → `cctv-snapshots` → `test/` folder

---

## PHASE 2 — LINE Image Test

### Function: `testSendLatestImageToLine()`

**What it does:**
- Same as PHASE 1 but also sends text + image to the configured LINE group

**Expected log:**
```
[TEST] Supabase upload OK: https://...
[LINE] Push OK
TEST SENT: https://...
```

**Expected LINE message:**
```
🚨 SMART FARM TEST

กล้อง: CCTV2
เหตุการณ์: NVR Event
เวลา: 2026-09-22 22:00:00
[SUPABASE]
```
Followed by the CCTV snapshot image.

**Verification:**
- ✅ LINE group receives the message with the image
- ✅ Image is visible in LINE (not broken)
- ✅ `[SUPABASE]` tag confirms Supabase URL was used (not GitHub fallback)

---

## PHASE 5/6 — Batch Processing Test

### Function: `processNvrSnapshots()` (manual run)

**What it does:**
- Processes the last completed 5-minute batch
- Selects newest snapshot from CCTV2/CCTV3 emails in that window
- Uploads to Supabase → sends ONE LINE notification

**Expected log:**
```
[UPLOAD] Supabase OK: https://...
[LINE] Push OK
{"batch":..., "camera":2, "eventType":"...", "emailDate":"...", "filename":"...", "imageUrl":"...", "uploadedTo":"supabase"}
```

**Verification:**
- ✅ Only ONE LINE notification per 5-minute window
- ✅ Running `processNvrSnapshots()` again immediately → no duplicate notification
- ✅ `LAST_SENT_BUCKET` Script Property is updated

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Missing Script Property: SUPABASE_URL` | Property not set | Add `SUPABASE_URL` in Script Properties |
| `Supabase upload failed: HTTP 401` | Wrong service_role key | Check `SUPABASE_SERVICE_ROLE_KEY` value |
| `Supabase upload failed: HTTP 400` | Bucket doesn't exist | Create `cctv-snapshots` bucket in Supabase Storage |
| `GitHub upload failed: HTTP 422` | File already exists in GitHub at same path | Normal for re-uploads; the upsert on Supabase avoids this |
| `LINE push failed: HTTP 401` | Wrong Channel ID or Secret | Check `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` |
| `LINE push failed: HTTP 400` | Wrong Group ID | Check `LINE_GROUP_ID` |
| `LINE image not displayed` | Image URL is not publicly accessible | Verify Supabase bucket is PUBLIC; open URL in browser |
| `ไม่พบภาพ JPG/JPEG/PNG` | No NVR emails in last 1 hour | Wait for an NVR trigger or use an email from the last hour |
| `[SKIP] Cannot identify camera` | `<Input1>` XML not found in NVR email | Check actual NVR email body format |
| `Unsupported image format: file.bmp` | NVR sent BMP | Normal log warning; configure NVR to send JPEG if possible |
| Trigger fires but nothing happens | `LAST_SENT_BUCKET` stuck | Delete that Script Property or wait for next batch window |

---

## Log Level Reference

| Prefix | Meaning |
|---|---|
| `[BATCH]` | Batch window processing decision |
| `[UPLOAD]` | Supabase or GitHub upload result |
| `[LINE]` | LINE notification result |
| `[SKIP]` | Email or attachment intentionally skipped |
| `[WARN]` | Non-fatal warning (fallback triggered) |
| `[TEST]` | TEST MODE function output |
