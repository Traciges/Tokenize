# Tokenize — MTG Board State Calculator

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

**Tokenize** is a mobile-first utility for Magic: The Gathering players who need to track complex board states in real time. Set how many copies of each card are on the battlefield, tap a category, and instantly see your calculated total — with full support for multipliers, additives, and floor effects.

---

## ✨ Key Features  

- **Quick Results** — Tap any category button (Tokens, Damage, Mana, etc.) to instantly see the calculated total for your current board state. Swipe the result footer away to dismiss it.
- **Full Calculation View** — Long-press a category to open a detailed breakdown with reorderable effects and step-by-step math. Drag to change order or hit Optimize to let the app find the best ordering automatically.
- **Math Engine** — Supports additive (+), multiplier (×), and floor (Min) card types. Handles cards like *Mondrak*, *Doubling Season*, and similar replacement effects.
- **Dynamic Card Values** — Mark a card as dynamic to update its value mid-game (e.g. X-cost spells).
- **Deck Management** — Create and save modifier sets per commander. Attach card art from Scryfall or pick a mana color for quick visual identification.
- **Quickstart Mode** — Jump straight into a game without creating a deck. Add cards on the fly. Your last Quickstart session is automatically saved and can be restored next time.
- **Scryfall Integration** — Search and apply authentic card art to any modifier card or deck.
- **Mobile First** — Built with Ionic and Capacitor for a native feel on iOS, Android, and Web.

---

## 🛠️ Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite |
| UI | Ionic Framework (React) |
| State | Zustand |
| Icons | Lucide React + Ionicons |
| Card Data & Art | Scryfall API |
| Native | Capacitor |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm

### Run locally

```bash
git clone https://github.com/yourusername/tokenize.git
cd tokenize
npm install
npm run dev
```

### Production build

```bash
npm run build
```

---

## 📱 Mobile Deployment (Capacitor)

```bash
npm run build
npx cap sync
npx cap open ios      # or android
```

---

## 📂 Project Structure

```
src/
├── components/   # Reusable UI (CardArtSelector, CardFormModal)
├── pages/        # Views: Home, Play, DeckDetail
├── store/        # Zustand store (decks, active board, quickstart)
├── theme/        # Ionic variables and global tokens
├── types/        # TypeScript types and constants
├── utils/        # Math helpers, color mapping
└── version.ts    # App version — bump this on each release
```

---

## ⚖️ License

MIT — see `LICENSE`.

*Unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.*

---

*Made by @Philipp*
