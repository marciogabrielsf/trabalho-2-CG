# 📚 Checklist de Requisitos do Trabalho

## ✅ Status de Implementação

### a) Requisitos Gerais (OBRIGATÓRIOS)

| Requisito | Status | Arquivo | Descrição |
|-----------|--------|---------|-----------|
| **I. Câmera com projeção perspectiva** | ✅ COMPLETO | `camera.js` | Câmera primeira pessoa com projeção perspectiva (FOV 45°) |
| **II. Iluminação Phong + Luz Móvel** | 🟡 PARCIAL | `shader.js` | Modelo Phong implementado, precisa adicionar movimento da luz |
| **III. Objeto animado** | ✅ COMPLETO | `main.js:100-118` | 3 cubos com rotação contínua (transformações geométricas) |
| **IV. Objeto com textura** | ✅ COMPLETO | `main.js:69-89` | Plano do chão com textura de grama |
| **V. Objeto com cor sólida** | ✅ COMPLETO | `main.js:91-118` | Cubos coloridos sem textura |
| **VI. WebGL puro** | ✅ COMPLETO | Todo o projeto | Zero bibliotecas gráficas de alto nível |
| **VII. Biblioteca auxiliar (álgebra)** | ✅ COMPLETO | `math/` | Implementação própria de Matrix4 e Vector3 |
| **VIII. Eventos de teclado** | ✅ COMPLETO | `input.js` | InputManager para captura de eventos |

### b) Requisitos do Passeio Virtual 3D

| Requisito | Status | Arquivo | Descrição |
|-----------|--------|---------|-----------|
| **I. Câmera primeira pessoa** | ✅ COMPLETO | `camera.js` | Sistema lookAt com movimento baseado em forward/right vectors |
| **II. Controle via teclado** | ✅ COMPLETO | `camera.js:48-105` | WASD (mover), Setas (rotacionar), Q/E (subir/descer), Shift (correr) |
| **III. Sem colisão** | ✅ COMPLETO | N/A | Não foi implementado (não é necessário) |
| **IV. Cenário manual** | ✅ COMPLETO | `main.js:setupScene()` | Plano, cubos criados por código |
| **V. Leitor OBJ próprio** | ✅ COMPLETO | `objLoader.js` | Parser completo de arquivos .OBJ sem bibliotecas externas |
| **VII. Uso de modelos externos** | ✅ COMPLETO | `main.js:123-149` | Carregamento do modelo nc2a.obj |

## 🎯 Resumo

- **Requisitos Obrigatórios**: 7/8 completos (falta apenas movimento da luz)
- **Requisitos Opcionais**: Todos implementados!
- **Leitor OBJ**: ✅ Implementado do zero (permite usar modelos do Blender)

## 🔧 Ajuste Necessário

### Adicionar Movimentação da Luz

A iluminação Phong está implementada corretamente, mas a luz está estática. Precisa adicionar animação à posição da luz.

**Onde**: `main.js` no método `update()` ou `render()`

**Como**: Criar uma animação circular ou orbital para `uLightPosition`

## 📝 Estrutura do Projeto

```
trabalho-2-CG/
├── index.html              # HTML principal com canvas
├── assets/
│   ├── models/
│   │   └── nc2a.obj       # Modelo 3D externo
│   └── textures/
│       └── grass.jpg      # Textura do chão
└── src/
    ├── main.js            # Aplicação principal
    ├── camera/
    │   └── camera.js      # Câmera primeira pessoa
    ├── geometry/
    │   ├── cube.js        # Geometria do cubo
    │   └── plane.js       # Geometria do plano
    ├── input/
    │   └── input.js       # Gerenciador de input
    ├── loaders/
    │   ├── objLoader.js   # 🌟 Parser OBJ próprio
    │   └── mtlLoader.js   # Parser MTL para materiais
    ├── math/
    │   ├── matrix4.js     # Biblioteca de matrizes 4x4
    │   └── vector3.js     # Biblioteca de vetores 3D
    ├── renderer/
    │   ├── renderer.js    # Sistema de renderização
    │   └── shader.js      # Shaders GLSL (Phong)
    ├── shadows/
    │   ├── shadowMap.js   # Sistema de sombras
    │   └── shadowShader.js
    └── skybox/
        ├── skybox.js      # Sistema de skybox
        └── skyboxShader.js
```

## 🎓 Conceitos Implementados

### 1. **Iluminação Phong** (shader.js)
```glsl
// Componente Ambiente
vec3 ambient = 0.3 * uLightColor;

// Componente Difuso
float diff = max(dot(norm, lightDir), 0.0);
vec3 diffuse = diff * uLightColor;

// Componente Especular
float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
vec3 specular = 0.5 * spec * uLightColor;
```

### 2. **Transformações Geométricas** (main.js)
```javascript
// Rotação animada dos cubos
cube.rotation.x += cube.angularVelocity.x * deltaTime;
cube.rotation.y += cube.angularVelocity.y * deltaTime;
cube.rotation.z += cube.angularVelocity.z * deltaTime;
```

### 3. **Parser OBJ Próprio** (objLoader.js)
- Leitura de vértices (`v`)
- Leitura de normais (`vn`)
- Leitura de coordenadas de textura (`vt`)
- Leitura de faces (`f`)
- Suporte a materiais MTL
- Triangulação automática de polígonos

## 🎮 Controles Implementados

| Tecla | Ação |
|-------|------|
| **W** | Mover para frente |
| **S** | Mover para trás |
| **A** | Mover para esquerda |
| **D** | Mover para direita |
| **Q** | Subir |
| **E** | Descer |
| **Setas** | Rotacionar câmera |
| **Shift** | Correr (2x velocidade) |

## 🚀 Como Executar

1. Iniciar servidor HTTP local (necessário para carregar texturas/modelos)
2. Abrir `index.html` no navegador
3. Usar os controles WASD + Setas para navegar

## 📖 Referências da Aula

- **aula_26.pdf**: Conceitos de iluminação Phong
- **Hello CG.html**: Exemplo de referência com iluminação
- **webgl.js**: Implementação de transformações e texturas
