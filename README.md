# Track My Box

A mobile app to organize, label and track your moving boxes — built with Expo (React Native) and a NestJS backend.

---

## Features

- **Boxes management** — create, edit, delete boxes with type, priority and status
- **Items** — add items inside each box with photos
- **QR code labels** — print custom labels per box; scan them to instantly open the box detail
- **Custom QR styles** — choose module shape (square, rounded, dots, diamond, star), eye/corner style, frame shape and colors
- **Rooms** — organize boxes by origin / destination room
- **Moves** — track moves and associate boxes
- **Batch print** — select multiple boxes and print all labels at once (AirPrint / BLE thermal printer)
- **Label formats** — configure paper size, grid, margins and save custom formats

---

## Stack

| Layer | Tech |
|---|---|
| Mobile | Expo SDK 52 · Expo Router · React Native |
| State | Zustand |
| QR | react-native-qrcode-styled · react-native-svg |
| Print | expo-print · react-native-view-shot |
| Scanner | expo-camera |
| Backend | NestJS · TypeScript |
| Storage | AsyncStorage (local) |

---

## Getting started

### Prerequisites

- Node.js ≥ 18
- iOS Simulator or a physical device with Expo Go

### Frontend (mobile)

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS simulator.

### Backend

```bash
cd backend
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default. To point the frontend to a local backend, update `services/api.ts`:

```ts
const API_BASE = 'http://localhost:3000';
```

---

## Project structure

```
app/
  (tabs)/           # Bottom tab screens
    index.tsx       # Home
    containers.tsx  # Box list
    scan.tsx        # QR scanner
    moves.tsx       # Moves
    settings.tsx    # Settings
  container/
    [id].tsx        # Box detail
    new.tsx         # New box form
  move/new.tsx      # New move form
  rooms/index.tsx   # Rooms management
  settings/qr.tsx   # QR code customization
  scanner.tsx       # Full-screen scanner

components/
  containers/       # Box-related components
  print/            # Label editor, print sheets
  ui/               # Design system (TMBButton, TMBInput, …)

services/
  api.ts            # REST API client
  labelFormats.ts   # Label format CRUD + presets
  qrShapes.ts       # QR style → react-native-qrcode-styled props
  systemPrint.ts    # HTML label builder for system print

stores/             # Zustand stores
hooks/
  useBatchPrint.ts  # Batch print orchestration

backend/            # NestJS API
```

---

## QR code customization

Navigate to **Settings → Personnaliser le QR Code** to access the dedicated screen.

| Option | Choices |
|---|---|
| Module (pixel) shape | Square · Rounded · Dots · Diamond · Star |
| Eye (corner) shape | Square · Rounded · Dots · Classic · Classic rounded |
| Frame shape | Square · Rounded · Circle |
| Foreground color | 6 presets |
| Background color | 5 presets |
| Center icon | on / off |

All settings are persisted via AsyncStorage and reflected live on every QR render and print job.

---

## License

MIT
