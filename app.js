const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");

const app = express();
const PORT = 4000;

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Cars Page
app.get("/cars", (req, res) => {
    res.render("cars");
});

// Booking Page
app.get("/booking", (req, res) => {
    res.render("booking");
});

// Contact Page
app.get("/contact", (req, res) => {
    res.render("contact");
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});

// ========================
// POST Routes
// ========================

// User Array

// Temporary User Storage (MongoDB will be used later)

let users = [];

app.post("/register", (req, res) => {

    console.log(req.body);

    users.push(req.body);

    console.log(users);

    res.redirect("/login");

});

app.post("/login", (req, res) => {

    let { email, password } = req.body;

    let user = users.find((u) => {
        return u.email === email && u.password === password;
    });

    if (user) {

        console.log("Login Successful");

        res.redirect("/");

    } else {

        res.send("Invalid Email or Password");

    }

});

// ========================
// Server
// 
app.listen(PORT, () => {
    console.log(`Server Running : http://localhost:${PORT}`);
});