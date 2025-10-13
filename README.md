# SimVova Server

Simple Express backend for SimVova (proxy to 5SIM).  
Set environment variables (Render → Environment):

- FIVESIM_API_KEY
- MONGO_URI
- APP_KEY
- JWT_SECRET
- PROFIT_MULTIPLIER (optional, default 3)

Endpoints:
- GET / -> health
- GET /services -> list services (converted to USD + profit)
- POST /buy -> requires header x-app-key and body { userId,country,service,operator? }
- GET /status/:id -> check order status from 5sim
- GET /balance -> fetch provider account profile
- Auth: POST /auth/register, /auth/login
- GET /users/me -> requires Bearer token
- Wallet: GET /wallet/:userId, POST /wallet/add
- GET /orders?userId=&limit=

Deploy on Render: connect repo -> set env vars -> Deploy.
