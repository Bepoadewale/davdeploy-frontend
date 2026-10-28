# Browser acceptance, onboarding, and support hardening

## Commands executed

- `npm run test:browser`
- `npm run verify`
- `npm audit --audit-level=moderate`

## Result

`npm run verify` passed formatting, lint, typecheck, 47 component tests, API/static/SPA checks,
production build, and a moderate-or-higher dependency audit with zero vulnerabilities.
`npm run test:browser` passed 7 fixture acceptance checks with 1 deliberate desktop skip for the
mobile-only navigation contract. The suite proves sign-in, protected-route navigation, AWS pilot
acknowledgement, plan provider/input errors, and mobile support access without hosted services.

## Execution boundary

The browser suite uses a local Vite server and route-intercepted fixture API only. It does not send
email, call Cognito/GitHub/AWS/Cloudflare, create a cloud connection, or open CloudFormation.

## Known limitations

It does not replace the separately controlled production invitation, Cognito email-OTP, plan
approval, and sign-out journey.
