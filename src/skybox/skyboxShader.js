class SkyboxShader {
    static createVertexShader() {
        return `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform float uTime;
            
            varying vec3 vColor;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            void main() {
                mat4 viewNoTranslation = uViewMatrix;
                viewNoTranslation[3][0] = 0.0;
                viewNoTranslation[3][1] = 0.0;
                viewNoTranslation[3][2] = 0.0;
                
                vec4 pos = uProjectionMatrix * viewNoTranslation * vec4(aPosition, 1.0);
                gl_Position = pos.xyww;
                
                vColor = aColor;
                vPosition = normalize(aPosition);
                vWorldPosition = aPosition;
            }
        `;
    }

    static createFragmentShader() {
        return `
            precision mediump float;
            
            varying vec3 vColor;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            uniform float uTime;
            
            // Função de ruído simplificada
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 4; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            void main() {
                vec3 direction = normalize(vWorldPosition);
                
                // Gradiente do céu (azul no topo, mais claro no horizonte)
                float horizonFactor = abs(direction.y);
                vec3 topColor = vec3(0.3, 0.5, 0.9);      // Azul escuro no topo
                vec3 horizonColor = vec3(0.6, 0.75, 0.95); // Azul claro no horizonte
                vec3 skyColor = mix(horizonColor, topColor, horizonFactor);
                
                // Adicionar nuvens apenas na parte superior
                if(direction.y > -0.1) {
                    vec2 cloudUV = direction.xz / (direction.y + 0.3) * 0.5;
                    cloudUV += uTime * 0.01; // Movimento lento das nuvens
                    
                    float cloudNoise = fbm(cloudUV * 3.0);
                    cloudNoise = smoothstep(0.4, 0.8, cloudNoise);
                    
                    // Nuvens brancas semi-transparentes
                    vec3 cloudColor = vec3(1.0, 1.0, 1.0);
                    skyColor = mix(skyColor, cloudColor, cloudNoise * 0.7);
                }
                
                // Adicionar um leve brilho no horizonte (efeito de sol)
                float sunGlow = max(0.0, dot(direction, normalize(vec3(0.5, 0.3, -0.5))));
                sunGlow = pow(sunGlow, 8.0) * 0.3;
                skyColor += vec3(1.0, 0.9, 0.7) * sunGlow;
                
                gl_FragColor = vec4(skyColor, 1.0);
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
                projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
                time: gl.getUniformLocation(program, 'uTime')
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
