class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.mouseButtons = new Map();
        this.pointerLocked = false;
        
        console.log('InputManager initialized with canvas:', canvas);
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (event) => {
            this.keys.set(event.code, true);
        });

        window.addEventListener('keyup', (event) => {
            this.keys.set(event.code, false);
        });

        // Mouse movement - works both in regular mode and pointer lock mode
        window.addEventListener('mousemove', (event) => {
            if (this.pointerLocked) {
                // In pointer lock mode, use movementX/Y for delta
                this.mouseDelta.x = event.movementX || 0;
                this.mouseDelta.y = event.movementY || 0;
            } else {
                // In regular mode, calculate delta from position change
                const newX = event.clientX;
                const newY = event.clientY;
                
                this.mouseDelta.x = newX - this.mousePosition.x;
                this.mouseDelta.y = newY - this.mousePosition.y;
                
                this.mousePosition.x = newX;
                this.mousePosition.y = newY;
            }
        });

        window.addEventListener('mousedown', (event) => {
            this.mouseButtons.set(event.button, true);
        });

        window.addEventListener('mouseup', (event) => {
            this.mouseButtons.set(event.button, false);
        });

        // Pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            console.log('Pointer lock state:', this.pointerLocked);
        });

        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock failed');
        });

        // Canvas click to request pointer lock
        if (this.canvas) {
            console.log('Setting up canvas event listeners');
            
            this.canvas.addEventListener('click', () => {
                console.log('Canvas clicked, requesting pointer lock');
                if (!this.pointerLocked) {
                    this.canvas.requestPointerLock();
                }
            });

            this.canvas.addEventListener('contextmenu', (event) => {
                console.log('Context menu prevented');
                event.preventDefault();
                return false;
            });
        } else {
            console.error('Canvas is null! Event listeners not attached.');
        }

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
