// routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

router.use(auth);

// GET /api/tasks
router.get('/tasks', taskController.getTasks);

// POST /api/tasks
router.post('/tasks', taskController.createTask);

// PUT /api/tasks/:id
router.put('/tasks/:id', taskController.updateTask);

// DELETE /api/tasks/:id
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
