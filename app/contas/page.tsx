"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

const CATEGORIAS_CONTA = [
  "ALUGUEL", "FORNECEDOR", "SERVICOS", "IMPOSTOS", "SALARIOS",
  "CLIENTE", "OUTROS"
];

export default function ContasPage() {
  const [dados, setDados] = useState<any>({ contas: [], resumo: { totalPagar: 0, totalReceber: 0 } });
  const [filtroTipo, setFiltroTipo] = useState<"" | "PAGAR" | "RECEBER">("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "PENDENTE" | "PAGO" | "CANCELADO">("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [tipo, setTipo] = useState("PAGAR");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [categoria, setCategoria] = useState("OUTROS");

  const carregar = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroStatus) params.set("status", filtroStatus);

    const res = await fetch(`/api/contas?${params}`);
    if (res.ok) setDados(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [filtroTipo, filtroStatus]);

  const criarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !dataVencimento) { alert("Preencha todos os campos!"); return; }

    const res = await fetch("/api/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, descricao, valor: Number(valor), dataVencimento, categoria }),
    });

    if (res.ok) {
      setShowForm(false);
      setDescricao(""); setValor(""); setDataVencimento(""); setCategoria("OUTROS");
      carregar();
      alert("Conta criada!");
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const pagarConta = async (id: string) => {
    if (!confirm("Confirma o pagamento desta conta?")) return;
    const res = await fetch(`/api/contas/${id}/pagar`, { method: "POST" });
    if (res.ok) { carregar(); alert("Conta paga!"); }
    else { const err = await res.json(); alert(err.error); }
  };

  const cancelarConta = async (id: string) => {
    if (!confirm("Cancelar esta conta?")) return;
    const res = await fetch(`/api/contas/${id}`, { method: "DELETE" });
    if (res.ok) carregar();
  };

  const isVencida = (data: string, status: string) => {
    return status === "PENDENTE" && new Date(data) < new Date();
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-amber-500 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Contas a Pagar / Receber</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de obrigações e recebimentos</p>
      </header>

      {/* RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-500 p-6 rounded-[32px] shadow-lg text-white">
          <p className="text-rose-200 font-black uppercase text-[10px] tracking-widest">A Pagar (Pendente)</p>
          <p className="text-3xl font-black italic mt-2">R$ {dados.resumo.totalPagar.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[32px] shadow-lg text-white">
          <p className="text-emerald-200 font-black uppercase text-[10px] tracking-widest">A Receber (Pendente)</p>
          <p className="text-3xl font-black italic mt-2">R$ {dados.resumo.totalReceber.toFixed(2)}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-[32px] shadow-lg text-white">
          <p className="text-blue-200 font-black uppercase text-[10px] tracking-widest">Saldo Previsto</p>
          <p className="text-3xl font-black italic mt-2">R$ {(dados.resumo.totalReceber - dados.resumo.totalPagar).toFixed(2)}</p>
        </div>
      </div>

      {/* FILTROS + NOVA CONTA */}
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all">
          <Plus size={14} /> Nova Conta
        </button>
        <div className="flex gap-2 ml-auto">
          {(["", "PAGAR", "RECEBER"] as const).map(t => (
            <button key={t || "all"} onClick={() => setFiltroTipo(t)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filtroTipo === t ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              {t || "Todas"}
            </button>
          ))}
          {(["", "PENDENTE", "PAGO", "CANCELADO"] as const).map(s => (
            <button key={s || "all-s"} onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filtroStatus === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              {s || "Todos Status"}
            </button>
          ))}
        </div>
      </div>

      {/* FORM NOVA CONTA */}
      {showForm && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={criarConta} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer">
                <option value="PAGAR">A Pagar</option>
                <option value="RECEBER">A Receber</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Descrição</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" placeholder="Ex: Aluguel abril" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Valor</label>
              <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Vencimento</label>
              <input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" />
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all">
              <Plus size={16} /> Criar
            </button>
          </form>
        </section>
      )}

      {/* LISTA */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-4">Tipo</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Vencimento</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {dados.contas.map((c: any) => (
              <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isVencida(c.dataVencimento, c.status) ? "bg-rose-50 dark:bg-rose-950/20" : ""}`}>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${c.tipo === "PAGAR" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"}`}>
                    {c.tipo}
                  </span>
                </td>
                <td className="p-4 font-bold text-sm text-slate-700 dark:text-slate-200 uppercase italic">
                  {c.descricao}
                  {isVencida(c.dataVencimento, c.status) && <AlertTriangle size={14} className="inline ml-2 text-rose-500" />}
                </td>
                <td className={`p-4 text-xs font-bold ${isVencida(c.dataVencimento, c.status) ? "text-rose-500" : "text-slate-500"}`}>
                  {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4 text-right font-black text-sm text-slate-700 dark:text-slate-200">R$ {c.valor.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    c.status === "PAGO" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                    c.status === "CANCELADO" ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
                    "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                  }`}>{c.status}</span>
                </td>
                <td className="p-4 text-center">
                  {c.status === "PENDENTE" && (
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => pagarConta(c.id)} className="text-emerald-500 hover:text-emerald-600 transition-colors" title="Pagar">
                        <CheckCircle2 size={18} />
                      </button>
                      <button onClick={() => cancelarConta(c.id)} className="text-rose-400 hover:text-rose-500 transition-colors" title="Cancelar">
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {dados.contas.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold italic">Nenhuma conta encontrada</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
