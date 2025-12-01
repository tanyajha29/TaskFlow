const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storagePath = path.join(__dirname, 'data', 'storage.json');

// Home: show add-task form
app.get('/', (req, res) => {
  res.render('index', { errors: [] , task: {} });
});

// Handle add-task (server-side minimal validation + save to storage.json)
app.post('/add-task', (req, res) => {
  const { title, description } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters.');
  }

  if (errors.length > 0) {
    return res.render('index', { errors, task: { title, description } });
  }

  // read storage.json (create if missing)
  let data = [];
  try {
    const raw = fs.readFileSync(storagePath, 'utf8');
    data = JSON.parse(raw || '[]');
  } catch (e) {
    data = [];
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString()
  };

  data.push(newTask);
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8');

  res.render('result', { task: newTask });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
