// Get the elements for homepage and todo app
const getStartedBtn = document.getElementById("get-started-btn");
const homepage = document.getElementById("homepage");
const todoApp = document.getElementById("todo-app");

// Get the elements for the Todo app
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const historyContainer = document.getElementById("history-container");
const showHistoryBtn = document.getElementById("show-history-btn");
const historySection = document.querySelector(".history-section");
const clearHistoryBtn = document.getElementById("clear-history-btn");

//The Event listeners
document.getElementById("add-btn").addEventListener("click", addTask);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

showHistoryBtn.addEventListener("click", () => {
    historySection.classList.toggle("hidden");
    
    // Event listener for deleting tasks
listContainer.addEventListener("click", (e) => {
    if (e.target && e.target.matches("i.fa-solid.fa-trash")) {
        // Remove the task item (li)
        e.target.closest("li").remove();
    }
});

 // Toggle the button text
    if (historySection.classList.contains("hidden")) {
        showHistoryBtn.textContent = "Show History";
    } else {
        showHistoryBtn.textContent = "Hide History";
    }
});

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("history");
    historyContainer.innerHTML = "";
});

// Show the Todo app when "Get Started" button is clicked
getStartedBtn.addEventListener("click", () => {
    // Hide the homepage and show Todo app
    homepage.style.display = "none";
    todoApp.style.display = "block";
});

function addTask() {
    const task = inputBox.value.trim();
    if (task === "") {
        alert("You must write something!");
        return;
    }

    // Create the task item
    const li = document.createElement("li");
    li.textContent = task;

    // Add delete icon
    const span = document.createElement("span");
    span.innerHTML = "<i class='fa-solid fa-trash'></i>";
    li.appendChild(span);
    listContainer.appendChild(li);

    // Save to history
    addToHistory(task);

    inputBox.value = "";

    // Handle delete task
    span.addEventListener("click", () => {
        li.remove();
    });
}

function addToHistory(task) {
    const historyItem = document.createElement("li");
    const time = getCurrentTime();
    historyItem.textContent = `${task} - ${time}`;
    historyContainer.appendChild(historyItem);

    // Save the history to localStorage
    const currentHistory = JSON.parse(localStorage.getItem("history")) || [];
    currentHistory.push({ task, time });
    localStorage.setItem("history", JSON.stringify(currentHistory));
}

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
}

// Load the history on page load
window.addEventListener("load", () => {
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];
    savedHistory.forEach((entry) => {
        const historyItem = document.createElement("li");
        historyItem.textContent = `${entry.task} - ${entry.time}`;
        historyContainer.appendChild(historyItem);
    });
});
