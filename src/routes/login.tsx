import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // usa o cliente compartilhado

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar - DeskNews" }] }),
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // 1. Autentica no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Credenciais inválidas.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        toast.error("Erro ao fazer login.");
        setLoading(false);
        return;
      }

      // 2. Busca permissões na tabela 'users' pelo EMAIL (não pelo id)
      const { data: userData, error: permError } = await supabase
        .from("users")
        .select("id, email, pode_acessar_pautas")
        .eq("email", data.user.email)
        .single();

      if (permError || !userData) {
        toast.error("Usuário não encontrado no sistema. Contate a chefia de redação.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!userData.pode_acessar_pautas) {
        toast.error("Você não tem permissão para acessar pautas. Contate a chefia de redação.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate({ to: "/pautas" });
    } catch (err) {
      toast.error("Erro inesperado ao conectar com o servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-4 font-sans ${
      isDarkMode
        ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
        : "bg-gray-50 text-gray-900"
    } selection:bg-[var(--accent-primary)]/30`}>
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
            : "bg-gray-200 hover:bg-gray-300 text-blue-600"
        }`}
        aria-label="Alternar tema"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-3 mb-10 justify-center group">
          <div className="p-3 rounded-3xl transition-all duration-300">
            <img
              src={isDarkMode ? "/logo1.png" : "/logo2.png"}
              className="h-10 w-65 transition-transform duration-500"
            />
          </div>
        </div>

        <div className={`rounded-3xl p-8 sm:p-10 transition-all duration-300 ${
          isDarkMode
            ? "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-[var(--shadow-2xl)] hover:border-[var(--border-medium)]"
            : "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300"
        }`}>
          <h1 className={`text-h1 font-bold tracking-tight transition-colors duration-300 ${
            isDarkMode ? "text-[var(--text-primary)]" : "text-gray-900"
          }`}>
            Entrar na redação
          </h1>
          <p className={`text-body-sm mt-2 mb-8 transition-colors duration-300 ${
            isDarkMode ? "text-[var(--text-tertiary)]" : "text-gray-600"
          }`}>
            Acesse com seu e-mail corporativo.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@jornal.com"
              className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                  : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
              }`}
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha"
              className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                  : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-6 rounded-2xl text-white font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 ${
                isDarkMode
                  ? "bg-[var(--accent-primary)] hover:shadow-[var(--shadow-xl)] shadow-[var(--shadow-lg)]"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-md"
              }`}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className={`text-caption mt-6 text-center italic transition-colors duration-300 ${
            isDarkMode ? "text-[var(--text-tertiary)]" : "text-gray-500"
          }`}>
            Contas de novos jornalistas devem ser solicitadas à chefia de redação.
          </div>
        </div>
      </div>
    </div>
  );
}
