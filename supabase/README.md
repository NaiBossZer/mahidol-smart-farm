# Supabase — Smart Farm CCTV

## Storage Bucket

| Bucket | Type | Purpose |
|---|---|---|
| `cctv-snapshots` | Public (TEST) | Stores CCTV snapshot images from NVR |

### Path Format

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

Test uploads are stored under:
```
cctv-snapshots/test/YYYY/MM/DD/CCTV{N}/YYYYMMDD_HHmmss.jpg
```

### Public URL Format

```
https://<project-ref>.supabase.co/storage/v1/object/public/cctv-snapshots/<path>
```

---

## Database Migrations

| File | Description |
|---|---|
| `migrations/20260922_cctv_events.sql` | Creates `cctv_events` table |

### How to Apply

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of the migration file
3. Click **Run**
4. Verify the table appears in **Table Editor → cctv_events**

---

## Table: cctv_events

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `camera_id` | INTEGER | 2 or 3 (CCTV2 / CCTV3) |
| `event_type` | TEXT | From NVR email `<EventType>` |
| `event_time` | TIMESTAMPTZ | Time of the NVR event |
| `batch_start` | TIMESTAMPTZ | Start of 5-minute batch window |
| `batch_end` | TIMESTAMPTZ | End of 5-minute batch window |
| `snapshot_path` | TEXT | Path inside `cctv-snapshots` bucket |
| `snapshot_url` | TEXT | Full public HTTPS URL |
| `email_message_id` | TEXT | Gmail message ID — **unique** (idempotency) |
| `notification_status` | ENUM | `pending / sent / failed / skipped` |
| `notification_error` | TEXT | Error message if status = `failed` |
| `processed_at` | TIMESTAMPTZ | When Apps Script processed this event |
| `created_at` | TIMESTAMPTZ | Row creation time |

### Row Level Security

- RLS is **enabled**
- No public write policy
- `service_role` bypasses RLS (used by Apps Script)
- Authenticated users can **read** (for dashboard/monitoring)

---

## Security Notes

- The `service_role` key is stored only in Apps Script Script Properties
- It is **never** committed to GitHub or exposed to the frontend
- The Lovable frontend (`src/`) does NOT have access to Supabase Storage or `cctv_events`
