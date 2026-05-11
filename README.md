# GitHub Developer Dashboard

React Native CLI app for browsing GitHub repositories with a small set of supporting screens and a cache-first flow.

The codebase is intentionally practical: enough structure to stay maintainable, but not so much abstraction that it feels overbuilt for the app size.

## Highlights

- React Native CLI 0.76 (not Expo)
- TypeScript + Redux Toolkit for the main data flow
- SQLite cache so repository results can come back after relaunch
- Network-aware fetches with offline fallback messages
- Reusable loading, empty, and error states
- FlatList tuning where it actually matters

## Tech Stack

- React Native 0.76
- TypeScript 5
- Redux Toolkit + React Redux
- React Navigation (Bottom Tabs + Nested Stacks)
- Axios (interceptors, retries, error mapping)
- SQLite (react-native-sqlite-storage)
- AsyncStorage (theme/user preferences)

## Project Structure

```text
src/
   app/                # App bootstrap and global providers
   components/         # Reusable UI blocks (feedback states, etc.)
   features/           # Feature modules (repositories, developers, settings)
   hooks/              # Typed custom hooks
   navigation/         # Root, tabs, and feature stack navigators
   services/           # API client, GitHub API, network manager, database
   store/              # Redux store, slices, selectors, thunks
   theme/              # Theming system + provider
   types/              # Shared type definitions
```

## Environment Configuration

The app uses environment files per deployment target:

- .env.development
- .env.staging
- .env.production

Expected variables:

```env
API_URL=https://api.github.com
API_TIMEOUT=10000
ENABLE_LOGGING=true
ENVIRONMENT=development
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start Metro

```bash
npm start
```

### 3) Run on Android

```bash
npm run android
```

### 4) Run on iOS

```bash
npm run ios
```

## Available Scripts

- npm start: start Metro bundler
- npm run android: build and run Android app
- npm run ios: build and run iOS app
- npm run lint: run ESLint
- npm run test: run Jest tests

## Architecture Overview

### State Management

- Repositories slice
   - Search, detail, trending, favorites
   - Normalized byId/allIds shape
- Developers slice
   - Search and detail flows for GitHub users
- Settings slice
   - Theme and cache actions
- UI slice
   - Global UI state (modals/loading/toasts)

### Offline-First Data Flow

1. UI dispatches thunk
2. Thunk checks SQLite cache first
3. If fresh cache exists, return cached response
4. If cache miss and online, fetch network and sync cache
5. If cache miss and offline, return domain NO_INTERNET error

### Database Layer

- DatabaseService singleton (connection + migrations)
- Repository pattern DAOs
   - RepositoryRepository
   - SearchCacheRepository
   - SyncMetadataRepository
- Cache maintenance and TTL-based invalidation

### Performance Strategy

- FlatList virtualization tuning
- Stable memoized callbacks and item components
- Per-row render pressure reduced with favorite lookup map
- Selector memoization throughout repository queries

## Implemented Features

- Repository search
- Trending repositories
- Infinite scroll pagination for search results
- Pull-to-refresh
- Favorite toggle
- Repository details with README preview
- Developer search and profile screens
- Settings screen with theme toggle and cache cleanup
- Offline mode banner
- Error boundaries and screen feedback states

## Quality Gates

- TypeScript strict compile passes
- ESLint integration configured
- No destructive state mutations outside Redux Toolkit reducers
- Centralized error taxonomy with AppError

## Known Constraints and Tradeoffs

- GitHub public API rate limit applies (unauthenticated requests)
- README preview fetch returns plain text currently
- App lifecycle handling is basic and focused on startup/background maintenance rather than full background sync
- Some screens are intentionally compact so the app stays easy to read

## Scalability Notes

The codebase is structured for extension with:

- Feature-local modules and shared contracts
- Clear service boundaries between API, cache, and UI
- Replaceable persistence abstraction for future encrypted or remote sync storage
- Middleware insertion points for analytics, telemetry, and observability

## Additional Documentation

- docs/ARCHITECTURE.md
- docs/INTERVIEW_GUIDE.md

## Troubleshooting

### Metro watcher issue on Windows

If Metro reports watch errors under expo-modules-autolinking build paths, ensure metro.config.js contains a resolver blockList entry for that path.

### Android build issues

- Clean Gradle cache and rebuild
- Verify Android SDK and platform tools installation

### iOS build issues

- Run pod install inside ios directory
- Ensure Xcode command line tools are configured

## License

This repository is for technical evaluation and demonstration purposes.

## Future Improvements

- **Real request cancellation throughout the stack:** the code now accepts abort signals on API calls, but UI components and some higher-level flows still rely on stale-result suppression rather than actively cancelling in-flight requests. Wiring component-level cancellation (e.g. aborting previous search requests when the query changes) and adding integration tests would complete this flow.
- **Database integration tests and tighter CI coverage:** current tests mock DAO calls for speed and determinism. Adding a small, isolated SQLite integration test suite (CI job that runs an emulator or node-native sqlite runner) would catch migration and schema regressions early.
