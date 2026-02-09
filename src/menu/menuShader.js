class MenuShader {
    static createVertexShader() {
        return `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            attribute vec3 aNormal;
            attribute vec2 aTexCoord;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec2 vTexCoord;
            
            void main() {
                vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
                vFragPos = worldPosition.xyz;
                
                gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
                
                vColor = aColor;
                vNormal = mat3(uModelMatrix) * aNormal;
                vTexCoord = aTexCoord;
            }
        `;
    }

    static createFragmentShader() {
        return `
            precision mediump float;
            
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec2 vTexCoord;
            
            uniform vec3 uLightPosition;
            uniform vec3 uViewPosition;
            uniform vec3 uLightColor;
            uniform sampler2D uTexture;
            uniform int uUseTexture;
            
            void main() {
                vec3 baseColor = vColor;
                
                if(uUseTexture == 1) {
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    baseColor = texColor.rgb;
                }
                
                // Iluminação ambiente
                vec3 ambient = 0.4 * uLightColor;
                
                // Iluminação difusa
                vec3 norm = normalize(vNormal);
                vec3 lightDir = normalize(uLightPosition - vFragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * uLightColor * 0.6;
                
                // Iluminação especular
                vec3 viewDir = normalize(uViewPosition - vFragPos);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 specular = 0.5 * spec * uLightColor;
                
                vec3 lighting = ambient + diffuse + specular;
                vec3 result = lighting * baseColor;
                
                gl_FragColor = vec4(result, 1.0);
            }
        `;
    }

    static compile(gl) {
        const vertexShaderSource = this.createVertexShader();
        const fragmentShaderSource = this.createFragmentShader();

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Menu shader linking error:', gl.getProgramInfoLog(program));
            return null;
        }

        return {
            program: program,
            attribLocations: {
                position: gl.getAttribLocation(program, 'aPosition'),
                color: gl.getAttribLocation(program, 'aColor'),
                normal: gl.getAttribLocation(program, 'aNormal'),
                texCoord: gl.getAttribLocation(program, 'aTexCoord')
            },
            uniformLocations: {
                modelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
                viewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
                projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
                lightPosition: gl.getUniformLocation(program, 'uLightPosition'),
                viewPosition: gl.getUniformLocation(program, 'uViewPosition'),
                lightColor: gl.getUniformLocation(program, 'uLightColor'),
                texture: gl.getUniformLocation(program, 'uTexture'),
                useTexture: gl.getUniformLocation(program, 'uUseTexture')
            }
        };
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
