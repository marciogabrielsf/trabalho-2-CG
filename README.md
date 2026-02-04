# Trabalho 2 - Computação Gráfica

Sistema de câmera 3D e cena interativa implementada em WebGL puro.

## 🎯 Características

- ✅ **WebGL Puro** - Sem bibliotecas de alto nível (three.js, etc)
- ✅ **Sistema de Câmera** - Câmera em primeira pessoa com controles WASD + Mouse
- ✅ **Controle de Mouse** - Rotação de câmera com clique direito ou Pointer Lock
- ✅ **Projeção Perspectiva** - Matriz de projeção implementada manualmente
- ✅ **Iluminação Phong** - Modelo de reflexão Phong com luz dinâmica
- ✅ **Skybox** - Céu com gradiente de cores renderizado ao fundo
- ✅ **Shadow Mapping** - Sombras dinâmicas com PCF (Percentage Closer Filtering)
- ✅ **Animações** - Objetos com rotação automática
- ✅ **Geometrias Customizadas** - Cubos e planos criados manualmente
- ✅ **Leitor OBJ Próprio** - Parser de arquivos .obj implementado do zero
- ✅ **Álgebra Linear Própria** - Implementação de Vector3 e Matrix4

## 🎮 Controles

### Teclado

| Tecla | Ação |
|-------|------|
| **W / ↑** | Mover para frente |
| **S / ↓** | Mover para trás |
| **A** | Mover para esquerda |
| **D** | Mover para direita |
| **Q** | Subir |
| **E** | Descer |
| **← →** | Rotacionar câmera horizontalmente |
| **↑ ↓** | Rotacionar câmera verticalmente (quando não pressionando W/S) |
| **Shift** | Aumentar velocidade de movimento |
| **K** | Toggle Skybox (Liga/Desliga) |
| **L** | Toggle Shadows (Liga/Desliga Sombras) |
| **M** | Debug Shadow Map (Visualização de Debug) |

### Mouse

| Ação | Resultado |
|------|-----------|
| **Clique no Canvas** | Ativa Pointer Lock (trava cursor) |
| **Clique Direito + Arrastar** | Rotacionar câmera (modo alternativo) |
| **Mover Mouse** (Pointer Lock ativo) | Rotacionar câmera livremente |
| **ESC** | Sair do Pointer Lock |

## 📁 Estrutura do Projeto

```
trabalho-2-CG/
├── index.html              # Página principal
├── README.md              # Este arquivo
├── OBJ_LOADER.md          # Documentação do leitor OBJ
├── TESTING.md             # Guia de testes para skybox e shadows
├── IMPLEMENTATION_SUMMARY.md  # Resumo da implementação
├── assets/
│   └── models/            # Modelos 3D em formato OBJ
│       ├── nc2a.obj       # Prédio principal (93KB)
│       ├── pyramid.obj    # Pirâmide
│       ├── sphere.obj     # Esfera
│       └── teapot.obj     # Chaleira
└── src/
    ├── main.js            # Aplicação principal e loop de renderização
    ├── math/
    │   ├── vector3.js     # Classe Vector3 para operações vetoriais
    │   └── matrix4.js     # Classe Matrix4 para transformações 3D
    ├── camera/
    │   └── camera.js      # Sistema de câmera em primeira pessoa
    ├── geometry/
    │   ├── cube.js        # Geometria do cubo
    │   └── plane.js       # Geometria do plano
    ├── skybox/
    │   ├── skybox.js      # Geometria do skybox
    │   └── skyboxShader.js # Shaders do skybox
    ├── shadows/
    │   ├── shadowMap.js   # Sistema de shadow mapping
    │   └── shadowShader.js # Shader de profundidade para sombras
    ├── loaders/
    │   └── objLoader.js   # Leitor proprietário de arquivos OBJ
    ├── renderer/
    │   ├── shader.js      # Compilação e gerenciamento de shaders
    │   └── renderer.js    # Sistema de renderização WebGL
    └── input/
        └── input.js       # Gerenciamento de entrada (teclado/mouse)
```

## 🚀 Como Executar

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

## 🔧 Tecnologias Utilizadas

- **WebGL 1.0** - API de renderização 3D
- **JavaScript ES6+** - Linguagem de programação
- **GLSL** - Linguagem de shaders (Vertex e Fragment)
- **HTML5 Canvas** - Contexto de renderização

## 📚 Implementação Técnica

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
- Estatísticas do modelo (vértices, triângulos, bounds)
- Ver [OBJ_LOADER.md](./OBJ_LOADER.md) para documentação completa

### Animações

- Luz orbitando a cena em movimento circular
- Múltiplos objetos com rotações independentes
- Velocidades angulares configuráveis por objeto
- Modelos OBJ carregados dinamicamente

### Skybox

Sistema de skybox com renderização ao infinito:
- Cubo de 50 unidades renderizado como fundo
- Gradiente de cores azuis (6 tonalidades)
- Shader remove translação da matriz view
- Renderizado por último com face culling desabilitado
- Toggle com tecla **K**

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

## 🧪 Testes

Para testar as funcionalidades de skybox e shadows, consulte o arquivo [TESTING.md](./TESTING.md).

Para detalhes completos da implementação, veja [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md).

## 🎓 Requisitos Atendidos

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

## 🐛 Troubleshooting

**Problema: Tela preta**
- Verifique o console do navegador (F12) para erros
- Certifique-se de que o WebGL está habilitado no navegador

**Problema: Controles não funcionam**
- Clique na página para garantir que ela está em foco
- Verifique se há erros no console

**Problema: Arquivo não carrega**
- Use um servidor local (não abra o HTML diretamente)
- Verifique se todos os arquivos JS estão na estrutura correta

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte da disciplina de Computação Gráfica.

## 👨‍💻 Autor

Desenvolvido seguindo as especificações do Trabalho 2 de Computação Gráfica.
