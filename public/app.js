// Global variables
let currentDate = new Date();
let events = [];
let groups = [];
let selectedDate = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoading();
    try {
        await loadEvents();
        await loadGroups();
        renderCalendar();
        renderTodoList();
        renderGroupsList();
        renderUpcomingEvents();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading data', 'error');
    } finally {
        hideLoading();
    }
}

// API Functions
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        events = await response.json();
    } catch (error) {
        console.error('Error loading events:', error);
        events = [];
    }
}

async function loadGroups() {
    try {
        const response = await fetch('/api/groups');
        groups = await response.json();
        updateGroupOptions();
    } catch (error) {
        console.error('Error loading groups:', error);
        groups = [];
    }
}

async function createEvent(eventData) {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
            const newEvent = await response.json();
            events.push(newEvent);
            renderCalendar();
            renderTodoList();
            renderUpcomingEvents();
            showNotification('Event created successfully!', 'success');
            return newEvent;
        } else {
            throw new Error('Failed to create event');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showNotification('Error creating event', 'error');
        throw error;
    }
}

async function updateEvent(eventId, updateData) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            const updatedEvent = await response.json();
            const index = events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                events[index] = updatedEvent;
            }
            renderCalendar();
            renderTodoList();
            renderUpcomingEvents();
            showNotification('Event updated successfully!', 'success');
            return updatedEvent;
        } else {
            throw new Error('Failed to update event');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        showNotification('Error updating event', 'error');
        throw error;
    }
}

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            events = events.filter(e => e.id !== eventId);
            renderCalendar();
            renderTodoList();
            renderUpcomingEvents();
            showNotification('Event deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Error deleting event', 'error');
        throw error;
    }
}

async function createGroup(groupData) {
    try {
        const response = await fetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });
        
        if (response.ok) {
            const newGroup = await response.json();
            groups.push(newGroup);
            updateGroupOptions();
            renderGroupsList();
            showNotification('Group created successfully!', 'success');
            return newGroup;
        } else {
            throw new Error('Failed to create group');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showNotification('Error creating group', 'error');
        throw error;
    }
}

// Calendar Functions
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonth = document.getElementById('currentMonth');
    
    // Update month display
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    currentMonth.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayHeaders = document.createElement('div');
    weekdayHeaders.className = 'calendar-weekdays';
    
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'weekday-header';
        header.textContent = day;
        weekdayHeaders.appendChild(header);
    });
    
    calendarGrid.appendChild(weekdayHeaders);
    
    // Add calendar days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = document.createElement('div');
    calendarDays.className = 'calendar-grid';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = createCalendarDay(date);
        calendarDays.appendChild(dayElement);
    }
    
    calendarGrid.appendChild(calendarDays);
}

