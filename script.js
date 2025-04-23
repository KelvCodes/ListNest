/**
 * Listify Todo App - A modern task management application
 * @author Agyare Kelvin Yeboah
 * @version 2.0
 */

// Constants
const STORAGE_KEYS = {
    TASKS: 'tasks',
    HISTORY: 'history',
    THEME: 'theme'
};

// DOM Elements
const elements = {
    // App Containers
    homepage: document.getElementById('homepage'),
    todoApp: document.getElementById('todo-app'),
    loadingOverlay: document.querySelector('.loading-overlay'),
    
    // Input Elements
    inputBox: document.getElementById('input-box'),
    categorySelect: document.getElementById('category-select'),
    dueDate: document.getElementById('due-date'),
    
    // List Containers
    listContainer: document.getElementById('list-container'),
    historyContainer: document.getElementById('history-container'),
    
    // Buttons
    getStartedBtn: document.getElementById('get-started-btn'),
    addBtn: document.getElementById('add-btn'),
    showHistoryBtn: document.getElementById('show-history-btn'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    undoBtn: document.getElementById('undo-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    
    // Filter Buttons
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Sections
    historySection: document.querySelector('.history-section'),
    
    // Stats Elements
    totalTasksSpan: document.getElementById('total-tasks'),
    completedTasksSpan: document.getElementById('completed-tasks'),
    pendingTasksSpan: document.getElementById('pending-tasks'),
    
    // Footer
    currentYearSpan: document.getElementById('current-year')
};

// App State
const state = {
    tasks: [],
    history: [],
    lastDeletedTask: null,
    currentFilter: 'all',
    isDarkMode: true
};

// Initialize the app
function init() {
    setLoading(true);
    
    // Load saved state
    loadState();
    
    // Set current year in footer
    elements.currentYearSpan.textContent = new Date().getFullYear();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial UI
    renderAllTasks();
    updateStats();
    renderHistory();
    applyTheme();
    
    setLoading(false);
}

// State Management
function loadState() {
    try {
        // Load tasks
        const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        state.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        
        // Load history
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        state.history = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Load theme preference
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        state.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
    } catch (error) {
        console.error('Error loading state:', error);
        showNotification('Error loading saved data', 'error');
    }
}

function saveState(key) {
    try {
        localStorage.setItem(key, JSON.stringify(state[key]));
    } catch (error) {
        console.error('Error saving state:', error);
        showNotification('Error saving data', 'error');
    }
}

// Theme Management
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
    saveState(STORAGE_KEYS.THEME);
}

function applyTheme() {
    if (state.isDarkMode) {
        document.body.classList.remove('light-mode');
        elements.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('light-mode');
        elements.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.getStartedBtn.addEventListener('click', showTodoApp);
    
    // Task Management
    elements.addBtn.addEventListener('click', addTask);
    elements.inputBox.addEventListener('keydown', (e) => e.key === 'Enter' && addTask());
    elements.clearAllBtn.addEventListener('click', confirmClearAll);
    
    // History Management
    elements.showHistoryBtn.addEventListener('click', toggleHistory);
    elements.clearHistoryBtn.addEventListener('click', confirmClearHistory);
    
    // Undo Functionality
    elements.undoBtn.addEventListener('click', undoLastAction);
    
    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Filter Buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
    });
}

// UI Transitions
function showTodoApp() {
    elements.homepage.classList.add('hidden');
    elements.todoApp.classList.add('visible');
    animateElement('.todo-app', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
}

function animateElement(selector, fromProps, toProps) {
    gsap.fromTo(selector, fromProps, toProps);
}

// Task Management
function addTask() {
    const taskText = elements.inputBox.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task!', 'warning');
        elements.inputBox.focus();
        return;
    }

    const task = createTask(taskText);
    state.tasks.push(task);
    
    renderTask(task);
    saveState(STORAGE_KEYS.TASKS);
    addToHistory(`Added: ${task.text} (${task.category})`);
    updateStats();
    
    // Reset inputs
    elements.inputBox.value = '';
    elements.dueDate.value = '';
    elements.inputBox.focus();
    
    showNotification('Task added successfully!', 'success');
}

function createTask(text) {
    return {
        text,
        category: elements.categorySelect.value,
        dueDate: elements.dueDate.value || 'No Due Date',
        completed: false,
        id: Date.now(),
        createdAt: new Date().toISOString()
    };
}

function renderAllTasks() {
    elements.listContainer.innerHTML = '';
    
    const tasksToRender = state.currentFilter === 'all' 
        ? state.tasks 
        : state.tasks.filter(task => task.category === state.currentFilter);
    
    if (tasksToRender.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = state.currentFilter === 'all' 
            ? 'No tasks yet. Add one above!' 
            : `No ${state.currentFilter} tasks.`;
        elements.listContainer.appendChild(emptyMessage);
        return;
    }
    
    tasksToRender.forEach(task => renderTask(task));
}

function renderTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
        <span>${escapeHtml(task.text)} 
            <small>(${task.category} - ${formatDate(task.dueDate)})</small>
        </span>
        <div>
            <i class="fas fa-check" data-action="complete" aria-label="Complete task"></i>
            <i class="fas fa-trash" data-action="delete" aria-label="Delete task"></i>
        </div>
    `;
    
    elements.listContainer.appendChild(li);
    animateElement(li, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 });
    
    // Add event listeners to action icons
    li.querySelectorAll('[data-action]').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.dataset.action;
            if (action === 'complete') toggleComplete(task.id);
            if (action === 'delete') confirmDeleteTask(task.id, li);
        });
    });
}

function toggleComplete(id) {
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
    saveState(STORAGE_KEYS.TASKS);
    
    const action = state.tasks[taskIndex].completed ? 'Completed' : 'Marked incomplete';
    addToHistory(`${action}: ${state.tasks[taskIndex].text}`);
    
    renderAllTasks();
    updateStats();
    
    showNotification(`Task ${state.tasks[taskIndex].completed ? 'completed' : 'marked incomplete'}!`);
}

function confirmDeleteTask(id, element) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(id, element);
    }
}

function deleteTask(id, element) {
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    state.lastDeletedTask = state.tasks[taskIndex];
    elements.undoBtn.classList.remove('hidden');
    
    animateElement(element, 
        { opacity: 1, x: 0 }, 
        { 
            opacity: 0, 
            x: 20, 
            duration: 0.3,
            onComplete: () => {
                state.tasks.splice(taskIndex, 1);
                saveState(STORAGE_KEYS.TASKS);
                addToHistory(`Deleted: ${state.lastDeletedTask.text}`);
                renderAllTasks();
                updateStats();
                
                // Hide undo button after 5 seconds
                setTimeout(() => {
                    if (elements.undoBtn && !elements.undoBtn.classList.contains('hidden')) {
                        elements.undoBtn.classList.add('hidden');
                        state.lastDeletedTask = null;
                    }
                }, 5000);
            }
        }
    );
}

function confirmClearAll() {
    if (!state.tasks.length) {
        showNotification('No tasks to clear!', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear ALL tasks? This cannot be undone.')) {
        clearAllTasks();
    }
}

function clearAllTasks() {
    state.lastDeletedTask = { tasks: [...state.tasks] };
    elements.undoBtn.classList.remove('hidden');
    
    animateElement(elements.listContainer.children, 
        { opacity: 1 }, 
        { 
            opacity: 0, 
            stagger: 0.1, 
            duration: 0.3,
            onComplete: () => {
                addToHistory('Cleared all tasks');
                state.tasks = [];
                saveState(STORAGE_KEYS.TASKS);
                renderAllTasks();
                updateStats();
                
                setTimeout(() => {
                    if (elements.undoBtn && !elements.undoBtn.classList.contains('hidden')) {
                        elements.undoBtn.classList.add('hidden');
                        state.lastDeletedTask = null;
                    }
                }, 5000);
            }
        }
    );
}

// Undo Functionality
function undoLastAction() {
    if (!state.lastDeletedTask) return;
    
    // Handle single task undo
    if (!Array.isArray(state.lastDeletedTask)) {
        state.tasks.push(state.lastDeletedTask);
        saveState(STORAGE_KEYS.TASKS);
        renderTask(state.lastDeletedTask);
        addToHistory(`Undo: Restored ${state.lastDeletedTask.text}`);
    } 
    // Handle clear all undo
    else if (state.lastDeletedTask.tasks) {
        state.tasks = [...state.lastDeletedTask.tasks];
        saveState(STORAGE_KEYS.TASKS);
        renderAllTasks();
        addToHistory('Undo: Restored all tasks');
    }
    
    updateStats();
    elements.undoBtn.classList.add('hidden');
    state.lastDeletedTask = null;
    
    showNotification('Undo successful!', 'success');
}

// Filtering
function filterTasks(category) {
    state.currentFilter = category;
    
    // Update active filter button
    elements.filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    
    renderAllTasks();
}

// History Management
function addToHistory(entry) {
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${timestamp} - ${entry}`;
    
    state.history.unshift(historyEntry); // Add to beginning
    if (state.history.length > 50) state.history.pop(); // Limit to 50 entries
    
    saveState(STORAGE_KEYS.HISTORY);
    renderHistory();
}

function renderHistory() {
    elements.historyContainer.innerHTML = '';
    
    if (state.history.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.textContent = 'No history yet. Your actions will appear here.';
        elements.historyContainer.appendChild(emptyMsg);
        return;
    }
    
    state.history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        elements.historyContainer.appendChild(li);
    });
}

function toggleHistory() {
    elements.historySection.classList.toggle('hidden');
    elements.showHistoryBtn.innerHTML = elements.historySection.classList.contains('hidden') 
        ? '<i class="fas fa-history"></i> History' 
        : '<i class="fas fa-history"></i> Hide History';
}

function confirmClearHistory() {
    if (!state.history.length) {
        showNotification('No history to clear!', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
        clearHistory();
    }
}

function clearHistory() {
    animateElement(elements.historyContainer.children, 
        { opacity: 1 }, 
        { 
            opacity: 0, 
            stagger: 0.1, 
            duration: 0.3,
            onComplete: () => {
                state.history = [];
                saveState(STORAGE_KEYS.HISTORY);
                renderHistory();
                showNotification('History cleared!', 'success');
            }
        }
    );
}

// Stats
function updateStats() {
    elements.totalTasksSpan.textContent = state.tasks.length;
    
    const completedCount = state.tasks.filter(t => t.completed).length;
    elements.completedTasksSpan.textContent = completedCount;
    elements.pendingTasksSpan.textContent = state.tasks.length - completedCount;
}

// Utility Functions
function setLoading(isLoading) {
    if (isLoading) {
        elements.loadingOverlay.classList.remove('hidden');
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    // In a real app, you might use a proper notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Simple alert for now - consider replacing with a toast notification
    if (type === 'error') {
        alert(`Error: ${message}`);
    } else if (type === 'warning') {
        alert(`Warning: ${message}`);
    }
    // Don't alert for success/info to avoid being annoying
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (dateString === 'No Due Date') return dateString;
    
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
    } catch {
        return dateString;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
