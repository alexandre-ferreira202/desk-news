import { jsx, jsxs } from "react/jsx-runtime";
import { ErrorComponent } from "@tanstack/react-router";
function RouteErrorComponent({
  error
}) {
  const isModuleError = error instanceof Error && (error.message.includes("Failed to fetch dynamically imported module") || error.message.includes("Importing a module script failed") || error.message.includes("error loading dynamically imported module"));
  if (isModuleError) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-[#09090b] text-white p-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] p-8 rounded-2xl border border-[#22c55e]/20 shadow-xl max-w-md text-center border-l-[3px] border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-h2 font-bold mb-3 text-white", children: "ATUALIZAÇÃO DISPONÍVEL" }),
      /* @__PURE__ */ jsx("p", { className: "text-[#9ca3af] mb-6 text-body-sm", children: "UMA NOVA VERSÃO DO DESKNEWS FOI DETECTADA OU HOUVE UMA INTERRUPÇÃO NA CONEXÃO// RECARREGUE A PÁGINA PARA CONTINUAR EDITANDO." }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => window.location.reload(), className: "w-full py-3 bg-[#22c55e] hover:bg-[#22c55e]/90 text-black rounded-xl font-bold transition-all active:scale-[0.98]", children: "RECARREGAR PÁGINA" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(ErrorComponent, { error });
}
export {
  RouteErrorComponent as errorComponent
};
