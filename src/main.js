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
        this.doors = [];

        this.keyStates = {
            kPressed: false,
            lPressed: false,
            mPressed: false,
            nPressed: false,
            oPressed: false,
        };
    }

    async initialize() {
        this.canvas = document.getElementById("glCanvas");
        if (!this.canvas) {
            console.error("Canvas not found");
            return false;
        }

        this.gl = this.canvas.getContext("webgl");
        if (!this.gl) {
            console.error("WebGL not supported");
            return false;
        }

        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());

        this.input = new InputManager(this.canvas);
        this.keyStates = {
            kPressed: false,
            lPressed: false,
            mPressed: false,
            pPressed: false,
            nPressed: false,
            oPressed: false,
        };

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
        const grassTexture = await this.renderer.loadTexture("./assets/textures/grass.jpg");
        console.log("Grass texture ready:", grassTexture);

        const planeGeometry = Plane.createGeometry(100, 100, 20);
        console.log("Plane geometry created:", {
            hasPositions: !!planeGeometry.positions,
            hasColors: !!planeGeometry.colors,
            hasNormals: !!planeGeometry.normals,
            hasTexCoords: !!planeGeometry.texCoords,
            texCoordsLength: planeGeometry.texCoords ? planeGeometry.texCoords.length : 0,
        });

        const groundPlane = this.renderer.addObject(
            planeGeometry,
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1),
            grassTexture,
        );
        console.log("Ground plane created with texture:", groundPlane.texture);
        console.log("Ground plane buffers:", {
            hasTexCoord: !!groundPlane.buffers.texCoord,
            hasTexture: !!groundPlane.texture,
        });

        const cubeGeometry = Cube.createGeometry();

        const centerCube = this.renderer.addObject(
            cubeGeometry,
            new Vector3(10, 1, 10),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 1),
        );
        centerCube.angularVelocity = new Vector3(0.5, 1.0, 0.3);
        this.animatedCubes.push(centerCube);

        const cube2 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(-10, 0.5, 10),
            new Vector3(0, 0, 0),
            new Vector3(0.5, 0.5, 0.5),
        );
        cube2.angularVelocity = new Vector3(0.3, 0.7, 0.2);
        this.animatedCubes.push(cube2);

        const cube3 = this.renderer.addObject(
            cubeGeometry,
            new Vector3(-10, 0.75, -10),
            new Vector3(0, 0, 0),
            new Vector3(0.75, 0.75, 0.75),
        );
        cube3.angularVelocity = new Vector3(0.8, 0.4, 0.6);
        this.animatedCubes.push(cube3);

        await this.loadOBJModels();
    }

    async loadOBJModels() {
        console.log("Loading OBJ models...");

        try {
            const buildingGeometry = await OBJLoader.load("./assets/models/nc2a.obj", true);
            const buildingStats = OBJLoader.getStats(buildingGeometry);
            console.log("Building (nc2a) loaded:", buildingStats);
            console.log("Building bounds:", buildingStats.bounds);

            // Apply material colors first
            if (buildingGeometry.materials) {
                console.log("Materials loaded:", buildingGeometry.materials.size);
                OBJLoader.applyMaterialColors(buildingGeometry, buildingGeometry.materials);
            }

            // Load textures for all materials that have map_Kd
            const texturesByMaterial = new Map();
            if (buildingGeometry.materials) {
                for (const [materialName, material] of buildingGeometry.materials) {
                    if (material.map_Kd) {
                        console.log(`Loading texture for material "${materialName}": ${material.map_Kd}`);
                        try {
                            const texturePath = material.map_Kd.replace(/\\/g, "/");
                            const textureUrl = `./assets/textures/${texturePath.split("/").pop()}`;
                            const texture = await this.renderer.loadTexture(textureUrl);
                            texturesByMaterial.set(materialName, texture);
                            console.log(`Texture loaded successfully for "${materialName}"`);
                        } catch (error) {
                            console.error(`Failed to load texture for "${materialName}":`, error);
                        }
                    }
                }
            }

            const objectsByName = OBJLoader.splitByObject(buildingGeometry);
            console.log("Split into objects:", Object.keys(objectsByName));

            const interiorDoorNames = new Set(["porta", "porta.001"]);
            const interiorDoorEntries = [];

            for (const [objectName, objectGeom] of Object.entries(objectsByName)) {
                if (interiorDoorNames.has(objectName)) {
                    interiorDoorEntries.push({ name: objectName, geometry: objectGeom });
                    continue;
                }

                const geometriesByMaterial = OBJLoader.splitByMaterial(objectGeom);
                for (const [materialName, geom] of Object.entries(geometriesByMaterial)) {
                    const texture = texturesByMaterial.get(materialName) || null;

                    // Inverter coordenadas de textura para o quadro gesad
                    if (materialName === "Materiais" && geom.texCoords) {
                        console.log(`Invertendo coordenadas UV para material "${materialName}"`);
                        for (let i = 0; i < geom.texCoords.length; i += 2) {
                            geom.texCoords[i] = 1.0 - geom.texCoords[i]; // Inverter coordenada U (horizontal)
                        }
                    }

                    const obj = this.renderer.addObject(
                        geom,
                        new Vector3(0, 0, 0),
                        new Vector3(0, 0, 0),
                        new Vector3(1, 1, 1),
                        texture,
                    );
                    this.objModels.push(obj);
                    if (texture) {
                        console.log(`Material "${materialName}" rendered with texture`);
                    }
                }
            }

            if (interiorDoorEntries.length > 0) {
                const interiorDoorData = [];

                for (const entry of interiorDoorEntries) {
                    const stats = OBJLoader.getStats(entry.geometry);
                    const bounds = stats.bounds;
                    const widthX = bounds.max.x - bounds.min.x;
                    const widthZ = bounds.max.z - bounds.min.z;
                    const centerX = (bounds.min.x + bounds.max.x) / 2;
                    const centerZ = (bounds.min.z + bounds.max.z) / 2;
                    const slideAxis = widthZ > widthX ? "z" : "x";
                    const slideDistance = slideAxis === "z" ? widthZ : widthX;

                    let doorTexture = null;
                    if (entry.geometry.faceMaterials && buildingGeometry.materials) {
                        for (const materialName of entry.geometry.faceMaterials) {
                            const material = buildingGeometry.materials.get(materialName);
                            if (material && material.map_Kd) {
                                doorTexture = texturesByMaterial.get(materialName) || null;
                                if (doorTexture) {
                                    break;
                                }
                            }
                        }
                    }

                    const doorObj = this.renderer.addObject(
                        entry.geometry,
                        new Vector3(0, 0, 0),
                        new Vector3(0, 0, 0),
                        new Vector3(1, 1, 1),
                        doorTexture,
                    );
                    this.objModels.push(doorObj);

                    interiorDoorData.push({
                        centerX,
                        centerZ,
                        slideAxis,
                        slideDistance,
                        doorObj,
                    });
                }

                if (interiorDoorData.length === 2) {
                    const axis = interiorDoorData[0].slideAxis;
                    if (axis === "x") {
                        interiorDoorData.sort((a, b) => a.centerX - b.centerX);
                    } else {
                        interiorDoorData.sort((a, b) => a.centerZ - b.centerZ);
                    }
                    interiorDoorData[0].slideDirection = -1;
                    interiorDoorData[1].slideDirection = 1;
                } else {
                    interiorDoorData[0].slideDirection = 1;
                }

                for (const data of interiorDoorData) {
                    this.doors.push(
                        new Door(data.doorObj, {
                            isLeftDoor: data.slideDirection < 0,
                            baseRotation: 0,
                            slideAxis: data.slideAxis,
                            slideDistance: data.slideDistance,
                            slideDirection: data.slideDirection,
                        }),
                    );
                }
            }

            const centerX = (buildingStats.bounds.min.x + buildingStats.bounds.max.x) / 2;
            const centerZ = (buildingStats.bounds.min.z + buildingStats.bounds.max.z) / 2;
            const height = buildingStats.bounds.max.y - buildingStats.bounds.min.y;

            console.log(`Building center: (${centerX.toFixed(2)}, ${centerZ.toFixed(2)})`);
            console.log(`Building height: ${height.toFixed(2)}`);
        } catch (error) {
            console.error("Failed to load building:", error);
        }

        try {
            const doorGeometry = await OBJLoader.load("./assets/models/porta.obj");
            const doorStats = OBJLoader.getStats(doorGeometry);
            console.log("Door loaded:", doorStats);

            let doorTexture = null;
            if (doorGeometry.materials) {
                OBJLoader.applyMaterialColors(doorGeometry, doorGeometry.materials);
                for (const [, material] of doorGeometry.materials) {
                    if (material.map_Kd) {
                        const texturePath = material.map_Kd.replace(/\\/g, "/");
                        const textureUrl = `./assets/textures/${texturePath.split("/").pop()}`;
                        try {
                            doorTexture = await this.renderer.loadTexture(textureUrl);
                        } catch (error) {
                            console.error("Failed to load door texture:", error);
                        }
                        break;
                    }
                }
            }

            const doorBounds = doorStats.bounds;

            const widthX = doorBounds.max.x - doorBounds.min.x;
            const widthZ = doorBounds.max.z - doorBounds.min.z;
            const useZAxis = widthZ > widthX;

            const slideAxis = useZAxis ? "z" : "x";
            console.log("Door bounds:", doorBounds);

            const door1 = this.renderer.addObject(
                doorGeometry,
                new Vector3(-0.27 - 17.69, 0.7 - 0.85, 10.75 - (-1.47)),
                new Vector3(0, Math.PI, 0),
                new Vector3(1.8, 1.5, 1.1),
                doorTexture,
            );

            const door2 = this.renderer.addObject(
                doorGeometry,
                new Vector3(0.32 - 17.69, 0.7 - 0.85, 10.75 - (-1.47)),
                new Vector3(0, Math.PI, 0),
                new Vector3(1.8, 1.5, 1.1),
                doorTexture,
            );

            this.objModels.push(door1);
            this.objModels.push(door2);

            const baseRotation = Math.PI;
            const slideDistance = 0.5;

            this.doors.push(
                new Door(door1, {
                    isLeftDoor: true,
                    baseRotation,
                    slideAxis,
                    slideDistance,
                    slideDirection: -1,
                }),
            );
            this.doors.push(
                new Door(door2, {
                    isLeftDoor: false,
                    baseRotation,
                    slideAxis,
                    slideDistance,
                    slideDirection: 1,
                }),
            );

            console.log("Doors initialized:", this.doors.length);

        } catch (error) {
            console.error("Failed to load door:", error);
        }

        try {
            const pyramidGeometry = await OBJLoader.load("./assets/models/pyramid.obj");
            const pyramidStats = OBJLoader.getStats(pyramidGeometry);
            console.log("Pyramid loaded:", pyramidStats);

            const pyramid = this.renderer.addObject(
                pyramidGeometry,
                new Vector3(-5, 1, 0),
                new Vector3(0, 0, 0),
                new Vector3(0.8, 0.8, 0.8),
            );
            pyramid.angularVelocity = new Vector3(0.2, 0.8, 0.1);
            this.animatedCubes.push(pyramid);
            this.objModels.push(pyramid);
        } catch (error) {
            console.error("Failed to load pyramid:", error);
        }

        try {
            const sphereGeometry = await OBJLoader.load("./assets/models/sphere.obj");
            const sphereStats = OBJLoader.getStats(sphereGeometry);
            console.log("Sphere loaded:", sphereStats);

            const sphere = this.renderer.addObject(
                sphereGeometry,
                new Vector3(5, 1.5, 0),
                new Vector3(0, 0, 0),
                new Vector3(0.7, 0.7, 0.7),
            );
            sphere.angularVelocity = new Vector3(0.3, 0.5, 0.4);
            this.animatedCubes.push(sphere);
            this.objModels.push(sphere);
        } catch (error) {
            console.error("Failed to load sphere:", error);
        }

        try {
            const teapotGeometry = await OBJLoader.load("./assets/models/teapot.obj");
            const teapotStats = OBJLoader.getStats(teapotGeometry);
            console.log("Teapot loaded:", teapotStats);

            const teapot = this.renderer.addObject(
                teapotGeometry,
                new Vector3(0, 1, -8),
                new Vector3(0, 0, 0),
                new Vector3(1.5, 1.5, 1.5),
            );
            teapot.angularVelocity = new Vector3(0.1, 0.6, 0.2);
            this.animatedCubes.push(teapot);
            this.objModels.push(teapot);
        } catch (error) {
            console.error("Failed to load teapot:", error);
        }

        console.log(`Loaded ${this.objModels.length} OBJ models successfully`);
    }

    update(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.camera.update(this.deltaTime, this.input);

        // Toggle skybox with K key
        if (this.input.isKeyDown("KeyK")) {
            if (!this.keyStates.kPressed) {
                this.renderer.enableSkybox = !this.renderer.enableSkybox;
                console.log("Skybox:", this.renderer.enableSkybox ? "ON" : "OFF");
                this.keyStates.kPressed = true;
            }
        } else {
            this.keyStates.kPressed = false;
        }

        // Toggle shadows with L key
        if (this.input.isKeyDown("KeyL")) {
            if (!this.keyStates.lPressed) {
                this.renderer.useShadows = !this.renderer.useShadows;
                console.log("Shadows:", this.renderer.useShadows ? "ON" : "OFF");
                this.keyStates.lPressed = true;
            }
        } else {
            this.keyStates.lPressed = false;
        }

        if (this.input.isKeyDown("KeyM")) {
            if (!this.keyStates.mPressed) {
                this.renderer.debugShadows = !this.renderer.debugShadows;
                console.log("Shadow Debug Mode:", this.renderer.debugShadows ? "ON" : "OFF");
                this.keyStates.mPressed = true;
            }
        } else {
            this.keyStates.mPressed = false;
        }

        // Toggle lights with P key
        if (this.input.isKeyDown("KeyP")) {
            if (!this.keyStates.pPressed) {
                this.renderer.enableLights = !this.renderer.enableLights;
                console.log("Lights:", this.renderer.enableLights ? "ON" : "OFF");
                this.keyStates.pPressed = true;
            }
        } else {
            this.keyStates.pPressed = false;
        }

        if (this.input.isKeyDown("KeyN")) {
            if (!this.keyStates.nPressed) {
                this.renderer.debugTexture = !this.renderer.debugTexture;
                console.log("Texture Debug Mode:", this.renderer.debugTexture ? "ON" : "OFF");
                this.keyStates.nPressed = true;
            }
        } else {
            this.keyStates.nPressed = false;
        }

        // Controlar portas com O key
        if (this.input.isKeyDown("KeyO")) {
            if (!this.keyStates.oPressed) {
                console.log("KeyO down, toggling doors:", this.doors.length);
                for (const door of this.doors) {
                    door.toggle();
                }
                this.keyStates.oPressed = true;
            }
        } else {
            this.keyStates.oPressed = false;
        }

        // Atualizar animação das portas
        for (const door of this.doors) {
            door.update(this.deltaTime);
        }

        for (const cube of this.animatedCubes) {
            cube.rotation.x += cube.angularVelocity.x * this.deltaTime;
            cube.rotation.y += cube.angularVelocity.y * this.deltaTime;
            cube.rotation.z += cube.angularVelocity.z * this.deltaTime;
        }

        this.renderer.updateLight(currentTime / 1000);

        // Atualizar estado anterior das teclas (necessário para wasKeyPressed)
        this.input.endFrame();
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
            console.log("Application initialized successfully");
            requestAnimationFrame((time) => this.run(time));
        } else {
            console.error("Failed to initialize application");
        }
    }
}

const app = new Application();
app.start();
