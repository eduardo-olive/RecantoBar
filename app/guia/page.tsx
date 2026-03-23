"use client";

import { useState } from "react";
import {
  Users, Shield, Tags, Package, Grid3X3, Truck, ClipboardCheck,
  Coins, Banknote, ShoppingCart, UtensilsCrossed, CreditCard,
  Receipt, AlertTriangle, FileText, ChevronDown, ChevronRight,
  ArrowRight, CheckCircle2, Info, AlertCircle, BookOpen
} from "lucide-react";

const fases = [
  {
    id: 1,
    titulo: "Configuração Inicial",
    descricao: "Perfis de acesso e usuários do sistema",
    cor: "violet",
    icone: Shield,
    etapas: [
      {
        titulo: "Criar Perfis / Cargos",
        rota: "/configuracoes",
        icone: Shield,
        descricao: "Defina os cargos do estabelecimento e suas permissões de acesso.",
        campos: [
          { nome: "Nome", obrigatorio: true, desc: "Nome do perfil (ex: Gerente, Garçom, Cozinheiro)" },
          { nome: "Permissões", obrigatorio: true, desc: "Array de permissões: vendas, caixa, estoque, financeiro, relatorios, admin, usuarios" },
        ],
        exemplos: [
          { perfil: "Gerente", permissoes: "Todas as permissões" },
          { perfil: "Garçom", permissoes: "vendas" },
          { perfil: "Cozinheiro", permissoes: "vendas (tela cozinha)" },
          { perfil: "Caixa", permissoes: "vendas, caixa" },
        ],
        dica: "As permissões controlam quais menus aparecem na barra lateral. Um garçom só verá o PDV e as mesas.",
      },
      {
        titulo: "Criar Usuários",
        rota: "/usuarios",
        icone: Users,
        descricao: "Cadastre os funcionários que vão operar o sistema.",
        campos: [
          { nome: "Nome", obrigatorio: true, desc: "Nome completo do funcionário" },
          { nome: "Email", obrigatorio: true, desc: "Único — usado para login" },
          { nome: "Senha", obrigatorio: true, desc: "Criptografada automaticamente (bcrypt)" },
          { nome: "Perfil", obrigatorio: true, desc: "Selecione entre os perfis cadastrados" },
        ],
        dica: "Você pode ativar/desativar usuários sem excluí-los, mantendo o histórico.",
        tipoDica: "success",
      },
    ],
  },
  {
    id: 2,
    titulo: "Cadastros Base",
    descricao: "Categorias, produtos e mesas",
    cor: "blue",
    icone: Package,
    etapas: [
      {
        titulo: "Criar Categorias",
        rota: "/categorias",
        icone: Tags,
        descricao: "Organize seus produtos em categorias.",
        passos: [
          "Digite o nome da categoria (ex: Bebidas, Pratos, Porções, Sobremesas)",
          'Clique em "ADICIONAR"',
          "Categorias aparecem como cards em grade",
          "Cada card tem botão de excluir (com confirmação)",
        ],
        alerta: "O nome da categoria deve ser único. Não é possível criar duas categorias com o mesmo nome.",
      },
      {
        titulo: "Criar Produtos",
        rota: "/produtos",
        icone: Package,
        descricao: "Cadastre todos os itens do cardápio.",
        campos: [
          { nome: "Nome", obrigatorio: true, desc: "Convertido para MAIÚSCULO automaticamente" },
          { nome: "Categoria", obrigatorio: true, desc: "Dropdown das categorias cadastradas (A-Z)" },
          { nome: "Estoque Mínimo", obrigatorio: false, desc: "Alerta no dashboard quando atingir esse nível" },
          { nome: "Capacidade Máxima", obrigatorio: false, desc: "Estoque de segurança ideal" },
        ],
        dica: "Preço de venda, preço de custo e estoque começam em zero. Serão definidos na entrada de estoque (Fase 3).",
      },
      {
        titulo: "Criar Mesas",
        rota: "/mesas",
        icone: Grid3X3,
        descricao: "Configure as mesas do estabelecimento.",
        campos: [
          { nome: "Número", obrigatorio: true, desc: "Único — identifica a mesa" },
          { nome: "Nome", obrigatorio: false, desc: 'Ex: "Varanda", "Salão", "VIP"' },
          { nome: "Capacidade", obrigatorio: false, desc: "Padrão: 4 lugares" },
        ],
        statusMesa: true,
      },
    ],
  },
  {
    id: 3,
    titulo: "Abastecimento de Estoque",
    descricao: "Entrada de mercadorias e ajustes",
    cor: "cyan",
    icone: Truck,
    etapas: [
      {
        titulo: "Entrada de Estoque / Compras",
        rota: "/compras",
        icone: Truck,
        descricao: "Registre a entrada de mercadorias com preços.",
        duasColunas: {
          esquerda: {
            titulo: "Painel Esquerdo — Busca",
            passos: [
              "Busque o produto pelo nome",
              "Clique no card do produto",
              "Modal abre com: Quantidade, Custo Unitário (R$), Novo Preço Venda (R$)",
              'Clique "Adicionar à Lista"',
            ],
          },
          direita: {
            titulo: "Painel Direito — Lista de Entrada",
            passos: [
              "Itens adicionados aparecem aqui",
              "Mostra qtd × custo unitário de cada item",
              "Total do investimento no rodapé",
              'Clique "CONFIRMAR ENTRADA"',
            ],
          },
        },
        dica: "Estoque atualizado, preços de custo/venda definidos, movimentações de COMPRA criadas e saldo do caixa ajustado.",
        tipoDica: "success",
      },
      {
        titulo: "Ajuste de Estoque",
        rota: "/ajuste-estoque",
        icone: ClipboardCheck,
        descricao: "Ajuste rápido de quantidades e preços direto na tabela.",
        passos: [
          "Tabela editável: Produto | Estoque | Custo (R$) | Venda (R$) | Margem %",
          "Clique na célula para editar o valor",
          "Margem calculada em tempo real e colorida por faixa",
          "Barra superior mostra quantos itens foram alterados",
          "Salva todas as alterações de uma vez",
        ],
        margens: true,
      },
    ],
  },
  {
    id: 4,
    titulo: "Abertura do Caixa",
    descricao: "Obrigatório antes de vender",
    cor: "amber",
    icone: Coins,
    etapas: [
      {
        titulo: "Abrir Caixa",
        rota: "/caixa/saldo-inicial",
        icone: Coins,
        descricao: "Informe o valor em dinheiro para abrir o caixa do dia.",
        passos: [
          "Informe o valor inicial em dinheiro (troco do dia)",
          'Clique "CONFIRMAR SALDO"',
          "Sistema cria o caixa com status aberto",
          "Redireciona para o Dashboard",
        ],
        alerta: "Só pode haver 1 caixa aberto por vez em todo o sistema. Vendas só funcionam com caixa aberto.",
      },
      {
        titulo: "Gestão do Caixa",
        rota: "/caixa",
        icone: Banknote,
        descricao: "Gerencie o dinheiro no caixa durante o dia.",
        duasColunas: {
          esquerda: {
            titulo: "Sangria (Retirada)",
            passos: [
              "Valor a retirar (R$)",
              "Motivo da retirada",
              "Saldo do caixa diminui",
            ],
            cor: "rose",
          },
          direita: {
            titulo: "Suprimento (Adição)",
            passos: [
              "Valor a adicionar (R$)",
              "Motivo da adição",
              "Saldo do caixa aumenta",
            ],
            cor: "emerald",
          },
        },
        fechamento: true,
      },
    ],
  },
  {
    id: 5,
    titulo: "Vendas (PDV)",
    descricao: "Dois modos: venda direta e comanda",
    cor: "emerald",
    icone: ShoppingCart,
    etapas: [
      {
        titulo: "Tela do PDV",
        rota: "/",
        icone: ShoppingCart,
        descricao: "Interface principal de vendas com dois painéis.",
        duasColunas: {
          esquerda: {
            titulo: "Painel Esquerdo — Produtos",
            passos: [
              "Campo de busca por nome",
              "Grade de cards com: nome, estoque, preço",
              "Cards desabilitados se estoque = 0",
              "Clique no card → modal de quantidade",
              "Modal valida: não permite exceder estoque",
            ],
          },
          direita: {
            titulo: "Painel Direito — Carrinho",
            passos: [
              "Lista de itens com qtd, preço, subtotal",
              "Botão de remover (lixeira vermelha)",
              "Seletor de mesa (opcional)",
              "Total a pagar em destaque",
              "Métodos de pagamento",
            ],
          },
        },
        pagamentos: true,
      },
      {
        titulo: "Modo A — Venda Direta",
        icone: CheckCircle2,
        descricao: "Cliente paga na hora, sem comanda.",
        tag: "Paga na hora",
        tagCor: "emerald",
        passos: [
          "Busque e adicione produtos ao carrinho",
          "(Opcional) Selecione uma mesa",
          "Escolha o método de pagamento",
          'Clique "FINALIZAR VENDA" (botão verde)',
        ],
        dica: "Sistema processa: Desconta estoque → Cria movimentação financeira → Atualiza saldo do caixa → Limpa carrinho",
        tipoDica: "success",
      },
      {
        titulo: "Modo B — Venda por Comanda",
        icone: CreditCard,
        descricao: "Cliente abre uma tab e paga ao final.",
        tag: "Paga depois",
        tagCor: "amber",
        passos: [
          "Selecione uma mesa no PDV",
          'Se não tem comanda aberta → botão "ABRIR COMANDA" aparece',
          "Informe o nome do cliente (opcional) e abra a comanda",
          "Carrinho muda para modo COMANDA (visual laranja)",
          "Adicione produtos ao carrinho",
          'Clique "ENVIAR PEDIDO" (botão laranja)',
          "Pode enviar múltiplos pedidos para a mesma comanda",
          "Itens com preparo vão para a Cozinha",
        ],
        alerta: "Na comanda, o dinheiro não entra no caixa ainda. O estoque é descontado, mas a cobrança só acontece ao fechar a comanda (Fase 7).",
      },
    ],
  },
  {
    id: 6,
    titulo: "Cozinha",
    descricao: "Acompanhamento de pedidos com preparo",
    cor: "rose",
    icone: UtensilsCrossed,
    etapas: [
      {
        titulo: "Tela da Cozinha",
        rota: "/cozinha",
        icone: UtensilsCrossed,
        descricao: "Atualiza automaticamente a cada 10 segundos. Mostra pedidos agrupados por mesa.",
        cozinha: true,
        passos: [
          "Cada card mostra: qtd × produto, tempo decorrido, status",
          "Contadores no topo: X pendentes, X preparando, X prontos",
          "Produtos sem preparo (ex: bebidas) pulam direto para ENTREGUE",
        ],
        dica: 'Marque o campo "requerPreparo" como true nos produtos que passam pela cozinha (pratos, porções). Bebidas e itens simples ficam como false.',
      },
    ],
  },
  {
    id: 7,
    titulo: "Fechamento de Comanda",
    descricao: "Cobrança e liberação da mesa",
    cor: "pink",
    icone: CreditCard,
    etapas: [
      {
        titulo: "Visualizar Comanda",
        rota: "/mesas",
        icone: Grid3X3,
        descricao: "Na tela de Mesas, mesas com comanda aberta têm visual âmbar.",
        passos: [
          "Clique no ícone de olho para ver todos os pedidos",
          "Modal mostra cada pedido com: horário, itens, valores, status (pago/pendente)",
          "Total geral da comanda no rodapé",
        ],
      },
      {
        titulo: "Fechar Comanda e Receber Pagamento",
        icone: CreditCard,
        descricao: "Colete o pagamento e libere a mesa.",
        passos: [
          'Clique no ícone de cartão na mesa ou "Fechar Comanda" no modal',
          "Resumo de todos os pedidos e total aparece",
          "Escolha o método de pagamento e informe o valor",
          'Para dividir: clique em "Dividir" e adicione múltiplos pagamentos',
          "Sistema valida: mostra se falta valor, excede ou confere",
          "Confirme o pagamento",
        ],
        pagamentoDividido: true,
        dica: "Ao confirmar: Cria movimentações financeiras → Atualiza saldo do caixa → Fecha comanda → Marca pedidos como pagos → Mesa volta para LIVRE",
        tipoDica: "success",
      },
    ],
  },
];

