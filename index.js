// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeAllPages();
});

function initializeAllPages() {
    initializeBookButtons();
    initializeFormValidation();
    initializeRoomCards();
    
    // Set minimum date to today for booking form
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

// Initialize all book buttons
function initializeBookButtons() {
    const bookButtons = document.querySelectorAll('.book-btn');
    
    bookButtons.forEach(button => {
        if (!button.hasAttribute('onclick') && button.type !== 'submit') {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'book.html';
            });
        }
    });
}

// Initialize room card animations
function initializeRoomCards() {
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Form validation system
function initializeFormValidation() {
    initializeBookingForm();
    initializeContactForm();
}

function initializeBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const inputs = bookingForm.querySelectorAll('input[required], select[required]');
    const submitBtn = document.getElementById('submitBtn');

    function validateForm() {
        let allValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                allValid = false;
            }
        });

        // Additional validation for specific fields
        const duration = document.getElementById('duration');
        if (duration && (duration.value < 1 || duration.value > 8)) {
            allValid = false;
        }

        const date = document.getElementById('date');
        if (date && date.value) {
            const selectedDate = new Date(date.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                allValid = false;
                date.setCustomValidity('Please select a future date');
            } else {
                date.setCustomValidity('');
            }
        }

        // Update button state
        if (submitBtn) {
            if (allValid) {
                submitBtn.classList.add('enabled');
                submitBtn.disabled = false;
            } else {
                submitBtn.classList.remove('enabled');
                submitBtn.disabled = true;
            }
        }

        return allValid;
    }

    // Add event listeners to all inputs
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });

    // Add change event for select elements
    const selects = bookingForm.querySelectorAll('select[required]');
    selects.forEach(select => {
        select.addEventListener('change', validateForm);
    });

    // Handle form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading state
            if (submitBtn) {
                submitBtn.innerHTML = 'Booking...';
                submitBtn.disabled = true;
            }

            // Simulate processing delay
            setTimeout(() => {
                // Generate confirmation data
                const formData = new FormData(bookingForm);
                const roomType = formData.get('room');
                const date = formData.get('date');
                const time = formData.get('time');
                const duration = formData.get('duration');
                const name = formData.get('name');
                
                // Format date for display
                const formattedDate = new Date(date).toLocaleDateString('en-US');
                
                // Format time for display
                const startTime = new Date(`2000-01-01T${time}`);
                const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
                const timePeriod = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                
                // Generate confirmation number
                const now = new Date();
                const lastName = name.split(' ').pop().toUpperCase();
                const confirmationNumber = `CMPND-${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${lastName}`;
                
                // Store in sessionStorage for confirmation page
                sessionStorage.setItem('bookingDetails', JSON.stringify({
                    roomType: roomType,
                    date: formattedDate,
                    time: timePeriod,
                    confirmationNumber: confirmationNumber
                }));
                
                // Redirect to confirmation page
                window.location.href = 'confirmed.html';
            }, 1500);
        }
    });

    // Initial validation
    validateForm();
}

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
    const sendBtn = document.getElementById('sendBtn');

    function validateContactForm() {
        let allValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                allValid = false;
            }
        });

        // Update button state
        if (sendBtn) {
            if (allValid) {
                sendBtn.classList.add('enabled');
                sendBtn.disabled = false;
            } else {
                sendBtn.classList.remove('enabled');
                sendBtn.disabled = true;
            }
        }

        return allValid;
    }

    // Add event listeners
    inputs.forEach(input => {
        input.addEventListener('input', validateContactForm);
    });

    // Handle form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateContactForm()) {
            // Show loading state
            if (sendBtn) {
                sendBtn.innerHTML = 'Sending...';
                sendBtn.disabled = true;
            }

            // Simulate sending delay
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you within 24 hours.');
                contactForm.reset();
                validateContactForm();
                
                // Reset button text
                if (sendBtn) {
                    sendBtn.innerHTML = 'Send Message';
                }
            }, 1500);
        }
    });

    // Initial validation
    validateContactForm();
}

// Load booking details on confirmation page
function loadBookingDetails() {
    if (window.location.pathname.includes('confirmed.html')) {
        const bookingDetails = sessionStorage.getItem('bookingDetails');
        
        if (bookingDetails) {
            const details = JSON.parse(bookingDetails);
            
            // Update page with booking details
            const roomTypeMap = {
                'common': 'Common Area',
                'quiet': 'Quiet Room',
                'conference': 'Conference Room'
            };
            
            document.getElementById('confirmedRoom').textContent = roomTypeMap[details.roomType] || details.roomType;
            document.getElementById('confirmedDate').textContent = details.date;
            document.getElementById('confirmedTime').textContent = details.time;
            document.getElementById('confirmedNumber').textContent = details.confirmationNumber;
            
            // Clear stored details
            sessionStorage.removeItem('bookingDetails');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAllPages();
    loadBookingDetails();
});