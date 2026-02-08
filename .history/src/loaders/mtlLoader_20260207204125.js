class MTLLoader {
    static async load(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`MTL file not found: ${url}`);
                return null;
            }
            
            const text = await response.text();
            return this.parse(text);
        } catch (error) {
            console.warn(`Error loading MTL file ${url}:`, error);
            return null;
        }
    }

    static parse(text) {
        const materials = new Map();
        let currentMaterial = null;

        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '' || line.startsWith('#')) {
                continue;
            }

            const parts = line.split(/\s+/);
            const keyword = parts[0];

            switch (keyword) {
                case 'newmtl':
                    const materialName = parts[1];
                    currentMaterial = {
                        name: materialName,
                        ambient: [0.2, 0.2, 0.2],
                        diffuse: [0.8, 0.8, 0.8],
                        specular: [0.5, 0.5, 0.5],
                        emissive: [0.0, 0.0, 0.0],
                        shininess: 32.0,
                        opacity: 1.0,
                        illum: 2
                    };
                    materials.set(materialName, currentMaterial);
                    break;

                case 'Ka':
                    if (currentMaterial) {
                        currentMaterial.ambient = [
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ];
                    }
                    break;

                case 'Kd':
                    if (currentMaterial) {
                        currentMaterial.diffuse = [
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ];
                    }
                    break;

                case 'Ks':
                    if (currentMaterial) {
                        currentMaterial.specular = [
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ];
                    }
                    break;

                case 'Ke':
                    if (currentMaterial) {
                        currentMaterial.emissive = [
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ];
                    }
                    break;

                case 'Ns':
                    if (currentMaterial) {
                        currentMaterial.shininess = parseFloat(parts[1]);
                    }
                    break;

                case 'd':
                case 'Tr':
                    if (currentMaterial) {
                        currentMaterial.opacity = parseFloat(parts[1]);
                    }
                    break;

                case 'illum':
                    if (currentMaterial) {
                        currentMaterial.illum = parseInt(parts[1]);
                    }
                    break;

                case 'map_Kd':
                    if (currentMaterial) {
                        // Extract texture path (may have spaces)
                        const texturePath = line.substring(line.indexOf(' ') + 1).trim();
                        currentMaterial.map_Kd = texturePath;
                    }
                    break;

                case 'map_Ks':
                    if (currentMaterial) {
                        const texturePath = line.substring(line.indexOf(' ') + 1).trim();
                        currentMaterial.map_Ks = texturePath;
                    }
                    break;

                case 'map_Ka':
                    if (currentMaterial) {
                        const texturePath = line.substring(line.indexOf(' ') + 1).trim();
                        currentMaterial.map_Ka = texturePath;
                    }
                    break;
            }
        }

        console.log(`MTL Parser: Loaded ${materials.size} materials`);
        return materials;
    }

    static createDefaultMaterial() {
        return {
            name: 'default',
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.8, 0.8, 0.8],
            specular: [0.5, 0.5, 0.5],
            emissive: [0.0, 0.0, 0.0],
            shininess: 32.0,
            opacity: 1.0,
            illum: 2
        };
    }
}
