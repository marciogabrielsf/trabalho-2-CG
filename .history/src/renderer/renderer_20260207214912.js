class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.shaderProgram = null;
        this.objects = [];
        
        // Multiple lights - one for each monitor
        this.lights = [
            { position: new Vector3(22.0, 2.2, -3.7), color: new Vector3(1.0, 0.9, 0.8) },
            { position: new Vector3(22.0, 2.2, -5.8), color: new Vector3(0.8, 0.9, 1.0) },
            { position: new Vector3(22.0, 2.2, -7.8), color: new Vector3(0.9, 1.0, 0.9) }
        ];
        
        this.skybox = null;
        this.skyboxShader = null;
        this.skyboxBuffers = null;
        this.enableSkybox = true;
        
        this.shadowMap = null;
        this.useShadows = true;
        this.debugShadows = false;
        this.debugTexture = false;
        this.shadowRenderCount = 0;
        
        this.enableLights = true;
        
        this.renderCount = 0;
    }

    initialize() {
        const gl = this.gl;
        
        gl.clearColor(0.1, 0.1, 0.15, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        this.shaderProgram = ShaderProgram.compile(gl);
        
        if (!this.shaderProgram) {
            console.error('Failed to initialize shader program');
            return false;
        }

        this.initializeSkybox();
        this.initializeShadows();

        return true;
    }

    initializeSkybox() {
        const gl = this.gl;
        
        this.skyboxShader = SkyboxShader.compile(gl);
        if (!this.skyboxShader) {
            console.warn('Failed to initialize skybox shader');
            return;
        }
        
        const skyboxGeometry = SkyboxGeometry.createGeometry();
        this.skyboxBuffers = this.createBuffers(skyboxGeometry);
    }

    initializeShadows() {
        const gl = this.gl;
        
        this.shadowMap = new ShadowMap(gl, 1024, 1024);
        if (!this.shadowMap.initialize()) {
            console.warn('Failed to initialize shadow mapping');
            this.useShadows = false;
            return;
        }
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

        let texCoordBuffer = null;
        if (geometry.texCoords) {
            texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.texCoords, gl.STATIC_DRAW);
        }

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

    addObject(geometry, position, rotation, scale, texture = null) {
        const buffers = this.createBuffers(geometry);
        
        const object = {
            buffers: buffers,
            position: position || new Vector3(0, 0, 0),
            rotation: rotation || new Vector3(0, 0, 0),
            scale: scale || new Vector3(1, 1, 1),
            angularVelocity: new Vector3(0, 0, 0),
            texture: texture
        };

        this.objects.push(object);
        return object;
    }

    updateLight(time) {
        // Animate lights with slight pulsing effect
        for (let i = 0; i < this.lights.length; i++) {
            const baseIntensity = 1.0;
            const pulse = 0.1 * Math.sin(time * 2.0 + i * Math.PI * 0.6);
            const intensity = baseIntensity + pulse;
            
            // Keep original colors but adjust intensity
            const baseColor = i === 0 ? [1.0, 0.9, 0.8] : 
                            i === 1 ? [0.8, 0.9, 1.0] : 
                                      [0.9, 1.0, 0.9];
            
            this.lights[i].color = new Vector3(
                baseColor[0] * intensity,
                baseColor[1] * intensity,
                baseColor[2] * intensity
            );
        }
    }

    render(camera) {
        const gl = this.gl;
        
        if (this.useShadows && this.shadowMap) {
            this.renderShadowMap();
        }
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        this.renderScene(camera);
        
        if (this.enableSkybox && this.skyboxShader && this.skyboxBuffers) {
            this.renderSkybox(camera);
        }
    }

    renderShadowMap() {
        const gl = this.gl;
        const shadowProgram = this.shadowMap.depthProgram;
        
        // Use first light for shadows
        this.shadowMap.updateLightMatrices(this.lights[0].position);
        this.shadowMap.bind();
        
        gl.useProgram(shadowProgram.program);
        
        const lightSpaceMatrix = this.shadowMap.getLightSpaceMatrix();
        gl.uniformMatrix4fv(shadowProgram.uniformLocations.lightSpaceMatrix, false, lightSpaceMatrix.elements);
        
        let objectsRendered = 0;
        for (const object of this.objects) {
            const modelMatrix = this.calculateModelMatrix(object);
            gl.uniformMatrix4fv(shadowProgram.uniformLocations.modelMatrix, false, modelMatrix.elements);
            
            const buffers = object.buffers;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(shadowProgram.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shadowProgram.attribLocations.position);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
            gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
            objectsRendered++;
        }
        
        this.shadowMap.unbind(gl.canvas.width, gl.canvas.height);
        
        this.shadowRenderCount++;
    }

    renderSkybox(camera) {
        const gl = this.gl;
        const skyboxProgram = this.skyboxShader;
        
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(skyboxProgram.program);
        
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();
        
        gl.uniformMatrix4fv(skyboxProgram.uniformLocations.viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(skyboxProgram.uniformLocations.projectionMatrix, false, projectionMatrix.elements);
        
        const buffers = this.skyboxBuffers;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(skyboxProgram.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skyboxProgram.attribLocations.position);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(skyboxProgram.attribLocations.color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skyboxProgram.attribLocations.color);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
        
        gl.depthFunc(gl.LESS);
        gl.enable(gl.CULL_FACE);
    }

    renderScene(camera) {
        const gl = this.gl;
        const program = this.shaderProgram;

        gl.useProgram(program.program);

        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        gl.uniformMatrix4fv(program.uniformLocations.viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix.elements);
        
        if (this.useShadows && this.shadowMap) {
            const lightSpaceMatrix = this.shadowMap.getLightSpaceMatrix();
            gl.uniformMatrix4fv(program.uniformLocations.lightSpaceMatrix, false, lightSpaceMatrix.elements);
            this.shadowMap.bindDepthTexture(1);
            gl.uniform1i(program.uniformLocations.shadowMap, 1);
            gl.uniform1i(program.uniformLocations.useShadows, 1);
            gl.uniform1i(program.uniformLocations.debugShadows, this.debugShadows ? 1 : 0);
        } else {
            gl.uniform1i(program.uniformLocations.useShadows, 0);
            gl.uniform1i(program.uniformLocations.debugShadows, 0);
        }
        
        // Pass multiple lights to shader
        const activeLights = this.enableLights ? this.lights.length : 0;
        gl.uniform1i(program.uniformLocations.numLights, activeLights);
        
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            if (program.uniformLocations.lightPositions[i] !== null) {
                gl.uniform3f(
                    program.uniformLocations.lightPositions[i], 
                    light.position.x, light.position.y, light.position.z
                );
            }
            if (program.uniformLocations.lightColors[i] !== null) {
                gl.uniform3f(
                    program.uniformLocations.lightColors[i],
                    light.color.x, light.color.y, light.color.z
                );
            }
        }
        
        gl.uniform3f(program.uniformLocations.viewPosition,
            camera.position.x, camera.position.y, camera.position.z);

        for (const object of this.objects) {
            this.renderObject(object, program);
        }
        
        this.renderCount++;
    }

    renderObject(object, program) {
        const gl = this.gl;
        const buffers = object.buffers;

        const modelMatrix = this.calculateModelMatrix(object);
        gl.uniformMatrix4fv(program.uniformLocations.modelMatrix, false, modelMatrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(program.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.attribLocations.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(program.attribLocations.color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.attribLocations.color);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(program.attribLocations.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.attribLocations.normal);

        const hasTexCoord = buffers.texCoord !== null && buffers.texCoord !== undefined;
        const hasTexture = object.texture !== null && object.texture !== undefined;
        
        if (hasTexCoord && hasTexture) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
            gl.vertexAttribPointer(program.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.attribLocations.texCoord);
            
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, object.texture);
            gl.uniform1i(program.uniformLocations.texture, 2);
            gl.uniform1i(program.uniformLocations.useTexture, 1);
            gl.uniform1i(program.uniformLocations.debugTexture, this.debugTexture ? 1 : 0);
        } else {
            if (program.attribLocations.texCoord >= 0) {
                gl.disableVertexAttribArray(program.attribLocations.texCoord);
            }
            gl.uniform1i(program.uniformLocations.useTexture, 0);
            gl.uniform1i(program.uniformLocations.debugTexture, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

    calculateModelMatrix(object) {
        let modelMatrix = new Matrix4();
        
        const translation = Matrix4.translate(
            object.position.x,
            object.position.y,
            object.position.z
        );
        
        const rotationX = Matrix4.rotateX(object.rotation.x);
        const rotationY = Matrix4.rotateY(object.rotation.y);
        const rotationZ = Matrix4.rotateZ(object.rotation.z);
        
        const scale = Matrix4.scale(
            object.scale.x,
            object.scale.y,
            object.scale.z
        );

        modelMatrix = translation
            .multiply(rotationY)
            .multiply(rotationX)
            .multiply(rotationZ)
            .multiply(scale);

        return modelMatrix;
    }

    loadTexture(url) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const pixel = new Uint8Array([128, 128, 128, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                
                let finalImage = image;
                
                if (!this.isPowerOf2(image.width) || !this.isPowerOf2(image.height)) {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.nextPowerOf2(image.width);
                    canvas.height = this.nextPowerOf2(image.height);
                    
                    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                    if (canvas.width > maxSize) canvas.width = maxSize;
                    if (canvas.height > maxSize) canvas.height = maxSize;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    finalImage = canvas;
                }
                
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, finalImage);
                
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                
                resolve(texture);
            };
            image.onerror = () => {
                console.error('Failed to load texture:', url);
                reject(new Error('Failed to load texture: ' + url));
            };
            image.src = url;
        });
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    
    nextPowerOf2(value) {
        return Math.pow(2, Math.ceil(Math.log2(value)));
    }
}
