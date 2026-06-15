import { Cloud, CheckCircle2, Loader2 } from "lucide-react";

// O "export" aqui é obrigatório para que a tela de redação consiga "enxergar" este componente
export function AutosaveIndicator({ isSaving, lastSaved }: { isSaving: boolean, lastSaved: Date | null }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      {isSaving ? (
        <span className="flex items-center gap-1.5 text-yellow-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> 
          Salvando rascunho...
        </span>
      ) : lastSaved ? (
        <span className="flex items-center gap-1.5 text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> 
          Salvo localmente
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          <Cloud className="h-3.5 w-3.5" /> 
          Nuvem
        </span>
      )}
    </div>
  );
}