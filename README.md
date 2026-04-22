# Seoul Quest

A small React + TypeScript app for learning **Hangul** through a neon-styled quest map: lessons, quizzes, XP, badges, and daily missions. Progress is stored in **localStorage** in your browser.

## Stack

- [Vite](https://vitejs.dev/) 8
- [React](https://react.dev/) 19
- [React Router](https://reactrouter.com/) 7
- ESLint + TypeScript

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Vite)  |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |

## Development

```bash
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`).

### Windows + Rolldown

This project pins `@rolldown/binding-win32-x64-msvc` as a dev dependency so the Vite/Rolldown native binding installs reliably on Windows when npm skips optional dependencies.

## License

Private project (`private: true` in `package.json`). Add a license file if you open-source it.
