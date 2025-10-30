// Tool handling
class WhiteboardTools {
    constructor() {
        this.currentTool = 'pen';
        this.color = '#000000';
        this.initializeTools();
        this.initializeEmojiPicker();
    }

    initializeTools() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'emoji') {
                    this.toggleEmojiPicker();
                    return;
                }
                this.setActiveTool(btn.id);
            });
        });

        // Color picker
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.setColor(color);
                colorPicker.value = color;
            });
        });
    }

    setActiveTool(toolId) {
        // Remove active class from all tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected tool
        const toolBtn = document.getElementById(toolId);
        if (toolBtn) {
            toolBtn.classList.add('active');
            this.currentTool = toolId;
        }
    }

    setColor(color) {
        this.color = color;
        document.querySelector('.color-preview').style.background = color;
    }

    initializeEmojiPicker() {
        const emojiPicker = document.getElementById('emoji-picker');
        const emojiBtn = document.getElementById('emoji');
        const emojis = {
            smileys: ['😀', '😊', '😎', '🤔', '😍', '😂', '🥳', '😴'],
            gestures: ['👋', '👍', '👎', '👏', '🙌', '🤝', '✌️', '👌'],
            objects: ['💡', '⭐', '🎯', '🎨', '📌', '📝', '💻', '📱'],
            symbols: ['❤️', '✨', '⚡', '💫', '🔥', '✅', '❌', '💭']
        };

        // Initialize emoji categories
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.showEmojiCategory(category, emojis[category]);
                
                // Update active category
                document.querySelectorAll('.emoji-category').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Handle emoji selection
        document.querySelector('.emoji-list').addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-item')) {
                this.addEmojiToCanvas(e.target.textContent);
                emojiPicker.classList.add('hidden');
            }
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.classList.add('hidden');
            }
        });
    }

    showEmojiCategory(category, emojis) {
        const emojiList = document.querySelector('.emoji-list');
        emojiList.innerHTML = emojis.map(emoji => `
            <button class="emoji-item">${emoji}</button>
        `).join('');
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emoji-picker');
        emojiPicker.classList.toggle('hidden');
    }

    addEmojiToCanvas(emoji) {
        const canvas = document.getElementById('whiteboard');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Calculate center position for new emojis
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Set font size and family for emoji
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw the emoji
        ctx.fillText(emoji, centerX, centerY);
        
        // Make emoji draggable
        this.makeEmojiDraggable(emoji, centerX, centerY);
    }

    makeEmojiDraggable(emoji, x, y) {
        let isDragging = false;
        let currentX = x;
        let currentY = y;
        let startX;
        let startY;

        const canvas = document.getElementById('whiteboard');
        const ctx = canvas.getContext('2d');

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Check if click is near the emoji
            const emojiWidth = ctx.measureText(emoji).width;
            if (Math.abs(mouseX - currentX) < emojiWidth/2 && 
                Math.abs(mouseY - currentY) < 24) { // 24 is half of font size
                isDragging = true;
                startX = mouseX - currentX;
                startY = mouseY - currentY;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const rect = canvas.getBoundingClientRect();
            currentX = e.clientX - rect.left - startX;
            currentY = e.clientY - rect.top - startY;

            // Clear canvas and redraw emoji at new position
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, currentX, currentY);
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }
}

// Initialize tools when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tools = new WhiteboardTools();
});