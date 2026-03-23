"use client";

import { useState, useEffect } from "react";
import { Users, Plus, CheckCircle2, XCircle, KeyRound, UserCheck, UserX } from "lucide-react";
import { useToast } from "../components/Toast";

export default function UsuariosPage() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfilId, setPerfilId] = useState("");

  const carregar = async () => {
    setLoading(true);
    const [resU, resP] = await Promise.all([fetch("/api/usuarios"), fetch("/api/perfis")]);
    if (resU.ok) setUsuarios(await resU.json());
    if (resP.ok) setPerfis(await resP.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const limparForm = () => {
    setNome(""); setEmail(""); setSenha(""); setPerfilId(""); setEditId(null); setShowForm(false);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !perfilId || (!editId && !senha)) {
      toast.warning("Preencha todos os campos!"); return;
    }

    const body: any = { nome, email, perfilId };
    if (senha) body.senha = senha;

    const url = editId ? `/api/usuarios/${editId}` : "/api/usuarios";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) { limparForm(); carregar(); toast.success("Usuário salvo!"); }
    else { const err = await res.json(); toast.error(err.error); }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    carregar();
  };

  const editar = (u: any) => {
    setEditId(u.id); setNome(u.nome); setEmail(u.email); setSenha(""); setPerfilId(u.perfilId || u.perfil?.id); setShowForm(true);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando...</div></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Gerenciar Usuários</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cadastro, edição e controle de acesso</p>
      </header>

      <button onClick={() => { limparForm(); setShowForm(!showForm); }}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all">
        <Plus size={14} /> Novo Usuário
      </button>

      {showForm && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-black uppercase text-sm text-slate-700 dark:text-white mb-4">{editId ? "Editar Usuário" : "Novo Usuário"}</h3>
          <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" placeholder="Nome completo" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" placeholder="email@exemplo.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{editId ? "Nova Senha (opcional)" : "Senha"}</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none" placeholder="********" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Perfil</label>
              <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer">
                <option value="">Selecione...</option>
                {perfis.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                <CheckCircle2 size={16} /> {editId ? "Salvar" : "Criar"}
              </button>
              <button type="button" onClick={limparForm} className="text-slate-400 font-bold uppercase text-xs hover:text-rose-500 transition-colors">Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* LISTA */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Usuários Cadastrados</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Perfil</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {usuarios.map((u: any) => (
              <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!u.ativo ? "opacity-40" : ""}`}>
                <td className="p-4 font-black text-sm text-slate-800 dark:text-white uppercase italic">{u.nome}</td>
                <td className="p-4 text-sm font-bold text-slate-500">{u.email}</td>
                <td className="p-4">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    {u.perfil?.nome}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.ativo ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => editar(u)} className="text-blue-500 hover:text-blue-600 transition-colors" title="Editar">
                      <KeyRound size={16} />
                    </button>
                    <button onClick={() => toggleAtivo(u.id, u.ativo)} className={u.ativo ? "text-rose-400 hover:text-rose-500" : "text-emerald-400 hover:text-emerald-500"} title={u.ativo ? "Desativar" : "Ativar"}>
                      {u.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold italic">Nenhum usuário cadastrado</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
