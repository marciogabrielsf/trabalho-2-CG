class SkyboxShader {
    static createVertexShader() {
        return `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying vec3 vColor;
            
            void main() {
                mat4 viewNoTranslation = uViewMatrix;
                viewNoTranslation[3][0] = 0.0;
                viewNoTranslation[3][1] = 0.0;
                viewNoTranslation[3][2] = 0.0;
                
                vec4 pos = uProjectionMatrix * viewNoTranslation * vec4(aPosition, 1.0);
                gl_Position = pos.xyww;
                
                vColor = aColor;
            }
        `;
    }

    static createFragmentShader() {
        return `
            precision mediump float;
            
            varying vec3 vColor;
            
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `;
    }

    static compile(gl) {
        const vertexShaderSource = this.createVertexShader();
        const fragmentShaderSource = this.createFragmentShader();

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Skybox program linking error:', gl.getProgramInfoLog(program));
            return null;
        }

        const programInfo = {
            program: program,
            attribLocations: {
                position: gl.getAttribLocation(program, 'aPosition'),
                color: gl.getAttribLocation(program, 'aColor')
            },
            uniformLocations: {
                viewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
                projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix')
            }
        };

        return programInfo;
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Skybox shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
