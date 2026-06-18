const STORAGE_KEY = "todo";

const taskForm = document.getElementById("taskForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const clearAllButton = document.getElementById("clearAllButton");
const message = document.getElementById("message");
const emptyState = document.getElementById("emptyState");

let todos = loadTodos();

taskForm.addEventListener("submit", handleAddTask);
clearAllButton.addEventListener("click", clearAllTasks);
todoList.addEventListener("click", handleTaskClick);
todoList.addEventListener("change", handleTaskToggle);
todoInput.addEventListener("input", function () {
    showMessage("");
});

renderTodos();

function loadTodos() {
    const savedTodos = localStorage.getItem(STORAGE_KEY);

    if (!savedTodos) {
        return [];
    }

    try {
        return JSON.parse(savedTodos).map(function (task) {
            return {
                id: task.id || createTaskId(),
                text: task.text,
                completed: Boolean(task.completed || task.done)
            };
        });
    } catch {
        return [];
    }
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function cleanInput(value) {
    return value.trim().replace(/\s+/g, " ");
}

function createTaskId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}

function handleAddTask(event) {
    event.preventDefault();

    const taskText = cleanInput(todoInput.value);

    if (taskText === "") {
        showMessage("Please enter a task first.");
        todoInput.focus();
        return;
    }

    const newTask = {
        id: createTaskId(),
        text: taskText,
        completed: false
    };

    todos.push(newTask);
    saveTodos();
    renderTodos();

    todoInput.value = "";
    todoInput.focus();
    showMessage("");
}

function handleTaskClick(event) {
    if (!event.target.classList.contains("delete-task")) {
        return;
    }

    const taskId = event.target.closest(".todo-item").dataset.id;
    todos = todos.filter(function (task) {
        return task.id !== taskId;
    });

    saveTodos();
    renderTodos();
}

function handleTaskToggle(event) {
    if (!event.target.classList.contains("task-checkbox")) {
        return;
    }

    const taskId = event.target.closest(".todo-item").dataset.id;
    todos = todos.map(function (task) {
        if (task.id === taskId) {
            return {
                ...task,
                completed: event.target.checked
            };
        }

        return task;
    });

    saveTodos();
    renderTodos();
}

function clearAllTasks() {
    if (todos.length === 0) {
        showMessage("There are no tasks to clear.");
        return;
    }

    todos = [];
    saveTodos();
    renderTodos();
    showMessage("");
}

function renderTodos() {
    todoList.innerHTML = "";

    todos.forEach(function (task) {
        const taskItem = createTaskElement(task);
        todoList.appendChild(taskItem);
    });

    updateCounts();
    toggleEmptyState();
}

function createTaskElement(task) {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";
    listItem.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const taskText = document.createElement("span");
    taskText.className = task.completed ? "task-text completed" : "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete task");

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
    listItem.appendChild(deleteButton);

    return listItem;
}

function updateCounts() {
    const completedTasks = todos.filter(function (task) {
        return task.completed;
    }).length;
    const pendingTasks = todos.length - completedTasks;

    todoCount.textContent = todos.length;
    pendingCount.textContent = pendingTasks;
    completedCount.textContent = completedTasks;
}

function toggleEmptyState() {
    emptyState.classList.toggle("show", todos.length === 0);
    clearAllButton.disabled = todos.length === 0;
}

function showMessage(text) {
    message.textContent = text;
}
