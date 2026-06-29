import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans flex items-center justify-center px-4">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-lg border border-[#22c55e]/30 bg-[#0f0f12] hover:bg-[#1a1a21] text-[#22c55e] transition-all duration-300"
        aria-label="Alternar tema"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse"></div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">On Air</span>
        </div>

        <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl">
          <h1 className="text-2xl font-black tracking-tight text-white mb-1 font-mono">REDAÇÃO</h1>
          <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Acesso Remoto</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@jornal.com"
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50"></div>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="senha"
                className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50"></div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-8 rounded-md text-white font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20"
            >
              {loading ? "Entrando..." : "ENTRAR AO VIVO"}
            </button>
          </form>

          <div className="text-xs mt-8 text-center text-slate-600 font-mono uppercase tracking-widest">
            Solicitar acesso: chefia.redacao@tv.br
          </div>
        </div>
      </div>
    </div>
  );
}
