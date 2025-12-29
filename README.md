# Gripper - DevTools for Designers

<p align="center">
  <img src="packages/extension/public/icons/logo.svg" width="80" height="80" alt="Gripper Logo">
</p>

<p align="center">
  <strong>A powerful browser extension for developers and designers.</strong>
</p>

<p align="center">
  Inspect elements, pick colors, analyze typography, and export assets with ease.
</p>

<p align="center">
  <a href="https://gripper.isboyjc.com">Website</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Element Inspector** | Click any element to view CSS properties, dimensions, and computed styles |
| 🎨 **Color Picker** | Pick any color from the page with magnified preview, auto-copy to clipboard |
| 🔤 **Typography Analysis** | Analyze fonts, sizes, weights, line heights, and letter spacing |
| 📐 **Box Model Viewer** | Visualize margin, border, padding, and content with interactive display |
| 📦 **Asset Export** | Export images, SVGs, and other assets directly with one click |
| 🔍 **Element Search** | Search elements by tag, class, or ID with keyboard navigation |
| 📋 **Side Panel** | View detailed element information in browser side panel |
| ⌨️ **Keyboard Shortcuts** | Boost productivity with intuitive shortcuts for all actions |
| 🌙 **Dark/Light Theme** | Follows system preference or manual toggle |
| 🌍 **Multi-language** | English and Chinese (中文) support |
| 🔒 **Per-Tab State** | Independent extension state for each browser tab |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Toggle Inspector Mode |
| `I` | Color Picker (Eyedropper) |
| `F` | Element Search |
| `S` | Toggle Side Panel |
| `A` | Inspect All Elements |
| `↑` | Select Parent Element |
| `↓` | Select Child Element |
| `P` | Pause/Resume |
| `Esc` | Close Extension |

## 📦 Installation

### From Browser Store

> Coming soon to Chrome Web Store, Firefox Add-ons, and Edge Add-ons.

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/isboyjc/gripper.git
   cd gripper
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build:chrome   # For Chrome
   pnpm build:firefox  # For Firefox
   pnpm build:edge     # For Edge
   ```

4. Load in browser:
   - **Chrome**: Go to `chrome://extensions/` → Enable "Developer mode" → Click "Load unpacked" → Select `packages/extension/dist`
   - **Firefox**: Go to `about:debugging` → Click "This Firefox" → Click "Load Temporary Add-on" → Select any file in `packages/extension/dist-firefox`
   - **Edge**: Go to `edge://extensions/` → Enable "Developer mode" → Click "Load unpacked" → Select `packages/extension/dist-edge`

## 🚀 Usage

1. Click the Gripper icon in your browser toolbar to activate
2. Use the floating toolbar to access tools:
   - **Inspector**: Click elements to inspect their properties
   - **Eyedropper**: Pick colors from anywhere on the page
   - **Search**: Find elements by tag, class, or ID
   - **Side Panel**: View detailed information
3. Press `Esc` to close the extension

## 🛠️ Development

### Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build Tool
- **Zustand** - State Management
- **Lucide React** - Icons
- **Vitest** - Unit Testing
- **Framer Motion** - Animations

### Project Structure

```
gripper/
├── packages/
│   ├── extension/          # 🧩 Browser Extension
│   │   ├── src/
│   │   │   ├── background/ # Service Worker
│   │   │   ├── content/    # Content Script & UI
│   │   │   │   └── ui/
│   │   │   │       ├── Toolbar/      # Floating Toolbar
│   │   │   │       ├── Eyedropper/   # Color Picker
│   │   │   │       ├── ElementSearch/# Search Feature
│   │   │   │       └── InspectAll/   # Full Page Inspection
│   │   │   ├── popup/      # Popup UI
│   │   │   ├── sidepanel/  # Side Panel UI
│   │   │   ├── stores/     # Zustand Stores
│   │   │   ├── hooks/      # Custom Hooks
│   │   │   ├── i18n/       # Internationalization
│   │   │   └── types/      # TypeScript Types
│   │   └── public/         # Static Assets
│   │
│   └── website/            # 🌐 Official Website
│       └── src/
│
├── package.json            # Monorepo Root
└── pnpm-workspace.yaml
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start extension dev (Chrome) |
| `pnpm dev:firefox` | Start extension dev (Firefox) |
| `pnpm dev:website` | Start website dev server |
| `pnpm build` | Build all browser extensions |
| `pnpm build:chrome` | Build Chrome extension |
| `pnpm build:firefox` | Build Firefox extension |
| `pnpm build:edge` | Build Edge extension |
| `pnpm build:website` | Build website |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Lint code |

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 🌍 Internationalization

Gripper supports:
- 🇺🇸 English
- 🇨🇳 简体中文

Language is auto-detected from browser settings, or can be changed in the popup.

## 📄 License

[MIT](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👤 Author

**isboyjc**

- GitHub: [@isboyjc](https://github.com/isboyjc)
- Website: [gripper.isboyjc.com](https://gripper.isboyjc.com)

---

<p align="center">
  Made with ❤️ for designers and developers
</p>
