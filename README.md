# 🎴 Tokenize — MTG Board State Calculator

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

**Tokenize** is a high-performance utility designed for Magic: The Gathering players who need to manage complex board states. From infinite token loops to intricate trigger stacks, Tokenize handles the math so you can focus on the game.

---

## Key Features

- **Advanced Math Engine:** Support for multipliers, additives, and floor-based logic (e.g., doubling tokens with *Mondrak* or *Doubling Season*).
- **Scryfall Integration:** Instantly search and apply authentic card art to your modifiers and decks.
- **Deck Management:** Create, save, and organize specific modifier sets for your favorite Commander or Modern decks.
- **Quickstart Mode:** Jump directly into a game with an ephemeral board state for one-off sessions.
- **Categorization:** Group cards by Tokens, Counters, Damage, ETB, and Attack triggers for rapid navigation.
- **Mobile First:** Built with Ionic and Capacitor for a native-like experience on iOS, Android, and Web.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI Architecture:** [Ionic Framework](https://ionicframework.com/) (React components)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight, hook-based)
- **Icons:** [Lucide React](https://lucide.dev/) & [Ionicons](https://ionicons.com/)
- **API:** [Scryfall API](https://scryfall.com/docs/api) for MTG data and high-res art
- **Cross-Platform:** [Capacitor](https://capacitorjs.com/) for native mobile deployment

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/tokenize.git
   cd tokenize
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📱 Mobile Deployment (Capacitor)

To run on iOS or Android:

1. **Add platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

2. **Sync changes:**
   ```bash
   npm run build
   && npx cap sync
   ```

3. **Open in IDE:**
   ```bash
   npx cap open ios
   npx cap open android
   ```

---

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI (CardArtSelector, Modals)
├── pages/        # Main application views (Home, Play, DeckDetail)
├── services/     # API integrations (Scryfall)
├── store/        # Zustand state management
├── theme/        # Global CSS and Ionic variables
├── types/        # TypeScript interfaces and enums
└── utils/        # Helper functions (Math, Color mapping)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

*This project is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.*
