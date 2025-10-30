// Socket.IO client connection
let socket = null;
let canvas = null;
let ctx = null;
let currentTool = 'pen';
let currentColor = '#000000';
let brushSize = 2;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let historyStep = -1;

// Load session details when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing...');
    loadSessionDetails();
    initializeWhiteboard();
    setupEventListeners();
    connectToBackend();
});

// Function to load session details from localStorage
function loadSessionDetails() {
    const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
    if (!sessionDetails) {
        console.error('❌ No session details found, redirecting...');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Session details loaded:', sessionDetails);
    document.getElementById('session-name').textContent = sessionDetails.sessionName;
    document.getElementById('room-id').textContent = sessionDetails.roomId;
}

// Initialize whiteboard canvas
function initializeWhiteboard() {
    console.log('🎨 Initializing whiteboard...');
    canvas = document.getElementById('whiteboard');
    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    console.log('✅ Canvas and context initialized');

    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        console.log('📐 Resizing canvas to:', rect.width, 'x', rect.height);
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
        
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function saveState() {
        historyStep++;
        if (historyStep < history.length) {
            history.length = historyStep;
        }
        history.push(canvas.toDataURL());
    }
    saveState();

    const tools = {
        select: document.getElementById('select'),
        pen: document.getElementById('pen'),
        highlighter: document.getElementById('highlighter'),
        eraser: document.getElementById('eraser'),
        text: document.getElementById('text'),
        sticky: document.getElementById('sticky'),
        emoji: document.getElementById('emoji'),
        image: document.getElementById('image'),
        rectangle: document.getElementById('rectangle'),
        circle: document.getElementById('circle'),
        line: document.getElementById('line'),
        arrow: document.getElementById('arrow'),
        undo: document.getElementById('undo'),
        redo: document.getElementById('redo'),
        clear: document.getElementById('clear')
    };

    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
        });
    }

    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            currentColor = preset.dataset.color;
            if (colorPicker) colorPicker.value = currentColor;
        });
    });

    function setActiveTool(toolName) {
        currentTool = toolName;
        Object.values(tools).forEach(btn => btn && btn.classList.remove('active'));
        if (tools[toolName]) tools[toolName].classList.add('active');
    }

    Object.keys(tools).forEach(toolName => {
        if (tools[toolName] && !['undo', 'redo', 'clear', 'emoji', 'image'].includes(toolName)) {
            tools[toolName].addEventListener('click', () => setActiveTool(toolName));
        }
    });

    if (tools.undo) {
        tools.undo.addEventListener('click', () => {
            if (historyStep > 0) {
                historyStep--;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                if (socket && socket.connected) {
                    const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
                    socket.emit('undo-action', { sessionId: sessionDetails.roomId });
                }
            }
        });
    }

    if (tools.redo) {
        tools.redo.addEventListener('click', () => {
            if (historyStep < history.length - 1) {
                historyStep++;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                if (socket && socket.connected) {
                    const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
                    socket.emit('redo-action', { sessionId: sessionDetails.roomId });
                }
            }
        });
    }

    if (tools.clear) {
        tools.clear.addEventListener('click', () => {
            if (confirm('Clear the entire canvas?')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                saveState();
                if (socket && socket.connected) {
                    const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
                    socket.emit('clear-canvas', { sessionId: sessionDetails.roomId });
                }
            }
        });
    }

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        console.log('🖊️ Start drawing at:', lastX, lastY, 'Tool:', currentTool);
        
        if (currentTool === 'text') {
            addText(lastX, lastY);
            isDrawing = false;
        }
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
            ctx.lineWidth = brushSize * 5;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else if (currentTool === 'highlighter') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize * 4;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        if (socket && socket.connected) {
            const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
            socket.emit('draw-action', {
                sessionId: sessionDetails.roomId,
                fromX: lastX,
                fromY: lastY,
                toX: x,
                toY: y,
                color: currentColor,
                brushSize: brushSize,
                tool: currentTool
            });
        }

        lastX = x;
        lastY = y;
    }

    function stopDrawing() {
        if (isDrawing) {
            console.log('✋ Stop drawing');
            isDrawing = false;
            ctx.globalAlpha = 1;
            saveState();
        }
    }

    function addText(x, y) {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = '20px Poppins, sans-serif';
            ctx.fillStyle = currentColor;
            ctx.fillText(text, x, y);
            saveState();
            if (socket && socket.connected) {
                const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
                socket.emit('add-text', {
                    sessionId: sessionDetails.roomId,
                    text: text,
                    x: x,
                    y: y,
                    color: currentColor
                });
            }
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

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

    console.log('✅ Canvas and context initialized successfully');
}

