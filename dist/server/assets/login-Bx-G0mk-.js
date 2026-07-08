import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { g as getSession, s as signIn } from "./router-NcdNWgek.js";
import "@tanstack/react-query";
import "@neondatabase/serverless";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (getSession()) navigate({
      to: "/pautas"
    });
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("desknews-theme");
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    else setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("desknews-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const {
      user,
      error
    } = await signIn(email, password);
    setLoading(false);
    if (error || !user) {
      toast.error(error ?? "Erro ao fazer login.");
      return;
    }
    toast.success(`Bem-vindo, ${user.nome}!`);
    navigate({
      to: "/pautas"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-slate-100 font-sans flex items-center justify-center px-4", children: [
    /* @__PURE__ */ jsx("button", { onClick: () => setIsDarkMode(!isDarkMode), className: "fixed top-6 right-6 p-3 rounded-lg border border-[#22c55e]/30 bg-[#0f0f12] hover:bg-[#1a1a21] text-[#22c55e] transition-all duration-300", "aria-label": "Alternar tema", children: isDarkMode ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-12 justify-center", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono uppercase tracking-[0.2em] text-slate-400", children: "On Air" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight text-white mb-1 font-mono", children: "REDAÇÃO" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-8 uppercase tracking-widest", children: "Acesso Remoto" }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-8 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "email@jornal.com", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "senha", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 mt-8 rounded-md text-white font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20", children: loading ? "Entrando..." : "ENTRAR AO VIVO" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs mt-8 text-center text-slate-600 font-mono uppercase tracking-widest", children: "Solicitar acesso: chefia.redacao@tv.br" })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
