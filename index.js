// ==========================================
// KANBAN TASK BOARD
// ==========================================

// DOM Elements
const todo = document.querySelector("#todo");
const progress = document.querySelector("#progress");
const done = document.querySelector("#done");

const columns = [todo, progress, done];

const toggleModalButton = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");

const taskTitleInput = document.querySelector("#task-title-input");
const taskDescInput = document.querySelector("#task-desc-input");

// State
let dragElement = null;


// ==========================================
// TASK CREATION
// ==========================================

function createTask(taskData) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    const title = document.createElement("h2");
    title.textContent = taskData.title;

    const desc = document.createElement("p");
    desc.textContent = taskData.desc;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    div.append(title, desc, deleteButton);

    // Delete task
    deleteButton.addEventListener("click", () => {
        div.remove();
        saveTasks();
    });

    // Drag task
    div.addEventListener("dragstart", () => {
        dragElement = div;
        div.classList.add("dragging");
    });

    div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
        dragElement = null;
    });

    return div;
}


// ==========================================
// SAVE TASKS & UPDATE COUNTS
// ==========================================

function saveTasks() {
    const tasksData = {};

    columns.forEach(column => {
        const tasks = column.querySelectorAll(".task");

        tasksData[column.id] = Array.from(tasks).map(task => ({
            title: task.querySelector("h2").textContent,
            desc: task.querySelector("p").textContent
        }));

        const count = column.querySelector(".right");

        if (count) {
            count.textContent = tasks.length;
        }
    });

    localStorage.setItem("tasks", JSON.stringify(tasksData));
}


// ==========================================
// RESTORE TASKS FROM LOCAL STORAGE
// ==========================================

function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
        saveTasks();
        return;
    }

    try {
        const tasksData = JSON.parse(savedTasks);

        columns.forEach(column => {
            const columnTasks = tasksData[column.id];

            if (!Array.isArray(columnTasks)) return;

            columnTasks.forEach(task => {
                if (
                    !task ||
                    typeof task.title !== "string" ||
                    typeof task.desc !== "string"
                ) {
                    return;
                }

                column.appendChild(createTask(task));
            });
        });

        saveTasks();
    } catch (error) {
        console.error("Unable to restore saved tasks:", error);
    }
}


// ==========================================
// DRAG & DROP
// ==========================================

function addDragEventsOnColumn(column) {
    column.addEventListener("dragover", event => {
        event.preventDefault();

        if (dragElement) {
            column.classList.add("hover-over");
        }
    });

    column.addEventListener("dragleave", event => {
        // Avoid removing the highlight when entering a child element.
        if (!column.contains(event.relatedTarget)) {
            column.classList.remove("hover-over");
        }
    });

    column.addEventListener("drop", event => {
        event.preventDefault();
        column.classList.remove("hover-over");

        if (!dragElement) return;

        column.appendChild(dragElement);
        saveTasks();
    });
}


// ==========================================
// MODAL
// ==========================================

function openModal() {
    modal.classList.add("active");
}

function closeModal() {
    modal.classList.remove("active");
}

toggleModalButton.addEventListener("click", openModal);

modalBg.addEventListener("click", closeModal);


// ==========================================
// ADD NEW TASK
// ==========================================

function addTask() {
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();

    // Validate task title
    if (!title) {
        taskTitleInput.focus();
        return;
    }

    const task = createTask({ title, desc });

    todo.appendChild(task);

    saveTasks();

    // Reset form
    taskTitleInput.value = "";
    taskDescInput.value = "";

    closeModal();
}

addTaskButton.addEventListener("click", addTask);


// ==========================================
// INITIALIZE APP
// ==========================================

columns.forEach(addDragEventsOnColumn);

loadTasks();
