// Utility function to generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// -------------------------
// Simple client-side auth
// -------------------------
const BACKEND_URL = window.BACKEND_URL || 'http://localhost:5000';

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
}

// Function to save session details to localStorage
function saveSessionDetails(sessionName, userName, roomId) {
    const sessionDetails = {
        sessionName,
        userName,
        roomId,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(sessionDetails));
}

// Function to handle session creation
async function createNewSession(sessionName, userName) {
    // Create session on backend so it's persisted and has a stable ID
    try {
    const resp = await fetch(`${BACKEND_URL}/api/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionName })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ error: 'Failed to create session' }));
            alert(err.error || 'Failed to create session');
            return;
        }

        const data = await resp.json();
        // backend returns session document with _id
        const roomId = data._id || generateRoomId();
        saveSessionDetails(sessionName, userName, roomId);
        window.location.href = `session.html?room=${encodeURIComponent(roomId)}`;
    } catch (e) {
        console.error('Error creating session:', e);
        alert('Unable to create session. Is the backend running?');
    }
}

// Event listener for the create session button
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations and scroll effects
    initializeScrollEffects();
    initializeImageLoading();
    
    const createSessionBtn = document.getElementById('create-session-btn');
    const createSessionModal = document.getElementById('create-modal');
    const finalCreateBtn = document.getElementById('create-session');
    const cancelCreateBtn = document.getElementById('cancel-create');
    const closeModalBtn = document.querySelector('.close-modal');
    const loginModal = document.getElementById('login-modal');
    const emailLoginBtn = document.getElementById('email-login');
    const googleSignInBtn = document.getElementById('google-signin');
    const cancelLoginBtn = document.getElementById('cancel-login');
    const closeLoginBtn = document.querySelector('.close-modal-login');
    const getStartedBtn = document.getElementById('get-started');
    const joinSessionBtn = document.getElementById('join-session-btn');
    const joinModal = document.getElementById('join-modal');
    const joinFinalBtn = document.getElementById('join-session');

    // Show modal when create session button is clicked (require login)
    createSessionBtn.addEventListener('click', () => {
        if (!isLoggedIn()) {
            openLogin(() => createSessionModal.classList.remove('hidden'));
            return;
        }

        // Pre-fill display name from logged in user
        const user = getCurrentUser();
        const display = document.getElementById('display-name-input');
        if (display && user && user.name) display.value = user.name;

        createSessionModal.classList.remove('hidden');
    });

    // Get Started shows login first and then opens Create modal
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            openLogin(() => {
                // open create modal after login
                if (createSessionModal) {
                    // prefill display name from user
                    const user = getCurrentUser();
                    const display = document.getElementById('display-name-input');
                    if (display && user && user.name) display.value = user.name;
                    createSessionModal.classList.remove('hidden');
                }
            });
        });
    }

    // Join session button should require login first
    if (joinSessionBtn) {
        joinSessionBtn.addEventListener('click', () => {
            if (!isLoggedIn()) {
                openLogin(() => joinModal.classList.remove('hidden'));
                return;
            }

            joinModal.classList.remove('hidden');
        });
    }

    // Hide modal when cancel or close is clicked (support multiple modals)
    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', () => {
            if (createSessionModal) createSessionModal.classList.add('hidden');
        });
    }

    // Close buttons with class .close-modal (there may be several)
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = btn.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Login modal handlers
    function openLogin(afterLogin) {
        if (isLoggedIn()) {
            if (typeof afterLogin === 'function') afterLogin();
            return;
        }

        if (loginModal) loginModal.classList.remove('hidden');

        // Attach a one-time callback to run after login
        loginModal._afterLogin = typeof afterLogin === 'function' ? afterLogin : null;
    }

    function closeLogin() {
        if (loginModal) loginModal.classList.add('hidden');
    }

    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLogin);
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);

    // Cancel join
    const cancelJoinBtn = document.getElementById('cancel-join');
    if (cancelJoinBtn) cancelJoinBtn.addEventListener('click', () => {
        if (joinModal) joinModal.classList.add('hidden');
    });

    // Google sign-in (simulated): prompt for email and name
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            const email = prompt('Enter your Google email to simulate sign-in (e.g., you@gmail.com)');
            if (!email) return alert('Google sign-in cancelled');
            const name = email.split('@')[0].replace(/\.|\_/g, ' ');
            const user = { name: capitalizeWords(name), email, provider: 'google' };
            saveCurrentUser(user);
            closeLogin();
            if (loginModal && loginModal._afterLogin) loginModal._afterLogin();
        });
    }

    // Email sign-in (attempt login, fall back to register)
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('login-name');
            const emailInput = document.getElementById('login-email');
            const pwdInput = document.getElementById('login-password');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = pwdInput ? pwdInput.value : '';

            if (!email || !validateEmail(email)) {
                return alert('Please provide a valid email address');
            }

            try {
                // try login first
                const resp = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (resp.ok) {
                    const data = await resp.json();
                    localStorage.setItem('authToken', data.token);
                    saveCurrentUser({ name: data.user.name, email: data.user.email, photoURL: data.user.photoURL });
                    closeLogin();
                    if (loginModal && loginModal._afterLogin) loginModal._afterLogin();
                    return;
                }

                // If login failed, attempt to register
                const reg = await fetch(`${BACKEND_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name || email.split('@')[0], email, password })
                });

                if (reg.ok) {
                    const data = await reg.json();
                    localStorage.setItem('authToken', data.token);
                    saveCurrentUser({ name: data.user.name, email: data.user.email, photoURL: data.user.photoURL });
                    closeLogin();
                    if (loginModal && loginModal._afterLogin) loginModal._afterLogin();
                    return;
                }

                const err = await resp.json().catch(() => ({ error: 'Login failed' }));
                alert(err.error || 'Authentication failed');
            } catch (e) {
                console.error('Auth error:', e);
                alert('Unable to contact authentication server. Is the backend running?');
            }
        });
    }

    // Join final button
    if (joinFinalBtn) {
        joinFinalBtn.addEventListener('click', () => {
            const sessionId = document.getElementById('join-session-id').value.trim();
            const password = document.getElementById('join-password').value;
            const displayName = document.getElementById('display-name').value.trim();

            if (!sessionId) return alert('Please enter a session ID');

            const user = getCurrentUser();
            const nameToUse = displayName || (user && user.name) || 'Guest';

            // Save session details and go to session page
            saveSessionDetails('Joined Session', nameToUse, sessionId);
            window.location.href = `session.html?room=${encodeURIComponent(sessionId)}`;
        });
    }

    // Handle session creation
    finalCreateBtn.addEventListener('click', () => {
        const sessionName = document.getElementById('session-name-input').value.trim();
        const userName = document.getElementById('display-name-input').value.trim();

        if (!sessionName) {
            alert('Please enter a session name');
            return;
        }

        if (!userName) {
            alert('Please enter your name');
            return;
        }

        createNewSession(sessionName, userName);
    });
});