const coresMap: Record<string, { bg: string; text: string; border: string; bgLight: string; ring: string }> = {
  violet: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30", bgLight: "bg-violet-500/10", ring: "ring-violet-500/20" },
  blue:   { bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/30",   bgLight: "bg-blue-500/10",   ring: "ring-blue-500/20" },
  cyan:   { bg: "bg-cyan-500/20",   text: "text-cyan-400",   border: "border-cyan-500/30",   bgLight: "bg-cyan-500/10",   ring: "ring-cyan-500/20" },
  amber:  { bg: "bg-amber-500/20",  text: "text-amber-400",  border: "border-amber-500/30",  bgLight: "bg-amber-500/10",  ring: "ring-amber-500/20" },
  emerald:{ bg: "bg-emerald-500/20",text: "text-emerald-400",border: "border-emerald-500/30",bgLight: "bg-emerald-500/10",ring: "ring-emerald-500/20" },
  rose:   { bg: "bg-rose-500/20",   text: "text-rose-400",   border: "border-rose-500/30",   bgLight: "bg-rose-500/10",   ring: "ring-rose-500/20" },
  pink:   { bg: "bg-pink-500/20",   text: "text-pink-400",   border: "border-pink-500/30",   bgLight: "bg-pink-500/10",   ring: "ring-pink-500/20" },
};

export default function GuiaPage() {
  const [faseAberta, setFaseAberta] = useState<number | null>(1);

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
          Guia do Sistema
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
          Passo a passo completo — Do cadastro à venda
        </p>
      </header>

      {/* Resumo visual do fluxo */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-blue-500" />
          Fluxo Resumido
        </h3>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {fases.map((fase, i) => {
            const cores = coresMap[fase.cor];
            return (
              <div key={fase.id} className="flex items-center gap-2">
                <button
                  onClick={() => setFaseAberta(faseAberta === fase.id ? null : fase.id)}
                  className={`${cores.bg} ${cores.text} ${cores.border} border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:scale-105 transition-all cursor-pointer`}
                >
                  {fase.id}. {fase.titulo}
                </button>
                {i < fases.length - 1 && (
                  <ArrowRight size={14} className="text-slate-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fases */}
      <div className="space-y-4">
        {fases.map((fase) => {
          const cores = coresMap[fase.cor];
          const aberta = faseAberta === fase.id;

          return (
            <div key={fase.id} className={`border rounded-2xl transition-all ${aberta ? `${cores.border} ${cores.ring} ring-1` : "border-slate-200 dark:border-slate-800"}`}>
              {/* Fase header */}
              <button
                onClick={() => setFaseAberta(aberta ? null : fase.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cores.bg} flex-shrink-0`}>
                  <span className={`text-lg font-black ${cores.text}`}>{fase.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {fase.titulo}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{fase.descricao}</p>
                </div>
                <fase.icone size={20} className={cores.text} />
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${aberta ? "rotate-180" : ""}`} />
              </button>

              {/* Fase conteúdo */}
              <div className={`overflow-hidden transition-all duration-300 ${aberta ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-5 space-y-4">
                  {fase.etapas.map((etapa: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 space-y-4">
                      {/* Etapa título */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <etapa.icone size={18} className={cores.text} />
                          {etapa.titulo}
                          {etapa.tag && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              etapa.tagCor === "emerald" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                            }`}>
                              {etapa.tag}
                            </span>
                          )}
                        </h3>
                        {etapa.rota && (
                          <a href={etapa.rota} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-mono">
                            {etapa.rota}
                          </a>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">{etapa.descricao}</p>

                      {/* Campos (tabela) */}
                      {etapa.campos && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-blue-500">Campo</th>
                                <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-blue-500">Obrigatório</th>
                                <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-blue-500">Descrição</th>
                              </tr>
                            </thead>
                            <tbody>
                              {etapa.campos.map((c: any, ci: number) => (
                                <tr key={ci} className="border-b border-slate-100 dark:border-slate-700/50">
                                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{c.nome}</td>
                                  <td className="py-2 px-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                      c.obrigatorio ? "bg-rose-500/15 text-rose-400" : "bg-slate-500/15 text-slate-400"
                                    }`}>
                                      {c.obrigatorio ? "Sim" : "Não"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{c.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Exemplos (perfis) */}
                      {etapa.exemplos && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-violet-400">Perfil</th>
                                <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-violet-400">Permissões</th>
                              </tr>
                            </thead>
                            <tbody>
                              {etapa.exemplos.map((ex: any, ei: number) => (
                                <tr key={ei} className="border-b border-slate-100 dark:border-slate-700/50">
                                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{ex.perfil}</td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{ex.permissoes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Passos numerados */}
                      {etapa.passos && (
                        <ol className="space-y-2 ml-1">
                          {etapa.passos.map((p: string, pi: number) => (
                            <li key={pi} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${cores.bg} ${cores.text}`}>
                                {pi + 1}
                              </span>
                              {p}
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Duas colunas */}
                      {etapa.duasColunas && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {[etapa.duasColunas.esquerda, etapa.duasColunas.direita].map((col: any, ci: number) => (
                            <div key={ci} className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border ${
                              col.cor === "rose" ? "border-rose-500/20" : col.cor === "emerald" ? "border-emerald-500/20" : "border-slate-200 dark:border-slate-700/50"
                            }`}>
                              <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                                col.cor === "rose" ? "text-rose-400" : col.cor === "emerald" ? "text-emerald-400" : "text-slate-600 dark:text-slate-300"
                              }`}>
                                {col.titulo}
                              </h4>
                              <ol className="space-y-1.5">
                                {col.passos.map((p: string, pi: number) => (
                                  <li key={pi} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                    {p}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status de mesa */}
                      {etapa.statusMesa && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">LIVRE</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400">OCUPADA</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">COMANDA ABERTA</span>
                        </div>
                      )}

                      {/* Margens */}
                      {etapa.margens && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">&gt;50% Ótima</span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">&gt;30% Boa</span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">&gt;15% Regular</span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400">&lt;15% Baixa</span>
                        </div>
                      )}

                      {/* Pagamentos */}
                      {etapa.pagamentos && (
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Métodos de Pagamento</p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">DINHEIRO</span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">PIX</span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">DÉBITO</span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">CRÉDITO</span>
                          </div>
                        </div>
                      )}

                      {/* Cozinha workflow */}
                      {etapa.cozinha && (
                        <div className="flex items-center gap-2 flex-wrap justify-center py-3">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400">PENDENTE</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500">Preparar</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400">PREPARANDO</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500">Pronto</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">PRONTO</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500">Entregue</span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-500/15 text-slate-400">ENTREGUE</span>
                        </div>
                      )}

                      {/* Fechamento do caixa */}
                      {etapa.fechamento && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                            Fechar Caixa (fim do dia)
                          </h4>
                          <ol className="space-y-1.5">
                            {[
                              "Conte o dinheiro físico na gaveta",
                              'Informe o "Valor Contado"',
                              'Sistema mostra o "Valor Esperado"',
                              "Calcula a diferença (sobra ou falta)",
                              "Adicione observações se necessário",
                              "Confirme o fechamento",
                            ].map((p, pi) => (
                              <li key={pi} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                                  {pi + 1}
                                </span>
                                {p}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Pagamento dividido */}
                      {etapa.pagamentoDividido && (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Pagamento Único</h4>
                            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                              <p>Total: R$ 85,00</p>
                              <p>PIX: R$ 85,00</p>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Valores conferem</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Pagamento Dividido</h4>
                            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                              <p>Total: R$ 85,00</p>
                              <p>PIX: R$ 50,00</p>
                              <p>DINHEIRO: R$ 35,00</p>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Valores conferem</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dica */}
                      {etapa.dica && (
                        <div className={`rounded-xl px-4 py-3 flex items-start gap-3 text-sm ${
                          etapa.tipoDica === "success"
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-blue-500/10 border border-blue-500/20"
                        }`}>
                          {etapa.tipoDica === "success" ? (
                            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={etapa.tipoDica === "success" ? "text-emerald-300" : "text-blue-300"}>
                            {etapa.dica}
                          </span>
                        </div>
                      )}

                      {/* Alerta */}
                      {etapa.alerta && (
                        <div className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-amber-300">{etapa.alerta}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operações complementares */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <FileText size={16} className="text-blue-500" />
          Operações Complementares
        </h3>

        <div className="grid md:grid-cols-3 gap-3">
          <a href="/despesas" className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-rose-400" />
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Despesas</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registre custos operacionais: Aluguel, Luz, Água, Internet, Salários, Fornecedores, Manutenção, Limpeza.
            </p>
          </a>

          <a href="/perdas" className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Perdas</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registre produtos perdidos (Vencimento, Quebra, Consumo Interno). Valor = qtd × preço de custo.
            </p>
          </a>

          <a href="/contas" className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} className="text-blue-400" />
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Contas</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contas a pagar e receber com vencimento, status e pagamento dividido por categoria.
            </p>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {[
            { rota: "/dashboard/relatorios/dre", titulo: "DRE", desc: "Receita - CMV - Despesas - Perdas = Resultado Líquido" },
            { rota: "/dashboard/relatorios/margem", titulo: "Margem por Produto", desc: "Margem por produto e categoria com potencial de lucro" },
            { rota: "/dashboard/relatorios/compras", titulo: "Sugestão de Compra", desc: "Baseada em estoque mínimo e tendências de venda" },
            { rota: "/dashboard/relatorios", titulo: "Relatórios", desc: "Relatório geral com filtro por período e exportação PDF" },
          ].map((r) => (
            <a key={r.rota} href={r.rota} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 hover:border-blue-500/30 transition-colors">
              <FileText size={14} className="text-blue-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-white">{r.titulo}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Fluxo visual final */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-6 text-center">
          Fluxo Visual Completo
        </h3>

        <div className="flex flex-col items-center gap-3">
          {/* Linha 1 - Setup */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Perfis", "Usuários", "Categorias", "Produtos", "Mesas"].map((item, i) => (
              <div key={item} className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${
                  i < 2 ? "bg-violet-500/15 border-violet-500/20 text-violet-400" : "bg-blue-500/15 border-blue-500/20 text-blue-400"
                }`}>{item}</span>
                {i < 4 && <ArrowRight size={12} className="text-slate-500" />}
              </div>
            ))}
          </div>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400">
            Entrada de Estoque (preços + quantidades)
          </span>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400">
            Abrir Caixa (valor inicial)
          </span>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          {/* Split */}
          <div className="flex gap-8 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Modo Direto</span>
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">Venda Direta</span>
              <ArrowRight size={12} className="text-slate-500 rotate-90" />
              <span className="text-[9px] text-slate-500">Paga na hora</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Modo Comanda</span>
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400">Abrir Comanda</span>
              <ArrowRight size={12} className="text-slate-500 rotate-90" />
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400">Enviar Pedidos</span>
              <ArrowRight size={12} className="text-slate-500 rotate-90" />
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400">Cozinha</span>
              <ArrowRight size={12} className="text-slate-500 rotate-90" />
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-pink-500/15 border border-pink-500/20 text-pink-400">Fechar Comanda</span>
              <ArrowRight size={12} className="text-slate-500 rotate-90" />
              <span className="text-[9px] text-slate-500">Paga ao fechar</span>
            </div>
          </div>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
            Caixa Atualizado
          </span>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400">
            Fechar Caixa (conferência)
          </span>

          <ArrowRight size={14} className="text-slate-500 rotate-90" />

          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 text-violet-400">
            Dashboard / Relatórios / DRE
          </span>
        </div>
      </div>
    </div>
  );
}
