# CamRent Frontend

A Vite-powered React + TypeScript codebase for the CamRent application.

## Getting Started

1. Install dependencies with
   - pm install.
2. Launch the development server via
   - pm run dev.
3. Build for production with
   - pm run build and preview using
   - pm run preview.

## Project Structure

`src/

- assets/ Static media files
- components/ Reusable visual building blocks
- config/ Environment and runtime configuration helpers
- constants/ Shared constants (API routes, enums, etc.)
- context/ React context providers
- hooks/ Custom React hooks
- layouts/ Page layout components
- pages/ Top-level route views
- services/ API clients and data access logic
- styles/ Global and shared styling resources
- types/ Shared TypeScript definitions
- utils/ Generic utility helpers`

Public assets that need to be served as-is belong in public/.

## Available Scripts

- pm run dev - start the Vite dev server with hot reload.
- pm run build - produce an optimized production build.
- pm run preview - preview the production build locally.
- pm run lint - lint the project using the configured ESLint rules.
