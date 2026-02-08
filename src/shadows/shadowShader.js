class ShadowShader {
    static createDepthVertexShader() {
        return `
            attribute vec3 aPosition;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uLightSpaceMatrix;
            
            void main() {
                gl_Position = uLightSpaceMatrix * uModelMatrix * vec4(aPosition, 1.0);
            }
        `;
    }

    static createDepthFragmentShader() {
        return `
            precision mediump float;
            
            varying float vDepth;
            
            void main() {
                float depth = gl_FragCoord.z;
                gl_FragColor = vec4(depth, depth, depth, 1.0);
            }
        `;
    }

    static compileDepthProgram(gl) {
        const vertexShaderSource = this.createDepthVertexShader();
        const fragmentShaderSource = this.createDepthFragmentShader();

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Bind attribute location explicitly for ANGLE/Chromium compatibility
        gl.bindAttribLocation(program, 0, "aPosition");

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Shadow depth program linking error:", gl.getProgramInfoLog(program));
            return null;
        }

        return {
            program: program,
            attribLocations: {
                position: gl.getAttribLocation(program, "aPosition"),
            },
            uniformLocations: {
                modelMatrix: gl.getUniformLocation(program, "uModelMatrix"),
                lightSpaceMatrix: gl.getUniformLocation(program, "uLightSpaceMatrix"),
            },
        };
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shadow shader compilation error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
