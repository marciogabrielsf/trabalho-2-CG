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
        this.objModels = [];
        
        this.keyStates = {
            kPressed: false,
            lPressed: false,
            mPressed: false,
            nPressed: false
        };
    }

    async initialize() {
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

        this.input = new InputManager(this.canvas);
        
        const aspect = this.canvas.width / this.canvas.height;
        this.camera = new Camera(45, aspect, 0.1, 200);

        this.renderer = new Renderer(this.gl);
        if (!this.renderer.initialize()) {
            return false;
        }

        await this.setupScene();

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

    async setupScene() {
        const grassTexture = await this.renderer.loadTexture('./assets/textures/grass.jpg');
        console.log('Grass texture ready:', grassTexture);
        
        const planeGeometry = Plane.createGeometry(100, 100, 20);
        console.log('Plane geometry created:', {
            hasPositions: !!planeGeometry.positions,
            hasColors: !!planeGeometry.colors,
            hasNormals: !!planeGeometry.normals,
            hasTexCoords: !!planeGeometry.texCoords,
            texCoordsLength: planeGeometry.texCoords ? planeGeometry.texCoords.length : 0
        });
        
        const groundPlane = this.renderer.addObject(
            planeGeometry,
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1),
            grassTexture
        );
        console.log('Ground plane created with texture:', groundPlane.texture);
        console.log('Ground plane buffers:', {
            hasTexCoord: !!groundPlane.buffers.texCoord,
            hasTexture: !!groundPlane.texture
        });

        const cubeGeometry = Cube.createGeometry();
        
        const centerCube = this.renderer.addObject(
            cubeGeometry,
            new Vector3(10, 1, 10),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1)
        );
        centerCube.angularVelocity = new Vector3(0.5, 1.0, 0.3);
        this.animatedCubes.push(centerCube);

        const cube2 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(-10, 0.5, 10),
            new Vector3(0, 0, 0),
            new Vector3(0.5, 0.5, 0.5)
        );
        cube2.angularVelocity = new Vector3(0.3, 0.7, 0.2);
        this.animatedCubes.push(cube2);

        const cube3 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(-10, 0.75, -10),
            new Vector3(0, 0, 0),
            new Vector3(0.75, 0.75, 0.75)
        );
        cube3.angularVelocity = new Vector3(0.8, 0.4, 0.6);
        this.animatedCubes.push(cube3);

        await this.loadOBJModels();
    }

    async loadOBJModels() {
        console.log('Loading OBJ models...');
        
        try {
            const buildingGeometry = await OBJLoader.load('./assets/models/nc2a.obj', true);
            const buildingStats = OBJLoader.getStats(buildingGeometry);
            console.log('Building (nc2a) loaded:', buildingStats);
            console.log('Building bounds:', buildingStats.bounds);
            
            if (buildingGeometry.materials) {
                console.log('Materials loaded:', buildingGeometry.materials.size);
                OBJLoader.applyMaterialColors(buildingGeometry, buildingGeometry.materials);
            }
            
            const building = this.renderer.addObject(
                buildingGeometry,
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0),
                new Vector3(1, 1, 1)
            );
            this.objModels.push(building);
            
            const centerX = (buildingStats.bounds.min.x + buildingStats.bounds.max.x) / 2;
            const centerZ = (buildingStats.bounds.min.z + buildingStats.bounds.max.z) / 2;
            const height = buildingStats.bounds.max.y - buildingStats.bounds.min.y;
            
            console.log(`Building center: (${centerX.toFixed(2)}, ${centerZ.toFixed(2)})`);
            console.log(`Building height: ${height.toFixed(2)}`);
            
        } catch (error) {
            console.error('Failed to load building:', error);
        }
        
        try {
            const pyramidGeometry = await OBJLoader.load('./assets/models/pyramid.obj');
            const pyramidStats = OBJLoader.getStats(pyramidGeometry);
            console.log('Pyramid loaded:', pyramidStats);
            
            const pyramid = this.renderer.addObject(
                pyramidGeometry,
                new Vector3(-5, 1, 0),
                new Vector3(0, 0, 0),
                new Vector3(0.8, 0.8, 0.8)
            );
            pyramid.angularVelocity = new Vector3(0.2, 0.8, 0.1);
            this.animatedCubes.push(pyramid);
            this.objModels.push(pyramid);
        } catch (error) {
            console.error('Failed to load pyramid:', error);
        }

        try {
            const sphereGeometry = await OBJLoader.load('./assets/models/sphere.obj');
            const sphereStats = OBJLoader.getStats(sphereGeometry);
            console.log('Sphere loaded:', sphereStats);
            
            const sphere = this.renderer.addObject(
                sphereGeometry,
                new Vector3(5, 1.5, 0),
                new Vector3(0, 0, 0),
                new Vector3(0.7, 0.7, 0.7)
            );
            sphere.angularVelocity = new Vector3(0.3, 0.5, 0.4);
            this.animatedCubes.push(sphere);
            this.objModels.push(sphere);
        } catch (error) {
            console.error('Failed to load sphere:', error);
        }

        try {
            const teapotGeometry = await OBJLoader.load('./assets/models/teapot.obj');
            const teapotStats = OBJLoader.getStats(teapotGeometry);
            console.log('Teapot loaded:', teapotStats);
            
            const teapot = this.renderer.addObject(
                teapotGeometry,
                new Vector3(0, 1, -8),
                new Vector3(0, 0, 0),
                new Vector3(1.5, 1.5, 1.5)
            );
            teapot.angularVelocity = new Vector3(0.1, 0.6, 0.2);
            this.animatedCubes.push(teapot);
            this.objModels.push(teapot);
        } catch (error) {
            console.error('Failed to load teapot:', error);
        }

        // Load monitors on desk (desk surface at Y≈3.99, desk section X≈9.7 to 12.9)
        try {
            const monitorGeometry = await OBJLoader.load('./assets/models/monitor.obj', true);
            const monitorStats = OBJLoader.getStats(monitorGeometry);
            console.log('Monitor loaded:', monitorStats);

            if (monitorGeometry.materials) {
                OBJLoader.applyMaterialColors(monitorGeometry, monitorGeometry.materials);
            }

            // Desks are along the walls at Z≈-9.9 (back wall) and Z≈+10 (front wall)
            // Desk surface at Y≈3.99, monitor base starts at Y=0.34
            // So position Y = 3.99 - 0.34 = 3.65
            // Desk sections (between dividers) along -Z wall:
            //   X: 9.7→12.9 (center ~11.3), 13.5→16.6 (center ~15), 17.2→20.3 (center ~18.7)
            // Monitor screen faces +Z by default (toward room center) — no rotation needed
            const monitorPositions = [
                new Vector3(11.3, 3.65, -10.0),
                new Vector3(15.0, 3.65, -10.0),
                new Vector3(18.7, 3.65, -10.0)
            ];

            for (const pos of monitorPositions) {
                const monitor = this.renderer.addObject(
                    monitorGeometry,
                    pos,
                    new Vector3(0, 0, 0),
                    new Vector3(1, 1, 1)
                );
                this.objModels.push(monitor);
            }

            console.log('3 monitors placed on desk');
        } catch (error) {
            console.error('Failed to load monitors:', error);
        }

        console.log(`Loaded ${this.objModels.length} OBJ models successfully`);
    }

    update(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.camera.update(this.deltaTime, this.input);
        
        // Toggle skybox with K key
        if (this.input.isKeyDown('KeyK')) {
            if (!this.keyStates.kPressed) {
                this.renderer.enableSkybox = !this.renderer.enableSkybox;
                console.log('Skybox:', this.renderer.enableSkybox ? 'ON' : 'OFF');
                this.keyStates.kPressed = true;
            }
        } else {
            this.keyStates.kPressed = false;
        }
        
        // Toggle shadows with L key
        if (this.input.isKeyDown('KeyL')) {
            if (!this.keyStates.lPressed) {
                this.renderer.useShadows = !this.renderer.useShadows;
                console.log('Shadows:', this.renderer.useShadows ? 'ON' : 'OFF');
                this.keyStates.lPressed = true;
            }
        } else {
            this.keyStates.lPressed = false;
        }
        
        if (this.input.isKeyDown('KeyM')) {
            if (!this.keyStates.mPressed) {
                this.renderer.debugShadows = !this.renderer.debugShadows;
                console.log('Shadow Debug Mode:', this.renderer.debugShadows ? 'ON' : 'OFF');
                this.keyStates.mPressed = true;
            }
        } else {
            this.keyStates.mPressed = false;
        }
        
        if (this.input.isKeyDown('KeyN')) {
            if (!this.keyStates.nPressed) {
                this.renderer.debugTexture = !this.renderer.debugTexture;
                console.log('Texture Debug Mode:', this.renderer.debugTexture ? 'ON' : 'OFF');
                this.keyStates.nPressed = true;
            }
        } else {
            this.keyStates.nPressed = false;
        }

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

    async start() {
        const initialized = await this.initialize();
        if (initialized) {
            console.log('Application initialized successfully');
            requestAnimationFrame((time) => this.run(time));
        } else {
            console.error('Failed to initialize application');
        }
    }
}

const app = new Application();
app.start();
