class SkyboxGeometry {
    static createGeometry() {
        const size = 50;
        
        const positions = new Float32Array([
            -size, -size,  size,   size, -size,  size,   size,  size,  size,  -size,  size,  size,
            -size, -size, -size,  -size,  size, -size,   size,  size, -size,   size, -size, -size,
            -size,  size, -size,  -size,  size,  size,   size,  size,  size,   size,  size, -size,
            -size, -size, -size,   size, -size, -size,   size, -size,  size,  -size, -size,  size,
             size, -size, -size,   size,  size, -size,   size,  size,  size,   size, -size,  size,
            -size, -size, -size,  -size, -size,  size,  -size,  size,  size,  -size,  size, -size
        ]);

        const colors = new Float32Array(72);
        for (let i = 0; i < 24; i++) {
            const faceIndex = Math.floor(i / 4);
            switch(faceIndex) {
                case 0:
                    colors[i * 3 + 0] = 0.5;
                    colors[i * 3 + 1] = 0.7;
                    colors[i * 3 + 2] = 1.0;
                    break;
                case 1:
                    colors[i * 3 + 0] = 0.4;
                    colors[i * 3 + 1] = 0.6;
                    colors[i * 3 + 2] = 0.9;
                    break;
                case 2:
                    colors[i * 3 + 0] = 0.6;
                    colors[i * 3 + 1] = 0.8;
                    colors[i * 3 + 2] = 1.0;
                    break;
                case 3:
                    colors[i * 3 + 0] = 0.3;
                    colors[i * 3 + 1] = 0.5;
                    colors[i * 3 + 2] = 0.7;
                    break;
                case 4:
                    colors[i * 3 + 0] = 0.4;
                    colors[i * 3 + 1] = 0.6;
                    colors[i * 3 + 2] = 0.8;
                    break;
                case 5:
                    colors[i * 3 + 0] = 0.35;
                    colors[i * 3 + 1] = 0.55;
                    colors[i * 3 + 2] = 0.75;
                    break;
            }
        }

        const normals = new Float32Array([
             0.0,  0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0,
             0.0,  0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0,
             0.0, -1.0,  0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,
             0.0,  1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,
            -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0
        ]);

        const indices = new Uint16Array([
            0,  2,  1,    0,  3,  2,
            4,  5,  6,    4,  6,  7,
            8,  9, 10,    8, 10, 11,
            12, 14, 13,   12, 15, 14,
            16, 17, 18,   16, 18, 19,
            20, 22, 21,   20, 23, 22
        ]);

        return {
            positions,
            colors,
            normals,
            indices,
            vertexCount: indices.length
        };
    }
}
