const express = require('express');
const router = express.Router();

// GET /api/books - returns all books as JSON
// Supports optional query parameters:
//   ?search=term - search by book name
//   ?minprice=5 - minimum price filter
//   ?maxprice=10 - maximum price filter
//   ?sort=name or ?sort=price - sort results
router.get('/books', function (req, res, next) {
    // Get the search term from query parameters and sanitize
    let searchTerm = req.query.search ? req.sanitize(req.query.search).trim() : '';
    
    // Get price range parameters and parse as floats
    let minPrice = req.query.minprice ? parseFloat(req.query.minprice) : null;
    let maxPrice = req.query.maxprice ? parseFloat(req.query.maxprice) : null;
    
    // Get sort parameter and validate (only allow 'name' or 'price')
    let sortBy = req.query.sort ? req.query.sort.toLowerCase().trim() : '';
    const allowedSorts = ['name', 'price'];
    if (sortBy && !allowedSorts.includes(sortBy)) {
        sortBy = ''; // ignore invalid sort values
    }
    
    // Build the SQL query dynamically based on provided filters
    let sqlquery = "SELECT * FROM books";
    let conditions = [];
    let params = [];
    
    // Add search term condition
    if (searchTerm) {
        // Escape SQL LIKE wildcards to avoid wildcard abuse
        const escaped = searchTerm.replace(/([\\%_])/g, '\\$1');
        conditions.push("LOWER(name) LIKE LOWER(?) ESCAPE '\\\\'");
        params.push('%' + escaped + '%');
    }
    
    // Add minimum price condition
    if (minPrice !== null && !isNaN(minPrice)) {
        conditions.push("price >= ?");
        params.push(minPrice);
    }
    
    // Add maximum price condition
    if (maxPrice !== null && !isNaN(maxPrice)) {
        conditions.push("price <= ?");
        params.push(maxPrice);
    }
    
    // Combine conditions with WHERE clause if any filters exist
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }
    
    // Add ORDER BY clause based on sort parameter
    if (sortBy === 'name') {
        sqlquery += " ORDER BY name ASC";
    } else if (sortBy === 'price') {
        sqlquery += " ORDER BY price ASC";
    } else {
        // Default ordering by name if no sort specified
        sqlquery += " ORDER BY name";
    }

    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router
module.exports = router;
