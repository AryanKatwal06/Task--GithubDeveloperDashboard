# GitHub Developer Dashboard

GitHub Developer Dashboard is a React Native CLI app for browsing GitHub repositories and developers. It combines live API data with local SQLite caching, so the app stays useful when the network drops and still feels responsive during normal use.

## Project Overview

The app is built around a simple idea: make GitHub data easy to explore on a phone without forcing the user to start over every time connectivity changes. From the home screen you can move into repository search, developer search, detail views, and settings, while the app keeps recent data available offline.

## Features

The app uses a bottom-tab layout with nested stacks so the main areas stay easy to reach while still allowing deeper screens for repository and developer details. That gives the app a straightforward navigation model without flattening everything into one long flow.

Repository and developer data comes from the GitHub REST API through a shared Axios client. The repository flow supports trending results, search, detail views, and issues, while the developer flow supports searching users and opening profile-related screens.

Large result sets are handled with tuned list rendering rather than default settings. The repository search screen uses stable keys, fixed row measurements, and FlatList batching so scrolling stays smooth even when there are many items on screen.

Search is controlled so it does not fire on every keystroke. Requests are only sent when the user submits the query, and stale requests are cancelled through thunk signals when a new search takes over. That keeps the interaction quiet and avoids unnecessary API churn.

Pagination is built into the repository search flow. As the user scrolls, the next page is fetched only when GitHub says there is more data, which keeps the initial payload small and avoids loading the entire result set at once.

Redux Toolkit is used for the main application state. Repository, developer, settings, and UI state all live in slices, which keeps async actions, selectors, and derived state predictable as the app grows.

SQLite is used for offline persistence. When the app receives fresh repository data, the cache sync middleware stores it locally and the app can hydrate cached repositories on startup or when the device is offline. This makes the dashboard more practical than an API-only implementation.

App lifecycle work is handled at startup and shutdown. The bootstrap layer starts network monitoring, opens the database, and runs cache maintenance on launch, then tears those services down cleanly when the app exits.

Theme support is persisted across launches. The app reads the saved preference on startup, switches between light and dark mode, and keeps the current choice in AsyncStorage.

Pull to refresh is available on the main repository list, so the user can refresh trending content or the active search without backing out of the screen.

Retry handling is built into both the API layer and the UI. The Axios client retries transient failures with exponential backoff, and the screens also expose manual retry actions when a request still fails.

Offline caching is not treated as a best-effort bonus. Cached repositories are surfaced in the UI when the device is offline, and a small banner makes it clear when results are coming from local storage.

The UI includes small but visible animations. The tab bar uses Reanimated for active state motion, and the repository search screen uses Animated transitions for focus and list entry so the app feels less static.

Loading, empty, and error states are handled explicitly. The app shows loaders while requests are running, empty states when there is nothing to display, and retry prompts when something goes wrong instead of leaving the user guessing.

## Tech Stack

- React Native CLI
- TypeScript
- Redux Toolkit
- React Navigation
- SQLite
- Axios
- React Native Vector Icons
- React Native Reanimated

## Folder Structure

The codebase follows a feature-based structure. Screens, slices, selectors, and feature-specific components are grouped under `src/features`, which keeps repository, developer, home, and settings logic separated instead of spread across the app.

Shared plumbing lives outside the feature folders. `src/services` contains the API client, network state manager, database service, and repository layer, while `src/store` contains the Redux store setup and feature slices. Shared UI lives in `src/components`, navigation lives in `src/navigation`, and the theme system lives in `src/theme`.

That split keeps the app readable. Feature code owns the user-facing flows, the service layer owns data access, and the repository pattern keeps SQLite access out of screens and reducers.

## How to Run the Project

1. Clone the repository:

```bash
git clone <repo-url>
cd GitHubDeveloperDashboard
```

2. Install JavaScript dependencies:

```bash
npm install
```

3. If you want to use a GitHub token or a custom API base URL, add the values expected by `react-native-config` in your local `.env` file. The app works without a token, but GitHub's public rate limits are stricter.

4. iOS setup requires macOS and Xcode. Install the CocoaPods dependencies from the `ios` folder:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

5. Start Metro in one terminal:

```bash
npm start
```

6. Run Android from another terminal:

```bash
npm run android
```

7. Run iOS from another terminal on macOS:

```bash
npm run ios
```

Helpful scripts:

```bash
npm run lint
npm test
```

## Key Technical Decisions

- Redux Toolkit was used because it keeps Redux code compact without hiding the data flow. The app has several async paths, so having slices, thunks, and selectors in one place makes the behavior easier to trace.
- SQLite was used because this is more than a transient cache. Search results and recently viewed data need to survive app restarts, and SQLite is a better fit for that than memory-only state or a few key-value entries.
- Offline-first caching was implemented so the app remains useful on bad connections. The goal was not perfect sync, just a reliable local fallback that makes the interface feel stable.
- A feature-based architecture was used because the app is split across repository, developer, home, and settings flows. This keeps each domain self-contained and avoids a single large folder of shared logic.
- Performance work focused on list rendering, normalized state, and request cancellation. Those are the places where a GitHub browser like this one usually starts to slow down.
- API handling lives in a shared Axios client and service layer so screens do not deal with raw HTTP details. That also centralizes retry rules, error mapping, and rate-limit behavior.

## Performance Considerations

- FlatList is tuned with `getItemLayout`, `removeClippedSubviews`, `windowSize`, and batched rendering so large repository lists stay responsive.
- Pagination limits the amount of data fetched at once and only loads the next page when the current results indicate there is more content.
- Search requests are only sent on submit, which keeps the screen from firing a request on every text change.
- Axios and Redux thunks both support request cancellation, which helps avoid stale responses overwriting newer results.
- Memoized context values, stable callbacks, and selector-driven state reduce avoidable re-renders.
- Successful responses are cached in SQLite and reused for offline fallback, which makes relaunches faster and reduces repeated network work.

## Improvements With More Time

- Add unit tests around thunks, selectors, cache sync, and error mapping.
- Add E2E coverage with Detox for the main search and detail flows.
- Wire the project into CI so linting and tests run on every push.
- Improve accessibility labels, focus order, and text scaling support.
- Add deeper offline sync so changes can reconcile more cleanly when the device comes back online.
- Expand caching policies with stale-while-revalidate behavior and smarter invalidation rules.
- Add analytics and push notifications if the project scope grows beyond a dashboard-style app.

## Challenges & Learnings

The main challenge was keeping online and offline behavior aligned without duplicating logic in the screens. Once search, caching, and navigation all started depending on the same data, it became important to normalize responses early and keep network, storage, and UI concerns separate.

The other useful lesson was that practical performance work matters more than adding more abstractions. A tuned list, predictable state updates, and a simple cache path gave better results here than trying to over-engineer the data flow.
