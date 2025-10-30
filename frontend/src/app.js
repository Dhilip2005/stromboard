import { setupCanvas } from './canvas.js';
import { setupWebSocket } from './websocket.js';
import { createSession, getAllSessions, deleteSession } from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');

    setupCanvas(canvas, ctx);
    setupWebSocket(canvas, ctx);

    const sessionList = document.getElementById('session-list');
    const createButton = document.getElementById('create-session');
    const sessionNameInput = document.getElementById('session-name');
    const openCreateModalBtn = document.getElementById('open-create-modal');
    const createModal = document.getElementById('create-modal');
    const closeModalBtn = document.getElementById('close-modal');

    async function loadSessions() {
        const sessions = await getAllSessions();
        sessionList.innerHTML = '';
        sessions.forEach(session => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="session-item">
                    <div class="session-meta">
                        <strong>${session.name}</strong>
                        <small class="session-id">${session._id}</small>
                    </div>
                    <div class="session-actions">
                        <button class="btn-join">Join</button>
                        <button class="btn-delete">Delete</button>
                    </div>
                </div>
            `;

            const joinButton = li.querySelector('.btn-join');
            const deleteButton = li.querySelector('.btn-delete');

            joinButton.addEventListener('click', () => {
                // navigate to session route to join
                window.location.href = `/session/${session._id}`;
            });

            deleteButton.addEventListener('click', async () => {
                if (confirm(`Delete session "${session.name}"?`)) {
                    await deleteSession(session._id);
                    loadSessions();
                }
            });

            sessionList.appendChild(li);
        });
    }

    createButton.addEventListener('click', async () => {
        const name = sessionNameInput.value;
        if (name) {
            await createSession(name);
            sessionNameInput.value = '';
            loadSessions();
            // close modal if open
            if (createModal) createModal.classList.add('hidden');
        }
    });

    // modal open/close handlers
    if (openCreateModalBtn && createModal) {
        openCreateModalBtn.addEventListener('click', () => createModal.classList.remove('hidden'));
    }
    if (closeModalBtn && createModal) {
        closeModalBtn.addEventListener('click', () => createModal.classList.add('hidden'));
    }

    loadSessions();
});