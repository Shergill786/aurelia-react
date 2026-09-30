# Rubric Guide — Component 2: Project Work & Viva (25 marks)

This file shows where each criterion in the Front End Engineering-II rubric is covered in the code, and gives short answers to likely viva questions.

| Criterion | Marks | Where to look first |
| --- | --- | --- |
| HTML Structure & CSS Styling | 8 | `src/components/layout/Layout.jsx`, `src/pages/Checkout.jsx`, `src/styles/` |
| JavaScript & GitHub Basics | 8 | `src/utils/`, folder structure, `git log`, `.github/workflows/deploy.yml` |
| DOM Manipulation | 5 | `src/dom/ripple.js`, `src/hooks/useEvents.js`, `src/pages/ProductDetail.jsx` |
| React Basics | 4 | `src/pages/Shop.jsx`, `src/components/product/ProductCard.jsx`, `src/components/home/Hero.jsx` |

---

## 1. HTML Structure and CSS Styling (8)

### Semantic HTML (written as JSX)

| Element | Where | Why |
| --- | --- | --- |
| `<header>`, `<nav>`, `<main>`, `<footer>` | `layout/Navbar.jsx`, `layout/Layout.jsx`, `layout/Footer.jsx` | Page landmarks that screen readers jump between |
| `<section aria-labelledby>` | every page | Each section is named by its own heading |
| `<article>` | `ProductCard.jsx`, `Orders.jsx` (`OrderCard`) | A product or an order makes sense on its own |
| `<aside>` | `FilterPanel.jsx`, cart and checkout summaries | Content that supports the main content |
| `<figure>` / `<figcaption>` | hero slides (`Hero.jsx`), team cards (`About.jsx`) | Image together with its caption |
| `<form>`, `<label htmlFor>`, `<fieldset>`/`<legend>` | `Checkout.jsx` (payment methods), `FilterPanel.jsx` | Every input has a label; related radios and checkboxes are grouped |
| `<dl>` / `<dt>` / `<dd>` | `Cart.jsx` → `SummaryRows` | Name/value pairs (Subtotal → ₹…) |
| `<table>` with `<caption>` and `<th scope="row">` | `ProductDetail.jsx` (Specifications tab) | A real data table |
| `<del>` | `Price.jsx` | The old price is marked as struck-out, not just styled that way |
| `<ol>` / `<ul>` | breadcrumb, order-tracking steps, cart lines, footer links | Lists are real lists |
| `<address>`, `<blockquote>` | `Contact.jsx`, reviews and team quotes | Contact details and quotations |

**Heading outline:** each page has one `<h1>` (in `PageHero` or the product title), sections use `<h2>`, and cards use `<h3>`.

**Accessibility:**
- A skip link jumps keyboard users to the main content.
- `aria-live` regions announce toasts and the Shop result count.
- Form fields get `aria-invalid` and `aria-describedby` when there is an error.
- The quick-view modal uses `role="dialog"`, closes with Escape and returns focus to where you were.
- Every image has `alt` text, and every link, button and field shows a visible focus ring.

### CSS

| Technique | Where |
| --- | --- |
| Design tokens with **CSS custom properties** (`--gold`, `--surface`, `--radius-m`, …) | `styles/style.css` (top) |
| **Dark mode**: the same variables redefined under `[data-theme="dark"]` | `styles/style.css` |
| **CSS Grid** (product grid, footer, checkout layout) and **Flexbox** (navbar, cards) | `style.css`, `product.css`, `cart.css` |
| **Responsive design**: media queries at 1200 / 1024 / 820 / 480 / 380px, `clamp()` font sizes, `minmax(0, 1fr)` so grids can't overflow | `styles/responsive.css`, `extras.css` |
| **Animations**: `@keyframes`, transitions, scroll reveal, marquee, `prefers-reduced-motion` respected | `home.css`, `style.css`, `extras.css` |
| `position: sticky` navbar, `backdrop-filter`, gradients, `::before`/`::after` decorations | `style.css`, `home.css` |
| **File organisation**: design system → page styles → extras → responsive, imported in that order | `src/main.jsx` |

Tested with no sideways scrolling at 320, 375, 414 and 768px widths.

---

## 2. JavaScript and GitHub Basics (8)

### Folder structure

The code is split by role: `pages/`, `components/` (grouped into `common`, `layout`, `product` and `home`), `context/`, `hooks/`, `utils/`, `dom/`, `data/` and `styles/`. The README shows the tree.

### Reusable components

Each of these is written once and used in many places:

| Component | Used by |
| --- | --- |
| `ProductCard` | Home sliders, Shop, Wishlist, related products |
| `ProductGrid` | Shop, Wishlist, Product page |
| `EmptyState` | Cart, Checkout, Orders, Wishlist, 404, product not found |
| `FormField` | Checkout, Contact, Login, Signup |
| `Modal` | Quick view (on Home, Shop and Wishlist) |
| `QuantitySelector` | Product page, Cart |
| `Price`, `StarRating` | cards, quick view, product page |
| `PageHero`, `Breadcrumb`, `SectionHead` | almost every page |
| `FaqItem`, `Reveal` | Product page, Contact, About, Home |

