class Camera {
    constructor(fov = 45, aspect = 1, near = 0.1, far = 200) {
        this.position = new Vector3(0, 5, 20);
        this.rotation = new Vector3(0, 0, 0);
        
        this.fov = fov * Math.PI / 180;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        
        this.moveSpeed = 5.0;
        this.rotationSpeed = 2.0;
        this.sprintMultiplier = 2.0;
        this.mouseSensitivity = 0.002;
        
        this.up = new Vector3(0, 1, 0);
    }

    getViewMatrix() {
        const target = this.getForwardVector();
        target.x += this.position.x;
        target.y += this.position.y;
        target.z += this.position.z;
        
        return Matrix4.lookAt(this.position, target, this.up);
    }

    getProjectionMatrix() {
        return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    }

    getForwardVector() {
        const pitch = this.rotation.x;
        const yaw = this.rotation.y;
        
        return new Vector3(
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            -Math.cos(yaw) * Math.cos(pitch)
        );
    }

    getRightVector() {
        const forward = this.getForwardVector();
        return Vector3.cross(forward, this.up).normalize();
    }

    update(deltaTime, input) {
        const speed = input.isKeyDown('Shift') 
            ? this.moveSpeed * this.sprintMultiplier 
            : this.moveSpeed;
        
        const moveAmount = speed * deltaTime;
        const rotateAmount = this.rotationSpeed * deltaTime;

        const forward = this.getForwardVector();
        const right = this.getRightVector();

        if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
            this.position = Vector3.add(
                this.position, 
                Vector3.multiply(forward, moveAmount)
            );
        }
        if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) {
            this.position = Vector3.subtract(
                this.position, 
                Vector3.multiply(forward, moveAmount)
            );
        }
        if (input.isKeyDown('KeyA')) {
            this.position = Vector3.subtract(
                this.position, 
                Vector3.multiply(right, moveAmount)
            );
        }
        if (input.isKeyDown('KeyD')) {
            this.position = Vector3.add(
                this.position, 
                Vector3.multiply(right, moveAmount)
            );
        }
        if (input.isKeyDown('KeyQ')) {
            this.position.y += moveAmount;
        }
        if (input.isKeyDown('KeyE')) {
            this.position.y -= moveAmount;
        }

        if (input.isKeyDown('ArrowLeft')) {
            this.rotation.y -= rotateAmount;
        }
        if (input.isKeyDown('ArrowRight')) {
            this.rotation.y += rotateAmount;
        }

        const maxPitch = Math.PI / 2 - 0.01;
        if (input.isKeyDown('ArrowUp') && !input.isKeyDown('KeyW')) {
            this.rotation.x = Math.min(this.rotation.x - rotateAmount, maxPitch);
        }
        if (input.isKeyDown('ArrowDown') && !input.isKeyDown('KeyS')) {
            this.rotation.x = Math.max(this.rotation.x + rotateAmount, -maxPitch);
        }

        const mouseDelta = input.getMouseDelta();
        const isRightMouseDown = input.isMouseButtonDown(2);
        const isPointerLocked = input.pointerLocked;
        
        if (isRightMouseDown || isPointerLocked) {
            this.rotation.y += mouseDelta.x * this.mouseSensitivity;
            this.rotation.x -= mouseDelta.y * this.mouseSensitivity;
            
            this.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.rotation.x));
        }
    }

    setAspect(aspect) {
        this.aspect = aspect;
    }
}
