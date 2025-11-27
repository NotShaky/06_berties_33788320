// Create a new router
const express = require("express");
const {check, validationResult} = require('express-validator');
const router = express.Router()

// Redirect-to-login middleware (requires sessions to be set in index.js)
const redirectLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/users/login'); // send to the users login page
    }
    next();
};

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// Replace the old search-result handler with this improved handler
router.get('/search_result', function (req, res, next) {
    const raw = req.query.search_text || '';
    // sanitize input (requires express-sanitizer middleware), trim and limit length
    const sanitized = req.sanitize(raw).trim().slice(0, 255);
    if (!sanitized) {
        return res.redirect('/books/search');
    }

    // Escape SQL LIKE wildcards and backslashes to avoid wildcard abuse
    const escaped = sanitized.replace(/([\\%_])/g, '\\$1');

    // Advanced search: partial, case-insensitive match, with ESCAPE for literal %, _
    const sql = "SELECT * FROM books WHERE LOWER(name) LIKE LOWER(?) ESCAPE '\\\\'";
    const param = '%' + escaped + '%';
    db.query(sql, [param], (err, result) => {
        if (err) return next(err);
        res.render('searchresult.ejs', { books: result, searchTerm: sanitized });
    });
});

router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render("addbook.ejs")
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render('list.ejs', { books: result });
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT id, name, price FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render('bargainbooks.ejs', { books: result });
    });
});

router.post('/bookadded',
    redirectLogin,
    [
        check('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).escape(),
        check('price').trim().notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat()
    ],
    function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // re-render the add form with validation errors and previous input
            return res.status(422).render('addbook.ejs', {
                errors: errors.array(),
                data: { name: req.body.name, price: req.body.price }
            });
        }

        // sanitize inputs using req.sanitize() (requires express-sanitizer middleware)
        const name = req.sanitize(req.body.name);
        const price = parseFloat(req.sanitize(String(req.body.price)));

        let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
        let newrecord = [name, price];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) return next(err);
            res.redirect('list');
        });
    }
);

module.exports = router
