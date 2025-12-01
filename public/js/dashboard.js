// dashboard.js 

// ==============================
// HELPER FUNCTIONS
// ==============================

// Get month grid (6x7)
function getCalendarMatrix(year, month) {
    const first = new Date(year, month, 1);
    const dayOfWeek = (first.getDay() + 6) % 7;
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
    return d.toISOString().slice(0, 10);
}



// ==============================
// RENDER CALENDAR
// ==============================

function renderCalendarGrid(matrix, tasksByDate) {
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    for (const row of matrix) {
        for (const d of row) {
            const dateKey = formatYMD(d);
            const tasks = tasksByDate[dateKey] || [];

            const cell = document.createElement("div");
            cell.className = "calendar-cell";

            // clickable to create task
            cell.addEventListener("click", (e) => {
                if (e.target.classList.contains("task-block")) return; // avoid conflict
                openAddTaskCard(d);
            });

            cell.innerHTML = `
                <div class="date-num">${d.getDate()}</div>
                <div class="tasks-container"></div>
            `;

            const container = cell.querySelector(".tasks-container");

            // Render task blocks (option‑2)
            tasks.forEach(t => {
                const block = document.createElement("div");
                block.className = "task-block";
                block.innerHTML = `
                    <div class="task-title">${t.title}</div>
                    <div class="task-actions">
                        <i class="material-icons tiny edit-btn">edit</i>
                        <i class="material-icons tiny delete-btn">delete</i>
                        <i class="material-icons tiny status-btn">flag</i>
                    </div>
                `;

                // Event listeners
                block.querySelector(".edit-btn").addEventListener("click", () => openEditTaskCard(t));
                block.querySelector(".delete-btn").addEventListener("click", () => deleteTask(t._id));
                block.querySelector(".status-btn").addEventListener("click", () => updateStatusPrompt(t));

                container.appendChild(block);
            });

            grid.appendChild(cell);
        }
    }
}



// ==============================
// TASK ACTIONS
// ==============================

async function deleteTask(id) {
    if (!confirm("Delete task?")) return;
    await ApiClient.deleteTask(id);
    M.toast({ html: "Deleted", classes: "green" });
    refreshAll();
}

async function updateStatusPrompt(t) {
    const status = prompt("Status: Pending / In Progress / Done", t.status);
    if (!status) return;
    await ApiClient.updateTask(t._id, { status });
    refreshAll();
}



// ==============================
// ADD TASK CARD
// ==============================

let selectedDate = null;

function openAddTaskCard(dateObj) {
    selectedDate = formatYMD(dateObj);
    const card = document.getElementById("addTaskCard");
    card.classList.remove("hide");
}

document.getElementById("closeTaskCard").addEventListener("click", () => {
    document.getElementById("addTaskCard").classList.add("hide");
});

document.getElementById("saveTaskBtn").addEventListener("click", async () => {
    const title = document.getElementById("newTaskTitle").value.trim();
    const desc = document.getElementById("newTaskDesc").value.trim();
    const status = document.getElementById("newTaskStatus").value;

    if (!title) return M.toast({ html: "Title required", classes: "red" });

await ApiClient.createTask({
    title,
    description: desc,
    status,
    dueDate: selectedDate
});

    M.toast({ html: "Task Added", classes: "green" });
    document.getElementById("addTaskCard").classList.add("hide");
    refreshAll();
});



// ==============================
// EDIT TASK CARD (similar to add)
// ==============================

function openEditTaskCard(task) {
    const card = document.getElementById("editTaskCard");

    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDesc").value = task.description;
    document.getElementById("editTaskStatus").value = task.status;

    card.dataset.id = task._id;
    card.classList.remove("hide");
}

document.getElementById("closeEditTaskCard").addEventListener("click", () => {
    document.getElementById("editTaskCard").classList.add("hide");
});

document.getElementById("updateTaskBtn").addEventListener("click", async () => {
    const id = document.getElementById("editTaskCard").dataset.id;

    await ApiClient.updateTask(id, {
        title: document.getElementById("editTaskTitle").value.trim(),
        description: document.getElementById("editTaskDesc").value.trim(),
        status: document.getElementById("editTaskStatus").value
    });

    M.toast({ html: "Updated", classes: "green" });
    document.getElementById("editTaskCard").classList.add("hide");
    refreshAll();
});



// ==============================
// REFRESH
// ==============================

async function refreshAll(filterStatus) {
    const now = new Date();
    const matrix = getCalendarMatrix(now.getFullYear(), now.getMonth());

    let tasks = await ApiClient.fetchTasks();
    if (filterStatus) tasks = tasks.filter(t => t.status === filterStatus);

    const tasksByDate = {};
    tasks.forEach(t => {
        const dateKey = formatYMD(new Date(t.createdAt));
        tasksByDate[dateKey] = tasksByDate[dateKey] || [];
        tasksByDate[dateKey].push(t);
    });

    renderCalendarGrid(matrix, tasksByDate);
}



// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    refreshAll();
});