### Modern JavaScript

- **ES modules** (`import`/`export`)
- **Arrow functions** and **destructuring** (`const { name, price } = product`)
- **Spread** (`[...cart, item]`, `{ ...form, [name]: value }`)
- **Template literals**
- **Optional chaining** (`ref.current?.focus()`) and **nullish coalescing** (`decimals ?? 0`)
- **Array methods:** `map`, `filter`, `reduce`, `some`, `find`, `sort`
- **`Set`** to de-duplicate brands
- **Regular expressions** for validation
- **`try/catch`** around `localStorage`
- **`Intl`** number formatting (`toLocaleString('en-IN')`)

**Pure functions** hold the business logic and have no React inside:
- `utils/cart.js`: `computeTotals` is the one place GST, coupons and shipping are calculated.
- `utils/validation.js`: a rules-object `validate()` plus the checkout rules.
- `utils/format.js` (`formatINR`) and `utils/search.js`.

### Naming conventions

- Components: `PascalCase`. Hooks: `useSomething`. Functions and variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`. CSS classes: `kebab-case`.
- Event handlers are named `handleSubmit` / `handleChange` (or `onSomething` when passed as a prop).

### Clean code

- `npm run lint` (oxlint) reports **0 warnings**.
- Each file starts with a comment explaining what it does.
- No duplicated maths: one `computeTotals` and one `matchesSearch`.
- Magic numbers are named constants (`FREE_SHIP_THRESHOLD`, `GST_RATE`, `SLIDE_MS`).
- `.editorconfig` keeps formatting consistent.

### GitHub practice

- The history is built step by step, with each commit doing one thing. Run `git log --oneline` to see it.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `ci:`, `docs:`), with a short subject and a body explaining why.
- `.gitignore` keeps `node_modules/` and `dist/` out of the repository.
- `.github/workflows/deploy.yml` lints, builds and deploys to GitHub Pages on every push to `main`.
- **What the team must do:** push to your group repository and keep committing regularly through the semester. Each member should commit their own work, because the evaluator looks at individual contributions and version history.

---

## 3. DOM Manipulation (5)

React normally updates the DOM for us. These are the places where the code works with the DOM directly, and why:

| DOM concept | File | What it does |
| --- | --- | --- |
| `createElement`, `appendChild`, `remove()`, `element.style`, **event delegation**, `closest()`, `getBoundingClientRect()` | `src/dom/ripple.js` | Plain JS with no React. One click listener on `document` draws a ripple inside whichever `.btn` was clicked, then removes it |
| `addEventListener` / `removeEventListener` on `window` (`scroll`) | `hooks/useScroll.js` | Scroll progress bar, navbar shadow, back-to-top button |
| `document` `mousedown`/`touchstart` + `Node.contains()` | `hooks/useEvents.js` → `useClickOutside` | Closes search suggestions when you click elsewhere |
| `document` `keydown` | `hooks/useEvents.js` → `useKeyDown` | Escape closes the modal and the mobile menu |
| `document.body.style.overflow` | `hooks/useEvents.js` → `useLockBodyScroll` | Stops the page scrolling behind a modal |
| `IntersectionObserver` | `hooks/useAnimations.js` → `useInView` | Fade-in on scroll; starts the About-page counters |
| `requestAnimationFrame` | `hooks/useAnimations.js` → `useCountUp` | Smooth number count-up |
| `element.scrollBy()` through `useRef` | `components/product/ProductSlider.jsx` | ‹ › slider buttons |
| `getBoundingClientRect()` + `ref.current.style.transformOrigin` | `pages/ProductDetail.jsx` → `ImageGallery` | Zoom follows the mouse without re-rendering |
| `document.getElementById(...).scrollIntoView()` | `Hero.jsx`, `Layout.jsx` | "Explore Categories" button and `/contact#faq` links |
| `.focus()`, `querySelector()`, `document.activeElement` | `Checkout.jsx`, `Contact.jsx`, `Modal.jsx`, skip link | Focus jumps to the first invalid field; the modal returns focus when it closes |
| `document.documentElement.setAttribute('data-theme', …)` | `context/ThemeContext.jsx`, `index.html` | Switches the whole colour scheme |
| `document.title` | `hooks/useDocumentTitle.js` | Browser tab title per page |
| `new Image()` + `onload` / `onerror` | `pages/Loading.jsx` | Preloads the home-page photos and drives the loading progress bar |
| `event.preventDefault()` | every form, skip link | Stops full-page reloads |

Every listener added in a `useEffect` is removed in its cleanup function, so none are left behind.

---

## 4. React Basics (4)

