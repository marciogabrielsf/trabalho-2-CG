# Arquitetura do Sistema

## Visão Geral

O projeto foi estruturado seguindo princípios de código limpo e organização modular, com separação clara de responsabilidades.

## Módulos Principais

### 1. Matemática Linear (`src/math/`)

#### `vector3.js`
Operações com vetores 3D essenciais para cálculos de física e geometria:
- Adição, subtração, multiplicação escalar
- Produto escalar (dot) e vetorial (cross)
- Normalização e magnitude
- Utilizado para posições, direções e cores

#### `matrix4.js`
Transformações 3D e projeções:
- Identidade e operações matriciais
- Matriz de perspectiva (projection)
- Matriz lookAt (view)
- Transformações: translação, rotação (X, Y, Z), escala
- Multiplicação de matrizes para composição

### 2. Sistema de Câmera (`src/camera/`)

#### `camera.js`
Implementa câmera em primeira pessoa:
- **Projeção**: Perspectiva configurável (FOV, aspect, near, far)
- **View Matrix**: Calculada com lookAt usando posição e rotação
- **Controles**: WASD para movimento, setas para rotação, Q/E vertical
- **Features**: Sprint (Shift), limitação de pitch, movimento suave

### 3. Geometrias (`src/geometry/`)

#### `cube.js`
Define geometria do cubo manualmente:
- 24 vértices (4 por face, 6 faces)
- Cores diferentes por face (RGB)
- Normais corretas para iluminação
- 36 índices (2 triângulos por face)

#### `plane.js`
Cria plano subdividido:
- Geração procedural com subdivisões
- Padrão xadrez nas cores
- Normais apontando para cima (0, 1, 0)
- Útil como chão ou superfície base

### 4. Sistema de Renderização (`src/renderer/`)

#### `shader.js`
Gerenciamento de shaders GLSL:
- **Vertex Shader**: Transformação MVP, passa atributos para fragment
- **Fragment Shader**: Iluminação Phong (ambient, diffuse, specular)
- Compilação e linkagem de programas
- Locations de atributos e uniforms

#### `renderer.js`
Gerencia renderização WebGL:
- Inicialização do contexto GL
- Criação e gerenciamento de buffers
- Sistema de objetos renderizáveis
- Cálculo de matrizes modelo
- Iluminação dinâmica

### 5. Sistema de Input (`src/input/`)

#### `input.js`
Captura eventos de entrada:
- Teclado: keydown/keyup com Map
- Mouse: posição, delta e botões
- Prevenção de states inválidos (blur)
- API simples: `isKeyDown()`, `isMouseButtonDown()`

### 6. Aplicação Principal (`src/`)

#### `main.js`
Loop principal e inicialização:
- Classe Application gerencia todo o sistema
- Inicialização de WebGL e componentes
- Loop de atualização/renderização (requestAnimationFrame)
- Setup da cena inicial
- Cálculo de deltaTime para animações

## Fluxo de Dados

```
Input (teclado/mouse)
    ↓
Camera.update() - Atualiza posição e rotação
    ↓
Application.update() - Atualiza objetos e luz
    ↓
Renderer.render()
    ↓
    ├─ Calcula View Matrix (Camera.getViewMatrix)
    ├─ Calcula Projection Matrix (Camera.getProjectionMatrix)
    ├─ Para cada objeto:
    │   ├─ Calcula Model Matrix (transformações)
    │   ├─ Envia uniforms para shader
    │   └─ Renderiza com drawElements
    └─ Output no canvas
```

## Pipeline de Renderização

### 1. Vertex Shader
```glsl
Position (local) 
    → Model Matrix (world space)
    → View Matrix (camera space)
    → Projection Matrix (clip space)
    → gl_Position
```

### 2. Rasterização
Interpolação de atributos entre vértices

### 3. Fragment Shader
```glsl
Para cada pixel:
    - Calcula Phong lighting
    - Ambient: constante
    - Diffuse: normal · lightDir
    - Specular: (view · reflect)^shininess
    - Combina com cor do vértice
```

