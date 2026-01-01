# Chat Wrapped 2025 🎁✨

**Analyze your WhatsApp and Telegram chat history privately on your device. Zero data upload.**

[![](https://img.shields.io/badge/Privacy-First-green.svg)]() [![](https://img.shields.io/badge/Made%20with-React-blue.svg)]() [![](https://img.shields.io/badge/License-MIT-orange.svg)]()

Turn your chat logs into a beautiful, interactive "Story" experience. Discover your top chatters, busiest times, emoji vibes, and more—all without your data ever leaving your browser.

## 📸 Demo Preview

See what your chat analysis looks like. These are generated instantly in your browser.

> *Note: All data in these screenshots is demo data for privacy.*

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/8e184a3b-85bc-454b-818a-439ce3575040" width="200" alt="Intro" />
      <br />
      <b>The Intro</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/ff914131-00ae-453e-af37-5db9015f3aa5" width="200" alt="Total Messages" />
      <br />
      <b>Total Volume</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/c40164c6-e990-4d06-b1c4-7d1674a73195" width="200" alt="Days Active" />
      <br />
      <b>Active Days</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/890dd608-5854-4f49-a7ce-2fd92b726aeb" width="200" alt="Top Chatters" />
      <br />
      <b>Leaderboard</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6f98ca69-3890-4bab-9807-e150395211c3" width="200" alt="Peak Activity" />
      <br />
      <b>Night Owl Meter</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/ba669f1e-fadc-44f1-91d4-5fa436438ee8" width="200" alt="Longest Streak" />
      <br />
      <b>The Streak</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6e2bb180-b6c2-4a0b-bdef-58bda2e789b9" width="200" alt="Speed Demons" />
      <br />
      <b>Reply Speed</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1a674557-e518-4821-99ac-77e022001b17" width="200" alt="Chaotic Day" />
      <br />
      <b>Busiest Day</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/3ce13e98-e230-402f-b982-f47c12d67609" width="200" alt="Vocabulary" />
      <br />
      <b>Top Words</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6cc4e9ff-268c-4d37-9d0e-b0d89db26b81" width="200" alt="Essayists" />
      <br />
      <b>The Essayist</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/837deda3-deab-4189-98ac-59b5f56f92e4" width="200" alt="Novelist" />
      <br />
      <b>The Novelist</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/18c70e86-3d88-46c7-980a-da61323917a1" width="200" alt="Outro" />
      <br />
      <b>Share Card</b>
    </td>
  </tr>
</table>

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
    git clone [https://github.com/sivaramjeychand/chat-wrapped.git](https://github.com/sivaramjeychand/chat-wrapped.git)
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
1.  Open a chat (individual or group) on your smartphone (PC export is not supported by WhatsApp).
2.  Tap on the contact/group name at the top.
3.  Scroll down and tap **Export Chat**.
4.  Select **Without Media**.
5.  Save the `.txt` file to your device and drag it into the app.

### Telegram
1.  Open Telegram Desktop.
2.  Go to **Settings** > **Advanced** > **Export Telegram Data**.
3.  Select "Machine-readable JSON" as the format.
4.  Upload the `result.json` file.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
