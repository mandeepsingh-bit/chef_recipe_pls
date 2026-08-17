# Chef Claude

## Setup
### 1. Backend (server folder)
```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in:
- `MONGODB_URI` — create a free cluster at https://www.mongodb.com/cloud/atlas, get the connection string from "Connect" → "Drivers"
- `JWT_SECRET` — any long random string, e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to generate one

```bash
npm run dev
```
Should print `MongoDB connected` and `Server running on port 5000`.

### 2. Frontend (project root)
```bash
npm install
cp .env.example .env
# add your Groq key + VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

Both need to be running at the same time in two separate terminals.

## Auth architecture — what to be able to explain

**Password storage:** passwords are never stored as plain text. `User.js`
has a `pre("save")` hook that runs automatically before any user document
is saved — it hashes the password with `bcrypt` first. Even if the
database were compromised, raw passwords are never in it.

**Login flow:** `POST /api/auth/login` checks the username exists, then
uses `bcrypt.compare()` to check the submitted password against the
stored hash (you can't "un-hash" a password — you re-hash the login
attempt and compare hashes). If it matches, the server signs a JWT
(JSON Web Token) containing the user's ID, and sends it back.

**What a JWT actually is:** a signed piece of data the server can verify
later without needing to look anything up. It's not encrypted — anyone
can read what's inside it — but it's signed with `JWT_SECRET`, so if
anyone tampers with it, the signature check fails. The frontend stores
this token in `localStorage` and attaches it to every request that needs
to know who's logged in, via the `Authorization: Bearer <token>` header.

**Protected routes:** `verifyToken.js` is middleware — a function that
runs before the actual route handler. It checks the `Authorization`
header, verifies the JWT's signature, and if valid, attaches `userId` to
the request object so the route handler knows who's making the request.
If the token's missing or invalid, it rejects the request with a 401
before the route logic ever runs.

## Newer additions — what to be able to explain

**Delete recipe (`DELETE /api/recipes/:id`):** the query is
`{ _id: req.params.id, user: req.userId }` — both conditions must match.
This means even if someone guessed another user's recipe ID, the delete
would silently fail (return null → 404), because the `user` field
wouldn't match their own `req.userId` from the token. Ownership is
enforced by the database query itself, not by a separate permission check.

**Input validation:** `validateCredentials()` in `authRoutes.js` throws
before hitting the database at all if the username/password don't meet
basic requirements. Throwing inside an `asyncHandler`-wrapped route is
safe — it gets caught and forwarded to `errorHandler.js` automatically.

**Centralized error handling:** every route is wrapped in
`asyncHandler()`, which catches any thrown error (or rejected promise)
and calls `next(err)`. Express then skips straight to `errorHandler.js` —
registered last in `index.js`, since Express matches middleware in
order and only reaches an error handler once something calls `next(err)`.
This means routes just `throw new AppError("message", statusCode)`
instead of repeating `try/catch` + `res.status().json()` everywhere.
`AppError` is a custom class carrying a `statusCode` alongside the
message — for errors *without* that (unexpected bugs, DB failures), the
handler deliberately returns a generic "something went wrong" instead
of leaking the raw error message to the client.

**Restricted CORS:** `cors({ origin: process.env.CLIENT_URL })` instead
of bare `cors()`. Without this, any website's JavaScript could make
authenticated requests to your API on behalf of someone with a valid
token in their browser. Restricting `origin` means the browser blocks
responses to any site that isn't your actual frontend. Set
`CLIENT_URL=http://localhost:5173` locally, and to your real deployed
frontend URL once you deploy the backend somewhere.



## Deploy to Vercel
1. Push to GitHub (`.env` is gitignored, won't be included — correct)
2. Import repo in Vercel
3. Project Settings → Environment Variables → add `VITE_GROQ_API_KEY` with your real key
4. Deploy

## File map
- `index.html` / `index.jsx` — entry point
- `App.jsx` — owns auth state, switches between main/login/history views
- `Header.jsx` — logo + title + account menu
- `Main.jsx` — owns ingredients/recipe state
- `ai.js` — the Groq API call, isolated from UI
- `auth.js` — frontend functions that call the backend (register, login, save/fetch/delete history)
- `components/IngredientsList.jsx` — renders list + the CTA (gated on `length > 3`) + delete buttons
- `components/ClaudeRecipe.jsx` — renders the markdown recipe + regenerate button
- `components/AuthForm.jsx` — login/signup form
- `components/AccountMenu.jsx` — top-right account button + dropdown
- `components/History.jsx` — past recipes list + delete
- `server/` — Express + MongoDB backend
  - `routes/authRoutes.js` — register/login, with input validation
  - `routes/recipeRoutes.js` — save/fetch/delete history, all scoped to the logged-in user
  - `middleware/verifyToken.js` — checks JWT on protected routes
  - `middleware/errorHandler.js` — centralized error handling, registered last
  - `utils/asyncHandler.js`, `utils/AppError.js` — support the error-handling pattern above

## Things to be able to explain out loud

**Why does `addIngredient` take `formData` instead of an event?**
`<form action={fn}>` is a React 19 feature. Instead of `onSubmit` +
`e.preventDefault()` + reading a controlled input's state, the form itself
collects all its fields into a `FormData` object and passes it to the
function on submit. `formData.get("ingredient")` reads the field by its
`name` attribute. No `useState` needed for the input at all — React also
clears the input automatically after the action runs.

**Why does `IngredientsList` check `ingredients.length > 3` and not
`Main.jsx`?**
The condition only affects what `IngredientsList` renders (the CTA box),
so it belongs there. `Main.jsx` shouldn't need to know about UI details
of a component it doesn't render directly — it just passes the full
ingredients array down.

**Why `key={ingredient}` and not `key={index}`?**
React uses `key` to track which list item is which across re-renders.
Using the ingredient string works here because ingredients are just
appended (never reordered), but breaks if the same ingredient gets added
twice — React will throw a duplicate key warning. Using `key={index}` avoids
that at the cost of breaking correctly if you ever reorder or delete from
the middle of the list. Neither is "right" — it depends on what operations
the list supports. Good one to bring up if asked about it.

**Why is `ai.js` a separate file instead of the fetch call living in
`Main.jsx`?**
Separation of concerns — `Main.jsx` handles UI state and doesn't need to
know *how* the recipe is generated, just that calling
`getRecipeFromChefClaude(ingredients)` returns markdown text. If you
swapped Groq for a different provider tomorrow, only `ai.js` would change.

**What does `dangerouslyAllowBrowser: true` actually mean?**
Groq's SDK (like Anthropic's) blocks browser use by default because
calling it client-side means your API key ships inside the JS bundle —
anyone can open dev tools → Network tab and steal it. Setting this flag is
you explicitly acknowledging that risk. It's fine for a portfolio project
with a free-tier key you don't mind rotating; it is not how you'd ship
this at a company, where the key would live in a backend/serverless
function instead.

**Why `import.meta.env.VITE_GROQ_API_KEY` and not `process.env`?**
`process.env` is a Node.js concept. Vite doesn't run in Node in the
browser — it's a build tool that swaps `import.meta.env.VITE_*` variables
for their real values at build time. The `VITE_` prefix is required; Vite
won't expose unprefixed env vars to client code on purpose, as a safety
guard against accidentally leaking server secrets into the bundle.
