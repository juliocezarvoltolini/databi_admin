# Sistema de Design - DataBi Admin

Este documento descreve o sistema de design tokens e classes utilitárias centralizadas do projeto.

## 🎨 Cores (Design Tokens)

### Paleta Principal
```css
/* Primária (Azul) */
primary-50 até primary-900
DEFAULT: primary (equivale a primary-600)

/* Secundária (Cinza) */  
secondary-50 até secondary-900
DEFAULT: secondary (equivale a secondary-500)

/* Semânticas */
success-50 até success-900    /* Verde */
danger-50 até danger-900      /* Vermelho */
warning-50 até warning-900    /* Amarelo/Laranja */
info-50 até info-900         /* Azul claro */
```

## 🔘 Botões

### Classes Base
```css
.btn              /* Classe base para todos os botões */
.btn-primary      /* Botão primário (azul) */
.btn-secondary    /* Botão secundário (cinza) */
.btn-danger       /* Botão de perigo (vermelho) */
.btn-success      /* Botão de sucesso (verde) */
.btn-warning      /* Botão de aviso (amarelo) */
.btn-info         /* Botão informativo (azul claro) */
```

### Tamanhos
```css
.btn-sm           /* Botão pequeno */
.btn              /* Tamanho padrão */
.btn-lg           /* Botão grande */
.btn-icon-only    /* Botão apenas com ícone */
```

## 📝 Formulários

### Inputs
```css
.input-field      /* Input padrão */
.input-sm         /* Input pequeno */
.input-lg         /* Input grande */
.input-error      /* Input com erro */
.input-success    /* Input com sucesso */
.select-field     /* Select customizado */
```

### Labels
```css
.label-field      /* Label padrão para formulários */
```

## 🏃 Cards e Containers

### Cards
```css
.card             /* Card básico */
.card-sm          /* Card pequeno */
.card-lg          /* Card grande */
.card-hover       /* Card com efeito hover */
.card-header      /* Cabeçalho do card */
.card-footer      /* Rodapé do card */
```

### Containers de Layout
```css
.container-main   /* Container principal (max-width: 7xl) */
.container-narrow /* Container estreito (max-width: 4xl) */
.container-wide   /* Container largo (sem limite) */
```

## 🚨 Alertas e Badges

### Alertas
```css
.alert            /* Alerta base */
.alert-error      /* Alerta de erro */
.alert-success    /* Alerta de sucesso */
.alert-warning    /* Alerta de aviso */
.alert-info       /* Alerta informativo */
```

### Badges
```css
.badge            /* Badge base */
.badge-primary    /* Badge primário */
.badge-secondary  /* Badge secundário */
.badge-success    /* Badge de sucesso */
.badge-danger     /* Badge de perigo */
.badge-warning    /* Badge de aviso */
.badge-info       /* Badge informativo */
```

## 📊 Dashboard

### Classes Específicas
```css
.dashboard-container    /* Container principal do dashboard */
.dashboard-header      /* Cabeçalho do dashboard */
.dashboard-sidebar     /* Sidebar do dashboard */
.dashboard-item        /* Item da sidebar */
.dashboard-item-active /* Item ativo da sidebar */
.dashboard-content     /* Conteúdo principal */
.dashboard-empty       /* Estado vazio */
```

## 📋 Tabelas

### Classes de Tabela
```css
.table-responsive     /* Container responsivo */
.table-base          /* Tabela base */
.table-header        /* Cabeçalho da tabela */
.table-header-cell   /* Célula do cabeçalho */
.table-body          /* Corpo da tabela */
.table-row           /* Linha da tabela */
.table-cell          /* Célula da tabela */
```

## 🎪 Grid e Layout

### Grids Automáticos
```css
.grid-auto-fit       /* Grid com auto-fit (min 250px) */
.grid-auto-fill      /* Grid com auto-fill (min 300px) */
```

## ✨ Utilitários

### Estados de Loading
```css
.loading             /* Estado de carregamento */
.loading-overlay     /* Overlay de carregamento */
.skeleton           /* Skeleton loading base */
.skeleton-text      /* Texto skeleton */
.skeleton-text-sm   /* Texto skeleton pequeno */
.skeleton-avatar    /* Avatar skeleton */
.skeleton-button    /* Botão skeleton */
```

### Animações
```css
.animate-fade-in        /* Fade in suave */
.animate-slide-up       /* Deslizar para cima */
.animate-bounce-subtle  /* Bounce sutil */
```

### Interações
```css
.focus-ring          /* Anel de foco padrão */
.hover-lift          /* Efeito de elevação no hover */
```

### Scrollbar
```css
.scrollbar-thin      /* Scrollbar personalizada fina */
```

### Gradientes
```css
.gradient-primary    /* Gradiente primário (azul) */
.gradient-secondary  /* Gradiente secundário (cinza) */
.gradient-success    /* Gradiente de sucesso (verde) */
.gradient-danger     /* Gradiente de perigo (vermelho) */
.gradient-warning    /* Gradiente de aviso (amarelo) */
```

### Texto
```css
.text-truncate-1     /* Trunca em 1 linha */
.text-truncate-2     /* Trunca em 2 linhas */
.text-truncate-3     /* Trunca em 3 linhas */
```

### Divisores
```css
.divider-horizontal  /* Divisor horizontal */
.divider-vertical    /* Divisor vertical */
```

### Espaçamento Semântico
```css
.space-section       /* Espaçamento entre seções */
.space-component     /* Espaçamento entre componentes */
.space-element       /* Espaçamento entre elementos */
```

## 🌙 Dark Mode

Todas as classes incluem suporte nativo ao dark mode usando a estratégia `class`. 
Elementos com dark mode são aplicados automaticamente quando a classe `dark` está presente no elemento pai ou `<html>`.

## 📱 Responsividade

O sistema utiliza os breakpoints padrão do Tailwind:
- `sm:` ≥ 640px
- `md:` ≥ 768px  
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px
- `2xl:` ≥ 1536px

## 💡 Como Usar

### Exemplo de Botão
```jsx
<button className="btn-primary">
  Salvar
</button>
```

### Exemplo de Card
```jsx
<div className="card">
  <div className="card-header">
    <h2>Título do Card</h2>
  </div>
  <p>Conteúdo do card...</p>
</div>
```

### Exemplo de Formulário
```jsx
<div>
  <label className="label-field">Nome</label>
  <input className="input-field" type="text" />
</div>
```

### Exemplo com Estados
```jsx
<input className="input-field input-error" />
<div className="alert-error">Erro de validação</div>
```

## 📏 Extensibilidade

O sistema foi projetado para ser facilmente extensível. Para adicionar novas variações:

1. **Cores**: Adicione no `tailwind.config.js` na seção `colors`
2. **Classes**: Adicione no `globals.css` na layer `@layer components`  
3. **Utilitários**: Adicione no `globals.css` na layer `@layer utilities`

## 🎯 Benefícios

- **Consistência**: Design uniforme em toda aplicação
- **Manutenibilidade**: Mudanças centralizadas
- **Performance**: Classes reutilizáveis
- **DX**: Melhor experiência do desenvolvedor
- **Dark Mode**: Suporte nativo
- **Responsividade**: Mobile-first design
- **Acessibilidade**: Estados de foco e interação padronizados