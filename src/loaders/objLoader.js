class OBJLoader {
    static async load(url, loadMaterials = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load OBJ file: ${url}`);
            }
            
            const text = await response.text();
            const geometry = this.parse(text);
            
            if (loadMaterials && geometry.mtllib) {
                const mtlUrl = url.substring(0, url.lastIndexOf('/') + 1) + geometry.mtllib;
                geometry.materials = await MTLLoader.load(mtlUrl);
            }
            
            return geometry;
        } catch (error) {
            console.error('Error loading OBJ file:', error);
            throw error;
        }
    }

    static parse(objText) {
        const lines = objText.split('\n');
        
        const vertices = [];
        const normals = [];
        const texCoords = [];
        
        const faceVertices = [];
        const faceNormals = [];
        const faceTexCoords = [];
        const faceMaterials = [];
        
        let currentMaterial = null;
        let mtllib = null;
        
        for (let line of lines) {
            line = line.trim();
            
            if (line.length === 0 || line.startsWith('#')) {
                continue;
            }
            
            const parts = line.split(/\s+/);
            const type = parts[0];
            
            switch (type) {
                case 'mtllib':
                    mtllib = parts[1];
                    break;
                    
                case 'usemtl':
                    currentMaterial = parts[1];
                    break;
                    
                case 'v':
                    vertices.push({
                        x: parseFloat(parts[1]),
                        y: parseFloat(parts[2]),
                        z: parseFloat(parts[3])
                    });
                    break;
                    
                case 'vn':
                    normals.push({
                        x: parseFloat(parts[1]),
                        y: parseFloat(parts[2]),
                        z: parseFloat(parts[3])
                    });
                    break;
                    
                case 'vt':
                    texCoords.push({
                        u: parseFloat(parts[1]),
                        v: parseFloat(parts[2])
                    });
                    break;
                    
                case 'f':
                    this.parseFace(parts, vertices, normals, texCoords, 
                                  faceVertices, faceNormals, faceTexCoords, 
                                  faceMaterials, currentMaterial);
                    break;
            }
        }
        
        const geometry = this.buildGeometry(faceVertices, faceNormals, faceTexCoords, faceMaterials);
        geometry.mtllib = mtllib;
        return geometry;
    }

    static parseFace(parts, vertices, normals, texCoords, 
                     faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial) {
        const faceData = [];
        
        for (let i = 1; i < parts.length; i++) {
            const vertexData = parts[i].split('/');
            
            const vIndex = parseInt(vertexData[0]) - 1;
            const vtIndex = vertexData[1] ? parseInt(vertexData[1]) - 1 : -1;
            const vnIndex = vertexData[2] ? parseInt(vertexData[2]) - 1 : -1;
            
            faceData.push({ vIndex, vtIndex, vnIndex });
        }
        
        if (faceData.length === 3) {
            this.addTriangle(faceData, vertices, normals, texCoords,
                           faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial);
        } else if (faceData.length === 4) {
            const triangle1 = [faceData[0], faceData[1], faceData[2]];
            const triangle2 = [faceData[0], faceData[2], faceData[3]];
            
            this.addTriangle(triangle1, vertices, normals, texCoords,
                           faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial);
            this.addTriangle(triangle2, vertices, normals, texCoords,
                           faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial);
        } else if (faceData.length > 4) {
            for (let i = 1; i < faceData.length - 1; i++) {
                const triangle = [faceData[0], faceData[i], faceData[i + 1]];
                this.addTriangle(triangle, vertices, normals, texCoords,
                               faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial);
            }
        }
    }

    static addTriangle(triangleData, vertices, normals, texCoords,
                      faceVertices, faceNormals, faceTexCoords, faceMaterials, currentMaterial) {
        for (const data of triangleData) {
            const vertex = vertices[data.vIndex];
            faceVertices.push(vertex.x, vertex.y, vertex.z);
            
            if (data.vnIndex >= 0 && normals[data.vnIndex]) {
                const normal = normals[data.vnIndex];
                faceNormals.push(normal.x, normal.y, normal.z);
            } else {
                faceNormals.push(0, 1, 0);
            }
            
            if (data.vtIndex >= 0 && texCoords[data.vtIndex]) {
                const texCoord = texCoords[data.vtIndex];
                faceTexCoords.push(texCoord.u, texCoord.v);
            } else {
                faceTexCoords.push(0, 0);
            }
            
            if (faceMaterials) {
                faceMaterials.push(currentMaterial || 'default');
            }
        }
    }

    static buildGeometry(faceVertices, faceNormals, faceTexCoords, faceMaterials) {
        const positions = new Float32Array(faceVertices);
        const normals = new Float32Array(faceNormals);
        const texCoords = new Float32Array(faceTexCoords);
        
        const vertexCount = positions.length / 3;
        const colors = new Float32Array(vertexCount * 3);
        for (let i = 0; i < vertexCount; i++) {
            colors[i * 3 + 0] = 0.8;
            colors[i * 3 + 1] = 0.8;
            colors[i * 3 + 2] = 0.8;
        }
        
        const indices = new Uint16Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            indices[i] = i;
        }
        
        if (this.hasInvalidNormals(normals)) {
            this.computeNormals(positions, normals);
        }
        
        return {
            positions,
            colors,
            normals,
            texCoords,
            indices,
            vertexCount: indices.length,
            faceMaterials
        };
    }
    
    static applyMaterialColors(geometry, materials) {
        if (!geometry.faceMaterials || !materials) {
            return;
        }
        
        const colors = geometry.colors;
        const faceMaterials = geometry.faceMaterials;
        
        for (let i = 0; i < faceMaterials.length; i++) {
            const materialName = faceMaterials[i];
            const material = materials.get(materialName);
            
            if (material && material.diffuse) {
                colors[i * 3 + 0] = material.diffuse[0];
                colors[i * 3 + 1] = material.diffuse[1];
                colors[i * 3 + 2] = material.diffuse[2];
            }
        }
        
        console.log(`Applied materials to ${faceMaterials.length} vertices`);
    }

    static hasInvalidNormals(normals) {
        for (let i = 0; i < normals.length; i += 3) {
            const x = normals[i];
            const y = normals[i + 1];
            const z = normals[i + 2];
            const length = Math.sqrt(x * x + y * y + z * z);
            if (length > 0.01) {
                return false;
            }
        }
        return true;
    }

    static computeNormals(positions, normals) {
        for (let i = 0; i < positions.length; i += 9) {
            const v0x = positions[i + 0];
            const v0y = positions[i + 1];
            const v0z = positions[i + 2];
            
            const v1x = positions[i + 3];
            const v1y = positions[i + 4];
            const v1z = positions[i + 5];
            
            const v2x = positions[i + 6];
            const v2y = positions[i + 7];
            const v2z = positions[i + 8];
            
            const edge1x = v1x - v0x;
            const edge1y = v1y - v0y;
            const edge1z = v1z - v0z;
            
            const edge2x = v2x - v0x;
            const edge2y = v2y - v0y;
            const edge2z = v2z - v0z;
            
            const normalX = edge1y * edge2z - edge1z * edge2y;
            const normalY = edge1z * edge2x - edge1x * edge2z;
            const normalZ = edge1x * edge2y - edge1y * edge2x;
            
            const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
            
            if (length > 0) {
                const nx = normalX / length;
                const ny = normalY / length;
                const nz = normalZ / length;
                
                for (let j = 0; j < 3; j++) {
                    normals[i + j * 3 + 0] = nx;
                    normals[i + j * 3 + 1] = ny;
                    normals[i + j * 3 + 2] = nz;
                }
            }
        }
    }

    static getStats(geometry) {
        const vertexCount = geometry.positions.length / 3;
        const triangleCount = geometry.indices.length / 3;
        
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < geometry.positions.length; i += 3) {
            const x = geometry.positions[i];
            const y = geometry.positions[i + 1];
            const z = geometry.positions[i + 2];
            
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }
        
        return {
            vertices: vertexCount,
            triangles: triangleCount,
            bounds: {
                min: { x: minX, y: minY, z: minZ },
                max: { x: maxX, y: maxY, z: maxZ }
            }
        };
    }
}
