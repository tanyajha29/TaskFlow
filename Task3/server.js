// ---------------- CommonJS Version -----------------
const express = require("express");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.post("/submit", (req, res) => {
    const { fullname, username, email, password } = req.body;

    res.render("result", {
        fullname,
        username,
        email,
        password
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
