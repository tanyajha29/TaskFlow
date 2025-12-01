// public/js/dashboard.js
// Week Scheduler UI - integrates with ApiClient and Materialize
(() => {
  const START_HOUR = 7;
  const END_HOUR = 22;

  let currentMonday = getMonday(new Date());
  let tasksCache = [];
  let editingTaskId = null;

  const dayHeaders = document.getElementById('dayHeaders');
  const slotsGrid = document.getElementById('slotsGrid');
  const leftCol = document.querySelector('.left-col');

  const weekRange = document.getElementById('weekRange');
  const prevWeek = document.getElementById('prevWeek');
  const nextWeek = document.getElementById('nextWeek');
  const todayBtn = document.getElementById('todayBtn');
  const addQuick = document.getElementById('addQuick');

  const taskCard = document.getElementById('taskCard');
  const cardTitle = document.getElementById('cardTitle');
  const cardTitleInput = document.getElementById('cardTitleInput');
  const cardDescInput = document.getElementById('cardDescInput');
  const cardDate = document.getElementById('cardDate');
  const cardTime = document.getElementById('cardTime');
  const cardStatus = document.getElementById('cardStatus');
  const saveTask = document.getElementById('saveTask');
  const deleteTaskBtn = document.getElementById('deleteTask');
  const closeCard = document.getElementById('closeCard');

  document.addEventListener('DOMContentLoaded', ()=>{
    M.FormSelect.init(document.querySelectorAll('select'));
  });

  function getMonday(d) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0,0,0,0);
    return date;
  }

  function isoDate(d) { return d.toISOString().slice(0,10); }

  function renderWeek() {
    dayHeaders.innerHTML = '';
    for (let i=0;i<7;i++){
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      const div = document.createElement('div');
      div.className = 'day-header';
      div.dataset.date = isoDate(d);
      div.innerHTML = `<div style="font-size:14px">${d.toLocaleDateString(undefined,{weekday:'short'})}</div>
                       <div style="font-weight:700; margin-top:6px">${d.toLocaleDateString(undefined,{month:'short', day:'numeric'})}</div>`;
      dayHeaders.appendChild(div);
    }

    const start = new Date(currentMonday);
    const end = new Date(currentMonday);
    end.setDate(end.getDate()+6);
    weekRange.textContent = `${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;

    leftCol.innerHTML = '';
    for (let h=START_HOUR; h<END_HOUR; h++){
      const tdiv = document.createElement('div');
      tdiv.className = 'time-slot';
      tdiv.textContent = `${String(h).padStart(2,'0')}:00`;
      leftCol.appendChild(tdiv);
    }

    slotsGrid.innerHTML = '';
    for (let day=0; day<7; day++){
      const col = document.createElement('div');
      col.className = 'day-column';
      const colDate = new Date(currentMonday);
      colDate.setDate(colDate.getDate() + day);
      col.dataset.date = isoDate(colDate);

      for (let h=START_HOUR; h<END_HOUR; h++){
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.hour = String(h).padStart(2,'0') + ':00';
        slot.dataset.date = col.dataset.date;
        slot.addEventListener('click', (ev) => { if (ev.target.closest('.task-block')) return; openAddCard(slot.dataset.date, slot.dataset.hour); });
        col.appendChild(slot);
      }
      slotsGrid.appendChild(col);
    }

    renderTasksIntoGrid();
  }

  async function loadTasks() {
    try {
      const tasks = await ApiClient.fetchTasks();
      tasksCache = tasks || [];
      renderTasksIntoGrid();
      renderStats(tasksCache);
    } catch (e) {
      console.error('loadTasks error', e);
      M.toast({ html: e.error || 'Failed to load tasks', classes: 'red' });
    }
  }

  function renderTasksIntoGrid() {
    document.querySelectorAll('.slot').forEach(s => s.innerHTML = '');
    tasksCache.forEach(t => {
      const due = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt || Date.now());
      const dateKey = isoDate(due);
      const hourKey = String(due.getHours()).padStart(2,'0') + ':00';
      const slot = document.querySelector(`.slot[data-date="${dateKey}"][data-hour="${hourKey}"]`);
      const target = slot || document.querySelector(`.day-column[data-date="${dateKey}"] .slot`) || null;
      if (!target) return;

      const block = document.createElement('div');
      block.className = 'task-block';
      block.dataset.id = t._id;
      block.addEventListener('click', (ev)=> ev.stopPropagation());

      block.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>${escapeHtml(t.title)}</div>
          <div class="task-actions">
            <div class="icon-btn edit" title="Edit"><i class="material-icons small">edit</i></div>
            <div class="icon-btn del" title="Delete"><i class="material-icons small">delete</i></div>
          </div>
        </div>
        <div class="task-meta">${t.status || 'Pending'} • ${due.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      `;

      block.querySelector('.edit').addEventListener('click', ()=> openEditCard(t));
      block.querySelector('.del').addEventListener('click', async ()=> {
        if (!confirm('Delete this task?')) return;
        try { await ApiClient.deleteTask(t._id); M.toast({ html: 'Deleted', classes: 'green' }); await loadTasks(); } catch(e){ M.toast({ html: e.error || 'Delete failed', classes:'red'}); }
      });

      block.querySelector('.task-meta').addEventListener('click', async ()=>{
        const next = nextStatus(t.status || 'Pending');
        try { await ApiClient.updateTask(t._id, { status: next }); await loadTasks(); } catch(e){ M.toast({ html: e.error || 'Failed', classes:'red' }); }
      });

      target.appendChild(block);
    });
  }

  function nextStatus(s) {
    if (!s) return 'Pending';
    if (s === 'Pending') return 'In Progress';
    if (s === 'In Progress') return 'Done';
    return 'Pending';
  }

  function openAddCard(dateStr, timeStr) {
    editingTaskId = null;
    cardTitle.textContent = 'Add Task';
    cardTitleInput.value = '';
    cardDescInput.value = '';
    cardDate.value = dateStr;
    cardTime.value = timeStr || '09:00';
    cardStatus.value = 'Pending';
    deleteTaskBtn.classList.add('hide');
    showTaskCard();
  }

  function openEditCard(task) {
    editingTaskId = task._id;
    cardTitle.textContent = 'Edit Task';
    cardTitleInput.value = task.title || '';
    cardDescInput.value = task.description || '';
    const due = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt || Date.now());
    cardDate.value = isoDate(due);
    cardTime.value = String(due.getHours()).padStart(2,'0') + ':' + String(due.getMinutes()).padStart(2,'0');
    cardStatus.value = task.status || 'Pending';
    deleteTaskBtn.classList.remove('hide');
    showTaskCard();
  }

  function showTaskCard() {
    taskCard.classList.remove('hidden');
    M.FormSelect.init(document.querySelectorAll('#cardStatus'));
  }

  function hideTaskCard() {
    taskCard.classList.add('hidden');
    editingTaskId = null;
  }

  saveTask.addEventListener('click', async () => {
    const title = cardTitleInput.value.trim();
    const description = cardDescInput.value.trim();
    const status = cardStatus.value;
    const date = cardDate.value;
    const time = cardTime.value || '09:00';
    if (!title) return M.toast({ html: 'Title required', classes: 'red' });

    const dueIso = new Date(`${date}T${time}`).toISOString();

    try {
      if (editingTaskId) {
        await ApiClient.updateTask(editingTaskId, { title, description, status, dueDate: dueIso });
        M.toast({ html: 'Updated', classes: 'green' });
      } else {
        await ApiClient.createTask(title, description, status, dueIso);
        M.toast({ html: 'Created', classes: 'green' });
      }
      hideTaskCard();
      await loadTasks();
    } catch (e) {
      console.error('save error', e);
      M.toast({ html: e.error || 'Save failed', classes: 'red' });
    }
  });

  deleteTaskBtn.addEventListener('click', async () => {
    if (!editingTaskId) return;
    if (!confirm('Delete this task?')) return;
    try {
      await ApiClient.deleteTask(editingTaskId);
      M.toast({ html: 'Deleted', classes: 'green' });
      hideTaskCard();
      await loadTasks();
    } catch (e) { M.toast({ html: e.error || 'Delete failed', classes: 'red' }); }
  });

  closeCard.addEventListener('click', hideTaskCard);

  prevWeek.addEventListener('click', ()=> { currentMonday.setDate(currentMonday.getDate() - 7); renderWeek(); });
  nextWeek.addEventListener('click', ()=> { currentMonday.setDate(currentMonday.getDate() + 7); renderWeek(); });
  todayBtn.addEventListener('click', ()=> { currentMonday = getMonday(new Date()); renderWeek(); });
  addQuick.addEventListener('click', ()=> { const today = new Date(); openAddCard(isoDate(today), String(today.getHours()).padStart(2,'0') + ':00'); });

  function renderStats(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
    const inProgress = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress').length;
    const pending = total - done - inProgress;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statProgress').textContent = inProgress;
    document.getElementById('statPending').textContent = pending;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  (async function init(){
    renderWeek();
    await loadTasks();
  })();

})();
