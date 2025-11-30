import express from "express";
import path from "path";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "Task3/public")));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "Task3/views"));

app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));

app.post("/contact-submit", (req, res) => {
    res.render("contact", { message: "Message sent successfully!" });
});

app.listen(3000, () => console.log("Task 3 running at http://localhost:3000"));
