const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskText');
const STORAGE_KEY = 'taskManager_tasks';
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortBtn = document.getElementById('sortBtn');
const allCountEl = document.getElementById('all-count');
const completedCountEl = document.getElementById('completed-count');
const pendingCountEl = document.getElementById('pending-count');
const emptyState = document.querySelector('.empty-state');
const emptyFilterNote = document.querySelector('.empty-filter-note');

let tasks = []; // all task in this array 
let activeFilter = 'all'; //by default 
let sortByNewest = true;  //by default

function init() {
    loadTasks(); // load from localstorage
    taskForm.addEventListener('submit', addTask);
    sortBtn.addEventListener('click', toggleSort);
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveFilter(btn.dataset.filter);
      });
    });
    renderTasks();
    updateTaskCounts();
}
  
function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        try {
          tasks = JSON.parse(storedTasks);
        } catch (error) {
          console.error('Failed', error);
          tasks = [];
        }
    }
}
  
function saveTasks() { // save task in localstorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); // save array as string
}

function addTask(e) { // Add new task
    e.preventDefault();
  
    const text = taskInput.value.trim();
    if (!text) return;
  
    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: Date.now()
    };
  
    tasks.unshift(newTask); // add in start
    saveTasks(); // update
    renderTasks(); // show
    updateTaskCounts(); // update number 
    taskInput.value = ''; // make input empty
}
  
function toggleTaskComplete(id) {
    tasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
    updateTaskCounts();
}
  
// Delete task
function deleteTask(id) {
    const taskToDelete = tasks.find(task => task.id === id);
    tasks = tasks.filter(task => task.id !== id); // remove task
    saveTasks();
    renderTasks();
    updateTaskCounts();
}
  
function setActiveFilter(filter) {
    activeFilter = filter;

    filterBtns.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    renderTasks();
}
  
function toggleSort() {
    sortByNewest = !sortByNewest;
    sortBtn.querySelector('span').textContent = sortByNewest ? 'Newest first' : 'Oldest first';
    renderTasks();
}

function renderTasks() {
    const emptyStateEl = taskList.querySelector('.empty-state');
    taskList.innerHTML = '';
    taskList.appendChild(emptyStateEl);
    
    const filteredTasks = tasks.filter(task => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'completed') return task.completed;
      if (activeFilter === 'pending') return !task.completed;
      return true;
    });
    
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      return sortByNewest 
        ? b.createdAt - a.createdAt 
        : a.createdAt - b.createdAt;
    });
    
    if (sortedTasks.length === 0) {
      emptyState.style.display = 'block';
      emptyFilterNote.style.display = activeFilter !== 'all' ? 'block' : 'none';
    } else {
      emptyState.style.display = 'none';
    }
    
    sortedTasks.forEach(task => {
      const taskEl = createTaskElement(task);
      taskList.insertBefore(taskEl, emptyStateEl);
    });
}

function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
    const date = new Date(task.createdAt).toLocaleDateString();
  
    taskEl.innerHTML = `
      <div class="task-content">
        <div class="checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
        ${task.completed ? '✓' : ''}
        </div>
    
        <div class="task-text-container">
          <span class="task-text">${task.text}</span>
          <span class="task-date">${date}</span>
        </div>
      </div>
      <button class="delete-btn" data-id="${task.id}">
      Delete
      </button>
    `;

    const checkbox = taskEl.querySelector('.checkbox');
    const deleteBtn = taskEl.querySelector('.delete-btn');
  
    checkbox.addEventListener('click', () => toggleTaskComplete(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
    return taskEl;
}
  
function updateTaskCounts() { //update task counts of all,pending,complete 
    const counts = {
      all: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length
    };
    
    allCountEl.textContent = counts.all;
    completedCountEl.textContent = counts.completed;
    pendingCountEl.textContent = counts.pending;
}

init();  // run app