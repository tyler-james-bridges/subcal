# SubCal - Subscription Calendar

A beautiful iOS app to track and manage your subscription renewals with a calendar view.

![Home Calendar](https://raw.githubusercontent.com/tyler-james-bridges/subcal/screenshots/pr-10/pr-10/01-home-calendar.png)

## Features

- Calendar view showing all subscription renewal dates
- Monthly/yearly subscription indicators (purple/orange dots)
- Add, edit, and delete subscriptions
- Track popular services (Netflix, Spotify, Adobe, Apple, etc.)
- Monthly spending total
- Dark theme interface
- Local data persistence

## Screenshots

| Home | Add Subscription | Day Detail |
|------|------------------|------------|
| ![Home](https://raw.githubusercontent.com/tyler-james-bridges/subcal/screenshots/pr-10/pr-10/01-home-calendar.png) | ![Add](https://raw.githubusercontent.com/tyler-james-bridges/subcal/screenshots/pr-10/pr-10/05-add-subscription-modal.png) | ![Detail](https://raw.githubusercontent.com/tyler-james-bridges/subcal/screenshots/pr-10/pr-10/06-day-detail-modal.png) |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- [bun](https://bun.sh) (recommended) or npm
- Expo CLI
- iOS Simulator (Mac) or Expo Go app (iOS device)

### Installation

```bash
# Install dependencies (using bun - recommended)
bun install

# Or with npm
npm install

# Start the development server
bun start
# or: npm start
```

### Running on iOS

**With Expo Go (recommended for quick testing):**
1. Install Expo Go from the App Store
2. Run `bun start`
3. Scan the QR code with your iPhone camera

**With iOS Simulator (Mac only):**
```bash
bun run ios
# or: npm run ios
```

## Development

### Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── CalendarDay.tsx
│   ├── CalendarGrid.tsx
│   ├── CalendarHeader.tsx
│   ├── CalendarFooter.tsx
│   ├── CalendarLegend.tsx
│   ├── ServiceIcon.tsx
│   ├── AddSubscriptionModal.tsx
│   └── DayDetailModal.tsx
├── constants/        # Theme colors, service configs
├── context/          # React Context for state management
├── data/             # Sample subscription data
├── screens/          # Screen components
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### CI/CD

Pull requests automatically run [Maestro](https://maestro.mobile.dev/) screenshot tests. Screenshots are captured and posted as PR comments for visual review.

The CI workflow:
- Builds the iOS app for simulator
- Runs Maestro UI tests
- Captures screenshots at key states
- Posts results to the PR

### Running Tests Locally

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run screenshot tests (requires iOS Simulator)
maestro test .maestro/flows/screenshots.yaml
```

## Tech Stack

- React Native with Expo
- TypeScript
- AsyncStorage for persistence
- date-fns for date manipulation
- @expo/vector-icons for icons
- Maestro for UI testing

## Acknowledgments

Design inspired by [Maxim Kuznetsov (@disarto_max)](https://x.com/disarto_max/status/2012212220365541747). Check out his product design work on [X](https://x.com/disarto_max).

## License

MIT
