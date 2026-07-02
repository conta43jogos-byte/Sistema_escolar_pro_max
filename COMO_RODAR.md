# 🚀 Como Executar o Sistema Escolar Pro Max

## Pré-requisitos

Você precisa ter instalado em seu computador:
- **Node.js** versão 16.0.0 ou superior (Download: https://nodejs.org/)
- **Git** (para clonar ou versionar o projeto)

## Passo 1: Abrir o Terminal

1. Navegue até a pasta do projeto
2. Abra um terminal nesta pasta (ou use `cd` para navegar)

## Passo 2: Instalar Dependências

Execute este comando para instalar todas as bibliotecas necessárias:

```bash
npm install
```

Isso pode levar alguns minutos na primeira vez.

## Passo 3: Iniciar o Servidor de Desenvolvimento

Execute este comando:

```bash
npm run dev
```

Você verá uma saída parecida com:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Passo 4: Abrir no Navegador

Abra seu navegador e acesse:

```
http://localhost:5173
```

## Dados de Teste para Fazer Login

- **Email:** qualquer email (ex: admin@example.com)
- **Senha:** qualquer senha (ex: 123456)

A autenticação em modo desenvolvimento aceita qualquer combinação!

## O que você verá

1. **Página de Login** - Faça login com o email e senha acima
2. **Dashboard** - Página principal com estatísticas
3. **Professores** - Listagem de professores cadastrados
4. **Turmas** - Gestão de turmas/classes
5. **Salas** - Gestão de salas de aula
6. **Disciplinas** - Gestão de disciplinas
7. **Horários** - Visualização de grade de horários
8. **Relatórios** - Geração de relatórios

## Comando Opcional: Verificar Código

Para encontrar erros no código antes de fazer commit:

```bash
npm run lint
```

Para corrigir erros automaticamente:

```bash
npm run lint:fix
```

## Parar o Servidor

Para parar o servidor, pressione `CTRL + C` no terminal.

## Compilar para Produção

Se quiser gerar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos compilados ficarão na pasta `dist/`.

## Troubleshooting

### A porta 5173 já está em uso?

Se a porta já estiver em uso, o Vite escolherá automaticamente outra porta (ex: 5174).

### Erro ao instalar dependências?

Tente deletar a pasta `node_modules` e o arquivo `package-lock.json`, depois execute `npm install` novamente:

```bash
rm -r node_modules package-lock.json
npm install
```

### Arquivos não estão atualizando no navegador?

Limpe o cache: `CTRL + SHIFT + Delete` (ou `Cmd + Shift + Delete` no Mac)

---

**Divirta-se usando o Sistema Escolar Pro Max!** 🎓
