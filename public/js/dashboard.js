// dashboard.js
// Requires: ApiClient (existing), Materialize initialized

// Helper to get start of current month grid (Monday start)
function getCalendarMatrix(year, month) {
  // month 0-11
  const first = new Date(year, month, 1);
  const dayOfWeek = (first.getDay() + 6) % 7; // convert Sun(0) to 6, Mon->0
  const start = new Date(first);
  start.setDate(first.getDate() - dayOfWeek);
  const matrix = [];
  let dt = new Date(start);
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      row.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    matrix.push(row);
  }
  return matrix;
}

function formatYMD(d) {
  return d.toISOString().slice(0,10);
}

// Render calendar grid cells
function renderCalendarGrid(matrix, tasksByDate) {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  for (const row of matrix) {
    for (const d of row) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      cell.innerHTML = `<div class="date">${d.getDate()}</div><div class="day-tasks"></div>`;
      const dayTasks = cell.querySelector('.day-tasks');
      const key = formatYMD(d);
      const tasks = tasksByDate[key] || [];
      tasks.slice(0,3).forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'task-chip';
        chip.textContent = t.title;
        chip.dataset.id = t._id;
        chip.addEventListener('click', ()=> openTaskQuickMenu(t));
        dayTasks.appendChild(chip);
      });
      // subtle today highlight
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        cell.style.boxShadow = 'inset 0 0 0 2px rgba(42,82,152,0.12)';
      }
      grid.appendChild(cell);
    }
  }
}

// Open quick overlay (simple prompt for now)
async function openTaskQuickMenu(task) {
  const want = prompt(`Task: ${task.title}\nCommands: edit / del / status\nEnter command:`);
  if (!want) return;
  const cmd = want.toLowerCase();
  if (cmd === 'del') {
    if (confirm('Delete task?')) {
      await ApiClient.deleteTask(task._id);
      M.toast({html:'Deleted', classes:'green'});
      await refreshAll();
    }
  } else if (cmd === 'edit') {
    const newT = prompt('Title', task.title);
    if (newT === null) return;
    const newD = prompt('Description', task.description || '');
    await ApiClient.updateTask(task._id, { title: newT, description: newD });
    M.toast({html:'Updated', classes:'green'});
    await refreshAll();
  } else if (cmd === 'status') {
    const s = prompt('Status (Pending / In Progress / Done)', task.status || 'Pending');
    if (!s) return;
    await ApiClient.updateTask(task._id, { status: s });
    M.toast({html:'Status updated', classes:'green'});
    await refreshAll();
  }
}

async function refreshAll(filterStatus) {
  const now = new Date();
  const matrix = getCalendarMatrix(now.getFullYear(), now.getMonth());

  // fetch tasks
  let tasks = [];
  try {
    tasks = await ApiClient.fetchTasks();
  } catch (e) {
    M.toast({html: e.error || 'Failed to load tasks', classes: 'red'});
  }

  // optional filter
  if (filterStatus) tasks = tasks.filter(t => (t.status || 'Pending') === filterStatus);

  // map by date (use dueDate or createdAt; tasks should have date property else fall back to createdAt)
  const tasksByDate = {};
  tasks.forEach(t => {
    const dateKey = (t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt || Date.now()));
    const k = formatYMD(dateKey);
    tasksByDate[k] = tasksByDate[k] || [];
    tasksByDate[k].push(t);
  });

  renderCalendarGrid(matrix, tasksByDate);
  renderRecent(tasks);
  renderProgress(tasks);
}

// recent list
function renderRecent(tasks) {
  const list = document.getElementById('recentList');
  list.innerHTML = '';
  const recent = tasks.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6);
  recent.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `<div>${t.title}</div><div class="tiny">${t.status || 'Pending'}</div>`;
    list.appendChild(li);
  });
}

// progress simple: percent done
function renderProgress(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => (t.status||'Pending').toLowerCase() === 'done').length;
  const pct = total === 0 ? 0 : Math.round((done/total)*100);
  const chart = document.getElementById('progressChart');
  const text = document.getElementById('progressText');
  // use conic gradient
  chart.style.background = `conic-gradient(var(--accent1) 0 ${pct}%, rgba(255,255,255,0.06) ${pct}% 100%)`;
  chart.textContent = pct + '%';
  text.textContent = `${done} / ${total} completed`;
}

// Create new task
document.getElementById('createTaskBtn').addEventListener('click', async () => {
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();
  const status = document.getElementById('taskStatus').value || 'Pending';
  if (!title) return M.toast({html:'Title required', classes:'red'});
  try {
    await ApiClient.createTask({ title,  desc, status }); // adjust based on your ApiClient.createTask signature
    M.toast({html:'Created', classes:'green'});
    const modal = M.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.close();
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    M.updateTextFields();
    await refreshAll();
  } catch (e) {
    M.toast({html: e.error || 'Create failed', classes:'red'});
  }
});

// filters
document.getElementById('filterAll').addEventListener('click', ()=> refreshAll());
document.getElementById('filterPending').addEventListener('click', ()=> refreshAll('Pending'));
document.getElementById('filterProgress').addEventListener('click', ()=> refreshAll('In Progress'));
document.getElementById('filterDone').addEventListener('click', ()=> refreshAll('Done'));

// init
document.addEventListener('DOMContentLoaded', () => {
  M.Modal.init(document.querySelectorAll('.modal'));
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);
  refreshAll();
});
