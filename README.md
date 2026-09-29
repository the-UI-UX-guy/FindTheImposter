# FindTheImposter

A React + TypeScript + Vite game project themed around the classic social deduction prompt: identifying the imposter.

## Overview

This app currently includes a landing screen with:

- a bold IMPOSTER title
- a start game action
- a game modes section
- a how to play section
- a settings action

The project is structured as a lightweight frontend app and is set up for rapid iteration as the game mechanics are expanded.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS via the Vite plugin
- Oxlint

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Project Structure

```text
src/
  App.tsx        # Main game screen/layout
  index.css      # Global styling
  main.tsx       # App entry point
public/
  favicon.svg    # Default app favicon
src/assets/
  logo.png       # Project logo used in the app metadata
```

## Notes

- The favicon has been updated to use the project logo asset stored in `src/assets/logo.png`.
- The repository ignores generated and local files such as `node_modules`, build output, environment files, and coverage reports.
