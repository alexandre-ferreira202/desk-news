import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/services/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login-customizado")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar - Sua Marca" }] }),
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("Login realizado com sucesso!");
        window.location.href = "/pautas";
      } else {
        toast.error(result.message || "Credenciais inválidas.");
      }
    } catch {
      toast.error("Erro inesperado ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a] text-white px-4 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Efeito de fundo animado */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Container principal */}
      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              src="/sua-marca-logo.png"
              alt="Sua Marca"
              className="h-16 w-auto object-contain drop-shadow-2xl relative"
            />
          </div>
        </div>

        {/* Card de login com glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:border-white/20 hover:bg-white/10">
            
            {/* Cabeçalho */}
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bem-vindo
            </h1>
            <p className="text-gray-400 mt-2 mb-8 text-base">
              Acesse sua conta para continuar
            </p>

            {/* Formulário */}
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              {/* Campo de email */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-white/20"
                />
              </div>

              {/* Campo de senha */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-white/20"
                />
              </div>

              {/* Botão de login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:from-blue-500 hover:to-blue-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            {/* Rodapé */}
            <div className="text-xs text-gray-500 mt-8 text-center">
              Contas de novos usuários devem ser solicitadas à administração
            </div>
          </div>
        </div>

        {/* Linha decorativa */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span className="text-xs text-gray-600">Seguro</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>

      {/* Estilos adicionais */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