## Modelo de Iluminação Phong

### Componentes

1. **Ambient (Ia)**
   - Iluminação base, independente de direção
   - `Ia = 0.3 * lightColor`

2. **Diffuse (Id)**
   - Depende do ângulo entre normal e luz
   - `Id = max(normal · lightDir, 0) * lightColor`

3. **Specular (Is)**
   - Reflexão especular, depende da visão
   - `Is = 0.5 * (view · reflect)^32 * lightColor`

4. **Total**
   - `color = (Ia + Id + Is) * objectColor`

## Transformações 3D

### Hierarquia de Matrizes

```
Model Matrix = Translation × RotationY × RotationX × RotationZ × Scale
View Matrix = lookAt(cameraPos, target, up)
Projection Matrix = perspective(fov, aspect, near, far)

MVP Matrix = Projection × View × Model
```

### Ordem de Aplicação
1. Scale - Ajusta tamanho
2. Rotate - Rotaciona (Z → X → Y)
3. Translate - Posiciona no mundo
4. View - Transforma para espaço da câmera
5. Projection - Projeta em 2D

## Padrões de Código

### Princípios Seguidos

1. **Single Responsibility**: Cada classe tem uma responsabilidade clara
2. **Encapsulamento**: Estados internos protegidos, APIs públicas limpas
3. **Composição**: Objetos compostos de componentes menores
4. **Imutabilidade**: Operações de Vector3/Matrix4 retornam novos objetos
5. **Separação de Concerns**: Lógica, rendering, input separados

### Convenções

- Classes com PascalCase
- Métodos e variáveis com camelCase
- Constantes em UPPER_SNAKE_CASE
- Métodos estáticos para operações puras
- Métodos de instância para operações com estado

## WebGL State Management

### Estados Configurados

```javascript
gl.clearColor(0.1, 0.1, 0.15, 1.0)  // Cor de fundo
gl.enable(gl.DEPTH_TEST)             // Teste de profundidade
gl.depthFunc(gl.LEQUAL)              // Função de profundidade
gl.enable(gl.CULL_FACE)              // Culling de faces
gl.cullFace(gl.BACK)                 // Culpa faces traseiras
```

### Buffers Utilizados

- **Position Buffer**: Coordenadas dos vértices (x, y, z)
- **Color Buffer**: Cores RGB dos vértices
- **Normal Buffer**: Normais para iluminação
- **Index Buffer**: Índices para geometria indexada

## Extensibilidade

### Como Adicionar Novos Objetos

```javascript
const geometry = CustomGeometry.create();
const object = renderer.addObject(
    geometry,
    new Vector3(x, y, z),      // position
    new Vector3(rx, ry, rz),   // rotation
    new Vector3(sx, sy, sz)    // scale
);
object.angularVelocity = new Vector3(vx, vy, vz);
```

### Como Adicionar Novas Geometrias

```javascript
class NewGeometry {
    static createGeometry() {
        return {
            positions: Float32Array,
            colors: Float32Array,
            normals: Float32Array,
            indices: Uint16Array,
            vertexCount: number
        };
    }
}
```

## Performance

### Otimizações Implementadas

1. **Float32Array**: Arrays tipados para performance
2. **Face Culling**: Não renderiza faces traseiras
3. **Index Buffers**: Reutiliza vértices compartilhados
4. **Static Draw**: Dados geométricos marcados como estáticos
5. **RequestAnimationFrame**: Sincronização com V-Sync

### Possíveis Melhorias

- Frustum culling para objetos fora da visão
- Level of Detail (LOD) para objetos distantes
- Instanced rendering para múltiplos objetos iguais
- Texture atlas para reduzir mudanças de estado
- Occlusion culling para objetos obstruídos

## Conclusão

A arquitetura foi projetada para ser:
- **Modular**: Componentes independentes e reutilizáveis
- **Extensível**: Fácil adicionar novas features
- **Legível**: Código auto-documentado e bem estruturado
- **Performática**: Uso eficiente de WebGL e arrays tipados
- **Educacional**: Implementação clara dos conceitos fundamentais
