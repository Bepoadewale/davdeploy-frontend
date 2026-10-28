# GitHub App onboarding boundary

DavDeploy uses a GitHub App rather than a personal access token. A workspace administrator
authorizes an installation for the repositories that may be inspected for planning.

## What is available

- Repository and branch discovery use the selected installation's short-lived token.
- The Connections screen shows the installation and whether signed installation updates are
  available.
- Repository inspection is read-only. The browser never receives the GitHub App private key or
  access token.

## What is not enabled

Public GitHub webhook delivery is not enabled for the hosted beta. The backend has contract tests
for signature validation, delivery deduplication, required event/delivery metadata, and a 1 MiB
payload limit, but that is not evidence of a public delivery.

Desired-state pull-request publication is separately guarded and is not a normal customer action.
DavDeploy does not merge a pull request or deploy customer infrastructure from GitHub onboarding.

## Customer handoff

1. An administrator selects only the intended organization or repositories in GitHub.
2. In DavDeploy, confirm the listed installation and select a repository/branch while creating a
   plan.
3. If the expected installation or repository is absent, contact
   [support@davdeploy.tech](mailto:support@davdeploy.tech). Do not send tokens, private keys, or
   one-time codes to support.

Remove the installation from GitHub when repository access should end. That action is controlled
by the customer organization, not by the DavDeploy browser.
