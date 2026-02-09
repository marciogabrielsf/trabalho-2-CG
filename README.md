# Trabalho 2 - Computação Gráfica

 A ideia do projeto é criar um cenário baseado no prédio NC2A da Universidade Estadual do Ceará, com pistas ao redor e árvores, utilizando um modelo 3D carregado via OBJ. O projeto inclui um menu principal interativo, sistema de portas animadas, iluminação dinâmica, skybox animado e shadow mapping.

## Características

- ✅ **WebGL Puro** - Implementação sem bibliotecas externas, utilizando apenas WebGL 1.0 e JavaScript ES6+
- ✅ **Menu Principal Interativo** - Sistema de estados com cubo 3D rotativo e navegação por teclado
- ✅ **Sistema de Câmera** - Câmera em primeira pessoa com controles WASD + Mouse
- ✅ **Controle de Mouse** - Rotação de câmera com clique direito ou Pointer Lock
- ✅ **Projeção Perspectiva** - Matriz de projeção implementada manualmente
- ✅ **Iluminação Phong** - Modelo de reflexão Phong com luz dinâmica
- ✅ **Skybox Animado** - Céu com nuvens animadas usando funções de ruído (noise)
- ✅ **Shadow Mapping** - Sombras dinâmicas com PCF (Percentage Closer Filtering)
- ✅ **Sistema de Portas** - Portas interativas que abrem/fecham com animação suave
- ✅ **Cenário Completo** - Prédio NC2A, pistas duplas em formato "L", árvores ao redor
- ✅ **Geometrias Customizadas** - Cubos, planos e árvores criados manualmente
- ✅ **Leitor OBJ Próprio** - Parser de arquivos .obj implementado do zero com suporte a objetos múltiplos
- ✅ **Álgebra Linear Própria** - Implementação de Vector3 e Matrix4

##  Controles

### Menu Principal

| Tecla | Ação |
|-------|------|
| **↑ / ↓** | Navegar entre opções do menu |
| **Enter** | Selecionar opção |
| **ESC** | Voltar ao menu (quando em jogo ou controles) |
| **Click** | Selecionar opção com mouse |

### Movimentação (No Jogo)

| Tecla | Ação |
|-------|------|
| **W / ↑** | Mover para frente |
| **S / ↓** | Mover para trás |
| **A** | Mover para esquerda |
| **D** | Mover para direita |
| **Espaço** | Pular (modo FPS) |
| **Q** | Subir (apenas modo Noclip) |
| **E** | Descer (apenas modo Noclip) |
| **V** | Alternar modo Noclip (voo livre) / FPS (com física) |
| **Shift** | Aumentar velocidade de movimento |

### Câmera e Interação

| Tecla | Ação |
|-------|------|
| **← →** | Rotacionar câmera horizontalmente |
| **↑ ↓** | Rotacionar câmera verticalmente (quando não pressionando W/S) |
| **O** | Abrir/Fechar portas |

### Efeitos Visuais

| Tecla | Ação |
|-------|------|
| **K** | Toggle Skybox (Liga/Desliga) |
| **L** | Toggle Shadows (Liga/Desliga Sombras) |
| **P** | Toggle Luzes dos Monitores |

### Debug

| Tecla | Ação |
|-------|------|
| **M** | Debug Shadow Map (Visualização de Debug) |
| **N** | Debug Texturas |

### Mouse

| Ação | Resultado |
|------|-----------|
| **Clique no Canvas** | Ativa Pointer Lock (trava cursor) |
| **Clique Direito + Arrastar** | Rotacionar câmera (modo alternativo) |
| **Mover Mouse** (Pointer Lock ativo) | Rotacionar câmera livremente |
| **ESC** | Sair do Pointer Lock |

##  Estrutura do Projeto

