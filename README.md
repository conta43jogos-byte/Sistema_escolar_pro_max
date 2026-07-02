# Sistema Escolar Pro Max 🎓

Sistema Inteligente de Gestão Escolar construído com React, Vite e Tailwind CSS.

## Pré-requisitos

1. Clone o repositório usando a URL do projeto.
2. Navegue até o diretório do projeto.
3. Instale as dependências: `npm install`.

## Executar Localmente

Para rodar apenas o frontend em desenvolvimento:

```bash
npm run dev
```

Abra a URL local impressa pelo Vite no seu navegador.

## Compilar para Produção

```bash
npm run build
```

## Visualizar o Build

```bash
npm run preview
```

## Verificar Qualidade do Código

```bash
npm run lint
```

Para corrigir erros automaticamente:

```bash
npm run lint:fix
```

## Estrutura do Projeto

```
src/
├── api/              # Cliente HTTP
├── components/       # Componentes React reutilizáveis
│   ├── Layout/      # Layouts principais
│   └── ui/          # Componentes de interface
├── hooks/           # Custom hooks
├── lib/             # Lógica de negócio e utilitários
├── pages/           # Páginas/Views
├── utils/           # Funções utilitárias
├── App.jsx          # Componente raiz
├── main.js          # Ponto de entrada
└── style.css        # Estilos globais
```

## Funcionalidades

- ✅ Autenticação (Login, Registro, Recuperação de Senha)
- ✅ Dashboard com Estatísticas
- ✅ Gestão de Turmas
- ✅ Gestão de Salas de Aula
- ✅ Gestão de Professores
- ✅ Gestão de Disciplinas
- ✅ Gestão de Horários
- ✅ Relatórios do Sistema

## Tecnologias Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **Tailwind CSS** - Estilos
- **React Query** - Gerenciamento de estado
- **Lucide React** - Ícones
- **ESLint** - Linter de código

## Usuário de Teste

Email: `admin@example.com`  
Senha: `password` (qualquer senha funciona em modo de desenvolvimento)

## Documentação

Para mais informações sobre as tecnologias utilizadas:

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## Suporte

Em caso de dúvidas ou problemas, verifique:

1. Se todas as dependências foram instaladas: `npm install`
2. Se a porta padrão (5173) não está em uso
3. Se você está usando uma versão recente do Node.js (v16+)

---

Desenvolvido com ❤️ para gestão escolar eficiente.
