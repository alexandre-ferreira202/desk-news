import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Newspaper, ShieldAlert } from "lucide-react";

// Importação do hook de RBAC e Auth para blindar o formulário
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

  // Validação de cargo: Apenas editores ou chefes podem registrar novos membros na redação
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

  // Se for um repórter tentando acessar a URL direta de cadastro, exibe tela de bloqueio
  if (!podeCadastrarMembros) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4">
        <div className="w-full max-w-md text-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-10 backdrop-blur-xl shadow-[var(--shadow-2xl)]">
          <ShieldAlert className="h-12 w-12 text-[var(--status-error)] mx-auto mb-4" />
          <h1 className="text-h2 font-bold tracking-tight text-[var(--text-primary)]">Acesso Restrito</h1>
          <p className="text-body-sm text-[var(--text-tertiary)] mt-3 mb-6">
            Apenas Editores ou Editores-chefe autorizados podem cadastrar e definir funções de novos colaboradores no DeskNews.
          </p>
          <Link to="/pautas" className="inline-flex justify-center w-full py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-semibold text-body-sm transition-all hover:bg-[var(--bg-overlay)]">
            Voltar para as Pautas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 font-sans selection:bg-[var(--accent-primary)]/30">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-3 mb-10 justify-center group">
          <div className="p-3 rounded-3xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 shadow-[var(--shadow-lg)]">
            <Newspaper className="h-7 w-7 text-[var(--accent-primary)] transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <span className="text-label text-[var(--text-primary)] tracking-[0.3em]">DeskNews</span>
        </div>
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-[var(--shadow-2xl)] rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:border-[var(--border-medium)]">
          <h1 className="text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Novo integrante</h1>
          <p className="text-body-sm text-[var(--text-tertiary)] mt-2 mb-8">Defina os dados e a função na redação.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-label text-[var(--text-quaternary)]">Nome</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo do colaborador"
                id="name"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-label text-[var(--text-quaternary)]">E-mail Corporativo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colaborador@jornal.com"
                id="email"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-label text-[var(--text-quaternary)]">Senha Inicial</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                id="password"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300" />
            </div>
            <div className="space-y-1">
              <label htmlFor="role" className="text-label text-[var(--text-quaternary)]">Função Editorial</label>
              <select value={roleSelection} onChange={(e) => setRoleSelection(e.target.value)}
                id="role"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer">
                <option value="reporter">Repórter</option>
                <option value="editor">Editor de Bloco</option>
                <option value="chefe_redacao">Editor-chefe</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-6 rounded-2xl bg-[var(--accent-primary)] text-white font-bold hover:shadow-[var(--shadow-xl)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[var(--shadow-lg)]">
              {loading ? "Registrando..." : "Cadastrar Membro"}
            </button>
          </form>
          <div className="text-caption text-[var(--text-tertiary)] mt-6 text-center">
            <Link to="/pautas" className="text-[var(--accent-primary)] hover:underline font-semibold">Voltar ao Painel Principal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}