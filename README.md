# 3W Social — Mini Social Post Application

A full-stack social feed (signup/login, text+image posts, likes, comments)
built for the 3W Full Stack Internship assignment. UI is styled in MUI,
loosely inspired by the TaskPlanet Social page (dark theme, pill buttons,
rounded cards).

## Stack

- **Frontend:** React (Vite) + Material UI (MUI) + React Router + Axios
- **Backend:** Node.js + Express + JWT auth + Multer (image upload)
- **Database:** MongoDB (Mongoose) — exactly 2 collections: `users`, `posts`
  (likes and comments are embedded inside each post document)

## Project structure

```
threew-social/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── models/Post.js
│   ├── routes/auth.js
│   ├── routes/posts.js
│   ├── uploads/            (uploaded post images live here)
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/     (CreatePost, PostCard, ProtectedRoute)
    │   ├── context/        (AuthContext)
    │   ├── pages/          (Login, Signup, Feed)
    │   ├── api.js
    │   ├── theme.js
    │   ├── App.jsx
    │   └── main.jsx
    └── .env
```

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI (Atlas or local), JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev        # nodemon, restarts on save
# or: npm start
```
Server runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
App runs on `http://localhost:5173`.

Open the app, sign up, create a post (text and/or image), and like/comment
from a second account to see it update instantly.

## API reference

| Method | Route                     | Auth | Description                          |
|--------|---------------------------|------|--------------------------------------|
| POST   | `/api/auth/signup`        | No   | Create account, returns JWT          |
| POST   | `/api/auth/login`         | No   | Log in, returns JWT                  |
| GET    | `/api/posts?page=&limit=` | No   | Paginated public feed, newest first  |
| POST   | `/api/posts`              | Yes  | Create post (multipart: text/image)  |
| POST   | `/api/posts/:id/like`     | Yes  | Toggle like on a post                |
| POST   | `/api/posts/:id/comment`  | Yes  | Add a comment `{ text }`             |

## Deployment

**Database — MongoDB Atlas**
1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user, allow access from anywhere (0.0.0.0/0) for simplicity
3. Copy the connection string into `MONGO_URI`

**Backend — Render**
1. Push this repo to GitHub (backend and frontend in separate folders, as required)
2. New → Web Service on https://render.com, point it at the repo, set root directory to `backend`
3. Build command: `npm install` — Start command: `npm start`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your deployed frontend URL)
5. Note the deployed URL, e.g. `https://threew-social-api.onrender.com`

**Frontend — Vercel**
1. Import the repo, set root directory to `frontend`
2. Build command: `npm run build` — Output directory: `dist`
3. Add environment variable `VITE_API_URL` = `https://<your-render-url>/api`
4. Deploy

> Note: uploaded images are stored on the backend's local disk. Render's free
> tier has an ephemeral filesystem, so uploaded images are lost on redeploy/restart.
> This is fine for demo purposes; for production, swap the Multer disk storage
> in `routes/posts.js` for Cloudinary or S3.

