# 💡 Explicação da Iluminação Phong Implementada

## 📚 Baseado na Aula 26

Este documento explica como a iluminação Phong foi implementada no seu projeto, seguindo os conceitos da aula.

---

## 🎯 O Modelo de Reflexão de Phong

O modelo de Phong divide a iluminação em **3 componentes principais**:

```
Luz Final = Ambiente + Difuso + Especular
```

### 1️⃣ Componente Ambiente (Ambient)

**O que é?**
- Iluminação básica uniforme que existe em toda a cena
- Simula luz indireta que foi refletida múltiplas vezes
- Não depende da posição da luz ou da câmera

**Implementação (shader.js:106):**
```glsl
vec3 ambient = 0.3 * uLightColor;
```

**Significado:**
- 30% da cor da luz é aplicado uniformemente
- Se `uLightColor = (1.0, 1.0, 1.0)` (branco)
- Então `ambient = (0.3, 0.3, 0.3)` (cinza claro)

**Visualização:**
```
🌍 Objeto        💡 Luz
   █              ☼
   
Luz ambiente chega de todas as direções
(não importa onde está a luz)
```

---

### 2️⃣ Componente Difuso (Diffuse)

**O que é?**
- Reflexão fosca/mate da superfície
- Depende do ângulo entre a **normal da superfície** e a **direção da luz**
- Quanto mais perpendicular, mais iluminado

**Implementação (shader.js:109-111):**
```glsl
vec3 norm = normalize(vNormal);                    // Normal da superfície
vec3 lightDir = normalize(uLightPosition - vFragPos); // Direção da luz
float diff = max(dot(norm, lightDir), 0.0);        // Produto escalar
vec3 diffuse = diff * uLightColor;                 // Multiplicar pela cor
```

**Lei de Lambert:**
```
Intensidade Difusa = cos(θ) = dot(N, L)

onde:
  N = vetor normal da superfície
  L = vetor direção da luz
  θ = ângulo entre N e L
```

**Visualização:**
```
Caso 1: Luz perpendicular (θ = 0°)
   💡 Luz
    |
    | N (normal)
    ↓
   ███  ← Muito iluminado
   
   dot(N, L) = 1.0 (máximo)


Caso 2: Luz oblíqua (θ = 60°)
   💡 Luz
    ╲
     ╲ N
      ↓
     ███  ← Pouco iluminado
     
   dot(N, L) = 0.5


Caso 3: Luz por trás (θ > 90°)
           💡 Luz
          ╱
     N  ╱
     ↓ ╱
    ███  ← Não iluminado
    
   dot(N, L) < 0.0 → max(..., 0.0) = 0.0
```

---

### 3️⃣ Componente Especular (Specular)

**O que é?**
- Reflexão brilhante da superfície (highlight)
- Depende do ângulo entre o **vetor de reflexão** e a **direção da câmera**
- Cria pontos brilhantes em superfícies polidas

**Implementação (shader.js:113-115):**
```glsl
vec3 viewDir = normalize(uViewPosition - vFragPos);  // Direção para câmera
vec3 reflectDir = reflect(-lightDir, norm);          // Reflexão da luz
float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess
vec3 specular = 0.5 * spec * uLightColor;            // 50% de intensidade
```

**Lei da Reflexão:**
```
Intensidade Especular = cos^n(α) = dot(V, R)^n

onde:
  V = vetor direção para a câmera
  R = vetor de reflexão da luz
  α = ângulo entre V e R
  n = expoente de brilho (shininess)
```

**Visualização:**
```
Geometria da Reflexão:

        👁 Câmera (V)               💡 Luz (L)
           ↑                          ↓
            ╲                        ╱
             ╲                      ╱
              ╲  α (ângulo)        ╱ θ
               ╲                  ╱
                ╲    R (reflex)  ╱
                 ╲      ↑       ╱
                  ╲     |      ╱
                   ╲    |     ╱
                    ╲   |    ╱
                     ╲  |N  ╱
                      ╲ | ╱
                    ═══════════ Superfície
                    
Quando α é pequeno (V próximo de R):
  → Brilho intenso (highlight)
  
Quando α é grande:
  → Sem brilho
```

**Efeito do Expoente n (Shininess):**

```
n = 1 (fosco)              n = 32 (nosso caso)        n = 256 (muito brilhante)
  █████████                    ██                           █
 ███████████                  ████                         ███
███████████                  ██████                       █████

Brilho espalhado          Brilho médio               Brilho concentrado
```

