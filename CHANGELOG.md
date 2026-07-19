# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Background Provider Refresh**: Provider data for items in the watchlist automatically updates behind the scenes every 7 days to account for shows moving between streaming services.
- **Provider Deduplication**: Streaming providers are intelligently deduplicated and cleaned up (e.g., merging "Netflix", "Netflix Standard with Ads"; removing Live TV/MVPD providers; standardizing "Plus" to "+").
- **Partner "New" Badges**: Added "New" badge to highlight shows and movies a partner has added since the user's last visit.

### Fixed
- Fixed mobile layout issues causing the header title and logout button to overlap on small screens.
- Updated the header title font size to scale fluidly.
- Fixed navigation tabs overflow clipping by removing centered justification on smaller screens.
- Redesigned `SeasonCard` on mobile to stack elements and wrap action buttons to a clean bottom row.
