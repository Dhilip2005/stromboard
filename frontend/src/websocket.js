import { io } from 'socket.io-client';

export function setupWebSocket(canvas, ctx) {
    const BACKEND_URL = window.BACKEND_URL || 'http://localhost:5000';
    const socket = io(BACKEND_URL); // Connect to backend server

    // derive sessionId from URL (assumes route /session/:id)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const sessionId = (pathParts[0] === 'session' && pathParts[1]) ? pathParts[1] : null;

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        if (sessionId) {
            socket.emit('join-session', { sessionId });
        }
    });

    // Handle incoming draw actions from other users
    socket.on('draw-action', (data) => {
        const { x, y, color, size, isNewPath } = data;

        ctx.save();
        ctx.strokeStyle = color || ctx.strokeStyle;
        ctx.lineWidth = size || ctx.lineWidth;

        if (isNewPath) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.restore();
    });

    // Handle canvas clear from other users
    socket.on('clear-canvas', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    let isDrawing = false;

    // Handle mouse down - start drawing
    canvas.addEventListener('mousedown', (event) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Emit the start of a new path
        socket.emit('draw-action', {
            x,
            y,
            color: ctx.strokeStyle,
            size: ctx.lineWidth,
            isNewPath: true,
            sessionId
        });
    });

    // Handle mouse move - continue drawing
    canvas.addEventListener('mousemove', (event) => {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();

        // Emit the drawing action
        socket.emit('draw-action', {
            x,
            y,
            color: ctx.strokeStyle,
            size: ctx.lineWidth,
            isNewPath: false,
            sessionId
        });
    });

    // Handle mouse up - stop drawing
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    // Handle mouse leave - stop drawing
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    // Handle clear canvas button
    document.getElementById('clear')?.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear-canvas', { sessionId });
    });

    // Save canvas state periodically
    setInterval(() => {
        const drawingData = canvas.toDataURL(); // Convert canvas to base64 image
        socket.emit('save-canvas-state', { sessionId, drawingData });
    }, 30000); // Save every 30 seconds

    return socket; // Return socket instance for potential use elsewhere
}