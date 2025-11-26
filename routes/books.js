// Create a new router
const express = require("express")
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
    const q = (req.query.search_text || '').trim();
    if (!q) {
        return res.redirect('/books/search');
    }

    // Advanced search: partial, case-insensitive match
    const sql = "SELECT * FROM books WHERE LOWER(name) LIKE LOWER(?)";
    const param = '%' + q + '%';
    db.query(sql, [param], (err, result) => {
        if (err) return next(err);
        // render the existing view file (no underscore)
        res.render('searchresult.ejs', { books: result, searchTerm: q });
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

router.post('/bookadded', function(req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return next(err);
        }
        res.redirect('list');
    });
});

module.exports = router
