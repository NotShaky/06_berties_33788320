// Import express and ejs
var express = require ('express')
var ejs = require('ejs')
const path = require('path')
var mysql = require('mysql2')
var session = require ('express-session')
const expressSanitizer = require('express-sanitizer');

// load environment variables from .env (must be before using process.env)
require('dotenv').config()

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Create an input sanitizer
app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000
    }
}))

// Define our application-specific data
app.locals.shopData = {shopName: "Bertie's Books"}

// Define the database connection pool (read creds from env vars)
const db = mysql.createPool({
    host: process.env.BB_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.BB_USER || process.env.DB_USER || 'berties_books_app',
    password: process.env.BB_PASSWORD || process.env.DB_PASS || 'qwertyuiop',
    database: process.env.BB_DATABASE || process.env.DB_NAME || 'berties_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Load the route handlers for /weather
const weatherRoutes = require('./routes/weather')
app.use('/weather', weatherRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))