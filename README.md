# Snake

A classic Nokia-style Snake game built with React, Vite, and TypeScript.

The app includes interactive performance toggles that intentionally degrade rendering performance to demonstrate frontend performance concepts. Its main intention is to project the impact of various performance decisions on overall app performance.
 
## Performance concepts demonstrated

- `transform` vs `top/left` movement
- Forced layout thrashing
- `requestAnimationFrame` vs `setInterval`
- `React.memo` vs non-memoized cell rendering

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

This repo is configured to deploy to GitHub Pages using GitHub Actions.

Expected deployed URL:

```txt
https://<your-github-username>.github.io/snake/
```