| Concept | Example |
| --- | --- |
| **JSX**: expressions `{}`, conditional rendering (`&&`, ternary), lists with `map()` and `key` | `ProductGrid.jsx` (`products.map(p => <ProductCard key={p.id} … />)`), `Cart.jsx` (empty cart vs list) |
| **Functional components** | Every component is a function. Some are tiny (`Price`, `StarRating`), some are full pages |
| **Props** (data and callbacks passed down) | `<ProductCard product={p} onQuickView={setQuickView} />`, `<QuantitySelector value={qty} onChange={setQty} />`, `children` in `AuthCard` and `Modal` |
| **State with `useState`** | `Shop.jsx`: `filters`, `sort`, `quickView`. `ProductDetail.jsx`: `color`, `size`, `qty`, `tab`. `Checkout.jsx`: `form`, `errors`, `payment`. `FaqItem.jsx`: `open` |
| **Lazy initial state** | `useState(() => filtersFromParams(params))`, and the `localStorage` read in `useLocalStorage` |
| **`useEffect`** with dependencies and cleanup | `Hero.jsx` (auto-slide timer), `HomeSections.jsx` → `Countdown` (`setInterval` + `clearInterval`), `useLocalStorage` (saves on change), `ThemeContext` (writes `data-theme`), `useScroll` (adds and removes a listener) |
| **Controlled forms** | Checkout, Contact, Login, Signup, coupon, newsletter, filters: every value lives in state |
| **Lifting state up** | `FilterPanel` only displays filters; `Shop` owns them and passes `filters` + `onChange` |
| **Context API** | `ShopContext` (cart, wishlist, orders, coupon), `AuthContext` (signed-in user), `ThemeContext`, `ToastContext`. Read with `useShop()`, `useAuth()`, `useTheme()`, `useToast()` |
| **Custom hooks** | `useLocalStorage`, `useScroll`, `useInView`, `useCountUp`, `useTypewriter`, `useClickOutside`, `useKeyDown`, `useDocumentTitle` |
| **Other hooks** | `useMemo` (filtered list), `useRef` (DOM access), `useCallback` (`showToast`), `useId` (FAQ ids) |
| **The `key` prop to reset state** | `<ShopView key={url}>` and `<ProductView key={product.id}>` start fresh when the URL changes |
| **Routing** | `App.jsx`: `HashRouter`, index route = Loading screen, nested routes with a shared `Layout` + `<Outlet>`, `useParams`, `useSearchParams`, `useNavigate` (with `replace`), `NavLink` active styling, 404 route |
| **Several effects working together** | `pages/Loading.jsx`: one effect preloads images (with cleanup), one runs the minimum-time and timeout timers, and one navigates once both are done — to `/home` if signed in, otherwise `/login` |

---

## Likely viva questions

**Why React instead of plain HTML pages?**
The navbar, product card and footer are written once and reused. When state changes (for example, adding to the cart), React updates only what changed: the badge, the cart and the totals all stay in sync automatically.

**What is the difference between props and state?**
Props are passed in by the parent and are read-only in the child. State belongs to the component and changes over time with its setter. For example, `QuantitySelector` receives `value` as a prop, but the page that uses it owns `qty` as state.

**When does `useEffect` run?**
After React renders. With `[]` it runs once after the first render. With `[x]` it runs again whenever `x` changes. The function it returns (the cleanup) runs before the next run and when the component unmounts. See `Countdown`, which starts an interval and clears it in the cleanup.

**Why is cleanup needed?**
Without it, timers and event listeners keep running after the component is gone. That leaks memory and can try to update a component that no longer exists.

**Why a `key` in lists?**
So React can tell which item is which between renders. The code uses the product `id`, not the array index.

**How is the cart saved after a refresh?**
`useLocalStorage` reads `localStorage` once as the initial state, and a `useEffect` writes the value back every time it changes.

**How do the filters work?**
`Shop` keeps a `filters` object in state. `FilterPanel` shows it and reports changes. `useMemo` runs `applyFilters()`, a pure function, to get the list, and `ProductGrid` renders it. The URL (`?section=Men`) sets the starting filters.

**Where is "real" DOM manipulation if React handles the DOM?**
Mainly in `src/dom/ripple.js` (createElement, appendChild, event delegation). There are also refs and effects for scroll, focus, IntersectionObserver and `getBoundingClientRect()`; see section 3 for the full list.

**Why `HashRouter`?**
GitHub Pages only serves static files. With a hash URL (`/#/shop`), refreshing any page still loads `index.html`, so nothing 404s.

**What happens when the site opens?**
`/` is the Loading page. It preloads the home-page photos (progress bar), waits at least 1.8s and at most 4.5s, then uses `navigate(..., { replace: true })` to go to Login, or straight to `/home` if `AuthContext` says you're already signed in. `replace` means the Back button won't return to the splash.

**How is GST calculated?**
In `computeTotals` (`utils/cart.js`): subtotal minus the coupon discount, then 18% GST on that amount, plus ₹199 shipping below ₹4,999.
