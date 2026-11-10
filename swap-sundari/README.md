# Swap Sundari (MERN MVP)
Phases covered: auth, product CRUD, search/filters, thrift orders, rental engine (overlap check + deposit + late fee), reviews, admin verification.
Payments are a stub (`paymentOk()` in server/routes/orders.js) - swap for Stripe/Razorpay test mode next.

## Run
1. `cd server && cp .env.example .env` (set MONGO_URI) `&& npm i && npm run dev`   -> :5000
2. `cd client && npm i && npm run dev`   -> :5173 (proxies /api)
Make an admin: register, then set `role: "admin"` on that user in Atlas/Compass.

## Deploy (Netlify + Render + MongoDB Atlas)

The GitHub repository currently contains the app inside the `swap-sundari` folder. Use the paths below when configuring both services.

### 1. Create a MongoDB Atlas database

1. Create an Atlas cluster, a database user, and a database named `swapsundari`.
2. In **Network Access**, allow connections from your Render service. For a quick setup, Atlas can allow `0.0.0.0/0`; use a strong database password and restrict the allowed IPs when you have fixed Render outbound IPs.
3. In **Connect → Drivers**, copy the Node.js connection string. Replace the password placeholder and include `/swapsundari` before any query string. If the password contains reserved URL characters, URL-encode them.

### 2. Deploy the backend to Render

1. Create a **Web Service** from the GitHub repository and select the `main` branch.
2. Set **Root Directory** to `swap-sundari/server`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
3. Add these environment variables in Render:
   - `MONGO_URI`: the Atlas connection string
   - `JWT_SECRET`: a long, random secret (do not reuse your MongoDB password)
   - `FRONTEND_URL`: your Netlify URL, for example `https://your-site.netlify.app`
   - `LATE_FEE_PER_DAY`: `200`
4. Set the Render health check path to `/health`, deploy, then confirm `https://YOUR-SERVICE.onrender.com/health` returns `{"status":"ok"}`. Copy your Render service URL.

### 3. Deploy the frontend to Netlify

1. Import the same GitHub repository into Netlify.
2. Set **Base directory** to `swap-sundari/client`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
3. Add the environment variable `VITE_API_URL` with the full backend API base, for example `https://YOUR-SERVICE.onrender.com/api`.
4. Deploy. The `_redirects` file in `client/public` allows React Router pages to load directly.
5. If you have a custom domain, add its exact origin to Render's `FRONTEND_URL` (comma-separate multiple origins), then redeploy the backend.

After changing `VITE_API_URL` in Netlify, trigger a new deploy so the value is included in the frontend build. Never put Atlas credentials or `JWT_SECRET` in Netlify variables or frontend code.
