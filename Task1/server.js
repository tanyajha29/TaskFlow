const express = require("express");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/submit", (req, res) => {
    res.render("Result", {
        username: req.body.username,
        email: req.body.email
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
