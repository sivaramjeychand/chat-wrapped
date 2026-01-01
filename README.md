# Chat Wrapped 2025 🎁✨

**Analyze your WhatsApp and Telegram chat history privately on your device. Zero data upload.**

[![](https://img.shields.io/badge/Privacy-First-green.svg)]() [![](https://img.shields.io/badge/Made%20with-React-blue.svg)]() [![](https://img.shields.io/badge/License-MIT-orange.svg)]()

Turn your chat logs into a beautiful, interactive "Story" experience. Discover your top chatters, busiest times, emoji vibes, and more—all without your data ever leaving your browser.

## ✨ Features

- **🔒 Privacy First**: All parsing and analysis happens 100% client-side in your browser. No servers, no uploads.
- **📱 Multi-Platform**: Supports **WhatsApp** (`.txt` exports) and **Telegram** (`result.json` exports).
- **📊 Interactive Stories**: Navigate through your stats like an Instagram Story.
  - **The Chatterbox**: Total messages & top senders.
  - **The Night Owl**: Heatmap of your most active hours.
  - **The Ghost**: Average reply times and ghosting stats.
  - **The Vibe**: Top words.
  - **The Streaks**: Longest conversation streaks.
- **📸 Export & Share**: Download individual slides or your entire wrapped summary as high-quality images (1080x1920) perfect for sharing on social media.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sivaramjeychand/chat-wrapped.git
    cd chat-wrapped
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 🛠️ Built With

- **[React](https://react.dev/)** + **[Vite](https://vitejs.dev/)** - Fast frontend tooling.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling.
- **[Framer Motion](https://www.framer.com/motion/)** - smooth animations.
- **[Lucide React](https://lucide.dev/)** - Beautiful icons.
- **[Recharts](https://recharts.org/)** - Data visualization.
- **[html-to-image](https://github.com/bubkoo/html-to-image)** - High-fidelity export.

## 📝 How to Export Chat History

### WhatsApp
1.  Open a chat (individual or group) on your smartphone (pc does not work).
2.  Tap on the contact/group name at the top.
3.  Scroll down and tap **Export Chat**.
4.  Select **Without Media**.
5.  Save the `.txt` file to your device.

### Telegram
1.  Open Telegram Desktop.
2.  Go to **Settings** > **Advanced** > **Export Telegram Data**.
3.  Select "Machine-readable JSON" as the format (if available) OR just export chat history.
4.  *Note: Current parser supports standard JSON export structure.*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
