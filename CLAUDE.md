# RecantoBar - Fluxo de Caixa

## Visao Geral
Sistema de PDV (Ponto de Venda) e fluxo de caixa para o Recanto Bar. Controla vendas, compras, estoque, perdas, despesas operacionais, contas a pagar/receber e gera relatorios financeiros completos.

## Tech Stack
- **Framework:** Next.js 15.1.0 (App Router) + React 19
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Prisma 6.19.2
- **Estilizacao:** Tailwind CSS 4
- **Icones:** Lucide React
- **PDF:** jsPDF + jsPDF-AutoTable

## Estrutura do Projeto
```
app/
├── api/
│   ├── caixa/
│   │   ├── abrir/            # GET caixa aberto | POST abrir novo caixa
│   │   ├── fechar/           # POST fechar caixa com conferencia
│   │   ├── sangria/          # POST retirada de dinheiro do caixa
│   │   ├── suprimento/       # POST adicao de dinheiro ao caixa
│   │   └── route.ts          # GET historico de caixas
│   ├── categorias/           # CRUD categorias
│   ├── contas/
│   │   ├── [id]/
│   │   │   ├── pagar/        # POST marcar conta como paga
│   │   │   └── route.ts      # PUT/DELETE conta individual
│   │   └── route.ts          # GET listar | POST criar contas
│   ├── dashboard/starts/     # GET KPIs (com filtro de data)
│   ├── movimentacoes/
│   │   ├── despesa/          # POST registrar despesa operacional
│   │   ├── lote/             # POST entrada de compras em lote
│   │   ├── venda/            # POST registro de vendas
│   │   └── route.ts          # GET movimentacoes (com filtros)
│   ├── perdas/               # GET listar | POST registrar perda (com impacto financeiro)
│   ├── produtos/             # CRUD produtos
│   └── relatorios/
│       ├── dre/              # GET demonstrativo de resultado
│       └── margem/           # GET margem por produto/categoria
├── caixa/
│   ├── page.tsx              # Gestao de caixa (abrir/fechar/sangria/suprimento)
│   └── saldo-inicial/        # Abertura rapida de caixa
├── compras/                  # Entrada de compras em lote
├── contas/                   # Contas a pagar e receber
├── dashboard/
│   ├── page.tsx              # Dashboard com KPIs
│   └── relatorios/
│       ├── page.tsx          # Relatorio geral (com filtro de data)
│       ├── compras/          # Sugestao de compra
│       ├── dre/              # DRE - Demonstrativo de Resultado
│       └── margem/           # Margem por produto
├── despesas/                 # Despesas operacionais
├── perdas/                   # Registro de perdas (com valor financeiro)
├── produtos/                 # Gestao de produtos
├── categorias/               # Gestao de categorias
├── components/
│   ├── DateRangeFilter.tsx   # Filtro de periodo reutilizavel
│   └── Sidebar.tsx           # Menu lateral com accordion
├── page.tsx                  # PDV (pagina de vendas)
├── DataContext.tsx            # Context global (categorias)
└── globals.css
lib/
├── caixa.ts                  # Utilitarios: getCaixaAberto(), requireCaixaAberto()
└── prisma.ts                 # Cliente Prisma singleton
prisma/
├── schema.prisma             # Schema do banco
└── migrations/
```

## Modelos do Banco (Prisma)
- **Categoria** - Categorias de produtos (nome unico)
- **Produto** - Produtos com preco de venda/custo, estoque, estoque minimo/seguro, vinculado a categoria
- **Movimentacao** - Transacoes financeiras com:
  - `tipo`: ENTRADA (dinheiro saindo) ou SAIDA (dinheiro entrando) - convencao centrada no produto
  - `categoria`: VENDA, COMPRA, DESPESA, PERDA, SANGRIA, SUPRIMENTO
  - `subcategoria`: para despesas (ALUGUEL, LUZ, AGUA, SALARIOS, etc.)
  - `caixaId`: vinculo com o caixa aberto
- **Perda** - Perdas com vinculo a movimentacao financeira
- **Caixa** - Caixa com abertura/fechamento, valor inicial/atual/fechamento, diferenca, observacao
- **ContaPagarReceber** - Contas a pagar e receber com vencimento, status e vinculo a movimentacao

## Convencao IMPORTANTE de Tipos
A convencao de ENTRADA/SAIDA e centrada no PRODUTO, nao no dinheiro:
- **SAIDA** = produto sai do estoque = DINHEIRO ENTRA (venda, suprimento)
- **ENTRADA** = produto entra no estoque = DINHEIRO SAI (compra, despesa, perda, sangria)
O campo `categoria` disambigua o significado real.

## Funcionalidades
- **PDV** com carrinho, multiplos metodos de pagamento (PIX, DINHEIRO, DEBITO, CREDITO)
- **Gestao de Caixa** completa: abertura, fechamento com conferencia, sangria, suprimento, historico
- **Dashboard** com KPIs: faturamento, compras, ticket medio, saldo caixa, despesas, perdas, lucro liquido
- **Despesas Operacionais** por subcategoria (aluguel, luz, agua, salarios, etc.)
- **Registro de Perdas** com impacto financeiro automatico
- **Contas a Pagar/Receber** com vencimento, pagamento e cancelamento
- **Relatorios** com filtro de periodo e exportacao PDF
- **DRE** - Demonstrativo de Resultado (receita, CMV, despesas, perdas, resultado liquido)
- **Margem por Produto** e por categoria com potencial de lucro
- **Alertas** de estoque baixo e sugestoes de compra

## Comandos
```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de producao
npx prisma studio        # Interface visual do banco
npx prisma db push       # Sincronizar schema com banco
npx prisma generate      # Gerar cliente Prisma
```
