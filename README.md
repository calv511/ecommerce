# E-Commerce App

A single-page e-commerce storefront built with React, TypeScript, and Vite. Products are pulled live from the [Fake Store API](https://fakestoreapi.com), and the shopping cart is managed with Redux Toolkit and persisted in `sessionStorage`.

**Live demo:** _add your deployed URL here_

![Storefront product catalog](docs/screenshot.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Data Source](#data-source)

## Features

### Product Catalog
- Fetches all products from the API using React Query and displays them on the home page.
- Each product card shows title, price, category, description, star rating, and image.
- Images that fail to load (a known issue with some Fake Store API image URLs) automatically fall back to a placeholder so the layout never breaks.
- A category dropdown is populated dynamically from the API — nothing is hardcoded. Selecting a category re-queries the category-specific endpoint and shows only matching products.

### Shopping Cart
- State is managed globally with Redux Toolkit (`cartSlice` + `configureStore`).
- Add a product to the cart directly from the home page listing.
- View, adjust quantity, or remove any item from the dedicated Cart page.
- Cart contents persist in `sessionStorage`, so they survive page refreshes and are shared across the app for the duration of the browser session.
- Running total item count and total price update live as the cart changes.
- A simulated checkout clears the cart (Redux state + `sessionStorage`) and shows a success message.

## Tech Stack

| Category         | Library                                   |
|-------------------|-------------------------------------------|
| UI                | React 19, React Bootstrap, Bootstrap 5    |
| Language          | TypeScript                                |
| Build tool        | Vite                                      |
| Data fetching     | TanStack React Query, Axios               |
| State management  | Redux Toolkit, React Redux                |
| Routing           | React Router                              |
| Ratings widget    | @smastrom/react-rating                    |

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes bundled with Node.js)

## Getting Started

1. Clone the repository and move into the project folder:

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the URL Vite prints in the terminal (typically [http://localhost:5173](http://localhost:5173)) in your browser.

No environment variables or API keys are required — the app talks directly to the public Fake Store API.

## Available Scripts

| Command           | Description                                          |
|--------------------|------------------------------------------------------|
| `npm run dev`      | Starts the Vite dev server with hot module reload.    |
| `npm run build`    | Type-checks the project and builds it for production. |
| `npm run preview`  | Serves the production build locally to sanity-check it. |
| `npm run lint`     | Runs ESLint across the codebase.                      |

## Project Structure

```
src/
├── api/               # Axios client and API request functions
├── app/               # Redux store configuration
├── components/        # ProductCard, Cart, and other UI components
├── context/           # React Context for product/category state
├── features/cart/     # Redux Toolkit cart slice (actions + reducer)
├── pages/              # Route-level pages (Home, Profile, Cart)
└── types/              # Shared TypeScript types
```

## Routes

| Path       | Page                                             |
|------------|---------------------------------------------------|
| `/`        | Home — product catalog, category filter, add to cart |
| `/cart`    | Shopping cart — view, edit, remove items, checkout |
| `/profile` | Simple profile page listing loaded products       |

## Deployment

The app is a static Vite build, so it deploys to Vercel or Netlify with no server. `vercel.json` and `netlify.toml` are included and already rewrite all paths to `index.html`, so `/cart` and `/profile` survive a direct visit or a refresh instead of returning a 404.

- Build command: `npm run build`
- Publish directory: `dist`

## Data Source

All product and category data comes from the [Fake Store API](https://fakestoreapi.com):

- `GET /products` — all products
- `GET /products/categories` — list of available categories
- `GET /products/category/{category}` — products in a specific category

The Fake Store API is a free testing API; it does not process real orders, which is why checkout is simulated locally.
