export async function createSession(name) {
    const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return response.json();
}

export async function getAllSessions() {
    const response = await fetch('/api/sessions');
    return response.json();
}

export async function getSessionById(id) {
    const response = await fetch(`/api/sessions/${id}`);
    return response.json();
}

export async function deleteSession(id) {
    const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}