# Smart Farm: Gmail → Supabase Storage → LINE

**V2** — Supabase Storage primary; GitHub fallback.

- CCTV2 and CCTV3 only
- Gmail is the NVR trigger
- One LINE alert per completed 5-minute window
- The newest supported JPG/JPEG/PNG snapshot in that window is selected
- Snapshot is uploaded to **Supabase Storage** (primary)
- If Supabase fails, falls back to GitHub (`raw.githubusercontent.com`)
- LINE receives one text + one image per batch

---

## Script Properties

Set these in **Apps Script → Project Settings → Script Properties**:

| Property | Description | Example |
|---|---|---|
| `GMAIL_QUERY_FROM` | NVR sender email | `apsun.0144@gmail.com` |
| `SUPABASE_URL` | Supabase project URL | `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server-side only) | `eyJhbGci...` |
| `GITHUB_TOKEN` | GitHub fine-grained token (fallback) | `github_pat_...` |
| `GITHUB_OWNER` | GitHub username | `NaiBossZer` |
| `GITHUB_REPO` | Repository name | `mahidol-smart-farm` |
| `GITHUB_BRANCH` | Branch | `main` |
| `LINE_CHANNEL_ID` | LINE Messaging API Channel ID | `2007...` |
| `LINE_CHANNEL_SECRET` | LINE Channel Secret | `abc123...` |
| `LINE_GROUP_ID` | Target LINE Group ID | `C0123...` |
| `BATCH_MINUTES` | Batch window size in minutes | `5` |
| `TIMEZONE` | Timezone string | `Asia/Bangkok` |

> **Security**: `SUPABASE_SERVICE_ROLE_KEY` and `LINE_CHANNEL_SECRET` are stored only in Apps Script Script Properties.  
> They are **never** committed to GitHub.

---

## Test Functions

### PHASE 1 — Supabase Storage Test

```
testSupabaseUpload()
```

Finds the newest CCTV2/CCTV3 snapshot from the last hour, uploads it to `cctv-snapshots/test/...` in Supabase, and logs the public URL.  
**Does NOT send LINE.** Open the URL in a browser to verify.

### PHASE 2 — LINE Image Test

```
testSendLatestImageToLine()
```

Same as PHASE 1, but also sends the text + image to your LINE group.

---

## Supabase Storage Path Format

```
cctv-snapshots/
  YYYY/
    MM/
      DD/
        CCTV2/
          YYYYMMDD_HHmmss.jpg
        CCTV3/
          YYYYMMDD_HHmmss.jpg
```

Test uploads go to:
```
cctv-snapshots/test/YYYY/MM/DD/CCTV{N}/YYYYMMDD_HHmmss.jpg
```

Public URL format:
```
https://<project-ref>.supabase.co/storage/v1/object/public/cctv-snapshots/<path>
```

---

## Gmail Requirements

The NVR email body must contain:

```xml
<Input1>2</Input1>
```
or
```xml
<Input1>3</Input1>
```

and an attached JPEG/JPG/PNG file.

If a BMP or unsupported format is attached, it is **skipped with a log entry** — other supported images in the same email are still processed.

---

## Automation Trigger

Run `installTrigger()` once. This installs a 1-minute time-based trigger for `processNvrSnapshots()`.

Each execution:
1. Calculates the last completed 5-minute batch window
2. Skips if already processed (`LAST_SENT_BUCKET` property)
3. Searches Gmail for NVR emails in that window
4. Parses camera from `<Input1>` XML
5. Selects the newest supported snapshot
6. Uploads to Supabase (or GitHub fallback)
7. Sends one LINE text + image message

---

## Upload Priority

```
Supabase Storage (primary)
    ↓ fails
GitHub raw.githubusercontent.com (fallback)
    ↓ also fails
Skip LINE notification, log error
```

---

## Privacy Note

The `cctv-snapshots` bucket is **PUBLIC** in TEST MODE.  
Any person with the URL can view the CCTV image.

For production: switch to a private bucket and generate signed URLs before sending to LINE.
