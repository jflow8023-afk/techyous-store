# TechYous Store — Standalone Source

React 19 + TanStack Start (Vite 7) + Tailwind CSS v4 e-commerce store, ready to deploy to Vercel.

## What's inside

- **Storefront** (`src/routes/index.tsx`, `src/routes/product.$id.tsx`): hero, sticky category bar, search, sort, product cards with stock badges, product detail pages.
- **Cart & checkout** (`src/components/CartDrawer.tsx`): sliding drawer, 100 MAD minimum order, shipping (20 MAD Kenitra / 30 MAD other cities), cash-on-delivery checkout, direct WhatsApp ordering.
- **Admin dashboard** (`src/routes/admin.tsx`): 6-digit PIN gate (`101528`), stats, product CRUD with image upload, order status management.
- **i18n** (`src/lib/i18n.ts`): Arabic (RTL, default), French, English with automatic dir switching.
- **WhatsApp & socials** (`src/lib/contact.ts`): order messages, floating WhatsApp button, footer social links.
- **Theme** (`src/styles.css`): Tailwind v4 `@theme` tokens (dark navy + cyan, Cairo/Tajawal fonts).

## Data model (important)

All data (products, orders, cart) persists in **localStorage** under the key `techyous-store-v1`. This is per-browser: products you add in the admin and orders placed by customers exist only in that visitor's browser. There is no shared server database. If you need shared data later, connect a backend (e.g. Lovable Cloud / Supabase).

The admin PIN `101528` is a client-side convenience check (sessionStorage), not real security.

## Auto-translation note

Product auto-translation (`src/lib/translate.functions.ts`) calls the Lovable AI Gateway and requires a `LOVABLE_API_KEY` env var plus that gateway. Outside Lovable (e.g. on Vercel) it is unavailable; the admin already handles this gracefully — products save without translations and the admin sees an alert. The 6 sample products ship with hand-written FR/EN translations.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy to Vercel

Option A — CLI (no git):

```bash
npm i -g vercel
vercel link        # once: create/link the project
npm run build      # emits .vercel/output (Vercel Build Output API)
npx nitro deploy --prebuilt
```

Option B — git-connected:

```bash
# Push this folder to GitHub, import it on vercel.com
# Framework Preset: Other
# Build Command:    npm run build
# Output Directory: leave empty (uses .vercel/output automatically via the build)
```

For a git-connected deployment Vercel runs the build itself; the Nitro "vercel" preset writes the Build Output API bundle, so no extra settings are needed beyond the build command.

## Customization

- Store info (phone, WhatsApp, socials): `src/lib/contact.ts`
- Categories: `src/lib/categories.ts`
- Cities & shipping fees: `CITIES` / `shippingFor` in `src/lib/store.ts`
- Minimum order: `MIN_ORDER` in `src/lib/store.ts`
- Texts in all 3 languages: `src/lib/i18n.ts`
- Theme tokens: `src/styles.css`
- Sample products: `seed` array in `src/lib/store.ts`
