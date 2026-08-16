# Savory Spoon — Restaurant Ordering System

Now split into **three apps** sharing one backend:

| App | Folder | Port | Who it's for |
|---|---|---|---|
| API | `backend/` | 5000 | Shared by both frontends |
| Customer Website | `customer-web/` | 5173 | Public — browse menu, order, track status |
| POS Dashboard | `pos-dashboard/` | 5174 | Internal — cashier, kitchen staff, admin |

## Why split it this way

The customer website and the internal POS are different products with different audiences, different login rules, and different designs — bundling them together made the single app harder to reason about and impossible to deploy/secure separately (e.g. you don't want random people finding your admin login on the customer site). Splitting them means:

- The POS can require an **admin signup code** for staff/cashier/admin accounts, while the customer site stays open registration.
- Each app can be deployed, styled, and scaled independently.
- The customer site never ships any admin/staff code to the browser, and vice versa.

## Roles

| Role | App | What they do |
|---|---|---|
| `customer` | Customer Website | Browse menu, place delivery/pickup orders, track status |
| `cashier` | POS Dashboard | Take walk-in dine-in/takeaway orders, view order queue |
| `staff` | POS Dashboard | View & update the kitchen order queue |
| `admin` | POS Dashboard | Everything above + manage menu/categories, view sales & account reports |

## Setup

### 1. Start MySQL (XAMPP)

Start MySQL in the XAMPP Control Panel.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit DB_HOST/DB_PORT/etc. to match your XAMPP setup
npm start
```

This auto-creates the database/tables (or safely migrates an older schema — see "Upgrading an existing database" below) and seeds demo accounts on first run:

```
admin@restaurant.com / admin123
staff@restaurant.com / staff123
cashier@restaurant.com / cashier123
customer@restaurant.com / customer123
```

**Set your own `ADMIN_SIGNUP_CODE`** in `.env` — this is the code staff/cashier/admin need to know to register a POS account. Don't ship the default value.

### 3. Customer Website

```bash
cd customer-web
npm install
npm run dev
```
→ `http://localhost:5173`

### 4. POS Dashboard

```bash
cd pos-dashboard
npm install
npm run dev
```
→ `http://localhost:5174`

Run all three at once (three terminals) to use the full system.

## Upgrading an existing database

If you already ran an earlier version of this project and imported `backend/schema.sql` into phpMyAdmin, you don't need to do anything — `db.js` runs safe `ALTER TABLE` migrations every time the server starts (adding the `cashier` role, walk-in order columns, `avatar_url`, `last_login`, etc.) without touching your existing data. Just pull the new code and run `npm start` as usual.

## What's new in this version

**POS Dashboard**
- Modern sidebar dashboard UI, distinct from the customer site's look, now restyled to the black/orange theme
- Staff/cashier/admin registration gated behind `ADMIN_SIGNUP_CODE`
- Cashier "New Order" terminal — take dine-in (table number) or takeaway (guest name) walk-in orders with no customer account needed; menu items now show photos
- Kitchen order queue (staff + cashier + admin)
- Admin: menu/category CRUD with photo upload, sales reports, and an **Accounts** page showing total accounts, new signups today/this week, and how many people logged in today (`GET /api/reports/accounts`)
- "Stay signed in" login option (30-day token vs 7-day)

**Frontend redesign (both apps)**
- Customer website restyled to match a bold black/orange "food ordering" look: rounded pill buttons, a split hero with a circular dish photo, a floating rating/prep-time badge, and a horizontal "featured dishes" strip on the homepage
- Menu cards now show the item photo, a colored accent, and a quick add/remove stepper
- Navbar now has a search icon, a cart icon with a live item-count badge, and a mobile hamburger menu — fully responsive for phone, tablet, and desktop
- POS dashboard restyled from purple to the same black/orange palette; menu item cards now show photos instead of a plain table

**Menu item photos**
- Admins can upload a photo (JPG/PNG/WEBP/GIF, up to 5MB) when creating or editing a menu item, from either the POS dashboard or the customer-site admin panel — no more manually pasting an image URL
- New endpoint: `POST /api/upload/image` (admin-only, multipart form field `image`) — returns `{ url }` to store as the item's `image_url`
- Uploaded files are served from `/uploads/<filename>` and are gitignored (not committed)

**Table number for online orders**
- Customers can now choose **Pickup** or **Dine-in** when checking out on the website; dine-in requires a table number, same as the POS walk-in flow
- `POST /api/orders` now accepts `order_type` (`online` or `dine_in`) and `table_number`
- Order history and the admin/staff order tables show the order type and table number

**Backend**
- `role` enum now includes `cashier`
- New `POST /api/auth/register-staff` (code-gated) alongside the existing public `POST /api/auth/register` (customer-only)
- `orders` table supports walk-in orders: nullable `customer_id`, `guest_name`, `table_number`, `order_type` (`online` / `dine_in` / `takeaway`), `delivery_address`, `created_by`
- New `POST /api/orders/walkin` endpoint for the POS
- `users.last_login` tracked on every login/register, `users.avatar_url` for profile photos
- `PUT /api/auth/me` to update name/avatar
- `GET /api/reports/accounts` — account analytics for the POS

**Customer Website**
- New signups now go through **email verification**: registering creates the account as unverified, emails a 6-digit code, and blocks login until it's confirmed
- Uses **Ethereal Email** for local testing — a free fake-SMTP service that never sends a real email; instead it hands back a "preview" link showing exactly what the email looks like. If Ethereal can't be reached (e.g. offline), the code is still printed to the backend's terminal so you're never blocked from testing.
- "Resend code" option on the verify screen
- Existing accounts (including the demo accounts and anything in your database before this update) are automatically grandfathered in as verified — nobody gets locked out
- Internal POS accounts (staff/cashier/admin) skip this step entirely, since they're already gated by the admin signup code

## Roadmap (not yet built)

From your original feature list, still to come:
- Customer profile photo upload (the same `/api/upload/image` endpoint can be reused for `avatar_url` — just needs a small UI in the profile screen)
- Payment UI (ABA/ACLEDA-style QR + mock success screen — real bank integration needs a merchant account)
- Delivery address input with "use my location" button, Foodpanda/Wonow-style
- QR-code table ordering: printing a QR code per table that deep-links to `/menu?table=N` and pre-fills the dine-in table number
- Star ratings/reviews per dish (the hero's rating badge is currently decorative, not backed by real review data)

Ask for any of these next and they'll be built the same way — tested against a real MySQL database before being handed off.
