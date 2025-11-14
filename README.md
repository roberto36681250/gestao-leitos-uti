# MVP - Gestão de Leitos Hospitalares

Este é um repositório completo para o MVP (Minimum Viable Product) de um sistema de **Gestão de Leitos Hospitalares em tempo real**. O projeto foi desenvolvido com foco em ações rápidas, interface intuitiva e atualizações instantâneas, utilizando Next.js 15 e Supabase.

O web app é público e não requer autenticação, com acesso controlado por políticas de segurança a nível de linha (RLS) do PostgreSQL, permitindo que usuários anônimos visualizem e realizem ações específicas de forma segura.

## 🎯 Funcionalidades Principais

- **Visualização em Tempo Real**: Grade de leitos (21 a 40) que reflete o estado atual do sistema instantaneamente, graças à subscrição Realtime do Supabase.

- **Mapa de Cores por Estado**: Cada estado de leito possui uma cor distinta para fácil identificação visual (Vago, Ocupado, Higienização, etc.).

- **Ações Rápidas por Leito**: Botões de ação contextualizados permitem que a equipe do hospital atualize o estado de um leito com um único clique (ex: "Alta Sinalizada", "Iniciar Higienização", "Reservar").

- **Filtros Dinâmicos**: Filtre a visualização dos leitos por estado, sexo, plano de saúde ou tipo de isolamento.

- **Geração de Boletim**: Um botão "Gerar Boletim" cria um texto formatado para WhatsApp, resumindo o status dos leitos (vagos, reservados, altas sinalizadas), pronto para ser copiado e compartilhado.

- **Edição de Dados**: Formulários em modais permitem editar informações do paciente (sexo, plano, isolamento) ou registrar motivos para cancelamento de alta.

- **Persistência de Dados Segura**: Todas as informações são armazenadas no Supabase, com políticas RLS que garantem que usuários anônimos só possam realizar as ações permitidas.

## 🚀 Stack Tecnológica

- **Frontend**: [Next.js](https://nextjs.org/) 15 (com App Router), [React](https://react.dev/) 18, [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, RLS)
- **Testes**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/)
- **Linting & Formatação**: ESLint, Prettier
- **Package Manager**: pnpm

## ⚙️ Setup e Instalação

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/en) (versão 18 ou superior)
- [pnpm](https://pnpm.io/installation)
- Uma conta no [Supabase](https://supabase.com/)

### 2. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd gestao-leitos
```

### 3. Instalar Dependências

```bash
pnpm install
```

### 4. Configurar o Supabase

1. **Crie um novo projeto no Supabase**.

2. Navegue até o **SQL Editor** no painel do seu projeto.

3. **Execute os scripts SQL** na seguinte ordem para configurar o banco de dados:

   - Copie e cole o conteúdo de `supabase/schema.sql` e execute.
   - Copie e cole o conteúdo de `supabase/triggers.sql` e execute.
   - Copie e cole o conteúdo de `supabase/policies.sql` e execute.
   - Copie e cole o conteúdo de `supabase/seed.sql` para popular o banco com os leitos iniciais.

4. **Habilite o Realtime** para a tabela `beds` e `reservations`:

   - Vá em **Database > Replication**.
   - Clique em "0 tables" e ative a replicação para as tabelas `beds` e `reservations`.

### 5. Configurar Variáveis de Ambiente

1. Encontre as chaves de API do seu projeto Supabase em **Project Settings > API**.

2. Renomeie o arquivo `.env.example` para `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

3. Abra o arquivo `.env.local` e adicione as suas credenciais do Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU_ID_DE_PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA
   ```

### 6. Rodar a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## 🧪 Rodando os Testes

Para rodar os testes unitários e de integração, use o comando:

```bash
pnpm test
```

## ☁️ Deploy no Vercel

O deploy na [Vercel](https://vercel.com/) é a forma mais recomendada para este projeto.

1. Faça o push do seu código para um repositório Git (GitHub, GitLab, etc.).

2. Crie um novo projeto na Vercel e importe seu repositório.

3. **Adicione as variáveis de ambiente** (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto na Vercel.

4. Clique em **Deploy**. A Vercel fará o build e o deploy do seu site automaticamente.

## 🗂️ Estrutura do Projeto

A estrutura de arquivos segue as convenções do Next.js App Router, com uma organização clara de responsabilidades:

```
gestao-leitos/
├── app/              # Páginas e layouts do Next.js
├── components/       # Componentes React (UI e de negócio)
├── hooks/            # Hooks customizados (useBeds, useActions)
├── lib/              # Funções utilitárias, tipos e cliente Supabase
├── supabase/         # Scripts SQL (schema, triggers, policies, seed)
├── __tests__/        # Arquivos de teste
├── public/           # Arquivos estáticos (manifest, ícones)
├── .env.example      # Exemplo de variáveis de ambiente
├── next.config.js    # Configurações do Next.js
├── package.json      # Dependências e scripts
└── README.md         # Este arquivo
```

## 📄 Licença

Este projeto é de código aberto e distribuído sob a licença MIT. Sinta-se à vontade para usar, modificar e distribuir conforme necessário.

