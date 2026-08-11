# E-Commerce App

A single-page e-commerce storefront built with React, TypeScript, and Vite. Firebase is the entire backend: Firebase Authentication handles accounts, and Cloud Firestore stores users, products, carts, and orders. The shopping cart is managed with Redux Toolkit.

**Live demo:** https://ecommerce-seven-delta-83.vercel.app

![Storefront product catalog](docs/screenshot.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Seeding Products](#seeding-products)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Firestore Data Model](#firestore-data-model)
- [Security Rules](#security-rules)
- [Deployment](#deployment)

## Features

### Product Catalog

- Products are read from the `products` collection in Firestore with React Query — there is no third-party product API at runtime.
- Each product card shows title, price, category, description, star rating, and image.
- Images that fail to load fall back to a placeholder so the layout never breaks.
- The category dropdown is derived from the products actually in the database, so it stays correct as products are added, edited, and removed. Filtering happens client-side against the already-loaded list, avoiding a second round trip.

### Product Management

- Signed-in users get full CRUD over the catalog, all of it in the app — no console work required.
- **Create:** an "Add product" button on the home page opens a form for title, price, description, category, and image URL.
- **Update:** every product card carries an "Edit" link that loads the same form pre-filled.
- **Delete:** the edit page has a delete button behind a confirmation prompt.
- After any change the products query is invalidated, so the catalog reflects the edit immediately.
- The `/products/new` and `/products/:id/edit` routes are wrapped in a `RequireAuth` guard that waits for the initial auth check before deciding, so a signed-in user is never bounced to the login page on a page refresh.
- Products created in the app start with a zeroed rating; ratings on seeded products come from the seed data.

### Accounts

- Three ways in through Firebase Authentication: email and password, Google, or an anonymous guest session. All three are offered on both the login and register pages.
- Registering creates a matching document in the `users` collection, keyed by the account's UID.
- Google and guest sign-ins never touch the register form, so `AuthContext` also upserts a user document whenever it sees an authenticated user without one. Every way into the app ends with a profile document.
- Firebase auth error codes are translated into readable messages, so a closed Google popup is ignored rather than shown as an error, and a disabled provider says so instead of surfacing `auth/operation-not-allowed`.
- Auth state is shared app-wide through `AuthContext`, which also exposes an `authReady` flag so the rest of the app can tell "not signed in" apart from "not known yet" during the initial auth check.
- The navbar swaps between Login/Register and Profile/Logout depending on whether anyone is signed in.

### User Profile (CRUD)

- **Create:** a user document is written at registration, or on first sign-in for Google and guest accounts.
- **Read:** the profile page loads the document from Firestore and fills the form from it.
- **Update:** display name and address are editable. Saving writes to Firestore and updates the Auth display name too, so the navbar and profile agree. The form is seeded once per user rather than on every refetch, so a background refresh can't wipe out edits in progress.
- **Delete:** deleting the account removes the user document, the saved cart, and every order that user placed, then deletes the Auth user itself. Firestore deletions run first — once the Auth user is gone the security rules would reject them.
- Email is shown read-only; changing it is a Firebase Auth operation with its own verification flow, not a profile field.

### Shopping Cart

- State is managed globally with Redux Toolkit (`cartSlice` + `configureStore`).
- Add a product to the cart directly from the home page listing.
- View, adjust quantity, or remove any item from the dedicated Cart page.
- Running total item count and total price update live as the cart changes.
- Cart contents persist in `sessionStorage` for everyone, so a guest's cart survives a page refresh.
- For signed-in users the cart is additionally saved to Firestore, so it follows them across browsers and devices. Writes are debounced so that holding down a quantity input doesn't generate a write per keystroke.
- Signing in **merges** a guest cart with the saved one rather than picking a winner: items are matched on product id and the larger of the two quantities is kept, so nothing the user added is silently dropped.
- Signing out clears the local cart so the next person to use the browser doesn't inherit it.

### Orders

- Checkout requires an account; signed-out users are sent to the login page.
- Placing an order writes a document containing the full product list, the totals, the placing user's UID, and a server-assigned timestamp. The cart is only cleared once that write succeeds — a failed order never costs the user their cart.
- The profile page lists past orders newest-first with order ID, date, item count, and total.
- Clicking an order opens `/orders/:orderId`, showing every product in it with image, unit price, quantity, and line total, plus the order total.
- Orders store a snapshot of the products as they were bought. Editing or deleting a product later does not rewrite order history.

## Tech Stack

| Category         | Library                                  |
| ---------------- | ---------------------------------------- |
| UI               | React 19, Bootstrap 5, custom CSS        |
| Language         | TypeScript                               |
| Build tool       | Vite                                     |
| Auth & database  | Firebase Authentication, Cloud Firestore |
| Data fetching    | TanStack React Query                     |
| State management | Redux Toolkit, React Redux               |
| Routing          | React Router                             |
| Ratings widget   | @smastrom/react-rating                   |

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes bundled with Node.js)
- A [Firebase](https://console.firebase.google.com/) project, if you want to run this against your own backend rather than the one already configured

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

The Firebase config is checked into `src/lib/firebase/firebase.ts` and points at an existing demo project that already has products in it, so the app runs as-is. See below to point it at your own.

## Firebase Setup

To run against your own Firebase project:

1. Replace the `firebaseConfig` object in `src/lib/firebase/firebase.ts` with the config from your project (Project settings → Your apps → Web app).
2. Under **Authentication → Sign-in method**, enable **Email/Password**, **Google**, and **Anonymous**. The app offers all three; any you leave disabled will report that the method isn't enabled when someone tries it. Anonymous is also what the seed script uses to authenticate.
3. Create a **Cloud Firestore** database.
4. Publish the security rules in [`firestore.rules`](firestore.rules) (Firestore → Rules). Do not leave the database in test mode — those rules allow the whole world to read every order, and they expire after 30 days.
5. Create the composite index described in [`firestore.indexes.json`](firestore.indexes.json): collection `orders`, `userId` ascending then `createdAt` descending. The order history query needs it, and Firestore will not create it automatically. If you skip this step the profile page reports the failure and links straight to the console page that creates it.
6. Populate the catalog — see [Seeding Products](#seeding-products). A fresh project has no products, so the home page will be empty until you either run the seed script or add products through the app.

Steps 4 and 5 can be done from the Firebase console by hand. If you prefer, installing the [Firebase CLI](https://firebase.google.com/docs/cli) and running `firebase init firestore` lets you deploy both files with `firebase deploy --only firestore` instead.

Note that a Firebase web API key is a public project identifier rather than a secret — it ships in the client bundle by design. The security rules, not the key, are what protect the data.

## Seeding Products

`scripts/seed-products.mjs` gives a fresh database a catalog to work with. It fetches the sample product set from the [Fake Store API](https://fakestoreapi.com), drops their numeric IDs so Firestore assigns its own, and writes each one into the `products` collection:

```bash
npm run seed:products
```

This is a one-time bootstrap, not a runtime dependency — the app itself never calls Fake Store. Running it twice creates a second copy of every product. If you would rather start from nothing, skip it and use the in-app "Add product" form.

The script reads its Firebase config from its own copy at the top of the file; update it alongside `src/lib/firebase/firebase.ts` if you switch projects. It signs in anonymously to satisfy the write rule on `products`, so Anonymous sign-in must be enabled.

## Available Scripts

| Command                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run dev`            | Starts the Vite dev server with hot module reload.                |
| `npm run build`          | Type-checks the project and builds it for production.             |
| `npm run preview`        | Serves the production build locally to sanity-check it.           |
| `npm run lint`           | Runs ESLint across the codebase.                                  |
| `npm run seed:products`  | One-time bootstrap of the `products` collection with sample data. |

## Project Structure

```
scripts/               # One-off maintenance scripts (product seeding)
src/
├── app/               # Redux store configuration and sessionStorage persistence
├── components/        # ProductCard, ProductForm, Cart, Navbar and other UI components
├── context/           # React Context for auth state and product/category state
├── features/cart/     # Cart slice, Firestore sync hook, and its mount component
├── lib/firebase/      # Firebase initialization, auth helpers, Firestore queries
├── pages/             # Route-level pages
└── types/             # Shared TypeScript types
```

Every Firestore read and write lives in `src/lib/firebase/firestore.ts` so that components never talk to the SDK directly.

## Routes

| Path                  | Page                                                                     | Auth required |
| --------------------- | ------------------------------------------------------------------------ | ------------- |
| `/`                   | Home — product catalog, category filter, add to cart                     | No            |
| `/cart`               | Shopping cart — view, edit, remove items, checkout                       | No (checkout does) |
| `/profile`            | Profile — edit name and address, order history, delete account           | No (empty when signed out) |
| `/orders/:orderId`    | Order detail — full product list and total for one order                 | Yes           |
| `/products/new`       | Create a product                                                          | Yes           |
| `/products/:id/edit`  | Edit or delete a product                                                  | Yes           |
| `/login`              | Sign in with email and password, Google, or as a guest                   | No            |
| `/register`           | Create an account                                                         | No            |
| `/logout`             | Signs the current user out                                                | No            |

## Firestore Data Model

| Collection | Document ID    | Fields                                                                    |
| ---------- | -------------- | ------------------------------------------------------------------------- |
| `users`    | the user's UID | `userId`, `email`, `displayName`, `address`, `createdAt`, `updatedAt`      |
| `products` | auto-generated | `title`, `price`, `description`, `category`, `image`, `rating`             |
| `carts`    | the user's UID | `items`, `updatedAt`                                                       |
| `orders`   | auto-generated | `userId`, `items`, `totalItems`, `totalPrice`, `createdAt`                 |

Each user has exactly one profile document and at most one cart document, both keyed by UID, plus any number of order documents tagged with their `userId`. Orders embed a copy of the cart items rather than referencing products, so order history stays accurate after the catalog changes.

## Security Rules

[`firestore.rules`](firestore.rules) grants:

- `users/{uid}` and `carts/{uid}` — read and write only to the signed-in user whose UID matches the document ID.
- `orders/{id}` — read and delete only to the user whose `userId` is on the document, create only when the new document's `userId` matches the caller, and updates never. Orders are immutable once placed.
- `products/{id}` — readable by anyone so the storefront works signed out, writable by any authenticated user. This matches the assignment brief, where product management is a user-facing feature rather than an admin one. A production catalog would gate writes on an admin claim instead.
- Everything else is denied.

## Deployment

The app is a static Vite build, so it deploys to Vercel or Netlify with no server. `vercel.json` and `netlify.toml` are included and already rewrite all paths to `index.html`, so `/cart` and `/profile` survive a direct visit or a refresh instead of returning a 404.

- Build command: `npm run build`
- Publish directory: `dist`

Firestore rules and indexes are not part of the static build — deploy those to Firebase separately, as described under [Firebase Setup](#firebase-setup). Remember to add your deployed domain under Authentication → Settings → Authorized domains, or sign-in will fail in production.

Checkout records a real order document in Firestore, but no payment is taken and nothing ships.
