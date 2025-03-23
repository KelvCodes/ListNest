// DOM Elements
const getStartedBtn = document.getElementById('get-started-btn');
const homepage = document.getElementById('homepage');
const todoApp = document.getElementById('todo-app');
const inputBox = document.getElementById('input-box');
const categorySelect = document.getElementById('category-select');
const dueDate = document.getElementById('due-date');
const listContainer = document.getElementById('list-container');
const historyContainer = document.getElementById('history-container');
const showHistoryBtn = document.getElementById('show-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const historySection = document.querySelector('.history-section');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');

// Toggle to Todo App
getStartedBtn.addEventListener('click', () => {
    homepage.classList.add('hidden');
    todoApp.classList.add('visible');
    gsap.from('.todo-app', { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out' });
});

// Event Listeners
document.getElementById('add-btn').addEventListener('click', addTask);
document.addEventListener('keydown', (e) => e.key === 'Enter' && addTask());
showHistoryBtn.addEventListener('click', toggleHistory);
clearHistoryBtn.addEventListener('click', clearHistory);
clearAllBtn.addEventListener('click', clearAllTasks);

// Task Management
function addTask() {
    const taskText = inputBox.value.trim();
    if (!taskText) {
        alert('Please enter a task!');
        return;
    }

    const task = {
        text: taskText,
        category: categorySelect.value,
        dueDate: dueDate.value,
        completed: false,
        id: Date.now()
    };

    renderTask(task);
    saveTask(task);
    addToHistory(task);
    updateStats();

    inputBox.value = '';
    dueDate.value = '';
}

function renderTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.innerHTML = `
        <span>${task.text} <small>(${task.category} - ${task.dueDate || 'No Due Date'})</small></span>
        <div>
            <i class="fas fa-check" data-action="complete"></i>
            <i class="fas fa-trash" data-action="delete"></i>
        </div>
    `;
    if (task.completed) li.classList.add('completed');
    listContainer.appendChild(li);

    gsap.from(li, { opacity: 0, x: -20, duration: 0.5, ease: 'power2.out' });
    li.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'complete') toggleComplete(task.id);
        if (action === 'delete') deleteTask(task.id, li);
    });
}

function toggleComplete(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    listContainer.innerHTML = '';
    tasks.forEach(renderTask);
    updateStats();
}

function deleteTask(id, li) {
    gsap.to(li, { 
        opacity: 0, 
        x: 20, 
        duration: 0.5, 
        ease: 'power2.in', 
        onComplete: () => {
            li.remove();
            const tasks = getTasks().filter(t => t.id !== id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            updateStats();
        }
    });
}

function clearAllTasks() {
    gsap.to(listContainer.children, { 
        opacity: 0, 
        stagger: 0.1, 
        duration: 0.5, 
        onComplete: () => {
            listContainer.innerHTML = '';
            localStorage.removeItem('tasks');
            updateStats();
        }
    });
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function updateStats() {
    const tasks = getTasks();
    totalTasksSpan.textContent = tasks.length;
    completedTasksSpan.textContent = tasks.filter(t => t.completed).length;
}

// History Management
function addToHistory(task) {
    const time = new Date().toLocaleTimeString();
    const historyItem = document.createElement('li');
    historyItem.textContent = `${task.text} (${task.category}) - ${time}`;
    historyContainer.appendChild(historyItem);
    saveHistory(`${task.text} (${task.category}) - ${time}`);
}

function saveHistory(entry) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push(entry);
    localStorage.setItem('history', JSON.stringify(history));
}

function toggleHistory() {
    historySection.classList.toggle('hidden');
    showHistoryBtn.innerHTML = historySection.classList.contains('hidden') 
        ? '<i class="fas fa-history"></i> History' 
        : '<i class="fas fa-history"></i> Hide History';
}

function clearHistory() {
    gsap.to(historyContainer.children, { 
        opacity: 0, 
        stagger: 0.1, 
        duration: 0.5, 
        onComplete: () => {
            historyContainer.innerHTML = '';
            localStorage.removeItem('history');
        }
    });
}

// Initialization
window.addEventListener('load', () => {
    getTasks().forEach(renderTask);
    (JSON.parse(localStorage.getItem('history')) || []).forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyContainer.appendChild(li);
    });
    updateStats();
});
