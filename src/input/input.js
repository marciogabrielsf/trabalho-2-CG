class InputManager {
    constructor() {
        this.keys = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.mouseButtons = new Map();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (event) => {
            this.keys.set(event.code, true);
        });

        window.addEventListener('keyup', (event) => {
            this.keys.set(event.code, false);
        });

        window.addEventListener('mousemove', (event) => {
            const newX = event.clientX;
            const newY = event.clientY;
            
            this.mouseDelta.x = newX - this.mousePosition.x;
            this.mouseDelta.y = newY - this.mousePosition.y;
            
            this.mousePosition.x = newX;
            this.mousePosition.y = newY;
        });

        window.addEventListener('mousedown', (event) => {
            this.mouseButtons.set(event.button, true);
        });

        window.addEventListener('mouseup', (event) => {
            this.mouseButtons.set(event.button, false);
        });

        window.addEventListener('blur', () => {
            this.keys.clear();
            this.mouseButtons.clear();
        });
    }

    isKeyDown(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    isMouseButtonDown(button) {
        return this.mouseButtons.get(button) === true;
    }

    getMousePosition() {
        return { ...this.mousePosition };
    }

    getMouseDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }
}
