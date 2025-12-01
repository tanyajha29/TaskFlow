// public/js/tasks-api.js
const ApiClient = (function () {
  const apiBase = '/api';

  function token() { return localStorage.getItem('tf_token'); }
  function setToken(t) { if (t) localStorage.setItem('tf_token', t); else localStorage.removeItem('tf_token'); }

  async function postAuth(path, data) {
    const res = await fetch(`/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  }

  async function login(usernameOrEmail, password) {
    const res = await postAuth('/login', { usernameOrEmail, password });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    setToken(data.token);
    return data;
  }

  async function register(payload) {
    const res = await postAuth('/register', payload);
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async function fetchTasks() {
    const res = await fetch(`${apiBase}/tasks`, {
      headers: { 'Authorization': 'Bearer ' + token() }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  // createTask(title, description, status, dueDateISO)
  async function createTask(title, description, status = 'Pending', dueDate = null) {
    const res = await fetch(`${apiBase}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token()
      },
      body: JSON.stringify({ title, description, status, dueDate })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async function updateTask(id, changes) {
    const res = await fetch(`${apiBase}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token()
      },
      body: JSON.stringify(changes)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async function deleteTask(id) {
    const res = await fetch(`${apiBase}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token() }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  return { login, register, fetchTasks, createTask, updateTask, deleteTask, token, setToken };
})();
