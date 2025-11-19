# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

# dotenv

This project uses the dotenv module to keep sensitive credentials out of source control.

- Install: npm install dotenv --save
- Create a file named `.env` in the project root (copy from `.env.example`) and set your real DB credentials:
  DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT
- The app loads variables with require('dotenv').config() in index.js and uses process.env.* when creating the DB pool.
- Make sure `.env` is listed in `.gitignore` so credentials are not committed.
- On the VM you can either create a `.env` file there or set environment variables via the system environment instead of a `.env` file for production.

## audit

Login attempts (successful and failed) are recorded in the `audit_log` table. The table schema is in `sql/create_audit_table.sql`. Each record stores:
- username (if provided)
- success (1/0)
- reason (short text like "incorrect password" or "user not found")
- ip address and user-agent
- timestamp (created_at)

Implementation notes:
- The POST /users/loggedin handler calls a helper `recordAudit(username, success, reason, req)` to insert an audit row for every attempt.
- The audit history is viewable at GET /users/audit (renders `views/audit.ejs`).
- Run the SQL on the VM to create the table before testing:
  `mysql -u root -p berties_books < sql/create_audit_table.sql`
