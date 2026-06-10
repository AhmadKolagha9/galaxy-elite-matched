# Unified Submit API Contract Spec

## Objective
No new backend endpoint is required for the unified Submit tab. The website continues to use existing submission contracts.

## Existing Endpoints
- Interest Board submissions continue through `POST /api/interest`.
- Private Club property submissions continue through `POST /api/verified-listing`.

## Required Behavior
- Both endpoints keep their current validation and pending-review defaults.
- All created records remain hidden until Galaxy Elite approval.
- Reference-code generation remains owned by the existing endpoint/store logic.
- Document upload handling remains private and compliance-review only.

## Compatibility
Old website routes redirect to `/submit` modes, so backend handlers do not need route aliases.
