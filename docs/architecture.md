# Smart Farm CCTV Alert System — Architecture

## System Overview

Cloud-based CCTV monitoring and batch notification system for Mahidol Smart Farm.  
**No PC needs to stay online.** The entire automation runs on Google Apps Script + Supabase.

**Active cameras:** CCTV2, CCTV3  
**Batch window:** 5 minutes (configurable)

---

## Data Flow

```
Hi-View NVR (CCTV2 / CCTV3)
        ↓
    Motion event triggered
        ↓
  Email (JPEG snapshot attached)
        ↓
    Gmail (apsun.0144@gmail.com)
        ↓
  Google Apps Script (runs every 1 min)
        ↓
  ┌─────────────────────────────┐
  │  Parse camera from XML      │
  │  <Input1>2</Input1>         │
  │  Parse event time           │
  │  Find snapshot attachment   │
  │  Assign to 5-min batch      │
  │  Check batch is complete    │
  │  Select newest snapshot     │
  └─────────────────────────────┘
        ↓
  Supabase Storage (PRIMARY)
  cctv-snapshots bucket
        ↓  (fallback if Supabase fails)
  GitHub raw.githubusercontent.com
        ↓
  HTTPS public image URL
        ↓
  LINE Messaging API (Push)
        ↓
  LINE Official Account (@732fdynz)
        ↓
  LINE Group
```

---

## Batch Window Logic

The system processes emails in **5-minute non-overlapping windows**.

```
Current time: 22:06
Active batch:  22:05–22:10  ← NEVER processed (not yet complete)
Target batch:  22:00–22:05  ← PROCESSED (completed)
```

**Batch key formula:**
```
bucket = floor(unix_timestamp_ms / batch_window_ms)
```

**Example:**

| Event time | Batch window |
|---|---|
| 22:01 | 22:00–22:05 |
| 22:03 | 22:00–22:05 |
| 22:04 | 22:00–22:05 |
| 22:06 | 22:05–22:10 |

If CCTV2 has 8 events and CCTV3 has 5 events in 22:00–22:05:  
→ **ONE LINE notification only** (newest snapshot selected)

---

## Camera Detection

The NVR embeds camera information in the email body as XML:

```xml
<Input1>2</Input1>   ← CCTV2
<Input1>3</Input1>   ← CCTV3
```

Rules:
- If `<Input1>` is missing → skip email, log warning
- If camera number is not 2 or 3 → skip email, log warning
- If attachment is BMP or unsupported → skip attachment, log warning, continue

---

## Image Selection (MVP)

For each completed batch, the **newest** valid snapshot is selected.  
On timestamp tie, the **largest file** (likely highest resolution) is preferred.

Future options (not implemented):
- AI confidence scoring
- Image quality scoring
- Person detection
- Camera priority weighting

---

## Supabase Storage

**Bucket:** `cctv-snapshots`  
**Mode:** Public (TEST) → Private + signed URLs (Production)

**Path structure:**
```
cctv-snapshots/
  YYYY/MM/DD/CCTV{N}/YYYYMMDD_HHmmss.jpg
```

**Public URL:**
```
https://<ref>.supabase.co/storage/v1/object/public/cctv-snapshots/<path>
```

---

## Idempotency

Each NVR email has a unique Gmail message ID.  
The `cctv_events.email_message_id` column has a **UNIQUE constraint**.

If the same email is processed twice:
- The second insert will fail with a unique constraint violation
- The system logs the error and skips without sending LINE
- No duplicate LINE notifications are sent

The `LAST_SENT_BUCKET` Script Property provides a secondary guard:  
- If `targetBucket <= lastProcessed`, the batch is skipped immediately

---

## Error Handling

The system never crashes on a single bad email.

| Error | Behavior |
|---|---|
| Missing `<Input1>` XML | Log + skip email |
| Camera not 2 or 3 | Log + skip email |
| Unsupported image format | Log `Unsupported image format: <filename>` + skip attachment |
| Supabase upload error | Log warning + try GitHub fallback |
| GitHub fallback error | Log error + skip LINE notification |
| LINE token error | Log error + stop |
| LINE push error | Log error |
| Missing Script Property | Throw immediately (fail loud) |

---

## Security Model

| Component | Secret | Storage |
|---|---|---|
| Supabase service_role | `SUPABASE_SERVICE_ROLE_KEY` | Apps Script Script Properties only |
| LINE Channel Secret | `LINE_CHANNEL_SECRET` | Apps Script Script Properties only |
| GitHub token | `GITHUB_TOKEN` | Apps Script Script Properties only |
| Supabase anon key | Not used by Apps Script | N/A |
| Frontend (Lovable) | No Supabase Storage access | N/A |

**Rule:** No secrets in source code or GitHub repository.

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ Complete | Supabase Storage bucket + SQL migration + Code.gs update |
| 2 | ⬜ Next | Verify LINE receives Supabase image URL |
| 3 | ⬜ | Read real NVR email, parse camera + timestamp + attachment |
| 4 | ⬜ | Full Gmail → Supabase upload + cctv_events logging |
| 5 | ⬜ | Supabase → LINE batch notification |
| 6 | ⬜ | Full automation: 1-min trigger, idempotency, error handling |
