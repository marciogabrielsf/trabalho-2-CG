class Door {
    constructor(renderObject, options = {}) {
        this.renderObject = renderObject;
        this.isLeftDoor = options.isLeftDoor ?? true;
        this.baseRotation = options.baseRotation ?? 0;
        this.slideAxis = options.slideAxis ?? "x";
        this.slideDistance = options.slideDistance ?? 1;
        this.slideDirection = options.slideDirection ?? (this.isLeftDoor ? -1 : 1);

        this.initialPosition = {
            x: renderObject.position.x,
            y: renderObject.position.y,
            z: renderObject.position.z,
        };

        this.initialRotation = {
            x: renderObject.rotation.x,
            y: renderObject.rotation.y,
            z: renderObject.rotation.z,
        };

        this.isOpen = false;
        this.isAnimating = false;

        this.currentRotation = 0;
        this.targetRotation = 0;
        this.maxRotation = Math.PI / 2;

        this.slideSpeed = 2.5;
        this.currentOffset = 0;
        this.targetOffset = 0;

        this._debugLogged = false;
    }

    toggle() {
        if (!this.isAnimating) {
            this.isOpen = !this.isOpen;
            this.targetOffset = this.isOpen ? this.slideDistance : 0;
            this.isAnimating = true;
            if (!this._debugLogged) {
                console.log("Door debug", {
                    isLeftDoor: this.isLeftDoor,
                    baseRotation: this.baseRotation,
                    slideAxis: this.slideAxis,
                    slideDistance: this.slideDistance,
                    initialPosition: this.initialPosition,
                });
                this._debugLogged = true;
            }
        }
    }

    open() {
        if (!this.isOpen) {
            this.toggle();
        }
    }

    close() {
        if (this.isOpen) {
            this.toggle();
        }
    }

    update(deltaTime) {
        if (this.isAnimating) {
            const direction = this.targetOffset > this.currentOffset ? 1 : -1;
            const change = this.slideSpeed * deltaTime * direction;
            this.currentOffset += change;

            if (direction > 0) {
                if (this.currentOffset >= this.targetOffset) {
                    this.currentOffset = this.targetOffset;
                    this.isAnimating = false;
                }
            } else {
                if (this.currentOffset <= this.targetOffset) {
                    this.currentOffset = this.targetOffset;
                    this.isAnimating = false;
                }
            }
        }

        this.renderObject.rotation.y = this.baseRotation;
        const offset = this.currentOffset * this.slideDirection;
        this.renderObject.position.x = this.initialPosition.x + (this.slideAxis === "x" ? offset : 0);
        this.renderObject.position.y = this.initialPosition.y;
        this.renderObject.position.z = this.initialPosition.z + (this.slideAxis === "z" ? offset : 0);
    }

    getInfo() {
        return {
            isOpen: this.isOpen,
            isAnimating: this.isAnimating,
            currentOffset: this.currentOffset,
            isLeftDoor: this.isLeftDoor,
        };
    }
}
