// Estados do jogo
const GameState = {
    MENU: 'menu',
    CONTROLS: 'controls',
    PLAYING: 'playing'
};

class Application {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.camera = null;
        this.renderer = null;
        this.input = null;
        this.menu = null;

        this.lastTime = 0;
        this.deltaTime = 0;
        this.animatedCubes = [];
        this.objModels = [];
        
        // Estado do jogo
        this.gameState = GameState.MENU;
        this.gameInitialized = false;

        this.keyStates = {
            kPressed: false,
            lPressed: false,
            mPressed: false,
            nPressed: false,
            escPressed: false,
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
            escPressed: false,
        };

        const aspect = this.canvas.width / this.canvas.height;
        this.camera = new Camera(45, aspect, 0.1, 200);

        // Inicializar menu
        this.menu = new MainMenu(this.gl, this.canvas);
        await this.menu.initialize();
        
        // Mostrar o overlay do menu
        this.showMenuOverlay();

        return true;
    }
    
    showMenuOverlay() {
        const menuOverlay = document.getElementById('menuOverlay');
        const controlsOverlay = document.getElementById('controlsOverlay');
        const info = document.getElementById('info');
        
        if (menuOverlay) menuOverlay.style.display = 'flex';
        if (controlsOverlay) controlsOverlay.style.display = 'none';
        if (info) info.style.display = 'none';
    }
    
    hideMenuOverlay() {
        const menuOverlay = document.getElementById('menuOverlay');
        const controlsOverlay = document.getElementById('controlsOverlay');
        const info = document.getElementById('info');
        
        if (menuOverlay) menuOverlay.style.display = 'none';
        if (controlsOverlay) controlsOverlay.style.display = 'none';
        if (info) info.style.display = 'block';
    }
    
    showControlsOverlay() {
        const menuOverlay = document.getElementById('menuOverlay');
        const controlsOverlay = document.getElementById('controlsOverlay');
        
        if (menuOverlay) menuOverlay.style.display = 'none';
        if (controlsOverlay) controlsOverlay.style.display = 'flex';
    }
    
    async initializeGame() {
        if (this.gameInitialized) return;
        
        this.renderer = new Renderer(this.gl);
        if (!this.renderer.initialize()) {
            return false;
        }

        await this.setupScene();
        this.gameInitialized = true;
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

        // Cubos removidos

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

            // Split geometry by material
            const geometriesByMaterial = OBJLoader.splitByMaterial(buildingGeometry);
            console.log("Split into materials:", Object.keys(geometriesByMaterial));

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

            // Render each material as separate object
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

            const centerX = (buildingStats.bounds.min.x + buildingStats.bounds.max.x) / 2;
            const centerZ = (buildingStats.bounds.min.z + buildingStats.bounds.max.z) / 2;
            const height = buildingStats.bounds.max.y - buildingStats.bounds.min.y;

            console.log(`Building center: (${centerX.toFixed(2)}, ${centerZ.toFixed(2)})`);
            console.log(`Building height: ${height.toFixed(2)}`);
            
            // Adicionar pista (estrada) ao lado do prédio
            this.createRoad();
            
            // Adicionar árvores ao redor do prédio
            this.createTrees();
        } catch (error) {
            console.error("Failed to load building:", error);
        }


        console.log(`Loaded ${this.objModels.length} OBJ models successfully`);
    }

    createRoad() {
        console.log("Creating road...");
        

        const grassWidth = 100;
        const roadLength = grassWidth;
        
        const roadGeometry = Plane.createGeometry(roadLength, 10, 1);
        
        for (let i = 0; i < roadGeometry.colors.length; i += 3) {
            roadGeometry.colors[i] = 0.2;     // R
            roadGeometry.colors[i + 1] = 0.2; // G
            roadGeometry.colors[i + 2] = 0.2; // B
        }
        
        const road = this.renderer.addObject(
            roadGeometry,
            new Vector3(0, 0.1, 30),
            new Vector3(0, 0, 0), 
            new Vector3(1, 1, 1)
        );
        this.objModels.push(road);
        
        console.log("Road created at position (0, 0.1, 30)");
    }

    createTrees() {
        console.log("Creating trees...");
        
        const treePositions = [
            new Vector3(-30, 0, 15),   
            new Vector3(30, 0, 15),   
            new Vector3(30, 0, 20),   
        ];
        
        treePositions.forEach((position, index) => {
            const trunkGeometry = Tree.createTrunkGeometry(0.4, 0.3, 2.5, 8);
            const trunk = this.renderer.addObject(
                trunkGeometry,
                position,
                new Vector3(0, 0, 0),
                new Vector3(1, 1, 1)
            );
            this.objModels.push(trunk);
            
            const foliageGeometry = Tree.createFoliageGeometry(2, 4, 10);
            const foliage = this.renderer.addObject(
                foliageGeometry,
                new Vector3(position.x, position.y + 2.5, position.z),
                new Vector3(0, 0, 0),
                new Vector3(1, 1, 1)
            );
            this.objModels.push(foliage);
        });
        
        console.log(`Created ${treePositions.length} trees around the building`);
    }

    updateMenu(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Atualizar o cubo rotativo do menu
        this.menu.update(this.deltaTime);
        
        // Processar input do menu
        const selection = this.menu.handleInput(this.input);
        
        if (selection === 0) {
            // Iniciar Jogo
            console.log('Iniciando jogo...');
            this.startGame();
        } else if (selection === 1) {
            // Controles
            console.log('Abrindo controles...');
            this.gameState = GameState.CONTROLS;
            this.showControlsOverlay();
        } else if (selection === 2) {
            // Sair - apenas mostra mensagem
            console.log('Opção Sair selecionada');
            alert('Obrigado por jogar!');
        }
        
        this.input.endFrame();
    }
    
    updateControls(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Atualizar o cubo rotativo do menu
        this.menu.update(this.deltaTime);
        
        // Verificar se o botão voltar foi clicado
        if (this.menu.hasPendingBack()) {
            this.gameState = GameState.MENU;
            this.showMenuOverlay();
            this.input.endFrame();
            return;
        }
        
        // Voltar ao menu com ESC ou Enter ou Backspace
        if (this.input.isKeyDown('Escape') || this.input.isKeyDown('Backspace')) {
            if (!this.keyStates.escPressed) {
                this.keyStates.escPressed = true;
                this.gameState = GameState.MENU;
                this.showMenuOverlay();
            }
        } else {
            this.keyStates.escPressed = false;
        }
        
        this.input.endFrame();
    }
    
    async startGame() {
        await this.initializeGame();
        this.gameState = GameState.PLAYING;
        this.hideMenuOverlay();
        
        // Focar no canvas para capturar input
        this.canvas.focus();
    }
    
    renderMenu() {
        this.menu.render();
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
        if (this.gameState === GameState.PLAYING && this.renderer) {
            this.renderer.render(this.camera);
        }
    }

    run(currentTime) {
        switch (this.gameState) {
            case GameState.MENU:
                this.updateMenu(currentTime);
                this.renderMenu();
                break;
                
            case GameState.CONTROLS:
                this.updateControls(currentTime);
                this.renderMenu();
                break;
                
            case GameState.PLAYING:
                this.update(currentTime);
                this.render();
                break;
        }

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
