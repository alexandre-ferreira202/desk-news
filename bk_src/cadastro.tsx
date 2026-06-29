import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { Protected } from "@/components/Protected";

export const Route = createFileRoute("/cadastro")({
  component: () => (
    <Protected>
      <SignupPage />
    </Protected>
  ),
  head: () => ({ meta: [{ title: "Cadastrar Integrante — DeskNews" }] }),
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelection, setRoleSelection] = useState("reporter");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { role } = useRBAC();
  const podeCadastrarMembros = role === "editor" || role === "chefe_redacao" || role === "admin";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeCadastrarMembros) {
      toast.error("Você não tem permissão para registrar integrantes.");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pautas`,
        data: { display_name: name, role: roleSelection },
      },
    });
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Integrante registrado com sucesso! Um e-mail de confirmação foi enviado.");
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  if (!podeCadastrarMembros) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4">
        <div className="w-full max-w-md text-center border-l-4 border-[#ef4444] bg-[#0f0f12] border border-[#ef4444]/20 rounded-lg p-10 backdrop-blur-lg shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <h1 className="text-xl font-black tracking-tight text-white font-mono mb-2">ACESSO NEGADO</h1>
          <p className="text-xs text-slate-400 mt-4 mb-6 uppercase tracking-widest">
            Permissões insuficientes para cadastrar integrantes.
          </p>
          <Link to="/pautas" className="inline-flex justify-center w-full py-3 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/30 text-slate-100 font-mono uppercase text-xs tracking-wider transition-all hover:bg-[#ef4444]/20">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse"></div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Cadastro</span>
        </div>

        <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl">
          <h1 className="text-2xl font-black tracking-tight text-white mb-1 font-mono">NOVO MEMBRO</h1>
          <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Redação · Registro</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block">Nome</label>
              <input 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nome completo"
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              />
              <div className="absolute bottom-0 right-0 h-px w-0 bg-[#22c55e] transition-all duration-500 group-focus-within:w-full"></div>
            </div>

            <div className="relative">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block">E-mail</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="user@jornal.com"
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50"></div>
            </div>

            <div className="relative">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block">Senha</label>
              <input 
                type="password" 
                required 
                minLength={6} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50"></div>
            </div>

            <div className="relative">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block">Função</label>
              <select 
                value={roleSelection} 
                onChange={(e) => setRoleSelection(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 appearance-none cursor-pointer font-mono text-sm"
              >
                <option value="reporter">Repórter</option>
                <option value="editor">Editor de Bloco</option>
                <option value="chefe_redacao">Editor-chefe</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 mt-8 rounded-md text-white font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20"
            >
              {loading ? "Registrando..." : "CADASTRAR"}
            </button>
          </form>

          <div className="text-xs text-slate-500 mt-6 text-center font-mono uppercase tracking-widest">
            <Link to="/pautas" className="text-[#22c55e] hover:text-[#16a34a] transition-colors">Voltar ao Painel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