function setupEventListeners() {
    document.getElementById('copy-room-id').addEventListener('click', () => {
        const roomId = document.getElementById('room-id').textContent;
        navigator.clipboard.writeText(roomId).then(() => {
            alert('Room ID copied to clipboard!');
        });
    });

    document.getElementById('leave-session').addEventListener('click', () => {
        if (confirm('Are you sure you want to leave this session?')) {
            if (socket) socket.disconnect();
            localStorage.removeItem('currentSession');
            window.location.href = 'index.html';
        }
    });

    document.getElementById('invite-users').addEventListener('click', () => {
        const roomId = document.getElementById('room-id').textContent;
        const inviteMessage = 'Join my Stromboard session!\n\nRoom ID: ' + roomId + '\n\nGo to: ' + window.location.origin;
        if (navigator.share) {
            navigator.share({ title: 'Join Stromboard Session', text: inviteMessage });
        } else {
            navigator.clipboard.writeText(inviteMessage).then(() => {
                alert('Invite message copied to clipboard!');
            });
        }
    });
}

function connectToBackend() {
    console.log('🔌 Connecting to Socket.IO backend...');
    const sessionDetails = JSON.parse(localStorage.getItem('currentSession'));
    if (!sessionDetails) {
        console.error('❌ No session details for Socket.IO connection');
        return;
    }

    let userName = sessionDetails.userName || 'Anonymous';
    let userAvatar = null;
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser) {
            userName = currentUser.name || userName;
            userAvatar = currentUser.photoURL || null;
        }
    } catch (e) {
        console.error('Error getting user info:', e);
    }

    console.log('👤 Connecting as:', userName);
    
    const BACKEND_URL = window.BACKEND_URL || 'http://localhost:5000';
    
    // Check if io is available
    if (typeof io === 'undefined') {
        console.error('❌ Socket.IO client library not loaded!');
        alert('Error: Socket.IO library not loaded. Please refresh the page.');
        return;
    }

    socket = io(BACKEND_URL, {
        auth: { token: localStorage.getItem('authToken') }
    });

    socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server, Socket ID:', socket.id);
        socket.emit('join-session', {
            sessionId: sessionDetails.roomId,
            userName: userName,
            userAvatar: userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=random'
        });
        console.log('📤 Sent join-session event for room:', sessionDetails.roomId);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        alert('Cannot connect to server. Make sure backend is running on port 5000.');
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.IO server');
    });

    socket.on('users-update', (users) => {
        console.log('👥 Received users-update:', users);
        updateActiveUsers(users);
    });

    socket.on('draw-action', (data) => {
        if (data.userId === socket.id) return;
        console.log('📥 Received draw-action from user:', data.userId);
        
        if (!canvas || !ctx) {
            console.error('❌ Canvas not initialized for incoming draw');
            return;
        }

        ctx.beginPath();
        ctx.moveTo(data.fromX, data.fromY);
        ctx.lineTo(data.toX, data.toY);

        if (data.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = data.brushSize * 5;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else if (data.tool === 'highlighter') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.brushSize * 4;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.brushSize;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    });

    socket.on('clear-canvas', () => {
        console.log('🧹 Canvas cleared by another user');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    socket.on('add-text', (data) => {
        if (data.userId === socket.id) return;
        console.log('📝 Text added by another user');
        if (!ctx) return;
        ctx.font = '20px Poppins, sans-serif';
        ctx.fillStyle = data.color;
        ctx.fillText(data.text, data.x, data.y);
    });
}

function updateActiveUsers(users) {
    console.log('🔄 Updating active users display with', users.length, 'users');
    const container = document.querySelector('.active-users-container');
    
    if (!container) {
        console.error('❌ Active users container not found in DOM!');
        return;
    }

    // Remove all existing user elements (keep the header)
    const existingUsers = container.querySelectorAll('.active-user');
    console.log('🗑️ Removing', existingUsers.length, 'existing user elements');
    existingUsers.forEach(user => user.remove());

    // Add each user
    users.forEach((user, index) => {
        console.log(`👤 Adding user ${index + 1}:`, user.name);
        
        const userContainer = document.createElement('div');
        userContainer.className = 'active-user';

        const avatar = document.createElement('img');
        avatar.className = 'user-avatar';
        avatar.src = user.avatar;
        avatar.alt = user.name;
        avatar.onerror = () => {
            console.warn('Failed to load avatar for', user.name);
            avatar.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random';
        };

        const name = document.createElement('span');
        name.className = 'user-name';
        name.textContent = user.name;

        userContainer.appendChild(avatar);
        userContainer.appendChild(name);
        container.appendChild(userContainer);
    });

    console.log('✅ Active users display updated successfully');
}
