# Frontend routes

| Route                | Access                       | Purpose                                                            |
| -------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `/`                  | Public                       | Truthful product overview and workflow                             |
| `/team`              | Public                       | Founder profile and professional contact details                   |
| `/about`             | Public                       | Product purpose, current AWS boundary, and multicloud vision       |
| `/login`             | Public                       | Hosted OIDC or explicit local-development fixture sign-in          |
| `/auth/callback`     | Public callback              | Complete OIDC code/PKCE, then resolve `/me`                        |
| `/overview`          | Authenticated                | Workspace totals, project activity, and admin review queue         |
| `/plans/new`         | Authenticated                | Repository/target selection and intent-to-plan workflow            |
| `/plans/:revisionId` | Authenticated, server scoped | Immutable plan, evidence, decisions, and bounded follow-up actions |
| `/history`           | Authenticated                | Search, state filter, project grouping, and metadata comparison    |
| `/activity`          | Authenticated                | Date-grouped audit evidence with inspectable details               |
| `/connections`       | Authenticated                | GitHub discovery and cloud role onboarding metadata                |
| `/settings`          | Authenticated                | Membership, usage, entitlements, API credentials, privacy, support |
| `/help`              | Authenticated                | Product boundaries and current capabilities                        |

`BrowserRouter` supplies clean URLs. Cloudflare Pages treats the site as an SPA when no top-level
`404.html` exists, so nested requests receive `index.html`. `npm run check:spa` independently checks
a nested refresh after every build.

Authenticated route guards are usability controls. The API determines whether the signed principal
can read or mutate the referenced workspace, project, plan, connection, or environment.
