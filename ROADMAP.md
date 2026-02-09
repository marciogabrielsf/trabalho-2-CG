# Roadmap - Próximas Implementações

Este documento lista as features que podem ser implementadas para completar os requisitos do trabalho e adicionar funcionalidades extras.

## 🎯 Requisitos Obrigatórios Restantes

### 1. Texturas ⏳
- [ ] Implementar carregamento de imagens
- [ ] Adicionar coordenadas UV nas geometrias
- [ ] Criar shader com suporte a texturas
- [ ] Adicionar pelo menos um objeto texturizado

**Implementação sugerida:**
```javascript
// src/texture/texture.js
class TextureLoader {
    static async load(gl, url) {
        // Carregar imagem
        // Criar textura WebGL
        // Configurar parâmetros
    }
}
```

### 2. Leitor de OBJ Próprio ⏳
- [ ] Implementar parser de arquivos .obj
- [ ] Suportar vértices, normais e UVs
- [ ] Criar geometria a partir dos dados parseados
- [ ] Testar com modelos simples

**Implementação sugerida:**
```javascript
// src/loaders/objLoader.js
class OBJLoader {
    static async load(url) {
        // Fetch arquivo
        // Parse linhas (v, vn, vt, f)
        // Construir arrays de geometria
        // Retornar formato compatível
    }
}
```

## 🎨 Melhorias Visuais

### 3. Skybox
- [ ] Criar geometria de cubo invertido
- [ ] Shader específico para skybox
- [ ] Textura de céu ou gradiente procedural

### 4. Sombras
- [ ] Shadow mapping básico
- [ ] Framebuffer para depth texture
- [ ] Segundo passo de renderização

### 5. Partículas
- [ ] Sistema de partículas simples
- [ ] Billboard rendering
- [ ] Aplicar para efeitos (fumaça, fogo, etc)

## 🎮 Gameplay & Interação

### 6. Controle de Mouse para Câmera
- [ ] Pointer lock API
- [ ] Rotação da câmera com mouse
- [ ] Sensibilidade configurável

**Implementação:**
```javascript
// Em camera.js
updateFromMouse(mouseDelta) {
    this.rotation.y -= mouseDelta.x * this.mouseSensitivity;
    this.rotation.x -= mouseDelta.y * this.mouseSensitivity;
    this.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.rotation.x));
}
```

### 7. Colisões Básicas
- [ ] AABB (Axis-Aligned Bounding Box)
- [ ] Detecção de colisão câmera-objeto
- [ ] Resposta física simples

### 8. Interação com Objetos
- [ ] Raycasting para detectar objeto sob cursor
- [ ] Highlight de objetos selecionáveis
- [ ] Ações ao clicar (portas, itens, etc)

## 🏗️ Arquitetura & Código

### 9. Sistema de Entidades
- [ ] Classe Entity base
- [ ] Componentes (Transform, Renderer, etc)
- [ ] Entity Component System (ECS) simplificado

### 10. Gerenciador de Cenas
- [ ] Classe Scene
- [ ] Carregar/descarregar cenas
- [ ] Transições entre cenas

### 11. Material System
- [ ] Classe Material
- [ ] Propriedades: cor, shininess, textura
- [ ] Diferentes tipos de materiais

## 🎨 Shaders Avançados

### 12. Normal Mapping
- [ ] Tangent space
- [ ] Normal maps para detalhes
- [ ] Atualizar shader

### 13. Toon Shading
- [ ] Cel shading para estilo cartoon
- [ ] Discretização de iluminação
- [ ] Outline rendering

### 14. PBR (Physically Based Rendering)
- [ ] Metallic-Roughness workflow
- [ ] Image-Based Lighting (IBL)
- [ ] BRDF mais complexo

## 🌍 Cenário 3D

### 15. Tour Virtual (Opção A)
- [ ] Modelar ambiente interno/externo
- [ ] Múltiplos cômodos ou áreas
- [ ] Portas e transições
- [ ] Pontos de interesse

### 16. Jogo 3D (Opção B)
- [ ] Mecânica de jogo básica
- [ ] Objetivos e score
- [ ] UI com informações
- [ ] Game states (menu, jogando, fim)

## 🔧 Ferramentas & Debug

### 17. Debug Overlay
- [ ] FPS counter
- [ ] Posição da câmera
- [ ] Número de draw calls
- [ ] Wireframe mode

### 18. Editor de Cena
- [ ] Manipular posição de objetos
- [ ] Adicionar/remover objetos
- [ ] Salvar/carregar configuração

### 19. Performance Profiler
- [ ] Timing de renderização
- [ ] Memory usage
- [ ] Gráfico de performance

## 📱 Responsividade & Acessibilidade

### 20. Mobile Support
- [ ] Touch controls
- [ ] Gyroscope para rotação
- [ ] Layout responsivo

### 21. Configurações Gráficas
- [ ] Quality presets (low, medium, high)
- [ ] Toggle de efeitos
- [ ] Ajuste de resolução

## 📚 Documentação & Apresentação

### 22. Video Demonstração
- [ ] Gravar gameplay
- [ ] Narração explicando features
- [ ] Upload no YouTube

### 23. Slides de Apresentação
- [ ] Introdução ao projeto
- [ ] Tecnologias utilizadas
- [ ] Demonstração de features
- [ ] Desafios e aprendizados
- [ ] Conclusão

### 24. Testes
- [ ] Testes unitários para math
- [ ] Testes de integração
- [ ] Testes em diferentes navegadores

## 🎯 Prioridades

### Alta Prioridade (Requisitos obrigatórios)
1. **Texturas** - Requisito essencial
2. **Leitor OBJ** - Apenas se for fazer a opção de jogo
3. **Completar cenário** - Tour virtual OU jogo

### Média Prioridade (Melhorias importantes)
4. Controle de mouse
5. Colisões básicas
6. Debug overlay
7. Video e slides

### Baixa Prioridade (Extras)
8. Skybox
9. Sombras
10. Efeitos visuais avançados

## 📝 Notas de Implementação

### Texturas - Dicas
```javascript
// Coordenadas UV para cubo
const uvs = new Float32Array([
    0, 0,  1, 0,  1, 1,  0, 1,  // Front
    // ... outras faces
]);

// No shader
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
uniform sampler2D uTexture;

// Fragment shader
gl_FragColor = texture2D(uTexture, vTexCoord);
```

### OBJ Parser - Estrutura
```
v x y z          # Vértice
vt u v           # Coordenada textura
vn x y z         # Normal
f v1/vt1/vn1 ... # Face (indices)
```

### Performance Tips
- Usar instancing para objetos repetidos
- Frustum culling para objetos fora da tela
- LOD para objetos distantes
- Texture atlas para reduzir draw calls

## 🏁 Checklist Final

Antes de entregar:
- [ ] Todos os requisitos obrigatórios implementados
- [ ] Código comentado onde necessário
- [ ] README atualizado com instruções
- [ ] Projeto funciona em servidor local
- [ ] Video de demonstração gravado
- [ ] Slides de apresentação prontos
- [ ] Repositório GitHub público
- [ ] Código testado em múltiplos navegadores

## 🚀 Timeline Sugerido

**Semana 1:**
- Implementar texturas
- Começar cenário principal

**Semana 2:**
- Completar cenário
- Implementar OBJ loader (se necessário)
- Adicionar interações

**Semana 3:**
- Polimento visual
- Debug e otimizações
- Gravar video
- Fazer slides

**Última semana:**
- Testes finais
- Documentação
- Preparar entrega
