# GitHub Developer Dashboard

React Native CLI app for browsing GitHub repositories and developers with offline caching, local persistence, and theme-aware navigation.

## Features

- Search repositories and developer profiles
- View repository details and issues
- Cache results locally with SQLite for offline support
- Persist app state with Redux Toolkit
- Adapt to connectivity changes with a lightweight network layer

## Tech Stack

- React Native 0.76
- TypeScript
- React Navigation
- Redux Toolkit
- Axios
- SQLite
- NetInfo

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment values in `.env.development`, `.env.staging`, or `.env.production` as needed.

3. Start Metro:

```bash
npm start
```

## Run

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Helpful scripts:

- `npm run lint`
- `npm test`

## Folder Structure

- `src/app` - app bootstrap and composition root
- `src/components` - shared UI and feedback components
- `src/features` - repository, developer, home, and settings screens
- `src/navigation` - tab and stack navigators
- `src/services` - API, network, database, and cache services
- `src/store` - Redux store, slices, selectors, and hooks
- `src/theme` - theme config and provider utilities

## Notes

- `.gitignore` excludes local secrets, native build output, caches, and editor files.
- The app is designed to run as a standard React Native CLI project without Expo-specific tooling.
