# 🌱 Mobilidade Sustentável

Projeto educacional desenvolvido com foco na conscientização sobre transporte urbano sustentável. A proposta é fornecer dicas práticas, pontuação gamificada e um mapa interativo com ciclovias para estimular escolhas mais ecológicas no dia a dia.

---

## 🎯 Objetivo

Promover hábitos de mobilidade urbana sustentável por meio de um site interativo, acessível e visualmente moderno, integrando design, dados reais e tecnologia web.

---

## 🧩 Funcionalidades

- ✅ Modo Claro/Escuro com salvamento da preferência do usuário
- ✅ Dicas sustentáveis carregadas dinamicamente via JSON
- ✅ Pontuação por interação (gamificação leve)
- ✅ Mapa interativo com ciclovias (Leaflet.js + OpenStreetMap)
- ✅ Modal com curiosidades ecológicas
- ✅ Layout responsivo com Bootstrap 5
- ✅ Código separado por responsabilidade (HTML / CSS / JS / JSON)

---

## 💻 Tecnologias Utilizadas

| Tecnologia           | Função                                      |
|----------------------|---------------------------------------------|
| HTML5                | Estrutura do conteúdo                       |
| CSS3 + Bootstrap 5   | Estilização moderna e responsiva            |
| JavaScript (Vanilla) | Interações, lógica, mapa, pontuação         |
| Leaflet.js           | Mapa interativo com marcadores personalizados |
| localStorage         | Armazenamento de tema e pontuação do usuário |
| JSON                 | Dados dinâmicos de dicas e ciclovias        |

---

## 📁 Estrutura de Arquivos

mobilidade_sustentavel/
├── index.html
├── css/
│ └── style.css
├── js/
│ └── script.js
├── data/
│ ├── dicas.json
│ └── ciclovias.json

---

## 👨‍💻 Como Executar

1. Faça o download ou clone este repositório.
2. Execute o `index.html` em um navegador moderno.
3. Para total funcionamento (fetch de JSON), utilize um servidor local:
   - Com VSCode: use a extensão **Live Server**
   - Ou via terminal:
     ```bash
     python -m http.server
     ```
4. Acesse via `http://localhost:8000`

---

## 🌍 Deploy com GitHub Pages (opcional)

Você pode publicar este site gratuitamente pelo GitHub Pages:
1. Vá em **Settings > Pages**
2. Selecione a branch `main` e a pasta `/root` (ou `/docs`)
3. Acesse o link gerado pelo GitHub para ver o site online

---

## 👥 Autores

Desenvolvido por estudantes do **3º semestre de Engenharia de Software - Turma C** da **Unicesumar**:

- **Guilherme Xavier Hojak**
- **João Guilherme Muller Bordin**

---

## 📜 Licença

Este projeto foi desenvolvido com fins **educacionais** e **não possui fins comerciais**.
