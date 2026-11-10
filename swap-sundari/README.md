# Swap Sundari (MERN MVP)
Phases covered: auth, product CRUD, search/filters, thrift orders, rental engine (overlap check + deposit + late fee), reviews, admin verification.
Payments are a stub (`paymentOk()` in server/routes/orders.js) - swap for Stripe/Razorpay test mode next.

## Run
1. `cd server && cp .env.example .env` (set MONGO_URI) `&& npm i && npm run dev`   -> :5000
2. `cd client && npm i && npm run dev`   -> :5173 (proxies /api)
Make an admin: register, then set `role: "admin"` on that user in Atlas/Compass.