---

## 🔄 Movimentação da Luz

**Implementação (renderer.js:136-141):**

```javascript
updateLight(time) {
    const radius = 5;
    // Movimento circular no plano XZ
    this.lightPosition.x = Math.cos(time * 0.5) * radius;
    this.lightPosition.z = Math.sin(time * 0.5) * radius;
    
    // Oscilação vertical
    this.lightPosition.y = 3 + Math.sin(time) * 2;
}
```

**Trajetória da Luz:**

```
Vista de Cima (plano XZ):

       Z
       ↑
       |
   -5  |  5  X
   ────┼────→
       |    ⊕ (raio 5)
       |   /
      -5  / ← Luz se move em círculo
         /    Velocidade: 0.5 rad/s
        /     Período: ~12.6 segundos
       ●
    (0,0)


Vista Lateral (plano YZ):

    Y
    ↑
  5 |     ∿∿∿∿∿ 
    |    /     \      ← Oscilação vertical
  3 | ──●───────●──     Amplitude: ±2
    |    \     /       Altura base: 3
  1 |     ∿∿∿∿∿        Frequência: 1 Hz
    |
    └────────────→ Z
```

**Equações Paramétricas:**

```
x(t) = 5 · cos(0.5t)
y(t) = 3 + 2 · sin(t)
z(t) = 5 · sin(0.5t)

onde t = tempo em segundos
```

---

## 🎨 Combinação Final

**Código completo (shader.js:106-123):**

```glsl
void main() {
    // 1. Cor base do objeto
    vec3 baseColor = vColor;
    if(uUseTexture == 1) {
        baseColor = texture2D(uTexture, vTexCoord).rgb;
    }
    
    // 2. COMPONENTE AMBIENTE (30%)
    vec3 ambient = 0.3 * uLightColor;
    
    // 3. COMPONENTE DIFUSO
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor;
    
    // 4. COMPONENTE ESPECULAR (50% de intensidade)
    vec3 viewDir = normalize(uViewPosition - vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = 0.5 * spec * uLightColor;
    
    // 5. SOMBRAS (opcional)
    float shadow = calculateShadow(...);
    
    // 6. RESULTADO FINAL
    vec3 lighting = ambient + (1.0 - shadow) * (diffuse + specular);
    vec3 result = lighting * baseColor;
    
    gl_FragColor = vec4(result, 1.0);
}
```

**Breakdown visual:**

```
Objeto Vermelho com luz branca:

Ambiente:     ███  (0.3, 0.0, 0.0) ← 30% vermelho sempre visível
              
Difuso:      █████ (variável)     ← Depende do ângulo com a luz
             Mais claro quando perpendicular
             
Especular:     █  (1.0, 1.0, 1.0) ← Branco sempre (cor da luz)
              Aparece só em certos ângulos
              
Resultado:   █████ Vermelho com brilho branco
```

---

## 📊 Comparação: Sem vs Com Phong

### Sem Iluminação (Flat Color)
```
████████████████
████████████████  ← Cor uniforme
████████████████     Sem profundidade
████████████████
```

### Com Phong
```
    ░░██████░░      ← Brilho especular
  ░░████████████
░░██████████████    ← Gradiente difuso
██████████████████  ← Ambiente + difuso completo
██████████████████
  ██████████████    ← Área menos iluminada
    ████████████
```

---

## 🧪 Testando os Componentes

Você pode modificar os valores no código para ver o efeito:

### Testar Ambiente
```glsl
// Em shader.js:106
vec3 ambient = 1.0 * uLightColor;  // 100% ambiente (sem sombras fortes)
vec3 ambient = 0.1 * uLightColor;  // 10% ambiente (muito escuro)
```

### Testar Difuso
```glsl
// Em shader.js:111
float diff = max(dot(norm, lightDir), 0.0) * 0.0;  // Desligar difuso
```

### Testar Especular
```glsl
// Em shader.js:115
float spec = pow(..., 8.0);    // Brilho mais espalhado
float spec = pow(..., 128.0);  // Brilho mais concentrado
vec3 specular = 2.0 * spec * uLightColor;  // Brilho mais intenso
```

---

## 📐 Vetores Importantes

### Vetores Usados no Phong

