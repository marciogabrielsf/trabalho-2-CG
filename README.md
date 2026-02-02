# Trabalho 2 - Computação Gráfica

Sistema de câmera 3D e cena interativa implementada em WebGL puro.

## 🎯 Características

- ✅ **WebGL Puro** - Sem bibliotecas de alto nível (three.js, etc)
- ✅ **Sistema de Câmera** - Câmera em primeira pessoa com controles WASD
- ✅ **Projeção Perspectiva** - Matriz de projeção implementada manualmente
- ✅ **Iluminação Phong** - Modelo de reflexão Phong com luz dinâmica
- ✅ **Animações** - Cubos com rotação automática
- ✅ **Geometrias Customizadas** - Cubos e planos criados manualmente
- ✅ **Álgebra Linear Própria** - Implementação de Vector3 e Matrix4

## 🎮 Controles

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

## 📁 Estrutura do Projeto

```
trabalho-2-CG/
├── index.html              # Página principal
├── README.md              # Este arquivo
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

### Animações

- Luz orbitando a cena em movimento circular
- Múltiplos cubos com rotações independentes
- Velocidades angulares configuráveis por objeto

## 🎓 Requisitos Atendidos

- [x] Uso exclusivo de WebGL puro
- [x] Câmera com projeção perspectiva
- [x] Implementação do modelo de reflexão Phong
- [x] Fonte de luz em movimento
- [x] Objetos animados com transformações geométricas
- [x] Objetos com cores sólidas
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