```
trabalho-2-CG/
├── index.html              # Página principal com CSS e estrutura HTML
├── README.md              # Este arquivo
├── OBJ_LOADER.md          # Documentação do leitor OBJ
├── TESTING.md             # Guia de testes para skybox e shadows
├── IMPLEMENTATION_SUMMARY.md  # Resumo da implementação
├── assets/
│   ├── models/            # Modelos 3D em formato OBJ
│   │   ├── nc2a.obj       # Prédio principal (93KB)
│   │   ├── pyramid.obj    # Pirâmide (removido da cena)
│   │   ├── sphere.obj     # Esfera (removido da cena)
│   │   └── teapot.obj     # Chaleira (removido da cena)
│   └── textures/          # Texturas e imagens
│       ├── grass.jpg      # Textura do chão
│       └── gesad.png      # Logo GESAD para menu
└── src/
    ├── main.js            # Aplicação principal com sistema de estados
    ├── math/
    │   ├── vector3.js     # Classe Vector3 para operações vetoriais
    │   └── matrix4.js     # Classe Matrix4 para transformações 3D
    ├── camera/
    │   └── camera.js      # Sistema de câmera em primeira pessoa
    ├── geometry/
    │   ├── cube.js        # Geometria do cubo
    │   ├── plane.js       # Geometria do plano
    │   └── tree.js        # Geometria de árvores (tronco + folhagem)
    ├── menu/
    │   ├── menu.js        # Sistema de menu principal
    │   ├── menuCube.js    # Geometria do cubo do menu
    │   └── menuShader.js  # Shaders do menu 3D
    ├── doors/
    │   └── door.js        # Sistema de portas interativas
    ├── skybox/
    │   ├── skybox.js      # Geometria do skybox
    │   └── skyboxShader.js # Shaders do skybox com animação de nuvens
    ├── shadows/
    │   ├── shadowMap.js   # Sistema de shadow mapping
    │   └── shadowShader.js # Shader de profundidade para sombras
    ├── loaders/
    │   ├── objLoader.js   # Leitor proprietário de arquivos OBJ
    │   └── mtlLoader.js   # Leitor de materiais MTL
    ├── renderer/
    │   ├── shader.js      # Compilação e gerenciamento de shaders
    │   └── renderer.js    # Sistema de renderização WebGL
    └── input/
        └── input.js       # Gerenciamento de entrada (teclado/mouse)
```

## Como Executar

### Opção 1: Servidor Local (Recomendado)

```bash
# Usando Python 3
python -m http.server 8000

# Usando Python 2
python -m SimpleHTTPServer 8000

# Usando Node.js (com npx)
npx http-server -p 8000

# Usando PHP
php -S localhost:8000
```

Depois, abra o navegador em: `http://localhost:8000`

### Opção 2: Extensão do VS Code

1. Instale a extensão "Live Server"
2. Clique com o botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 3: Abrir Diretamente

Alguns navegadores permitem abrir o arquivo `index.html` diretamente. Se houver problemas com CORS, use uma das opções acima.

## Tecnologias Utilizadas

- **WebGL 1.0** - API de renderização 3D
- **JavaScript ES6+** - Linguagem de programação
- **GLSL** - Linguagem de shaders (Vertex e Fragment)
- **HTML5 Canvas** - Contexto de renderização

##  Implementação Técnica

### Sistema de Câmera

A câmera implementa:
- Projeção perspectiva com FOV configurável
- Transformação view usando lookAt
- Controles em primeira pessoa
- Rotação com limitação de pitch

### Sistema de Renderização

O renderer inclui:
- Compilação de shaders GLSL
- Buffers para posições, cores e normais
- Sistema de transformação modelo-view-projection (MVP)
- Culling de face traseira
- Teste de profundidade

### Iluminação

Implementação do modelo Phong:
- **Ambient** - Iluminação ambiente constante
- **Diffuse** - Iluminação difusa baseada em normais
- **Specular** - Reflexão especular com shininess = 32

### Leitor OBJ

Implementação própria de parser de arquivos OBJ:
- Suporte a vértices (v), normais (vn) e coordenadas de textura (vt)
- Parsing de faces triangulares, quadradas e poligonais
- Triangulação automática de faces complexas
- Cálculo automático de normais se ausentes
- **Separação por objeto** - `splitByObject()` para detectar múltiplos objetos (portas, paredes, etc.)
- **Separação por material** - `splitByMaterial()` para aplicação correta de texturas
- Estatísticas do modelo (vértices, triângulos, bounds)
- Ver [OBJ_LOADER.md](./OBJ_LOADER.md) para documentação completa

### Animações

- Luz orbitando a cena em movimento circular
- **Portas interativas** com animação de abertura/fechamento
- **Cubo do menu** com rotação contínua em 3 eixos
- **Nuvens no skybox** com movimento baseado em tempo
- Velocidades angulares configuráveis por objeto

### Skybox

Sistema de skybox com renderização ao infinito e animação:
- Cubo de 50 unidades renderizado como fundo
- **Nuvens animadas** usando funções de ruído (noise) no fragment shader
- Movimento de nuvens com uniform de tempo (`uTime`)
- Gradiente de cores azuis com mistura dinâmica
- Shader remove translação da matriz view
- Renderizado por último com face culling desabilitado
- Toggle com tecla **K**

