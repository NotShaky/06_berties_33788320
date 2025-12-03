# Bertie's Books

Small Express + EJS app with a MySQL backend. Supports books, user registration/login and a login audit.

Prerequisites
- Node.js (14+)
- MySQL server
- npm

Quick setup
1. Install dependencies:
   npm install

2. Configure environment:
   - Copy `.env.example` -> `.env` and set real credentials (do not commit `.env`).
   - Required vars: BB_HOST, BB_USER, BB_PASSWORD, BB_DATABASE, PORT (optional).

3. Create database and tables (run on VM or locally):
   mysql -u root -p < create_db.sql
   mysql -u root -p berties_books < insert_test_data.sql (optional)

4. Start the app:
   node index.js
   or
   PORT=8000 node index.js

Main routes
- Home: /
- Books: /books/list, /books/addbook, /books/search
- Users: /users/register, /users/login, POST /users/loggedin
- Audit: /users/audit
- Weather: /weather
- API: /api/books (JSON endpoint)

## API Documentation

### GET /api/books

Returns a JSON array of books from the database. Supports multiple query parameters for filtering and sorting.

**Base URL:**
```
http://localhost:8000/api/books
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search books by name (case-insensitive, partial match) | `?search=world` |
| `minprice` | number | Filter books with price greater than or equal to value | `?minprice=10` |
| `maxprice` | number | Filter books with price less than or equal to value | `?maxprice=25` |
| `sort` | string | Sort results by `name` or `price` (ascending) | `?sort=price` |

**Examples:**

1. **Get all books:**
   ```
   GET /api/books
   ```
   Response:
   ```json
   [
     {"id": 1, "name": "Brighton Rock", "price": "20.25"},
     {"id": 2, "name": "Brave New World", "price": "25.00"},
     {"id": 3, "name": "Animal Farm", "price": "12.99"}
   ]
   ```

2. **Search for books containing "world":**
   ```
   GET /api/books?search=world
   ```
   Response:
   ```json
   [
     {"id": 2, "name": "Brave New World", "price": "25.00"}
   ]
   ```

3. **Get books between £10 and £25:**
   ```
   GET /api/books?minprice=10&maxprice=25
   ```
   Response:
   ```json
   [
     {"id": 1, "name": "Brighton Rock", "price": "20.25"},
     {"id": 2, "name": "Brave New World", "price": "25.00"},
     {"id": 3, "name": "Animal Farm", "price": "12.99"}
   ]
   ```

4. **Sort all books by price:**
   ```
   GET /api/books?sort=price
   ```
   Response:
   ```json
   [
     {"id": 3, "name": "Animal Farm", "price": "12.99"},
     {"id": 1, "name": "Brighton Rock", "price": "20.25"},
     {"id": 2, "name": "Brave New World", "price": "25.00"}
   ]
   ```

5. **Combine multiple filters:**
   ```
   GET /api/books?search=rock&minprice=15&maxprice=30&sort=name
   ```
   Response:
   ```json
   [
     {"id": 1, "name": "Brighton Rock", "price": "20.25"}
   ]
   ```

**Notes:**
- All query parameters are optional and can be combined
- Invalid sort values are ignored (defaults to sorting by name)
- Price filters accept decimal values
- Search is case-insensitive and matches partial book names
- SQL injection protection via parameterized queries
- Returns empty array `[]` if no books match the criteria

dotenv
- The app uses dotenv. index.js calls require('dotenv').config() at startup.
- DB credentials and port are read from: BB_HOST, BB_USER, BB_PASSWORD, BB_DATABASE, PORT.
- Keep a template in `.env.example`. Never commit your real `.env` (it's in `.gitignore`).

Database
- Schema and DDL are in `create_db.sql`. It creates `books`, `users` and `audit_log` tables.
- Run the script on the VM before testing routes that read/write DB.
- Use `insert_test_data.sql` for seed data (keeps schema and seeds separate).

audit
- Purpose: record successful and failed login attempts.
- Storage: `audit_log` table (id, username, success, reason, ip, user_agent, created_at).
- Implementation: `recordAudit(username, success, reason, req)` in `routes/users.js` inserts an audit row for every login attempt.
- View: GET `/users/audit` renders `views/audit.ejs` (most recent first).
- Setup: run the SQL that creates `audit_log` on the VM.

access control
- Session-based auth with express-session (session cookie).
- On successful login the app sets `req.session.userId`.
- Protected routes use `redirectLogin` middleware. By default routes protected include: /books/addbook, /users/listusers, /users/audit (check route files for exact list).
- Logout clears session and cookie.

data validation
- Server-side validation uses express-validator.
- Registration checks include: valid email, username length (5–20, allowed chars), password length >= 8, presence/length limits for first/last names.
- Uniqueness checks for username/email are done against the DB before insert (returns validation errors).

sanitisation
- Inputs that may be rendered back (first, last, username, email) are sanitized with express-sanitizer to mitigate XSS.
- Passwords are not HTML-sanitized (to avoid altering the secret); they are trimmed and validated for length/complexity, then hashed before storage.

security notes
- Passwords are hashed with bcrypt before storing (saltRounds configurable).
- Database credentials must not be committed. Use `.env` or environment variables on the VM.
- Audit data includes IP and user-agent — treat it as sensitive and restrict access.

weather feature
- Integrated OpenWeatherMap API for real-time weather data.
- Route: GET /weather
- Supports city search via query parameter: `/weather?city=Paris`
- Requires OPENWEATHER_API_KEY in `.env` file.
- Displays temperature, humidity, wind speed, sunrise/sunset times and more.
