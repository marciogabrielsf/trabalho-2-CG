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
            
            #define MAX_LIGHTS 3
            
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vFragPos;
            varying vec4 vFragPosLightSpace;
            varying vec2 vTexCoord;
            
            uniform vec3 uLightPositions[MAX_LIGHTS];
            uniform vec3 uLightColors[MAX_LIGHTS];
            uniform int uNumLights;
            uniform vec3 uViewPosition;
            uniform sampler2D uShadowMap;
            uniform sampler2D uTexture;
            uniform int uUseShadows;
            uniform int uDebugShadows;
            uniform int uUseTexture;
            uniform int uDebugTexture;
            
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
                
                vec3 norm = normalize(vNormal);
                vec3 viewDir = normalize(uViewPosition - vFragPos);
                
                // Ambient light (global)
                vec3 ambient = 0.2 * vec3(1.0, 1.0, 1.0);
                
                // Accumulate lighting from all lights
                vec3 diffuse = vec3(0.0);
                vec3 specular = vec3(0.0);
                
                // Safeguard: if no lights, use basic lighting
                if(uNumLights > 0) {
                    for(int i = 0; i < MAX_LIGHTS; i++) {
                        if(i >= uNumLights) break;
                        
                        vec3 lightDir = normalize(uLightPositions[i] - vFragPos);
                        
                        // Diffuse
                        float diff = max(dot(norm, lightDir), 0.0);
                        
                        // Attenuation based on distance
                        float distance = length(uLightPositions[i] - vFragPos);
                        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
                        
                        diffuse += diff * uLightColors[i] * attenuation;
                        
                        // Specular
                        vec3 reflectDir = reflect(-lightDir, norm);
                        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                        specular += 0.5 * spec * uLightColors[i] * attenuation;
                    }
                } else {
                    // Fallback lighting
                    diffuse = vec3(0.8);
                }
                
                float shadow = 0.0;
                if(uUseShadows == 1 && uNumLights > 0) {
                    vec3 lightDir = normalize(uLightPositions[0] - vFragPos);
                    shadow = calculateShadow(vFragPosLightSpace, norm, lightDir);
                }
                
                vec3 lighting = ambient + (1.0 - shadow) * (diffuse + specular);
                vec3 result = lighting * baseColor;
                result = clamp(result, 0.0, 1.0);
                
                gl_FragColor = vec4(result, 1.0);
            }
        `;
    }

    static compile(gl) {
        const vertexShaderSource = this.createVertexShader();
        const fragmentShaderSource = this.createFragmentShader();

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        if (!vertexShader) {
            console.error("Failed to compile vertex shader");
            return null;
        }

        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!fragmentShader) {
            console.error("Failed to compile fragment shader");
            return null;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Bind attribute locations explicitly for ANGLE/Chromium compatibility
        gl.bindAttribLocation(program, 0, "aPosition");
        gl.bindAttribLocation(program, 1, "aColor");
        gl.bindAttribLocation(program, 2, "aNormal");
        gl.bindAttribLocation(program, 3, "aTexCoord");

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            return null;
        }

        // Get uniform array locations for multiple lights
        const lightPositions = [];
        const lightColors = [];
        for (let i = 0; i < 3; i++) {
            const posLoc = gl.getUniformLocation(program, `uLightPositions[${i}]`);
            const colLoc = gl.getUniformLocation(program, `uLightColors[${i}]`);
            lightPositions.push(posLoc);
            lightColors.push(colLoc);
        }

        const programInfo = {
            program: program,
            attribLocations: {
                position: gl.getAttribLocation(program, "aPosition"),
                color: gl.getAttribLocation(program, "aColor"),
                normal: gl.getAttribLocation(program, "aNormal"),
                texCoord: gl.getAttribLocation(program, "aTexCoord"),
            },
            uniformLocations: {
                modelMatrix: gl.getUniformLocation(program, "uModelMatrix"),
                viewMatrix: gl.getUniformLocation(program, "uViewMatrix"),
                projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
                lightPositions: lightPositions,
                lightColors: lightColors,
                numLights: gl.getUniformLocation(program, "uNumLights"),
                viewPosition: gl.getUniformLocation(program, "uViewPosition"),
                lightSpaceMatrix: gl.getUniformLocation(program, "uLightSpaceMatrix"),
                shadowMap: gl.getUniformLocation(program, "uShadowMap"),
                texture: gl.getUniformLocation(program, "uTexture"),
                useShadows: gl.getUniformLocation(program, "uUseShadows"),
                debugShadows: gl.getUniformLocation(program, "uDebugShadows"),
                useTexture: gl.getUniformLocation(program, "uUseTexture"),
                debugTexture: gl.getUniformLocation(program, "uDebugTexture"),
            },
        };

        return programInfo;
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
