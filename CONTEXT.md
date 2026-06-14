## 1. System Overview & Tech Stack
* **Core Purpose:** A web application for curating, ranking, and sharing a personalized TV show season watchlist, featuring a matchmaker to find common interests with a partner and celebrating matches with confetti.
* **Stack:** React 19, TypeScript, Vite, Firebase (Auth/Database), dnd-kit (for drag-and-drop ranking), Framer Motion, canvas-confetti, and Vanilla CSS.
* **Deployment/Runtime:** Vite for local development, Firebase Hosting for deployment.

## 2. Architectural Conventions
* **Directory Layout:** The `src/` folder is modularized into `components/` (UI elements), `hooks/` (custom React hooks for state/business logic), `services/` (TMDB API and Firebase integrations), and `types/` (shared TypeScript definitions).
* **Data Flow & State:** Source-of-truth data lives in Firebase. Local state and data fetching are encapsulated in custom hooks (`useAuth`, `useProfile`, `useWatchlist`) which inject state down to the UI components.
* **Routing:** Currently managed via simple component-level state (`activeTab` in `App.tsx` toggling between 'watchlist', 'matches', 'partner', and 'connect' views) rather than a dedicated library like React Router.

## 3. Strict Development Rules (The "Never/Always" List)
* Always use TypeScript strict types for all components, API responses, and database schemas; never use `any`.
* Always use environment variables for API keys and secrets (`VITE_TMDB_API_KEY`, Firebase config); never hardcode credentials in the source code.
* Always manage complex business logic and Firebase interactions within custom hooks to keep UI components pure and declarative.
* Always handle loading, empty, and error states explicitly for all network requests and authentication checks.

## 4. Primary Core Entities & Schemas
* **WatchlistItem:** `{ id: string; show: ShowDetails; season: Season; providers: WatchProvidersResponse | null }` (Represents a user's ranked TV season).
* **UserProfile:** `{ uid: string; email: string | null; partnerUid: string | null }` (Manages user identity and their connection to a partner).
* **ShowDetails & Season:** Derived from the TMDB API, containing metadata like IDs, names, overviews, and poster paths.

## 5. Current Active State & API Boundaries
* **Major Integration Points:** TMDB API (The Movie Database) for show search, season details, and streaming providers. Firebase Authentication and Firestore/Realtime DB for user profiles and watchlist synchronization.
* **Known Technical Debt / Constraints:** The app relies on state-based conditional rendering instead of a formal router, meaning deep linking to specific tabs is not natively supported. Drag-and-drop features rely heavily on `@dnd-kit`, requiring careful handling of local vs. server state during reordering.
