# V-NET2.0 → Apps Script setup

This connector is intentionally isolated in `VnetSync.gs`. Do not replace or rename `Code.gs`; the Gmail → CCTV → Supabase Storage → LINE workflow remains unchanged.

## 1. Request WECON Third-party API access

1. Sign in to V-NET2.0.
2. Open **User management → Third-party account management**.
3. Select **Apply for a third-party account**, complete the application and submit.
4. Check **Application Records** until approved.
5. In the third-party account list, open **Device management** and bind both HMI devices:
   - `HMI_PI8043_MU_LAMPANG_1`
   - `HMI_PI8043_MU_LAMPANG_2`
6. Confirm the account is enabled and check its monthly quota.

WECON documents a default free allowance of 10,000 API requests/month. Do not enable 20-second polling for this daily analytics use case.

## 2. Add credentials to Apps Script (never commit them)

Open the Apps Script project used by the existing CCTV automation. Add the new `VnetSync.gs` file from this repository, keeping the existing `Code.gs` intact.

In **Project Settings → Script Properties**, add:

| Property | Value |
|---|---|
| `VNET_API_ALIAS` | Third-party account alias issued by WECON |
| `VNET_PASSWORD_MD5` | MD5 hash of the third-party account password (32 hex characters) |
| `VNET_API_BASE` | Optional; leave unset for the ASEAN endpoint |

Do not paste passwords, hashes, API tokens, session IDs, or service-role keys into GitHub issues, source files, or chat. The existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` properties are reused server-side by the existing project; do not expose the service-role key in browser code.

## 3. Run the first connection test

After WECON approval and device binding:

1. Run `checkVnetConfiguration()`.
2. Run `testVnetConnection()` and approve the Google permissions prompt.
3. Inspect the Apps Script execution log. It should show a successful login and a sanitized device list.
4. Share only the two devices' returned `id` / `machineCode` / `name` / `model` / `state` fields for the next mapping step. Do not share credentials or the session ID.

This first test only logs in and lists devices. It does not fetch sensor values, write to Supabase, control HMI outputs, or install any time trigger.

## 4. Next integration stage

Once the actual device-list response is verified, map the returned box/device IDs to the two HMI names, then inspect each HMI's real-time groups and tag configuration. Only then implement a quota-budgeted daily historical-data sync and upsert into `farm_devices`, `farm_sensor_tags`, `farm_sensor_readings`, and `farm_sync_runs`.

No sensor readings are fabricated. The dashboard remains in its waiting-for-data state until verified readings are ingested.
