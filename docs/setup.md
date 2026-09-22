# Smart Farm CCTV Alert System — Setup Guide

## Prerequisites

- Supabase project (already connected)
- Google Apps Script project (already connected to Gmail)
- LINE Official Account (@732fdynz) with Messaging API enabled
- GitHub repository: `NaiBossZer/mahidol-smart-farm`

---

## PHASE 1 — Supabase Storage Setup

### Step 1: Create the `cctv-snapshots` bucket

1. Open your Supabase project
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Enter name: `cctv-snapshots`
5. Toggle **Public bucket** → **ON** *(TEST MODE — see security note)*
6. Click **Create bucket**

> **⚠️ TEST MODE**: Public bucket means anyone with the URL can view the image.  
> This matches the existing GitHub approach. Switch to private for production.

---

### Step 2: Run the SQL Migration

1. Open your Supabase project → **SQL Editor**
2. Click **New query**
3. Open the file: `supabase/migrations/20260922_cctv_events.sql`
4. Copy all contents and paste into the SQL Editor
5. Click **Run**
6. Go to **Table Editor** → verify `cctv_events` table appears

---

### Step 3: Collect Your Supabase Credentials

1. Go to Supabase → **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **service_role** key (under "Project API keys" → reveal)

> **Security**: The service_role key bypasses Row Level Security.  
> Store it ONLY in Apps Script Script Properties. Never paste it in code.

---

### Step 4: Add Script Properties in Apps Script

1. Open your Google Apps Script project
2. Go to **Project Settings** (gear icon) → **Script Properties**
3. Click **Add property** and add:

| Property | Value |
|---|---|
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |

> All other existing properties (`GMAIL_QUERY_FROM`, `LINE_CHANNEL_ID`, etc.) remain unchanged.

---

### Step 5: Update Code.gs

1. Open your Google Apps Script project
2. Replace the entire contents of `Code.gs` with the file at:  
   `automation/gmail-line/Code.gs`
3. Click **Save** (Ctrl+S)

---

### Step 6: Run `testSupabaseUpload()`

1. In the Apps Script editor, select function: `testSupabaseUpload`
2. Click **Run**
3. Check the **Execution log**

**Expected output:**
```
=== TEST MODE: testSupabaseUpload() ===
[TEST] Uploading to path: test/2026/09/22/CCTV2/20260922_220000.jpg
=== SUPABASE UPLOAD OK ===
Public URL: https://abcdefgh.supabase.co/storage/v1/object/public/cctv-snapshots/test/2026/09/22/CCTV2/20260922_220000.jpg
Open this URL in a browser to verify the image is accessible.
========================
```

4. Copy the URL and open it in a browser → CCTV image should appear ✅

---

## PHASE 2 — LINE Image Test

### Step 7: Run `testSendLatestImageToLine()`

1. In the Apps Script editor, select function: `testSendLatestImageToLine`
2. Click **Run**
3. Check your LINE group for the message

**Expected LINE message:**
```
🚨 SMART FARM TEST

กล้อง: CCTV2
เหตุการณ์: NVR Event
เวลา: 2026-09-22 22:00:00
[SUPABASE]
```
Followed by the CCTV snapshot image.

---

## PHASE 6 — Install Automation Trigger

Once all phases are verified, install the 1-minute trigger:

1. In Apps Script editor, select function: `installTrigger`
2. Click **Run**
3. Go to **Triggers** (clock icon) → verify `processNvrSnapshots` appears with "Every minute"

---

## Script Properties Reference

| Property | Required | Description |
|---|---|---|
| `GMAIL_QUERY_FROM` | ✅ | NVR sender email |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service_role key |
| `LINE_CHANNEL_ID` | ✅ | LINE OAuth Channel ID |
| `LINE_CHANNEL_SECRET` | ✅ | LINE OAuth Channel Secret |
| `LINE_GROUP_ID` | ✅ | Target LINE Group ID |
| `BATCH_MINUTES` | ✅ | `5` (default) |
| `TIMEZONE` | ✅ | `Asia/Bangkok` |
| `GITHUB_TOKEN` | ⬜ Optional | GitHub token for fallback upload |
| `GITHUB_OWNER` | ⬜ Optional | `NaiBossZer` |
| `GITHUB_REPO` | ⬜ Optional | `mahidol-smart-farm` |
| `GITHUB_BRANCH` | ⬜ Optional | `main` |
