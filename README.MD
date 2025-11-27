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
