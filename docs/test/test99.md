# test99 - blog author names and article link rendering

## Commands executed

No local test or verification command was run for this change.

## Result

Local automated verification is pending. GitHub CI will run the existing repository checks on the implementation commit. A focused test suite was not added or run in this session.

## Execution boundary

The frontend submits `author_name` as ordinary post content and renders article text through React text nodes plus validated HTTP/HTTPS anchors. It does not render author content as HTML or change backend authorization.

## Known limitations

The private backend currently ignores `author_name` and returns a fixed team name. The frontend PR remains draft until backend persistence/API support is merged and deployed.
