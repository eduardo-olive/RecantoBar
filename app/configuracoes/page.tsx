"use client";

import { useState, useEffect } from "react";
import { Settings, Plus, CheckCircle2, Trash2, Shield } from "lucide-react";
import { useToast } from "../components/Toast";

const TODAS_PERMISSOES = [
  { key: "vendas", label: "Vendas (PDV)" },
  { key: "caixa", label: "Caixa / Fluxo" },
  { key: "estoque", label: "Estoque / Produtos" },
  { key: "financeiro", label: "Financeiro / Despesas" },
  { key: "relatorios", label: "Relatórios / DRE" },
  { key: "usuarios", label: "Gerenciar Usuários" },
  { key: "admin", label: "Administrador Total" },
];

export default function ConfiguracoesPage() {
  const toast = useToast();
  const [perfis, setPerfis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState<string[]>([]);

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/perfis");
    if (res.ok) setPerfis(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const togglePermissao = (key: string) => {
    setPermissoes(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const limparForm = () => {
    setNome(""); setPermissoes([]); setEditId(null); setShowForm(false);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || permissoes.length === 0) { toast.warning("Nome e pelo menos uma permissão!"); return; }

    const url = editId ? `/api/perfis/${editId}` : "/api/perfis";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, permissoes }),
    });

    if (res.ok) { limparForm(); carregar(); toast.success("Perfil salvo!"); }
    else { const err = await res.json(); toast.error(err.error); }
  };

  const editar = (p: any) => {
    setEditId(p.id); setNome(p.nome); setPermissoes(p.permissoes as string[]); setShowForm(true);
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir este perfil?")) return;
    const res = await fetch(`/api/perfis/${id}`, { method: "DELETE" });
    if (res.ok) { carregar(); toast.success("Perfil excluído!"); }
    else { const err = await res.json(); toast.error(err.error); }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando...</div></div>;
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="border-l-4 border-blue-600 pl-4 py-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Perfis e Permissões</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Configure os níveis de acesso do sistema</p>
      </header>

      <button onClick={() => { limparForm(); setShowForm(!showForm); }}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all">
        <Plus size={14} /> Novo Perfil
      </button>

      {showForm && (
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-black uppercase text-sm text-slate-700 dark:text-white mb-4">{editId ? "Editar Perfil" : "Novo Perfil"}</h3>
          <form onSubmit={salvar} className="space-y-5">
            <div className="flex flex-col gap-2 max-w-md">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nome do Perfil</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none uppercase" placeholder="Ex: GERENTE" />
            </div>

            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 block">Permissões</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TODAS_PERMISSOES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePermissao(p.key)}
                    className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-left ${
                      permissoes.includes(p.key)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                <CheckCircle2 size={16} /> {editId ? "Salvar" : "Criar"}
              </button>
              <button type="button" onClick={limparForm} className="text-slate-400 font-bold uppercase text-xs hover:text-rose-500 transition-colors">Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* LISTA DE PERFIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perfis.map((p: any) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 p-2 rounded-lg">
                  <Shield size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-slate-800 dark:text-white">{p.nome}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p._count?.usuarios || 0} usuários</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editar(p)} className="text-blue-500 hover:text-blue-600 p-1 transition-colors text-[10px] font-black uppercase">Editar</button>
                <button onClick={() => excluir(p.id)} className="text-rose-400 hover:text-rose-500 p-1 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(p.permissoes as string[]).map((perm: string) => (
                <span key={perm} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
