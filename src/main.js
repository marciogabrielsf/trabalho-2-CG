class Application {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.camera = null;
        this.renderer = null;
        this.input = null;
        
        this.lastTime = 0;
        this.deltaTime = 0;
        this.animatedCubes = [];
    }

    initialize() {
        this.canvas = document.getElementById('glCanvas');
        if (!this.canvas) {
            console.error('Canvas not found');
            return false;
        }

        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return false;
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.input = new InputManager();
        
        const aspect = this.canvas.width / this.canvas.height;
        this.camera = new Camera(45, aspect, 0.1, 100);

        this.renderer = new Renderer(this.gl);
        if (!this.renderer.initialize()) {
            return false;
        }

        this.setupScene();

        return true;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.camera) {
            this.camera.setAspect(this.canvas.width / this.canvas.height);
        }
    }

    setupScene() {
        const planeGeometry = Plane.createGeometry(20, 20, 10);
        this.renderer.addObject(
            planeGeometry,
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1)
        );

        const cubeGeometry = Cube.createGeometry();
        
        const centerCube = this.renderer.addObject(
            cubeGeometry,
            new Vector3(0, 1, 0),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1)
        );
        centerCube.angularVelocity = new Vector3(0.5, 1.0, 0.3);
        this.animatedCubes.push(centerCube);

        const cube2 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(3, 0.5, 2),
            new Vector3(0, 0, 0),
            new Vector3(0.5, 0.5, 0.5)
        );
        cube2.angularVelocity = new Vector3(0.3, 0.7, 0.2);
        this.animatedCubes.push(cube2);

        const cube3 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(-3, 0.75, -2),
            new Vector3(0, 0, 0),
            new Vector3(0.75, 0.75, 0.75)
        );
        cube3.angularVelocity = new Vector3(0.8, 0.4, 0.6);
        this.animatedCubes.push(cube3);

        const cube4 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(0, 1.5, -5),
            new Vector3(0, 0, 0),
            new Vector3(1.2, 1.2, 1.2)
        );
        cube4.angularVelocity = new Vector3(0.4, 0.6, 0.5);
        this.animatedCubes.push(cube4);
    }

    update(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.camera.update(this.deltaTime, this.input);

        for (const cube of this.animatedCubes) {
            cube.rotation.x += cube.angularVelocity.x * this.deltaTime;
            cube.rotation.y += cube.angularVelocity.y * this.deltaTime;
            cube.rotation.z += cube.angularVelocity.z * this.deltaTime;
        }

        this.renderer.updateLight(currentTime / 1000);
    }

    render() {
        this.renderer.render(this.camera);
    }

    run(currentTime) {
        this.update(currentTime);
        this.render();
        
        requestAnimationFrame((time) => this.run(time));
    }

    start() {
        if (this.initialize()) {
            console.log('Application initialized successfully');
            requestAnimationFrame((time) => this.run(time));
        } else {
            console.error('Failed to initialize application');
        }
    }
}

const app = new Application();
app.start();
