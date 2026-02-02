class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.shaderProgram = null;
        this.objects = [];
        
        this.lightPosition = new Vector3(3, 5, 3);
        this.lightColor = new Vector3(1.0, 1.0, 1.0);
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

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            color: colorBuffer,
            normal: normalBuffer,
            index: indexBuffer,
            vertexCount: geometry.vertexCount
        };
    }

    addObject(geometry, position, rotation, scale) {
        const buffers = this.createBuffers(geometry);
        
        const object = {
            buffers: buffers,
            position: position || new Vector3(0, 0, 0),
            rotation: rotation || new Vector3(0, 0, 0),
            scale: scale || new Vector3(1, 1, 1),
            angularVelocity: new Vector3(0, 0, 0)
        };

        this.objects.push(object);
        return object;
    }

    updateLight(time) {
        const radius = 5;
        this.lightPosition.x = Math.cos(time * 0.5) * radius;
        this.lightPosition.z = Math.sin(time * 0.5) * radius;
        this.lightPosition.y = 3 + Math.sin(time) * 2;
    }

    render(camera) {
        const gl = this.gl;
        const program = this.shaderProgram;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program.program);

        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        gl.uniformMatrix4fv(program.uniformLocations.viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix.elements);
        
        gl.uniform3f(program.uniformLocations.lightPosition, 
            this.lightPosition.x, this.lightPosition.y, this.lightPosition.z);
        gl.uniform3f(program.uniformLocations.viewPosition,
            camera.position.x, camera.position.y, camera.position.z);
        gl.uniform3f(program.uniformLocations.lightColor,
            this.lightColor.x, this.lightColor.y, this.lightColor.z);

        for (const object of this.objects) {
            this.renderObject(object, program);
        }
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
}
