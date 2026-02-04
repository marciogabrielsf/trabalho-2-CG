class ShadowMap {
    constructor(gl, width = 1024, height = 1024) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.framebuffer = null;
        this.depthTexture = null;
        this.depthProgram = null;
        
        this.lightProjectionMatrix = null;
        this.lightViewMatrix = null;
    }

    initialize() {
        const gl = this.gl;
        
        this.depthProgram = ShadowShader.compileDepthProgram(gl);
        if (!this.depthProgram) {
            console.error('Failed to compile shadow depth program');
            return false;
        }

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const depthRenderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.depthTexture,
            0
        );

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer not complete:', status);
            return false;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        console.log('Shadow map initialized:', this.width, 'x', this.height);
        return true;
    }

    updateLightMatrices(lightPosition) {
        const lightTarget = new Vector3(0, 0, 0);
        const lightUp = new Vector3(0, 1, 0);
        
        this.lightViewMatrix = Matrix4.lookAt(lightPosition, lightTarget, lightUp);
        
        const orthoSize = 25;
        this.lightProjectionMatrix = Matrix4.orthographic(
            -orthoSize, orthoSize,
            -orthoSize, orthoSize,
            1.0, 100
        );
    }

    getLightSpaceMatrix() {
        if (!this.lightProjectionMatrix || !this.lightViewMatrix) {
            return new Matrix4();
        }
        return this.lightProjectionMatrix.multiply(this.lightViewMatrix);
    }

    bind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    unbind(canvasWidth, canvasHeight) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clearColor(0.1, 0.1, 0.15, 1.0);
    }

    bindDepthTexture(textureUnit) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    }
}
