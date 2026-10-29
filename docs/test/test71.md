# test71 — Persistent-session evidence record

## Commands executed

```sh
curl https://davdeploy.tech/api/v1/me
aws cognito-idp initiate-auth ... USER_AUTH / EMAIL_OTP
aws cognito-idp respond-to-auth-challenge ... EMAIL_OTP
curl -X POST https://davdeploy.tech/api/v1/auth/browser-session
curl -H 'Cookie: <issued host-only cookies>' https://davdeploy.tech/api/v1/me
```

## Result

The unauthenticated endpoint returned HTTP 401 through Cloudflare, session establishment returned
HTTP 204, and a separate cookie-backed request returned HTTP 200. Tokens, cookies, OTP values, and
response data were neither stored in the repository nor recorded in this evidence.

## Execution boundary

One controlled founder identity was used solely to test authentication. No customer records or cloud
resources were created, changed, or deleted.

## Known limitations

This records an HTTP-level session restoration contract. A visual browser tab close/reopen journey
remains a useful UX check.
