# Smart Farm: Gmail -> GitHub Snapshot -> LINE

V1:
- CCTV2 and CCTV3 only
- Gmail is the NVR trigger
- One LINE alert per completed 5-minute window
- The newest supported JPG/JPEG/PNG snapshot in that window is selected
- Snapshot is uploaded to this public GitHub repository
- LINE receives one text + one image

## Important privacy note

The repository `NaiBossZer/mahidol-smart-farm` is currently public. Because LINE Image Messages need a public HTTPS URL, the uploaded snapshots are publicly accessible through `raw.githubusercontent.com`.

Do not use this design for sensitive/private camera images unless public exposure is acceptable.

## Apps Script Script Properties

Set these in Apps Script -> Project Settings -> Script properties:

- GMAIL_QUERY_FROM = the NVR sender email
- GITHUB_TOKEN = fine-grained GitHub token with Contents: Read and write on this repository only
- GITHUB_OWNER = NaiBossZer
- GITHUB_REPO = mahidol-smart-farm
- GITHUB_BRANCH = main
- LINE_CHANNEL_ID = your Channel ID
- LINE_CHANNEL_SECRET = your Channel Secret
- LINE_GROUP_ID = your LINE Group ID
- BATCH_MINUTES = 5
- TIMEZONE = Asia/Bangkok

Do not store any of these secrets in GitHub.

## Test

Copy `Code.gs` into the Apps Script project and save.

Run:

`testSendLatestImageToLine`

This finds the newest supported snapshot from CCTV2/CCTV3 in the last hour, uploads it to GitHub, and sends it to the configured LINE group.

After that, run:

`installTrigger`

The automatic job is `processNvrSnapshots`, scheduled every minute.

## Gmail requirements

The NVR email body must contain:

`<Input1>2</Input1>` or `<Input1>3</Input1>`

and an attached JPEG/JPG/PNG.

If the NVR sends BMP instead, this V1 does not convert it; LINE Image Messages require JPEG or PNG.

## GitHub image URL

Images are stored under:

`snapshots/CCTV2_YYYYMMDD_HHMMSS.jpg`

or

`snapshots/CCTV3_YYYYMMDD_HHMMSS.jpg`

The public image URL is:

`https://raw.githubusercontent.com/NaiBossZer/mahidol-smart-farm/main/snapshots/FILE.jpg`

GitHub's repository Contents API accepts Base64 file content and requires repository Contents write permission for uploads.
