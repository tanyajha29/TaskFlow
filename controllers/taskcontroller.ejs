// controllers/taskController.js
const Task = require('../models/task');

exports.createTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, status, dueDate } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'Title required' });

    const t = new Task({
      user: userId,
      title: title.trim(),
      description: description || '',
      status: status || 'Pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      updatedAt: new Date()
    });

    await t.save();
    res.status(201).json(t);
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const tasks = await Task.find({ user: userId }).sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;

    task.updatedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const result = await Task.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Task not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
