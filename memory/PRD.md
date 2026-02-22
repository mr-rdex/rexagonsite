# Rexagon Minecraft Server - PRD

## Original Problem Statement
Build a website for a Minecraft server (Rexagon) using React.js and MongoDB with FastAPI backend. Turkish language. Dark theme (#222222 bg, #FDD500 accent).

## Tech Stack
- **Frontend:** React.js, TailwindCSS, Lucide icons
- **Backend:** FastAPI, Motor (async MongoDB), JWT auth, bcrypt
- **Database:** MongoDB
- **Avatars:** Cravatar.eu | **Skins:** mc-heads.net

## Implemented Features
- [x] User registration/login (JWT)
- [x] Homepage with Minecraft hero, stats, leaderboards, news
- [x] Forum system (7 categories)
- [x] Market with categories + discounts + image support
- [x] Leaderboard page (6 tabs: Kredi, Ada Seviyesi, Dinar, Son Kayitlar, Son Alisverisler, Son Kredi Yuklemeler)
- [x] Profile pages (full-width banner, 3-col layout: bio+stats | themes | body skin)
- [x] Profile Themes system (admin-managed, users unlock/select via credits)
- [x] Profile Settings modal (biography edit + password change)
- [x] Admin Panel (5 tabs: Users, Market, News, Reports, Themes)
- [x] Admin edit popup modals for Market/News/Themes
- [x] Help Center (footer popup report form + admin view)
- [x] Privacy Policy popup (footer)
- [x] Wallet page
- [x] Hakkimizda page
- [x] Responsive mobile design
- [x] Server IP copy button

## Key Endpoints
- Auth: POST /api/auth/kayit, /api/auth/giris, GET /api/auth/me
- Users: GET /api/users/{username}, PUT /api/users/sifre, PUT /api/users/biyografi
- Market: GET /api/market/urunler, /api/market/{kategori}/urunler
- Themes: GET /api/themes, POST /api/themes/{id}/satin-al, PUT /api/themes/aktif/{id}
- Leaderboard: GET /api/leaderboard/{kredi|ada-seviyesi|dinar|son-kayitlar|son-alisverisler|son-kredi-yuklemeler}
- Reports: POST /api/reports
- Admin: CRUD for kullanici, haber, market/urun, reports, themes

## Credentials
- **Admin:** rexagon_admin / Rexagon2026!

## MOCKED
- Market purchase: placeholder minecraft command
- Active players: hardcoded 0

## Backlog
- [ ] PayTR/Shopier payment integration
- [ ] Minecraft server command execution
- [ ] Live player stats API
- [ ] Forum topic editing
