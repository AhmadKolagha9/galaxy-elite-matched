# Unified Submit Dashboard Links Spec

## Objective
Dashboard and profile management links should point users to the unified Submit tab instead of board-specific inline add forms.

## Link Rules
- Interest creation links use `/submit?mode=interest`.
- Private Club property creation links use `/submit?mode=property`.
- Dashboard overview exposes one primary Submit action instead of separate add-entry buttons.

## Board Pages
- Interest Board remains browse/match only.
- Private Club remains browse/filter/match only.
- Management pages may keep add buttons, but they must route to `/submit` modes.
