"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Search, ArrowRightLeft, History, ChevronDown } from "lucide-react";
import { useToast } from "../components/Toast";

interface Produto {
  id: string;
  nome: string;
  precoVenda: number;
  estoque: number;
}

interface ItemPedido {
  id: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
  produto: { id: string; nome: string };
}

interface PedidoComItens {
  id: string;
  valorTotal: number;
  pago: boolean;
  metodoPagamento: string | null;
  criadoEm: string;
  itens: ItemPedido[];
  mesa?: { numero: number } | null;
  comanda?: { id: string; clienteNome: string | null } | null;
}

interface TrocaRegistro {
  id: string;
  data: string;
  qtdDevolvida: number;
  qtdNova: number;
  valorOriginal: number;
  valorNovo: number;
  diferenca: number;
  resolucaoDiferenca: string | null;
  metodoPagamento: string | null;
  motivo: string | null;
  produtoOriginal: { nome: string };
  produtoNovo: { nome: string } | null;
}

export default function TrocasPage() {
  const toast = useToast();
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [trocas, setTrocas] = useState<TrocaRegistro[]>([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(false);

  // Seleção
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoComItens | null>(null);
  const [itemSelecionado, setItemSelecionado] = useState<ItemPedido | null>(null);
  const [qtdDevolvida, setQtdDevolvida] = useState(1);
  const [produtoNovoId, setProdutoNovoId] = useState("");
  const [qtdNova, setQtdNova] = useState(1);
  const [resolucao, setResolucao] = useState("COBRADO");
  const [metodoPagamento, setMetodoPagamento] = useState("DINHEIRO");
  const [motivo, setMotivo] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");

  const hoje = new Date().toISOString().split("T")[0];

  const carregarPedidosDoDia = async () => {
    setLoading(true);
    const res = await fetch(`/api/movimentacoes?categoria=VENDA&dataInicio=${hoje}&dataFim=${hoje}`);
    // Buscar pedidos pagos do dia
    const resPedidos = await fetch(`/api/pedidos?data=${hoje}`);
    if (resPedidos.ok) {
      setPedidos(await resPedidos.json());
    }
    setLoading(false);
  };

  const carregarProdutos = async () => {
    const res = await fetch("/api/produtos");
    if (res.ok) setProdutos(await res.json());
  };

  const carregarTrocas = async () => {
    const res = await fetch(`/api/trocas?dataInicio=${hoje}&dataFim=${hoje}`);
    if (res.ok) setTrocas(await res.json());
  };

  useEffect(() => {
    carregarPedidosDoDia();
    carregarProdutos();
    carregarTrocas();
  }, []);

  const selecionarItem = (pedido: PedidoComItens, item: ItemPedido) => {
    setPedidoSelecionado(pedido);
    setItemSelecionado(item);
    setQtdDevolvida(1);
    setProdutoNovoId("");
    setQtdNova(1);
    setMotivo("");
    setResolucao("COBRADO");
  };

  const produtoNovo = produtos.find((p) => p.id === produtoNovoId);
  const valorOriginal = itemSelecionado ? qtdDevolvida * itemSelecionado.precoUnit : 0;
  const valorNovo = produtoNovo ? qtdNova * produtoNovo.precoVenda : 0;
  const diferenca = valorNovo - valorOriginal;

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) &&
      p.id !== itemSelecionado?.produto.id
  );

  const registrarTroca = async () => {
    if (!itemSelecionado) return;

    if (!produtoNovoId && resolucao !== "DEVOLVIDO") {
      toast.warning("Selecione um produto novo ou escolha 'Devolver em dinheiro'");
      return;
    }

    setProcessando(true);

    const body: any = {
      pedidoItemId: itemSelecionado.id,
      qtdDevolvida,
      motivo,
    };

    if (produtoNovoId) {
      body.produtoNovoId = produtoNovoId;
      body.qtdNova = qtdNova;
    }

    if (Math.abs(diferenca) > 0.01) {
      body.resolucaoDiferenca = resolucao;
      if (diferenca > 0.01) {
        body.metodoPagamento = metodoPagamento;
      }
    }

    // Se não tem produto novo, é só devolução em dinheiro
    if (!produtoNovoId) {
      body.resolucaoDiferenca = "DEVOLVIDO";
    }

    const res = await fetch("/api/trocas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success("Troca registrada com sucesso!");
      setPedidoSelecionado(null);
      setItemSelecionado(null);
      carregarPedidosDoDia();
      carregarProdutos();
      carregarTrocas();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao registrar troca");
    }
    setProcessando(false);
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="border-l-4 border-violet-600 pl-4 py-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Trocas</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Troque produtos de vendas realizadas hoje</p>
      </header>

      {/* PEDIDOS DO DIA */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-violet-600" />
            <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Pedidos do Dia</h2>
          </div>
          <button onClick={carregarPedidosDoDia} className="text-slate-400 hover:text-violet-600 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold italic animate-pulse">Carregando...</div>
        ) : pedidos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold italic">Nenhum pedido encontrado hoje</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {pedido.mesa && (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                        Mesa {pedido.mesa.numero}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      pedido.pago ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {pedido.pago ? "Pago" : "Pendente"}
                    </span>
                  </div>
                  <span className="font-black text-sm text-emerald-600 italic font-mono">R$ {pedido.valorTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {item.quantidade}x {item.produto.nome}
                        <span className="text-slate-400 ml-2 font-mono">R$ {item.subtotal.toFixed(2)}</span>
                      </span>
                      <button
                        onClick={() => selecionarItem(pedido, item)}
                        className={`text-[9px] font-black uppercase px-3 py-1 rounded-full transition-all ${
                          itemSelecionado?.id === item.id
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-violet-100 hover:text-violet-600"
                        }`}
                      >
                        <ArrowRightLeft size={10} className="inline mr-1" />
                        Trocar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FORMULÁRIO DE TROCA */}
      {itemSelecionado && (
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-violet-500 shadow-lg shadow-violet-500/10">
          <h2 className="font-black uppercase text-sm text-violet-600 tracking-tighter mb-6 flex items-center gap-2">
            <ArrowRightLeft size={18} /> Registrar Troca
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produto original */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">Devolvendo</p>
              <p className="font-black text-lg uppercase italic text-slate-800 dark:text-white">{itemSelecionado.produto.nome}</p>
              <p className="text-xs text-slate-500 font-mono">R$ {itemSelecionado.precoUnit.toFixed(2)} / unidade</p>

              <div className="mt-3 flex items-center gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Qtd</label>
                <select
                  value={qtdDevolvida}
                  onChange={(e) => setQtdDevolvida(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl font-black text-sm outline-none"
                >
                  {Array.from({ length: itemSelecionado.quantidade }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-400">de {itemSelecionado.quantidade}</span>
              </div>

              <p className="mt-2 text-sm font-black text-rose-500 font-mono">- R$ {valorOriginal.toFixed(2)}</p>
            </div>

            {/* Produto novo */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Novo Produto</p>

              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-bold text-sm outline-none mb-2"
              />

              <select
                value={produtoNovoId}
                onChange={(e) => setProdutoNovoId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-bold text-sm outline-none appearance-none"
              >
                <option value="">-- Só devolver (sem trocar) --</option>
                {produtosFiltrados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — R$ {p.precoVenda.toFixed(2)} (est: {p.estoque})
                  </option>
                ))}
              </select>

              {produtoNovoId && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    max={produtoNovo?.estoque || 1}
                    value={qtdNova}
                    onChange={(e) => setQtdNova(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl font-black text-sm text-center outline-none"
                  />
                </div>
              )}

              {produtoNovoId && (
                <p className="mt-2 text-sm font-black text-emerald-500 font-mono">+ R$ {valorNovo.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Diferença */}
          <div className={`mt-4 p-4 rounded-2xl text-center ${
            Math.abs(diferenca) <= 0.01
              ? "bg-slate-100 dark:bg-slate-800"
              : diferenca > 0
              ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-300"
              : "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300"
          }`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Diferença</p>
            <p className={`text-2xl font-black italic font-mono ${
              Math.abs(diferenca) <= 0.01 ? "text-slate-400" : diferenca > 0 ? "text-amber-600" : "text-emerald-600"
            }`}>
              {diferenca > 0 ? "+" : ""}{diferenca === 0 ? "" : "R$ "}{diferenca === 0 ? "SEM DIFERENÇA" : diferenca.toFixed(2)}
            </p>
            {diferenca > 0.01 && <p className="text-[10px] text-amber-600 font-bold mt-1">Cliente precisa pagar a diferença</p>}
            {diferenca < -0.01 && <p className="text-[10px] text-emerald-600 font-bold mt-1">Cliente tem crédito/devolução</p>}
          </div>

          {/* Resolução da diferença */}
          {Math.abs(diferenca) > 0.01 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resolução</label>
                <select
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none"
                >
                  {diferenca > 0 ? (
                    <option value="COBRADO">Cobrar diferença do cliente</option>
                  ) : (
                    <>
                      <option value="DEVOLVIDO">Devolver em dinheiro</option>
                      <option value="CREDITO">Gerar crédito</option>
                    </>
                  )}
                </select>
              </div>

              {diferenca > 0.01 && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pagamento</label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none"
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="DÉBITO">Débito</option>
                    <option value="CRÉDITO">Crédito</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Motivo */}
          <div className="mt-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none"
              placeholder="Ex: Cliente não gostou, produto errado..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { setItemSelecionado(null); setPedidoSelecionado(null); }}
              className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-300"
            >
              Cancelar
            </button>
            <button
              onClick={registrarTroca}
              disabled={processando}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
            >
              <ArrowRightLeft size={16} /> {processando ? "Processando..." : "Confirmar Troca"}
            </button>
          </div>
        </section>
      )}

      {/* HISTÓRICO */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <History size={18} className="text-violet-600" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Trocas do Dia</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-4">Hora</th>
              <th className="p-4">Devolvido</th>
              <th className="p-4">Novo</th>
              <th className="p-4 text-right">Diferença</th>
              <th className="p-4">Resolução</th>
              <th className="p-4">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trocas.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-xs font-bold text-slate-500">{new Date(t.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                <td className="p-4 text-xs font-bold text-rose-500 uppercase italic">{t.qtdDevolvida}x {t.produtoOriginal.nome}</td>
                <td className="p-4 text-xs font-bold text-emerald-500 uppercase italic">{t.produtoNovo ? `${t.qtdNova}x ${t.produtoNovo.nome}` : "—"}</td>
                <td className={`p-4 text-right font-black text-sm font-mono ${t.diferenca > 0 ? "text-amber-600" : t.diferenca < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                  {t.diferenca === 0 ? "—" : `${t.diferenca > 0 ? "+" : ""}R$ ${t.diferenca.toFixed(2)}`}
                </td>
                <td className="p-4">
                  {t.resolucaoDiferenca ? (
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      t.resolucaoDiferenca === "COBRADO" ? "bg-amber-100 text-amber-600" :
                      t.resolucaoDiferenca === "DEVOLVIDO" ? "bg-emerald-100 text-emerald-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {t.resolucaoDiferenca}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td className="p-4 text-xs text-slate-500 italic">{t.motivo || "—"}</td>
              </tr>
            ))}
            {trocas.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold italic">Nenhuma troca hoje</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
