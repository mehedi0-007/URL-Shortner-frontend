<div align="center">
  <img src="https://lucide.dev/logo.svg" alt="URL Shortener Logo" width="100" height="100" />
  <h1>🚀 Next.js URL Shortener Frontend</h1>
  <p>A lightning-fast, production-ready frontend for your URL Shortener service.</p>
</div>

---

## ✨ Features

- **⚡ Blazing Fast Next.js (App Router)**: Fully optimized static and dynamic route rendering with Turbopack.
- **🎨 Tailwind CSS Styling**: Beautiful, responsive, and modern UI out-of-the-box.
- **🔒 Secure Authentication**: Seamless JWT integration wielding Axios interceptors with silent, automatic 401 token refreshing.
- **💾 Persistent State**: Zustand paired with local storage keeps your session alive gracefully across reloads.
- **💡 Clean Dashboard & Admin Panels**: Role-based routing to keep admins and users neatly separated.
- **🔔 Actionable Toasts**: Instant feedback mechanisms using React Hot Toast.
- **🎯 Typescript Hardened**: Strictest typing configurations to ensure maximum stability and zero `any` usage.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16+](https://nextjs.org/) (App Router)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with Persist Middleware
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Alerts:** [React Hot Toast](https://react-hot-toast.com/)

---

## 🚀 Getting Started

### 1. Prerequisites

- Make sure you have **Node.js** (v18+) installed.
- Ensure your backend NestJS API is running locally or deployed.

### 2. Installation

Clone this repository and install the dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a \`.env.local\` file in the root of the project and set your backend API URL (defaults to \`http://localhost:3000\` if not provided):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run Development Server

Start the fast Turbopack development server:

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser. (Typically Next uses 3000, but if your backend runs on 3000, start this on a different port like \`npm run dev -- -p 3001\`).

---

## 📦 Production Deployment

The project is fully linter-cleared and AST compiled. Ready for Vercel, Netlify, or any VPS:

```bash
# Compile optimized build
npm run build

# Start production server
npm run start
```
