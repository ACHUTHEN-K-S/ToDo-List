
let currentCategory = '';
let tasks = {
    Personal: [],
    Work: [],
    Memory: []
};

// Load tasks and theme from LocalStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').checked = true;
        document.getElementById('theme-label').textContent = 'Dark Mode';
    }
});

function showCategory(category) {
    currentCategory = category;
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('category-page').style.display = 'block';
    document.getElementById('category-title').textContent = `${category} Tasks`;
    renderTasks();
}

function showMainPage() {
    document.getElementById('category-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
    currentCategory = '';
}

async function addTask() {
    const { value: formValues } = await Swal.fire({
        title: `Enter your task for ${currentCategory}`,
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Task name">' +
            '<input id="swal-input2" type="file" accept="image/*" class="swal2-file">',
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            const taskName = document.getElementById('swal-input1').value;
            const imageFile = document.getElementById('swal-input2').files[0];
            if (!taskName) {
                Swal.showValidationMessage('Please enter a task!');
                return false;
            }
            return new Promise((resolve) => {
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({ taskName, image: e.target.result });
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    resolve({ taskName, image: null });
                }
            });
        }
    });

    if (formValues) {
        const { taskName, image } = formValues;
        const timestamp = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        tasks[currentCategory].push({
            name: taskName,
            timestamp: timestamp,
            image: image,
            completed: false
        });
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks[currentCategory].forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
            <div class="task-container">
                <div class="task-content">
                    ${task.image ? `<img src="${task.image}" class="task-image" alt="Task Image">` : ''}
                    <div class="task-name">${task.name}</div>
                </div>
                <div class="task-timestamp">${task.timestamp}</div>
                <div class="task-actions">
                    <button class="complete" onclick="toggleComplete(${index})">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="delete" onclick="deleteTask(${index})">Delete</button>
                </div>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

function toggleComplete(index) {
    tasks[currentCategory][index].completed = !tasks[currentCategory][index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks[currentCategory].splice(index, 1);
    saveTasks();
    renderTasks();
}

function clearAllTasks() {
    Swal.fire({
        title: 'Are you sure?',
        text: `This will clear all tasks in ${currentCategory}!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear all!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            tasks[currentCategory] = [];
            saveTasks();
            renderTasks();
            Swal.fire('Cleared!', 'All tasks have been cleared.', 'success');
        }
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.getElementById('theme-toggle').addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.getElementById('theme-label').textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        document.getElementById('theme-label').textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    }
});
