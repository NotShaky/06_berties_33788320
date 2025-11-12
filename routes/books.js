// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword)
});

router.get('/addbook', function(req, res, next) {
    res.render("addbook.ejs")
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        // render with the name `books` so [views/list.ejs](views/list.ejs) receives it
        res.render("list.ejs", { books: result })
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
        // redirect to the list route so it re-queries the DB and shows the new book
        res.redirect('/books/list');
    });
});

module.exports = router
