import { useEffect, useState, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Type,
  MoveVertical,
  FlipHorizontal,
  Maximize,
  Minimize,
  X,
  HelpCircle,
  Keyboard,
} from "lucide-react";

export default function Teleprompter() {
  const scrollRef = useRef(null);
  const rodaTvRef = useRef(null);

  const [items, setItems] = useState([
    {
      id: "1",
      bloco_id: "bloco_1",
      assunto: "BUSCAS CORPOS PANTE ESTRETTO",
      cabeca:
        "FORÇA TAREFA RESGATA CORPOS EM AREA DE DESASTRE NATURAL.\n\nOPERAÇÃO ENVOLVEU MAIS DE 50 PROFISSIONAIS DA DEFESA CIVIL, BOMBEIROS E VOLUNTÁRIOS.\n\nATE O MOMENTO FORAM IDENTIFICADOS 12 CORPOS NO LOCAL.",
      ordem: 1,
      status: "pendente",
      tempo_cab: "2:43",
      materia_id: null,
    },
    {
      id: "2",
      bloco_id: "bloco_1",
      assunto: "CALAPSO HOSPITAIS",
      cabeca:
        "SISTEMA DE SAUDE ENFRENTA CRISE DE SUPERLOTAÇÃO.\n\nHOSPITAIS DA REGIÃO ATINGEM 130% DE OCUPAÇÃO.\n\nGOVERNADOR ANUNCIA MEDIDAS DE EMERGÊNCIA PARA AMPLIAR LEITOS.",
      ordem: 2,
      status: "pendente",
      tempo_cab: "2:20",
      materia_id: null,
    },
    {
      id: "3",
      bloco_id: "bloco_2",
      assunto: "DEBATE SALSAS",
      cabeca:
        "CANDIDATOS DEBATEM PLANO ECONOMICO PARA PROXIMO MANDATO.\n\nPROPOSTAS INCLUEM REDUCAO DE IMPOSTOS E INVESTIMENTO EM INFRAESTRUTURA.\n\nDEBATE ACONTECEU NA NOITE DE ONTEM COM GRANDE AUDIENCIA.",
      ordem: 3,
      status: "pendente",
      tempo_cab: "2:45",
      materia_id: null,
    },
  ]);

  const [blocos, setBlocos] = useState([
    { id: "bloco_1", nome: "ABERTURA", ordem: 1, apresentador: "ANA SILVA" },
    { id: "bloco_2", nome: "POLITICA", ordem: 2, apresentador: "CARLOS SANTOS" },
  ]);

  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [fontSize, setFontSize] = useState(60);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [mirrored, setMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const currentItem = items.find((i) => i.id === selectedItemId);

  // ── Auto-scroll ──
  useEffect(() => {
    if (!isScrolling || !scrollRef.current) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed]);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          setIsScrolling((prev) => !prev);
          break;
        case "f":
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
          break;
        case "c":
          e.preventDefault();
          alert("Modo câmera (não implementado nesta versão)");
          break;
        case "m":
          e.preventDefault();
          alert("Modo master (não implementado nesta versão)");
          break;
        case "e":
          e.preventDefault();
          setMirrored((prev) => !prev);
          break;
        case "?":
          setShowInstructions(!showInstructions);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFontSize((prev) => Math.max(50, prev - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFontSize((prev) => Math.min(180, prev + 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          setScrollSpeed((prev) => Math.max(0.5, prev - 0.5));
          break;
        case "ArrowDown":
          e.preventDefault();
          setScrollSpeed((prev) => Math.min(15, prev + 0.5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInstructions]);

  // ── Touch Scroll ──
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (!scrollRef.current) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 10) {
      scrollRef.current.scrollTop += diff * 0.5;
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Guia de Atalhos</h2>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Teclado</h3>
                <div className="space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                      F
                    </div>
                    <div>
                      <p className="text-white font-semibold">Fullscreen</p>
                      <p className="text-zinc-400 text-sm">Tela cheia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                      Espaço
                    </div>
                    <div>
                      <p className="text-white font-semibold">Play / Pause</p>
                      <p className="text-zinc-400 text-sm">Inicia/pausa scroll</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                      E
                    </div>
                    <div>
                      <p className="text-white font-semibold">Espelhar</p>
                      <p className="text-zinc-400 text-sm">Inverte horizontalmente</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                      ← →
                    </div>
                    <div>
                      <p className="text-white font-semibold">Fonte</p>
                      <p className="text-zinc-400 text-sm">Aumenta/diminui</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                      ↑ ↓
                    </div>
                    <div>
                      <p className="text-white font-semibold">Velocidade</p>
                      <p className="text-zinc-400 text-sm">Controla scroll</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {!isFullscreen && (
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            📝 TELEPROMPTER — DeskNews
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-zinc-500" />
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 accent-blue-500"
              />
              <span className="text-sm text-zinc-400 w-12">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-2">
              <MoveVertical className="h-4 w-4 text-zinc-500" />
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-20 accent-blue-500"
              />
              <span className="text-sm text-zinc-400 w-12">{scrollSpeed.toFixed(1)}</span>
            </div>

            <button
              onClick={() => setMirrored(!mirrored)}
              className={`p-2 rounded-lg border transition-all ${
                mirrored
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400 hover:text-zinc-300"
              }`}
              title="Espelhar"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
                setIsScrolling(false);
              }}
              className="p-2 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-400 hover:text-zinc-300"
              title="Reiniciar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              title="Play/Pause (Espaço)"
            >
              {isScrolling ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-400 hover:text-zinc-300"
              title="Fullscreen (F)"
            >
              <Maximize className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowInstructions(true)}
              className="p-2 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-400 hover:text-zinc-300"
              title="Ajuda"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="absolute top-6 left-6 z-[110] opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-4 py-2 rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-700 text-white font-semibold text-sm flex items-center gap-2"
          >
            <Minimize className="h-4 w-4" /> Sair Fullscreen
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!isFullscreen && (
          <aside className="w-80 bg-zinc-900 border-r border-zinc-800 overflow-y-auto flex flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Roteiro do Jornal
            </div>

            <div className="flex-1 divide-y divide-zinc-800">
              {blocos.map((b) => {
                const blockItems = items.filter((i) => i.bloco_id === b.id);
                return (
                  <div key={b.id} className="p-2">
                    <div className="px-3 py-1 text-[9px] text-blue-400/60 uppercase font-bold bg-zinc-950/60 sticky top-0 z-10">
                      BLOCO {b.ordem} — {b.nome}
                    </div>
                    {blockItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          if (scrollRef.current) scrollRef.current.scrollTop = 0;
                          setIsScrolling(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all text-xs uppercase font-bold tracking-wider ${
                          selectedItemId === item.id
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate">{item.assunto}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Prompter Area */}
        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 overflow-y-auto px-10 sm:px-20 py-[45vh] cursor-pointer relative ${
            mirrored ? "scale-x-[-1]" : ""
          }`}
          onClick={() => setIsScrolling(!isScrolling)}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="max-w-5xl mx-auto uppercase font-bold leading-relaxed">
            {currentItem ? (
              <div className="space-y-12">
                <div className="text-blue-400/40 text-sm tracking-[0.5em] text-center border-b border-blue-400/20 pb-4 mb-8">
                  {currentItem.assunto}
                </div>

                {/* Apresentador */}
                {(() => {
                  const bl = blocos.find((b) => b.id === currentItem.bloco_id);
                  return bl?.apresentador ? (
                    <div className="text-emerald-400 text-center mb-8 text-4xl border-2 border-emerald-500/30 py-4 rounded-xl bg-emerald-500/10">
                      [{bl.apresentador}]
                    </div>
                  ) : null;
                })()}

                {currentItem.cabeca ? (
                  <>
                    <div className="whitespace-pre-wrap text-zinc-100">
                      {currentItem.cabeca}
                    </div>
                    <div
                      ref={rodaTvRef}
                      className="text-emerald-400 text-center mt-12 text-4xl border-2 border-emerald-500/30 py-4 rounded-xl bg-emerald-500/10"
                    >
                      [RODA TV]
                    </div>
                  </>
                ) : (
                  <div className="text-zinc-600 italic text-2xl text-center py-20">
                    Matéria sem texto cadastrado.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-zinc-600 italic text-2xl font-mono text-center">
                {items.length === 0
                  ? "Aguardando textos..."
                  : "Selecione uma matéria no roteiro lateral."}
              </div>
            )}
            {items.length > 0 && (
              <div className="h-[50vh] flex items-center justify-center text-zinc-700 font-mono text-sm uppercase tracking-widest">
                Fim do programa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Line */}
      <div className="fixed left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-between px-2 z-40 opacity-30">
        <div className="w-6 h-1 bg-blue-500 rounded-r-full"></div>
        <div className="w-6 h-1 bg-blue-500 rounded-l-full"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
