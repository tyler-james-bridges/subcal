# SubCal - Subscription Calendar

A beautiful iOS app to track and manage your subscription renewals with a calendar view.

## Features

- Calendar view showing all subscription renewal dates
- Monthly/yearly subscription indicators (purple/orange dots)
- Add, edit, and delete subscriptions
- Track popular services (Netflix, Spotify, Adobe, Apple, etc.)
- Monthly spending total
- Dark theme interface
- Local data persistence

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Expo Go app (iOS device)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on iOS

**With Expo Go (recommended for quick testing):**
1. Install Expo Go from the App Store
2. Run `npm start`
3. Scan the QR code with your iPhone camera

**With iOS Simulator (Mac only):**
```bash
npm run ios
```

## Project Structure

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

## Tech Stack

- React Native with Expo
- TypeScript
- AsyncStorage for persistence
- date-fns for date manipulation
- @expo/vector-icons for icons

## License

MIT
