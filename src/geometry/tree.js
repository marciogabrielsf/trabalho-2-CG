class Tree {
    // Criar geometria de um cilindro (tronco)
    static createTrunkGeometry(radiusBottom = 0.3, radiusTop = 0.25, height = 2, segments = 12) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

        const brownColor = [0.4, 0.25, 0.1]; // Marrom para o tronco

        // Criar vértices do cilindro
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);

            // Vértice inferior
            positions.push(
                radiusBottom * cosAngle,
                0,
                radiusBottom * sinAngle
            );
            normals.push(cosAngle, 0, sinAngle);
            colors.push(...brownColor);

            // Vértice superior
            positions.push(
                radiusTop * cosAngle,
                height,
                radiusTop * sinAngle
            );
            normals.push(cosAngle, 0, sinAngle);
            colors.push(...brownColor);
        }

        // Criar faces do cilindro
        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }

        // Tampa inferior
        const bottomCenter = positions.length / 3;
        positions.push(0, 0, 0);
        normals.push(0, -1, 0);
        colors.push(...brownColor);

        for (let i = 0; i < segments; i++) {
            const next = i + 1;
            indices.push(bottomCenter, i * 2, next * 2);
        }

        // Tampa superior
        const topCenter = positions.length / 3;
        positions.push(0, height, 0);
        normals.push(0, 1, 0);
        colors.push(...brownColor);

        for (let i = 0; i < segments; i++) {
            const next = i + 1;
            indices.push(topCenter, next * 2 + 1, i * 2 + 1);
        }

        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            indices: new Uint16Array(indices),
            vertexCount: indices.length
        };
    }

    // Criar geometria de um cone (copa da árvore)
    static createFoliageGeometry(radius = 1.5, height = 3, segments = 12) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

        const greenColor = [0.1, 0.5, 0.1]; // Verde para a folhagem

        // Vértice do topo do cone
        const topIndex = 0;
        positions.push(0, height, 0);
        normals.push(0, 1, 0);
        colors.push(...greenColor);

        // Vértices da base
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            
            positions.push(x, 0, z);
            
            // Normal apontando para fora e para cima
            const nx = Math.cos(angle);
            const nz = Math.sin(angle);
            normals.push(nx, 0.5, nz);
            colors.push(...greenColor);
        }

        // Criar faces laterais do cone
        for (let i = 1; i <= segments; i++) {
            indices.push(topIndex, i, i + 1);
        }

        // Tampa da base
        const centerIndex = positions.length / 3;
        positions.push(0, 0, 0);
        normals.push(0, -1, 0);
        colors.push(...greenColor);

        for (let i = 1; i <= segments; i++) {
            indices.push(centerIndex, i + 1, i);
        }

        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            indices: new Uint16Array(indices),
            vertexCount: indices.length
        };
    }
}