function createCalendarDay(date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = isDateToday(date);
    const dayEvents = getEventsForDate(date);
    
    if (!isCurrentMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    if (dayEvents.length > 0) {
        dayElement.classList.add('has-events');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);
    
    // Events
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';
    
    dayEvents.slice(0, 3).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${event.type}`;
        eventElement.textContent = event.title;
        eventElement.title = event.description || event.title;
        eventsContainer.appendChild(eventElement);
    });
    
    if (dayEvents.length > 3) {
        const moreElement = document.createElement('div');
        moreElement.className = 'event-item';
        moreElement.textContent = `+${dayEvents.length - 3} more`;
        eventsContainer.appendChild(moreElement);
    }
    
    dayElement.appendChild(eventsContainer);
    
    // Click handler
    dayElement.addEventListener('click', () => {
        selectedDate = new Date(date);
        showDateEvents(date);
    });
    
    return dayElement;
}

function getEventsForDate(date) {
    const dateString = formatDate(date);
    return events.filter(event => event.date === dateString);
}

function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Todo List Functions
function renderTodoList() {
    const todoList = document.getElementById('todoList');
    const todos = events.filter(event => event.type === 'todo');
    
    if (todos.length === 0) {
        todoList.innerHTML = '<p class="empty-state">No todos yet. Create your first todo!</p>';
        return;
    }
    
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoElement.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo('${todo.id}')">
            <div class="todo-content">
                <div class="todo-title">${todo.title}</div>
                <div class="todo-date">${formatDisplayDate(todo.date)}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteEvent('${todo.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        todoList.appendChild(todoElement);
    });
}

async function toggleTodo(todoId) {
    const todo = events.find(e => e.id === todoId);
    if (todo) {
        await updateEvent(todoId, { completed: !todo.completed });
    }
}

// Groups Functions
function renderGroupsList() {
    const groupsList = document.getElementById('groupsList');
    
    if (groups.length === 0) {
        groupsList.innerHTML = '<p class="empty-state">No groups yet. Create your first group!</p>';
        return;
    }
    
    groupsList.innerHTML = '';
    
    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-item';
        
        groupElement.innerHTML = `
            <div class="group-name">${group.name}</div>
            <div class="group-members">${group.members.length} members</div>
        `;
        
        groupElement.addEventListener('click', () => {
            showGroupDetails(group);
        });
        
        groupsList.appendChild(groupElement);
    });
}

function updateGroupOptions() {
    const eventGroup = document.getElementById('eventGroup');
    eventGroup.innerHTML = '<option value="">Select a group</option>';
    
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        eventGroup.appendChild(option);
    });
}

// Upcoming Events Functions
function renderUpcomingEvents() {
    const upcomingEvents = document.getElementById('upcomingEvents');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcoming = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek && !event.completed;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length === 0) {
        upcomingEvents.innerHTML = '<p class="empty-state">No upcoming events this week.</p>';
        return;
    }
    
    upcomingEvents.innerHTML = '';
    
    upcoming.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'upcoming-item';
        
        eventElement.innerHTML = `
            <div class="upcoming-title">${event.title}</div>
            <div class="upcoming-date">${formatDisplayDate(event.date)}</div>
        `;
        
        upcomingEvents.appendChild(eventElement);
    });
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Reset forms
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Event Listeners
function setupEventListeners() {
    // Event form
    document.getElementById('eventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        try {
            const formData = new FormData(e.target);
            const assignees = document.getElementById('eventAssignees').value
                .split(',')
                .map(email => email.trim())
                .filter(email => email);
            
            const eventData = {
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                description: document.getElementById('eventDescription').value,
                type: 'event',
                groupId: document.getElementById('eventGroup').value || null,
                assignedTo: assignees
            };
            
            await createEvent(eventData);
            hideModal('eventModal');
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            hideLoading();
        }
    });
    
    // Todo form
    document.getElementById('todoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        try {
            const todoData = {
                title: document.getElementById('todoTitle').value,
                date: document.getElementById('todoDate').value,
                description: document.getElementById('todoDescription').value,
                type: 'todo',
                assignedTo: []
            };
            
            await createEvent(todoData);
            hideModal('todoModal');
        } catch (error) {
            console.error('Error creating todo:', error);
        } finally {
            hideLoading();
        }
    });
    
    // Group form
    document.getElementById('groupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        try {
            const members = document.getElementById('groupMembers').value
                .split(',')
                .map(email => email.trim())
                .filter(email => email);
            
            const groupData = {
                name: document.getElementById('groupName').value,
                description: document.getElementById('groupDescription').value,
                members: members
            };
            
            await createGroup(groupData);
            hideModal('groupModal');
        } catch (error) {
            console.error('Error creating group:', error);
        } finally {
            hideLoading();
        }
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Utility Functions
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('show');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            .notification.success { background: #28a745; }
            .notification.error { background: #dc3545; }
            .notification.info { background: #17a2b8; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function showDateEvents(date) {
    const dayEvents = getEventsForDate(date);
    const dateString = formatDisplayDate(date);
    
    if (dayEvents.length === 0) {
        showNotification(`No events on ${dateString}`, 'info');
        return;
    }
    
    // Create a simple modal to show events for the day
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-day"></i> Events for ${dateString}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-form">
                ${dayEvents.map(event => `
                    <div class="event-detail" style="padding: 10px; margin-bottom: 10px; background: #f8f9fa; border-radius: 8px;">
                        <h4>${event.title}</h4>
                        <p>${event.description || 'No description'}</p>
                        <small>Type: ${event.type}</small>
                        ${event.assignedTo && event.assignedTo.length > 0 ? 
                            `<br><small>Assigned to: ${event.assignedTo.join(', ')}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showGroupDetails(group) {
    showNotification(`Group: ${group.name} - ${group.members.length} members`, 'info');
}