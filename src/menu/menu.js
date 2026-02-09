class MainMenu {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.shader = null;
        this.cubeBuffers = null;
        this.texture = null;
        
        // Rotação do cubo
        this.rotation = new Vector3(0, 0, 0);
        this.rotationSpeed = new Vector3(0.3, 0.5, 0.2);
        
        // Câmera do menu
        this.cameraPosition = new Vector3(0, 0, 5);
        this.lightPosition = new Vector3(3, 3, 5);
        this.lightColor = new Vector3(1.0, 1.0, 1.0);
        
        // Estado do menu
        this.selectedOption = 0;
        this.menuOptions = ['Iniciar Jogo', 'Controles', 'Sair'];
        
        // Controle de teclas
        this.keyPressed = {
            up: false,
            down: false,
            enter: false
        };
        
        // Flag para indicar se cliques devem ser processados
        this.pendingSelection = -1;
    }
    
    setupClickHandlers() {
        const self = this;
        
        // Click handlers para opções do menu
        for (let i = 0; i < this.menuOptions.length; i++) {
            const element = document.getElementById(`option${i}`);
            if (element) {
                const optionIndex = i;
                element.addEventListener('click', () => {
                    console.log('Menu option clicked:', optionIndex);
                    self.selectedOption = optionIndex;
                    self.updateMenuUI();
                    // Marcar seleção pendente para processar no próximo frame
                    self.pendingSelection = optionIndex;
                });
                element.style.cursor = 'pointer';
            }
        }
        
        // Click handler para botão voltar
        const backButton = document.getElementById('controlsBack');
        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log('Back button clicked');
                self.pendingSelection = -2; // Código especial para voltar
            });
            backButton.style.cursor = 'pointer';
        }
        
        console.log('Click handlers configured');
    }

    async initialize() {
        const gl = this.gl;
        
        console.log('Initializing menu...');
        
        // Compilar shader
        this.shader = MenuShader.compile(gl);
        if (!this.shader) {
            console.error('Failed to compile menu shader');
            return false;
        }
        console.log('Menu shader compiled successfully');
        
        // Criar geometria do cubo
        const cubeGeometry = MenuCube.createGeometry();
        this.cubeBuffers = this.createBuffers(cubeGeometry);
        console.log('Menu cube buffers created');
        
        // Carregar textura do GESAD
        try {
            this.texture = await this.loadTexture('./assets/textures/gesad.png');
            console.log('GESAD texture loaded successfully');
        } catch (error) {
            console.error('Failed to load GESAD texture:', error);
            // Continuar mesmo sem textura
        }
        
        // Configurar handlers de clique agora que os elementos existem
        this.setupClickHandlers();
        
        console.log('Menu initialized successfully');
        return true;
    }

    createBuffers(geometry) {
        const gl = this.gl;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.texCoords, gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            color: colorBuffer,
            normal: normalBuffer,
            texCoord: texCoordBuffer,
            index: indexBuffer,
            vertexCount: geometry.vertexCount
        };
    }

    loadTexture(url) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Placeholder enquanto carrega
        const pixel = new Uint8Array([128, 128, 128, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                
                // Gerar mipmaps se a imagem for potência de 2
                if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
                
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                
                console.log('GESAD texture loaded');
                resolve(texture);
            };
            image.onerror = () => {
                console.error('Failed to load GESAD logo:', url);
                reject(new Error('Failed to load texture: ' + url));
            };
            image.src = url;
        });
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    handleInput(input) {
        // Verificar se há seleção pendente de clique
        if (this.pendingSelection >= 0) {
            const selection = this.pendingSelection;
            this.pendingSelection = -1;
            console.log('Processing pending selection:', selection);
            return selection;
        }
        
        // Navegação com setas
        if (input.isKeyDown('ArrowUp')) {
            if (!this.keyPressed.up) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuUI();
                this.keyPressed.up = true;
            }
        } else {
            this.keyPressed.up = false;
        }

        if (input.isKeyDown('ArrowDown')) {
            if (!this.keyPressed.down) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuUI();
                this.keyPressed.down = true;
            }
        } else {
            this.keyPressed.down = false;
        }

        // Seleção com Enter ou Espaço
        if (input.isKeyDown('Enter') || input.isKeyDown('Space') || input.isKeyDown('NumpadEnter')) {
            if (!this.keyPressed.enter) {
                this.keyPressed.enter = true;
                return this.selectedOption;
            }
        } else {
            this.keyPressed.enter = false;
        }

        return -1;
    }
    
    hasPendingBack() {
        if (this.pendingSelection === -2) {
            this.pendingSelection = -1;
            return true;
        }
        return false;
    }
    
    updateMenuUI() {
        for (let i = 0; i < this.menuOptions.length; i++) {
            const element = document.getElementById(`option${i}`);
            if (element) {
                element.innerHTML = (i === this.selectedOption ? '▶ ' : '  ') + this.menuOptions[i];
                element.style.color = i === this.selectedOption ? '#4CAF50' : 'white';
                element.style.fontSize = i === this.selectedOption ? '28px' : '24px';
            }
        }
    }

    update(deltaTime) {
        // Atualizar rotação do cubo usando velocidade angular
        this.rotation.x += this.rotationSpeed.x * deltaTime;
        this.rotation.y += this.rotationSpeed.y * deltaTime;
        this.rotation.z += this.rotationSpeed.z * deltaTime;
        
        // Animação da luz
        const time = Date.now() / 1000;
        this.lightPosition.x = Math.cos(time) * 3;
        this.lightPosition.z = 5 + Math.sin(time) * 2;
    }

    render() {
        const gl = this.gl;
        
        gl.clearColor(0.05, 0.05, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        
        if (!this.shader || !this.cubeBuffers) {
            console.error('Menu shader or buffers not initialized');
            return;
        }
        
        gl.useProgram(this.shader.program);
        
        // Matrizes de transformação usando uniforms
        const modelMatrix = this.calculateModelMatrix();
        const viewMatrix = this.calculateViewMatrix();
        const projectionMatrix = this.calculateProjectionMatrix();
        
        // Enviar uniforms
        gl.uniformMatrix4fv(this.shader.uniformLocations.modelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(this.shader.uniformLocations.viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(this.shader.uniformLocations.projectionMatrix, false, projectionMatrix.elements);
        
        gl.uniform3f(this.shader.uniformLocations.lightPosition, 
            this.lightPosition.x, this.lightPosition.y, this.lightPosition.z);
        gl.uniform3f(this.shader.uniformLocations.viewPosition, 
            this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        gl.uniform3f(this.shader.uniformLocations.lightColor, 
            this.lightColor.x, this.lightColor.y, this.lightColor.z);
        
        // Textura
        gl.activeTexture(gl.TEXTURE0);
        if (this.texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.shader.uniformLocations.texture, 0);
            gl.uniform1i(this.shader.uniformLocations.useTexture, 1);
        } else {
            gl.uniform1i(this.shader.uniformLocations.useTexture, 0);
        }
        
        // Buffers
        this.bindBuffers();
        
        // Desenhar
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeBuffers.index);
        gl.drawElements(gl.TRIANGLES, this.cubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

    bindBuffers() {
        const gl = this.gl;
        const attrib = this.shader.attribLocations;
        
        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.position);
        gl.vertexAttribPointer(attrib.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib.position);
        
        // Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.color);
        gl.vertexAttribPointer(attrib.color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib.color);
        
        // Normal
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.normal);
        gl.vertexAttribPointer(attrib.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib.normal);
        
        // TexCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.texCoord);
        gl.vertexAttribPointer(attrib.texCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib.texCoord);
    }

    calculateModelMatrix() {
        const matrix = new Matrix4();
        
        // Aplicar rotações
        const rotX = Matrix4.rotateX(this.rotation.x);
        const rotY = Matrix4.rotateY(this.rotation.y);
        const rotZ = Matrix4.rotateZ(this.rotation.z);
        
        // Combinar transformações
        return matrix.multiply(rotY).multiply(rotX).multiply(rotZ);
    }

    calculateViewMatrix() {
        const target = new Vector3(0, 0, 0);
        const up = new Vector3(0, 1, 0);
        return Matrix4.lookAt(this.cameraPosition, target, up);
    }

    calculateProjectionMatrix() {
        const aspect = this.canvas.width / this.canvas.height;
        const fov = 45 * Math.PI / 180;
        return Matrix4.perspective(fov, aspect, 0.1, 100);
    }

    getSelectedOption() {
        return this.selectedOption;
    }

    getMenuOptions() {
        return this.menuOptions;
    }
}
