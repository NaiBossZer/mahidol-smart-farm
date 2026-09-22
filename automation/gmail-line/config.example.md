# Script Properties — Configuration Reference

Copy this file and fill in your real values.  
**Never commit real secrets to GitHub.**

Set these values in:  
**Google Apps Script → Project Settings → Script Properties → Add property**

---

## Required Properties

```
GMAIL_QUERY_FROM        = apsun.0144@gmail.com
SUPABASE_URL            = https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY = YOUR_SERVICE_ROLE_KEY_HERE
LINE_CHANNEL_ID         = YOUR_LINE_CHANNEL_ID
LINE_CHANNEL_SECRET     = YOUR_LINE_CHANNEL_SECRET
LINE_GROUP_ID           = YOUR_LINE_GROUP_ID
BATCH_MINUTES           = 5
TIMEZONE                = Asia/Bangkok
```

## Optional / Fallback Properties

```
GITHUB_TOKEN            = YOUR_GITHUB_FINE_GRAINED_TOKEN
GITHUB_OWNER            = NaiBossZer
GITHUB_REPO             = mahidol-smart-farm
GITHUB_BRANCH           = main
```

`GITHUB_TOKEN` is only used if Supabase upload fails.  
You can remove it once Supabase is confirmed stable.

---

## Where to Find Each Value

| Property | Location |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → service_role (secret) |
| `LINE_CHANNEL_ID` | LINE Developers → Your channel → Basic Settings → Channel ID |
| `LINE_CHANNEL_SECRET` | LINE Developers → Your channel → Basic Settings → Channel secret |
| `LINE_GROUP_ID` | Use a LINE webhook logger or the LINE Official Account's Group ID |
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → Fine-grained tokens → Contents: Read+Write on `mahidol-smart-farm` only |

---

## Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` is a **secret key** — treat it like a password
- It must ONLY be stored in Apps Script Script Properties
- It must NEVER appear in source code, GitHub, or any frontend/client
- `LINE_CHANNEL_SECRET` has the same restriction