// Close modal if clicking outside
window.addEventListener('click', (e) => {
    // If user clicks on the overlay (element with class 'modal'), close it
    if (e.target && e.target.classList && e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Small helpers
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function capitalizeWords(s) {
    return s.replace(/(^|\s)\S/g, t => t.toUpperCase());
}

// Initialize smooth scroll effects
function initializeScrollEffects() {
    // Create particle background
    createParticleBackground();

    // Initialize typing effect for hero title
    initTypingEffect();

    // Initialize parallax effect
    initParallaxEffect();

    // Initialize intersection observer for scroll animations
    initScrollAnimations();

    // Scroll progress bar
    const scrollProgress = document.querySelector('.scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            scrollProgress.style.width = scrolled + '%';
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Create floating particle background
function createParticleBackground() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-bg';

    for (let i = 0; i < 9; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particlesContainer.appendChild(particle);
    }

    heroSection.style.position = 'relative';
    heroSection.insertBefore(particlesContainer, heroSection.firstChild);
}

// Initialize typing effect for hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-content h1');
    if (!heroTitle) return;

    // Remove typing animation after it completes
    setTimeout(() => {
        heroTitle.classList.add('typed');
    }, 3500);
}

// Initialize parallax scrolling effect
function initParallaxEffect() {
    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    });
}

// Initialize scroll-triggered animations with Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.features-section, .gallery-section, .testimonials-section').forEach(section => {
        observer.observe(section);
    });

    // Add counters animation
    initCounters();
}

// Animate counters
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
}

// Initialize image loading animations
function initializeImageLoading() {
    const images = document.querySelectorAll('.hero-image img, .feature-image img, .gallery-item img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });

    // Add ripple effect to all buttons
    addRippleEffect();
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .tool-btn');
    buttons.forEach(button => {
        button.classList.add('ripple');
    });
}

// Initialize Demo Whiteboard
function initDemoWhiteboard() {
    const canvas = document.getElementById('demo-whiteboard');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let brushSize = 2;
    let history = [];
    let historyStep = -1;

    // Set canvas size
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Tool buttons
    const toolBtns = {
        pen: document.getElementById('demo-pen'),
        eraser: document.getElementById('demo-eraser'),
        text: document.getElementById('demo-text'),
        shapes: document.getElementById('demo-shapes'),
        undo: document.getElementById('demo-undo'),
        redo: document.getElementById('demo-redo'),
        clear: document.getElementById('demo-clear')
    };

    // Color and size controls
    const colorPicker = document.getElementById('demo-color-picker');
    const sizeSlider = document.getElementById('demo-pen-size');

    // Set active tool
    function setTool(tool) {
        currentTool = tool;
        Object.values(toolBtns).forEach(btn => btn && btn.classList.remove('active'));
        if (toolBtns[tool]) toolBtns[tool].classList.add('active');
    }

    // Tool event listeners
    if (toolBtns.pen) toolBtns.pen.addEventListener('click', () => setTool('pen'));
    if (toolBtns.eraser) toolBtns.eraser.addEventListener('click', () => setTool('eraser'));
    if (toolBtns.text) toolBtns.text.addEventListener('click', () => setTool('text'));
    if (toolBtns.shapes) toolBtns.shapes.addEventListener('click', () => setTool('shapes'));

    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
        });
    }

    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            brushSize = e.target.value;
        });
    }

    // Clear canvas
    if (toolBtns.clear) {
        toolBtns.clear.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveState();
        });
    }

    // Undo/Redo
    function saveState() {
        historyStep++;
        if (historyStep < history.length) {
            history.length = historyStep;
        }
        history.push(canvas.toDataURL());
    }

    if (toolBtns.undo) {
        toolBtns.undo.addEventListener('click', () => {
            if (historyStep > 0) {
                historyStep--;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
            }
        });
    }

    if (toolBtns.redo) {
        toolBtns.redo.addEventListener('click', () => {
            if (historyStep < history.length - 1) {
                historyStep++;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
            }
        });
    }

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        
        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = brushSize * 3;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
        }
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastX = x;
        lastY = y;
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    // Initial state
    saveState();
}

// Initialize demo whiteboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    initDemoWhiteboard();
});
