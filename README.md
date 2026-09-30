# Aurelia — React Clothing Store

A responsive online clothing store for men, women and kids, built with **React 19**, **React Router 7** and **Vite**.
Project for **Front End Engineering-II (25CSE0203)**, BECSE (AIML) Batch 2025, Chitkara University.

> **For evaluators:** [`docs/RUBRIC_GUIDE.md`](docs/RUBRIC_GUIDE.md) maps every Component 2 criterion
> (HTML/CSS, JavaScript & GitHub, DOM, React) to the exact files that show it.

## Team

| Name | Roll no. | Main contribution |
| ---- | -------- | ----------------- |
| _add name_ | _add_ | _e.g. Shop page, filters_ |
| _add name_ | _add_ | _e.g. Cart & checkout_ |
| _add name_ | _add_ | _e.g. Home, About, styling_ |
| _add name_ | _add_ | _e.g. Auth pages, hooks_ |

## Features

- **13 pages:** Loading screen, Login, Signup, Home, Shop, Product, Cart, Checkout, Orders, Wishlist, About, Contact and a 404 page
- **Start-up flow like the original site:** the app opens on a Loading screen (it preloads the home-page photos and shows real progress), then Login, then the store. Signed-in visitors go straight from Loading to the store; "Continue as guest" skips sign-in.
- **119 products** in 3 sections and 6 clothing types, each with its own photo
- **Shop filters:** search, section, type, brand, price slider and rating, plus sorting; filters can be set from the URL (`/shop?section=Men`)
- **Product page:** image zoom that follows the cursor, colour/size/quantity pickers, tabs, related products
- **Cart:** quantities, coupons (`AURELIA10`, `WELCOME15`, `GOLD20`), 18% GST, free shipping over ₹4,999
- **Checkout:** validated form (Indian PIN and mobile formats), payment choice, saved order history with tracking steps
- **Wishlist, live navbar search, quick-view modal, toasts, dark mode.** Cart, wishlist, orders and theme are saved in `localStorage`.
- **Responsive** from 320px phones to desktop; **accessible** (semantic landmarks, labelled form fields, keyboard support, skip link)

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the dev server → open the URL it prints (usually http://localhost:5173)
                 # it opens on the Loading screen, then Login (any email + 6-char password works)
npm run lint     # check code quality with oxlint
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Folder structure

```
aurelia/
├── index.html                 page shell (meta tags, fonts, pre-render theme script)
├── public/                    static files copied as-is (favicon)
├── src/
│   ├── main.jsx               entry point: global CSS, ripple, renders <App />
│   ├── App.jsx                providers + all routes
│   ├── pages/                 one component per page (Home, Shop, ProductDetail, …)
│   ├── components/
│   │   ├── common/            small reusable UI: Price, StarRating, Modal, FormField, …
│   │   ├── layout/            Navbar, SearchBox, Footer, Layout
│   │   ├── product/           ProductCard, ProductGrid, FilterPanel, QuickViewModal, ProductSlider
│   │   └── home/              Hero, CategoryGrid, Countdown, Newsletter, …
│   ├── context/               shared state: ShopContext (cart, wishlist, orders), Auth, Theme, Toast
│   ├── hooks/                 custom hooks: useLocalStorage, useScroll, useInView, …
│   ├── utils/                 pure JS helpers: formatINR, cart maths, validation, search
│   ├── dom/                   plain-DOM enhancements (click ripple)
│   ├── data/                  product catalogue + home-page image list
│   └── styles/                CSS: design system, page styles, responsive rules
├── docs/RUBRIC_GUIDE.md       where each rubric criterion is shown
└── .github/workflows/         GitHub Pages deployment
```

## Conventions

- **Components** use `PascalCase` (`ProductCard.jsx`), with one main component per file.
- **Hooks** start with `use` (`useLocalStorage`). **Utilities** and **variables** use `camelCase`.
- **Constants** use `UPPER_SNAKE_CASE` (`FREE_SHIP_THRESHOLD`). **CSS classes** use `kebab-case`.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`.
- **Before pushing**, run `npm run lint` and `npm run build`. Both must pass.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project (see below).
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` then runs `.github/workflows/deploy.yml`, which lints, builds and publishes the site.

```bash
git remote add origin https://github.com/<your-username>/aurelia.git
git push -u origin main
```

The app uses `HashRouter` (URLs look like `/#/shop`), so page links and refreshes work on GitHub Pages without any server setup.

## Credits

Product and editorial photos are from [Unsplash](https://unsplash.com). Fonts: Playfair Display and Inter (Google Fonts).