### Menu Interativo

Sistema de menu principal com três estados:
- **MENU** - Tela inicial com cubo 3D rotativo ao fundo
- **CONTROLS** - Tela de controles com grid de 4 seções
- **PLAYING** - Estado de jogo ativo

**Características do Menu:**
- Cubo 3D com textura GESAD rotacionando continuamente
- Iluminação Phong aplicada ao cubo do menu
- Navegação por teclado (↑↓ + Enter) ou mouse (click)
- Transições suaves entre estados
- Overlays HTML sobre renderização WebGL

### Sistema de Portas

Portas interativas com animação suave:
- Detecção automática de portas no modelo OBJ usando `splitByObject()`
- Animação de abertura/fechamento com interpolação linear
- Controle via tecla **O** (abrir/fechar)
- Rotação em torno do eixo Y (90 graus quando aberta)
- Estados: fechada, abrindo, aberta, fechando
- Velocidade de animação: 2.0 unidades por segundo

### Cenário Completo

**Prédio NC2A:**
- Modelo 3D principal carregado via OBJ
- Materiais com cores e texturas aplicadas
- Separação de objetos (portas, paredes, etc.)

**Pistas (Estradas):**
- Pista horizontal no eixo Z (posição: 0, 0.1, 30)
- Pista vertical no eixo X (posição: 40, 0.1, 0)
- Formato em "L" ao redor do prédio
- Cor cinza escuro (RGB: 0.2, 0.2, 0.2)

**Árvores:**
- Sistema de criação procedural
- Tronco cilíndrico (8 segmentos, altura 2.5)
- Copa cônica (10 segmentos, altura 4)
- Posicionadas estrategicamente ao redor do prédio
- Cores realistas (marrom para tronco, verde para folhagem)

### Shadow Mapping

Sistema completo de mapeamento de sombras:
- **Resolução:** 1024x1024 shadow map
- **Técnica:** PCF (Percentage Closer Filtering) com kernel 3x3
- **Projeção:** Ortográfica para luz direcional (frustum de 25 unidades)
- **Bias:** 0.001 constante para prevenir shadow acne
- **Render-to-Texture:** Framebuffer com RGBA + depth renderbuffer
- **Debug Mode:** Visualização de valores de profundidade (tecla **M**)
- **Toggle:** Liga/desliga com tecla **L**

**Pipeline de Renderização:**
1. **Shadow Pass** - Renderiza cena da perspectiva da luz
2. **Scene Pass** - Renderiza cena com iluminação e sombras
3. **Skybox Pass** - Renderiza skybox como plano de fundo



##  Funcionalidades 

Esta versão inclui melhorias significativas na experiência do usuário e no cenário:

###  Interface e Menu
- **Menu principal interativo** com navegação por teclado/mouse
- **Cubo 3D rotativo** no menu com textura GESAD e iluminação Phong
- **Tela de controles** dedicada com grid responsivo de 4 seções
- **Sistema de estados** (Menu → Controles → Jogo) com transições suaves

### Interatividade
- **Portas animadas** que abrem/fecham com a tecla **O**
- Detecção automática de portas no modelo OBJ
- Animação suave com 4 estados (fechada, abrindo, aberta, fechando)

###  Cenário Expandido
- **Árvores procedurais** com tronco e copa posicionadas ao redor do prédio
- **Pista dupla** em formato "L" (horizontal e vertical)
- **Skybox com nuvens animadas** usando funções de ruído GLSL
- Textura de grama aplicada ao chão

### 🔧 Melhorias Técnicas
- Separação de objetos no OBJ loader (`splitByObject()`)
- Separação por material (`splitByMaterial()`) para texturas
- Sistema modular com arquivos organizados por funcionalidade
- Suporte a texturas MTL com `map_Kd`

##  Requisitos Atendidos do Trabalho 

- [x] Uso exclusivo de WebGL puro
- [x] Câmera com projeção perspectiva
- [x] Implementação do modelo de reflexão Phong
- [x] Fonte de luz em movimento
- [x] Objetos animados com transformações geométricas
- [x] Objetos com cores sólidas
- [x] Leitor proprietário de arquivos OBJ
- [x] Biblioteca de álgebra linear própria
- [x] Captura de eventos de teclado
- [x] Código organizado e modular



##  Autores
- **Janaina Ribeiro** 
- **Joaquim Ribeiro**
- **Suayane Carvalho**
- **Márcio Gabriel**
