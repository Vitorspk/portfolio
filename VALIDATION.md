# 🔍 Code Validation Guide

Este projeto usa validação automatizada para garantir qualidade de código em todos os Pull Requests.

## 🤖 Validação Automática (GitHub Actions)

Toda vez que você abre um Pull Request, a Action `validate-pr.yml` executa automaticamente:

### ✅ Checks Executados

1. **HTML Validation**
   - Estrutura HTML válida
   - Meta tags obrigatórias (charset, viewport, description)
   - Links corretos para CSS/JS externos
   - Mínimo de estilos/scripts inline

2. **CSS Linting**
   - Sintaxe CSS válida
   - Regras de qualidade (stylelint)
   - Check de uso excessivo de `!important`
   - Verificação de vendor prefixes

3. **JavaScript Linting**
   - Sintaxe JavaScript válida
   - Regras de qualidade (ESLint)
   - Detecção de console.log/debugger
   - Boas práticas de código

4. **File Size Checks**
   - HTML < 500KB
   - CSS < 100KB
   - JS < 50KB

5. **Security Checks**
   - Detecção de inline event handlers
   - Verificação de recursos externos
   - Boas práticas de segurança

6. **Required Files**
   - `index.html` presente
   - `styles.css` presente
   - `script.js` presente

## 💻 Validação Local

### Instalação

```bash
npm install
```

### Comandos Disponíveis

```bash
# Rodar todas as validações
npm run validate
# ou
npm test

# Validar apenas HTML
npm run lint:html

# Validar apenas CSS
npm run lint:css

# Validar apenas JavaScript
npm run lint:js

# Auto-fix (CSS e JS)
npm run lint:fix
```

## 📋 Arquivos de Configuração

- **`.eslintrc.json`** - Configuração do ESLint para JavaScript
- **`.stylelintrc.json`** - Configuração do Stylelint para CSS
- **`.htmlvalidate.json`** - Configuração do HTML Validate
- **`.github/workflows/validate-pr.yml`** - GitHub Action workflow

## 🔧 Como Funciona

### 1. Pull Request Criado

Quando você cria um PR alterando arquivos `.html`, `.css` ou `.js`:

```bash
git checkout -b minha-feature
# ... faça suas alterações ...
git add .
git commit -m "feat: nova feature"
git push origin minha-feature
# Abra PR no GitHub
```

### 2. Action Executada

A Action roda automaticamente e:
- ✅ Valida todo o código
- 📊 Gera relatório detalhado
- 💬 Comenta no PR com resumo
- ⚠️ Mostra warnings e erros

### 3. Review do Resultado

Veja os resultados em:
- **PR Comments** - Resumo automático
- **Actions Tab** - Logs detalhados
- **Checks** - Status de cada validação

## 🎯 Boas Práticas

### HTML
```html
✅ BOM
<div class="card">
  <h2>Título</h2>
</div>

❌ EVITAR
<div style="color: red">Texto</div>
<div onclick="alert('test')">Clique</div>
```

### CSS
```css
✅ BOM
.card {
    padding: 1rem;
    margin: 1rem 0;
}

❌ EVITAR
.card {
    padding: 1rem !important;
    margin: 1rem 0 !important;
}
```

### JavaScript
```javascript
✅ BOM
function showTab(event, tabName) {
    const element = document.getElementById(tabName);
    if (element) {
        element.classList.add('active');
    }
}

❌ EVITAR
function showTab(event,tabName){
console.log('debug');
document.getElementById(tabName).classList.add('active')
}
```

## 🚨 Resolvendo Erros Comuns

### ESLint: "no-console"
```javascript
// ❌ Erro
console.log('debug info');

// ✅ Remover ou comentar
// console.log('debug info');
```

### Stylelint: "indentation"
```css
/* ❌ Erro */
.card {
  padding: 1rem;
    margin: 1rem; /* indentação errada */
}

/* ✅ Correto */
.card {
    padding: 1rem;
    margin: 1rem;
}
```

### HTML Validate: "missing meta tag"
```html
<!-- ❌ Faltando -->
<head>
    <title>Site</title>
</head>

<!-- ✅ Completo -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Descrição do site">
    <title>Site</title>
</head>
```

## 🎓 Recursos Adicionais

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Stylelint Rules](https://stylelint.io/user-guide/rules)
- [HTML Validate](https://html-validate.org/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🤝 Contribuindo

Antes de criar um PR:

1. ✅ Rode `npm run validate` localmente
2. ✅ Corrija todos os erros
3. ✅ Teste no navegador
4. ✅ Crie o PR

## 📞 Suporte

Se encontrar problemas com as validações, abra uma issue ou contate o mantenedor do projeto.

---

**Última atualização:** 2025-11-17
