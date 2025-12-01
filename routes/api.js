const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const taskController = require('../controllers/taskController');    

/* GET /api/tasks - user's tasks */
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort('-createdAt');
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* POST create task */
router.post('/tasks', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim().length < 1) return res.status(400).json({ error: 'Title required' });
    const t = new Task({ user: req.userId, title: title.trim(), description: description || '' });
    await t.save();
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* PUT update */
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    task.updatedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* DELETE */
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Task.deleteOne({ _id: id, user: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
