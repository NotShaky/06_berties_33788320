// Create a new router
const express = require("express")
const router = express.Router()

const bcrypt = require('bcrypt')
const saltRounds = 10

// Helper: record an audit entry (non-blocking)
function recordAudit(username, success, reason, req) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || null;
    const ua = req.get && req.get('User-Agent') ? req.get('User-Agent') : null;
    const sql = "INSERT INTO audit_log (username, success, reason, ip, user_agent) VALUES (?,?,?,?,?)";
    db.query(sql, [username || null, success ? 1 : 0, reason || null, ip, ua], (err) => {
        if (err) console.error('Audit insert error:', err);
    });
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    const plainPassword = req.body.password || ''
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) return next(err)

        // Insert the new user into the users table
        const sql = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)"
        const params = [
            req.body.username || null,
            req.body.first || null,
            req.body.last || null,
            req.body.email || null,
            hashedPassword
        ]

        db.query(sql, params, (dbErr, result) => {
            if (dbErr) {
                // handle duplicate entry cleanly
                if (dbErr.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username or email already in use')
                }
                return next(dbErr)
            }
            // registration success - include password and hashed password in the response
            let out = 'Hello '+ (req.body.first || '') + ' ' + (req.body.last || '') + ' you are now registered!  We will send an email to you at ' + (req.body.email || '')
            out += ' Your password is: ' + (req.body.password || '') + ' and your hashed password is: ' + hashedPassword
            res.send(out)
        })
    })
}); 

router.get('/listusers', function (req, res, next) {
    let sqlquery = "SELECT id, username, first, last, email FROM users"; // query database to get all the users
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        // render with the name `users` so [views/listusers.ejs](views/listusers.ejs) receives it
        res.render("listusers.ejs", { users: result })
     });
});

// New route: compare submitted username/password with DB and show success/failure
router.post('/loggedin', function (req, res, next) {
    const username = (req.body.username || '').trim();
    const plainPassword = req.body.password || '';

    if (!username || !plainPassword) {
        recordAudit(username, false, 'missing credentials', req);
        return res.status(400).send('Login failed: username and password are required');
    }

    const sql = "SELECT username, first, last, hashedPassword FROM users WHERE username = ? LIMIT 1";
    db.query(sql, [username], (err, results) => {
        if (err) return next(err);

        if (!results || results.length === 0) {
            recordAudit(username, false, 'user not found', req);
            return res.send('Login failed: user not found');
        }

        const user = results[0];
        bcrypt.compare(plainPassword, user.hashedPassword, function(err, match) {
            if (err) return next(err);

            if (match) {
                recordAudit(username, true, 'login successful', req);
                const out = 'Login successful. Hello ' + (user.first || '') + ' ' + (user.last || '') + ' (username: ' + user.username + ')';
                return res.send(out);
            } else {
                recordAudit(username, false, 'incorrect password', req);
                return res.send('Login failed: incorrect password');
            }
        });
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
});

// Show audit history
router.get('/audit', function (req, res, next) {
    const sql = "SELECT id, username, success, reason, ip, user_agent, created_at FROM audit_log ORDER BY created_at DESC LIMIT 1000";
    db.query(sql, (err, rows) => {
        if (err) return next(err);
        res.render('audit.ejs', { audit: rows });
    });
});

// Export the router object so index.js can access it
module.exports = router