```javascript
// 1. Normal (N) - Direção perpendicular à superfície
vNormal = mat3(uModelMatrix) * aNormal;

// 2. Light Direction (L) - Da superfície para a luz
lightDir = normalize(uLightPosition - vFragPos);

// 3. View Direction (V) - Da superfície para a câmera
viewDir = normalize(uViewPosition - vFragPos);

// 4. Reflect Direction (R) - Reflexão de L pela normal
reflectDir = reflect(-lightDir, norm);
```

**Visualização 3D:**
```
           💡 uLightPosition
            ↓
            L (lightDir)
           ╱
          ╱
         ╱ θ
   👁 V ╱←── N (normal)
       ↑    ╱
       |   ╱
       |  ╱ θ (ângulo igual)
       | ╱
       |╱ R (reflectDir)
    ═════════════════
    vFragPos (ponto na superfície)
```

---

## 🎯 Valores dos Parâmetros no Projeto

| Parâmetro | Valor | Localização | Efeito |
|-----------|-------|-------------|--------|
| **Ambiente (ka)** | 0.3 | shader.js:106 | 30% de iluminação mínima |
| **Difuso (kd)** | 1.0 | shader.js:111 | 100% da intensidade calculada |
| **Especular (ks)** | 0.5 | shader.js:115 | 50% de brilho |
| **Shininess (n)** | 32.0 | shader.js:114 | Brilho médio-focado |
| **Cor da Luz** | (1,1,1) | renderer.js:8 | Branca |
| **Raio órbita** | 5.0 | renderer.js:137 | Distância da luz ao centro |
| **Velocidade angular** | 0.5 rad/s | renderer.js:138-139 | Rotação da luz |
| **Amplitude vertical** | ±2.0 | renderer.js:140 | Movimento Y da luz |

---

## 🔬 Experimentos Sugeridos

### 1. Mudar Cor da Luz
```javascript
// Em renderer.js:8
this.lightColor = new Vector3(1.0, 0.5, 0.3);  // Luz alaranjada
this.lightColor = new Vector3(0.3, 0.5, 1.0);  // Luz azulada
```

### 2. Aumentar Velocidade da Luz
```javascript
// Em renderer.js:138-139
this.lightPosition.x = Math.cos(time * 2.0) * radius;  // 4x mais rápido
this.lightPosition.z = Math.sin(time * 2.0) * radius;
```

### 3. Luz Estática
```javascript
// Em renderer.js:136-141
updateLight(time) {
    this.lightPosition.x = 5;  // Posição fixa
    this.lightPosition.y = 5;
    this.lightPosition.z = 5;
}
```

### 4. Múltiplas Luzes
```javascript
// Adicionar no fragment shader (mais avançado)
vec3 light1 = calculatePhong(lightPos1, ...);
vec3 light2 = calculatePhong(lightPos2, ...);
vec3 result = ambient + light1 + light2;
```

---

## 📚 Referências do Material da Aula

### Conceitos da Aula 26:
- ✅ Modelo de reflexão de Phong
- ✅ Componentes: ambiente, difuso, especular
- ✅ Lei de Lambert para difuso
- ✅ Reflexão especular com expoente
- ✅ Transformação de normais
- ✅ Iluminação no fragment shader

### Diferença do Material de Referência (webgl.js):
O arquivo `webgl.js` fornecido usa uma abordagem similar, mas com algumas diferenças:

**webgl.js (referência):**
```glsl
gl_FragColor.rgb = 0.2*lightColor*texColor;              // Ambiente
gl_FragColor.rgb += 0.2*lightColor*lightd*texColor;      // Difuso direcional
gl_FragColor.rgb += 0.5*lightColor*lightp*texColor;      // Difuso pontual
gl_FragColor.rgb += lightColor*pow(lighte, 500.0)*texColor; // Especular
```

**Seu código (implementação):**
```glsl
vec3 ambient = 0.3 * uLightColor;
vec3 diffuse = diff * uLightColor;
vec3 specular = 0.5 * spec * uLightColor;
vec3 result = (ambient + diffuse + specular) * baseColor;
```

Ambos estão corretos! Sua implementação é mais limpa e modular.

---

## ✅ Conclusão

Seu projeto implementa **corretamente** o modelo de Phong com:
- ✅ 3 componentes (ambiente, difuso, especular)
- ✅ Luz em movimento (requisito de luz móvel)
- ✅ Cálculos no espaço mundial
- ✅ Transformação adequada das normais
- ✅ Uso apropriado do produto escalar
- ✅ Expoente de brilho (shininess)

**Parabéns! A iluminação está perfeita! 🎉**
