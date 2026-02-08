class ShaderProgram {
    static createVertexShader() {
        return `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            attribute vec3 aNormal;
            attribute vec2 aTexCoord;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uLightSpaceMatrix;
            
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec4 vFragPosLightSpace;
            varying vec2 vTexCoord;
            
            void main() {
                vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
                vFragPos = worldPosition.xyz;
                vFragPosLightSpace = uLightSpaceMatrix * worldPosition;
                
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
            varying vec4 vFragPosLightSpace;
            varying vec2 vTexCoord;
            
            uniform vec3 uLightPosition;
            uniform vec3 uViewPosition;
            uniform vec3 uLightColor;
            uniform sampler2D uShadowMap;
            uniform sampler2D uTexture;
            uniform int uUseShadows;
            uniform int uDebugShadows;
            uniform int uUseTexture;
            uniform int uDebugTexture;
            uniform float uShadowFactor;
            uniform float uEmissiveStrength;
            
            float calculateShadow(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
                vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
                projCoords = projCoords * 0.5 + 0.5;
                
                if(projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0) {
                    return 0.0;
                }
                
                float currentDepth = projCoords.z;
                float bias = 0.001;
                
                float shadow = 0.0;
                vec2 texelSize = vec2(1.0 / 1024.0, 1.0 / 1024.0);
                for(int x = -1; x <= 1; x++) {
                    for(int y = -1; y <= 1; y++) {
                        vec2 offset = vec2(float(x), float(y)) * texelSize;
                        float pcfDepth = texture2D(uShadowMap, projCoords.xy + offset).r;
                        shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
                    }
                }
                shadow /= 9.0;
                
                return shadow;
            }
            
            void main() {
                if(uDebugShadows == 1) {
                    vec3 projCoords = vFragPosLightSpace.xyz / vFragPosLightSpace.w;
                    projCoords = projCoords * 0.5 + 0.5;
                    
                    if(projCoords.x >= 0.0 && projCoords.x <= 1.0 && projCoords.y >= 0.0 && projCoords.y <= 1.0) {
                        float depth = texture2D(uShadowMap, projCoords.xy).r;
                        gl_FragColor = vec4(depth, depth, depth, 1.0);
                    } else {
                        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                    }
                    return;
                }
                
                vec3 baseColor = vColor;
                
                if(uUseTexture == 1) {
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    baseColor = texColor.rgb;
                    
                    if(uDebugTexture == 1) {
                        gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 0.0, 1.0);
                        return;
                    }
                }
                
                vec3 ambient = 0.3 * uLightColor;
                
                vec3 norm = normalize(vNormal);
                vec3 lightDir = normalize(uLightPosition - vFragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * uLightColor;
                
                vec3 viewDir = normalize(uViewPosition - vFragPos);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 specular = 0.5 * spec * uLightColor;
                
                float shadow = 0.0;
                if(uUseShadows == 1) {
                    shadow = calculateShadow(vFragPosLightSpace, norm, lightDir);
                }
                float effectiveShadow = shadow * uShadowFactor;
                vec3 lighting = ambient + (1.0 - effectiveShadow) * (diffuse + specular);
                vec3 result = lighting * baseColor + uEmissiveStrength * baseColor;
                gl_FragColor = vec4(result, 1.0);
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
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return null;
        }

        const programInfo = {
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
                lightSpaceMatrix: gl.getUniformLocation(program, 'uLightSpaceMatrix'),
                shadowMap: gl.getUniformLocation(program, 'uShadowMap'),
                texture: gl.getUniformLocation(program, 'uTexture'),
                useShadows: gl.getUniformLocation(program, 'uUseShadows'),
                debugShadows: gl.getUniformLocation(program, 'uDebugShadows'),
                useTexture: gl.getUniformLocation(program, 'uUseTexture'),
                debugTexture: gl.getUniformLocation(program, 'uDebugTexture'),
                shadowFactor: gl.getUniformLocation(program, 'uShadowFactor'),
                emissiveStrength: gl.getUniformLocation(program, 'uEmissiveStrength')
            }
        };

        return programInfo;
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
