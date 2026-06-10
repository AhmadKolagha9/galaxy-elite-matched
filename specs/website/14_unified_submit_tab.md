# Unified Submit Tab Website Spec

## Objective
Create one member-only `/submit` workflow for creating new Interest Board demand posts and Private Club property posts. Board pages become browse/match surfaces only, while creation happens in the Submit tab.

## Routes
- `/submit` is the primary submit tab in the public header.
- `/submit?mode=interest` opens the Interest Board post form.
- `/submit?mode=property` opens the Private Club property post form.
- `/post-interest`, `/dashboard/post-interest`, `/interest-board?add=1`, `/private-club?add=1`, `/private-availability`, and `/dashboard/verified-listing` redirect into the relevant submit mode.

## UI Rules
- Header navigation includes a `Submit` tab.
- Interest Board and Private Club pages do not render inline add buttons or inline add forms.
- Submit page uses segmented controls to switch between the two form types.
- Existing forms, validation, statuses, and submission locks remain unchanged.

## Access
- `/submit` requires a signed-in member.
- Logged-out users are redirected to login with the submit path preserved in `next`.
- Private documents remain private and existing review/approval flows stay unchanged.
