class Plane {
    static createGeometry(width = 10, depth = 10, subdivisions = 1) {
        const positions = [];
        const colors = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        const segmentWidth = width / subdivisions;
        const segmentDepth = depth / subdivisions;

        for (let z = 0; z <= subdivisions; z++) {
            for (let x = 0; x <= subdivisions; x++) {
                const xPos = (x * segmentWidth) - (width / 2);
                const zPos = (z * segmentDepth) - (depth / 2);
                
                positions.push(xPos, 0, zPos);
                
                const isEven = (x + z) % 2 === 0;
                if (isEven) {
                    colors.push(0.3, 0.3, 0.3);
                } else {
                    colors.push(0.5, 0.5, 0.5);
                }
                
                normals.push(0, 1, 0);
                
                const u = x / subdivisions;
                const v = z / subdivisions;
                texCoords.push(u * (width / 10), v * (depth / 10));
            }
        }

        for (let z = 0; z < subdivisions; z++) {
            for (let x = 0; x < subdivisions; x++) {
                const topLeft = z * (subdivisions + 1) + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * (subdivisions + 1) + x;
                const bottomRight = bottomLeft + 1;

                indices.push(topLeft, bottomLeft, topRight);
                indices.push(topRight, bottomLeft, bottomRight);
            }
        }

        const result = {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            vertexCount: indices.length
        };
        
        console.log('Plane.createGeometry returning:', {
            hasTexCoords: !!result.texCoords,
            texCoordsLength: result.texCoords.length,
            texCoordsArrayLength: texCoords.length
        });
        
        return result;
    }
}
