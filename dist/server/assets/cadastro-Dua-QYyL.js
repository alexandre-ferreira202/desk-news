import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { P as Protected, u as useRBAC } from "./Protected-qIYr_dhg.js";
import "@tanstack/react-query";
import "@neondatabase/serverless";
function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelection, setRoleSelection] = useState("reporter");
  const [loading, setLoading] = useState(false);
  useNavigate();
  const {
    role
  } = useRBAC();
  const podeCadastrarMembros = role === "editor" || role === "chefe_redacao" || role === "admin";
  const onSubmit = async (e) => {
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
    const {
      error
    } = await db.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pautas`,
        data: {
          display_name: name,
          role: roleSelection
        }
      }
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
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center border-l-4 border-[#ef4444] bg-[#0f0f12] border border-[#ef4444]/20 rounded-lg p-10 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "h-12 w-12 text-[#ef4444] mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-black tracking-tight text-white font-mono mb-2", children: "ACESSO NEGADO" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-4 mb-6 uppercase tracking-widest", children: "Permissões insuficientes para cadastrar integrantes." }),
      /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "inline-flex justify-center w-full py-3 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/30 text-slate-100 font-mono uppercase text-xs tracking-wider transition-all hover:bg-[#ef4444]/20", children: "Voltar ao Painel" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4 font-sans", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-12 justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-mono uppercase tracking-[0.2em] text-slate-400", children: "Cadastro" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight text-white mb-1 font-mono", children: "NOVO MEMBRO" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-8 uppercase tracking-widest", children: "Redação · Registro" }),
      /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-8 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Nome" }),
          /* @__PURE__ */ jsx("input", { required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Nome completo", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-px w-0 bg-[#22c55e] transition-all duration-500 group-focus-within:w-full" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "E-mail" }),
          /* @__PURE__ */ jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "user@jornal.com", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Senha" }),
          /* @__PURE__ */ jsx("input", { type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Mínimo 6 caracteres", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Função" }),
          /* @__PURE__ */ jsxs("select", { value: roleSelection, onChange: (e) => setRoleSelection(e.target.value), className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 appearance-none cursor-pointer font-mono text-sm", children: [
            /* @__PURE__ */ jsx("option", { value: "reporter", children: "Repórter" }),
            /* @__PURE__ */ jsx("option", { value: "editor", children: "Editor de Bloco" }),
            /* @__PURE__ */ jsx("option", { value: "chefe_redacao", children: "Editor-chefe" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 mt-8 rounded-md text-white font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20", children: loading ? "Registrando..." : "CADASTRAR" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 mt-6 text-center font-mono uppercase tracking-widest", children: /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "text-[#22c55e] hover:text-[#16a34a] transition-colors", children: "Voltar ao Painel" }) })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsx(Protected, { children: /* @__PURE__ */ jsx(SignupPage, {}) });
export {
  SplitComponent as component
};
