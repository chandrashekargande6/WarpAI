// Frontend JavaScript for Student Registration System
// Handles form submissions, API calls, and dynamic UI updates

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Registration App initialized');
    
    // Initialize the application
    initializeApp();
});

// Main initialization function
function initializeApp() {
    // Get DOM elements
    const studentForm = document.getElementById('studentForm');
    const messagesDiv = document.getElementById('messages');
    const studentsContainer = document.getElementById('studentsContainer');
    const studentsCount = document.getElementById('studentsCount');

    // Attach event listeners
    if (studentForm) {
        studentForm.addEventListener('submit', handleFormSubmit);
    }

    // Load students data on page load
    loadStudents();
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Extract form data
    const studentData = {
        name: formData.get('name').trim(),
        rollNumber: formData.get('rollNumber').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        event: formData.get('event')
    };

    // Basic client-side validation
    if (!validateFormData(studentData)) {
        return;
    }

    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = '🔄 Registering...';
        submitButton.disabled = true;

        // Make API call to register student
        const response = await fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showMessage('✅ ' + result.message, 'success');
            
            // Clear form
            form.reset();
            
            // Reload students list
            await loadStudents();
        } else {
            // Show error message
            showMessage('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error registering student:', error);
        showMessage('❌ Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = '🎯 Register for Event';
        submitButton.disabled = false;
    }
}

// Validate form data
function validateFormData(data) {
    // Check if all fields are filled
    for (const [key, value] of Object.entries(data)) {
        if (!value || value.trim() === '') {
            showMessage(`❌ ${key.charAt(0).toUpperCase() + key.slice(1)} is required.`, 'error');
            return false;
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('❌ Please enter a valid email address.', 'error');
        return false;
    }

    // Validate phone number (should be digits, 10 digits minimum)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        showMessage('❌ Please enter a valid 10-digit phone number.', 'error');
        return false;
    }

    return true;
}

// Load and display students
async function loadStudents() {
    const studentsContainer = document.getElementById('studentsContainer');
    const studentsCount = document.getElementById('studentsCount');
    
    try {
        // Show loading state
        studentsContainer.innerHTML = '<div class="loading">🔄 Loading students...</div>';
        studentsCount.textContent = 'Loading registered students...';

        // Fetch students from API
        const response = await fetch('/students');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
            displayStudents(result.data);
            updateStudentsCount(result.count);
        } else {
            studentsContainer.innerHTML = '<div class="no-students">❌ Error loading students data</div>';
            studentsCount.textContent = 'Error loading data';
        }
    } catch (error) {
        console.error('Error loading students:', error);
        studentsContainer.innerHTML = '<div class="no-students">❌ Failed to load students. Please refresh the page.</div>';
        studentsCount.textContent = 'Error loading data';
    }
}

// Display students in the UI
function displayStudents(students) {
    const studentsContainer = document.getElementById('studentsContainer');
    
    if (!students || students.length === 0) {
        studentsContainer.innerHTML = `
            <div class="no-students">
                📝 No students registered yet.<br>
                Be the first to register for an event!
            </div>
        `;
        return;
    }

    // Create HTML for each student
    const studentsHTML = students.map(student => createStudentHTML(student)).join('');
    studentsContainer.innerHTML = studentsHTML;

    // Add event listeners for delete buttons
    attachDeleteEventListeners();
}

// Create HTML for a single student
function createStudentHTML(student) {
    return `
        <div class="student-item" data-student-id="${student._id}">
            <div class="student-header">
                <div class="student-name">${escapeHtml(student.name)}</div>
                <button class="btn btn-danger" onclick="deleteStudent('${student._id}')">
                    🗑️ Remove
                </button>
            </div>
            
            <div class="student-info">
                <div class="info-item">
                    <span class="info-label">Roll Number:</span>
                    <span class="info-value">${escapeHtml(student.rollNumber)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${escapeHtml(student.email)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${escapeHtml(student.phone)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Event:</span>
                    <span class="event-badge">${escapeHtml(student.event)}</span>
                </div>
            </div>
        </div>
    `;
}

// Update students count display
function updateStudentsCount(count) {
    const studentsCount = document.getElementById('studentsCount');
    studentsCount.textContent = `📊 Total Registered Students: ${count}`;
}

// Delete student function
async function deleteStudent(studentId) {
    if (!studentId) {
        showMessage('❌ Invalid student ID', 'error');
        return;
    }

    // Confirm deletion
    const confirmDelete = confirm('Are you sure you want to remove this student registration?');
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/students/${studentId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ ' + result.message, 'success');
            // Reload students list
            await loadStudents();
        } else {
            showMessage('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    }
}

// Attach event listeners to delete buttons
function attachDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        if (!button.hasAttribute('data-listener-attached')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const studentId = this.closest('.student-item').getAttribute('data-student-id');
                deleteStudent(studentId);
            });
            button.setAttribute('data-listener-attached', 'true');
        }
    });
}

// Show success/error messages
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    const messageClass = type === 'error' ? 'error-message' : 'success-message';
    
    messagesDiv.innerHTML = `
        <div class="${messageClass}">
            ${message}
        </div>
    `;

    // Auto-hide message after 5 seconds
    setTimeout(() => {
        if (messagesDiv.innerHTML.includes(message)) {
            messagesDiv.innerHTML = '';
        }
    }, 5000);

    // Scroll to message
    messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Utility function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteStudent function globally available
window.deleteStudent = deleteStudent;

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add real-time form validation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
});

// Real-time field validation
function validateField(field) {
    const value = field.value.trim();
    
    // Remove previous error styling
    field.style.borderColor = '';
    
    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#e53e3e';
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.style.borderColor = '#e53e3e';
            return false;
        }
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            field.style.borderColor = '#e53e3e';
            return false;
        }
    }
    
    // Success styling
    field.style.borderColor = '#48bb78';
    return true;
}

// Add keyboard shortcut for quick refresh
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        loadStudents();
        showMessage('🔄 Students list refreshed', 'success');
    }
});

console.log('Student Registration App JavaScript loaded successfully!');
