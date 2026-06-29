import { useState, useRef, useEffect } from "react";
import { Upload, Play, RotateCcw, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface SonoraComTimecode {
  tipo: "SONORA" | "PASSAGEM";
  nome: string;
  funcao?: string;
  posicaoPalavras: number; // palavra em que aparece
  duracao?: number;
  timecodeCalculado: string; // MM:SS
  timecodeManual?: string; // MM:SS (ajuste fino)
}

interface AnaliseVT {
  duracaoSegundos: number;
  totalPalavras: number;
  sonorasEPassagens: SonoraComTimecode[];
}

export function TimecodeCalculator() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duracaoVT, setDuracaoVT] = useState<number | null>(null);
  const [laudaTexto, setLaudaTexto] = useState<string>("");
  const [analise, setAnalise] = useState<AnaliseVT | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const laudaInputRef = useRef<HTMLTextAreaElement>(null);

  // 🎥 Extrair duração do vídeo
  const extrairDuracaoDoVideo = async (file: File) => {
    return new Promise<number>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(video.duration));
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Erro ao ler vídeo"));
      };

      video.src = url;
    });
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErro(null);

    try {
      const duracao = await extrairDuracaoDoVideo(file);
      setVideoFile(file);
      setDuracaoVT(duracao);
      console.log(`✅ VT carregado: ${duracao}s`);
    } catch (err) {
      setErro("Erro ao ler duração do vídeo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 📖 Parsear lauda e encontrar [SONORA] e [PASSAGEM]
  const parsearLauda = (texto: string): SonoraComTimecode[] => {
    const linhas = texto.split("\n").map((l) => l.trim());
    const itens: SonoraComTimecode[] = [];
    let posicaoAtual = 0; // contador de palavras

    let i = 0;
    while (i < linhas.length) {
      const linha = linhas[i];

      // 🎤 ENCONTROU [SONORA]
      if (linha.match(/^\[SONORA\]$/i)) {
        let nome = "";
        let funcao = "";
        let textoSonora = "";

        // Próxima linha: (NOME)
        if (i + 1 < linhas.length) {
          const nomeMatch = linhas[i + 1].match(/^\(([^)]+)\)$/);
          if (nomeMatch) {
            nome = nomeMatch[1];
            i++;

            // Próxima: (FUNCAO)
            if (i + 1 < linhas.length) {
              const funcaoMatch = linhas[i + 1].match(/^\(([^)]+)\)$/);
              if (funcaoMatch) {
                funcao = funcaoMatch[1];
                i++;
              }
            }
          }
        }

        // Coletar texto entre aspas
        while (i + 1 < linhas.length) {
          const proxLinha = linhas[i + 1];
          if (proxLinha.match(/^\[([A-Z_]+)\]$/i)) break;
          const textoMatch = proxLinha.match(/^"(.+)"$/);
          if (textoMatch) {
            textoSonora += (textoSonora ? " " : "") + textoMatch[1];
            i++;
          } else {
            break;
          }
        }

        if (nome) {
          const duracao = Math.ceil(textoSonora.split(/\s+/).length / 2.5);
          itens.push({
            tipo: "SONORA",
            nome,
            funcao,
            posicaoPalavras: posicaoAtual,
            duracao,
            timecodeCalculado: "00:00",
          });
        }
      }

      // 📍 ENCONTROU [PASSAGEM]
      if (linha.match(/^\[PASSAGEM\]$/i)) {
        let nome = "";
        let local = "";
        let textoPassagem = "";

        // Próxima linha: (NOME)
        if (i + 1 < linhas.length) {
          const nomeMatch = linhas[i + 1].match(/^\(([^)]+)\)$/);
          if (nomeMatch) {
            nome = nomeMatch[1];
            i++;

            // Próxima: (LOCAL)
            if (i + 1 < linhas.length) {
              const localMatch = linhas[i + 1].match(/^\(([^)]+)\)$/);
              if (localMatch) {
                local = localMatch[1];
                i++;
              }
            }
          }
        }

        // Coletar texto entre aspas
        while (i + 1 < linhas.length) {
          const proxLinha = linhas[i + 1];
          if (proxLinha.match(/^\[([A-Z_]+)\]$/i)) break;
          const textoMatch = proxLinha.match(/^"(.+)"$/);
          if (textoMatch) {
            textoPassagem += (textoPassagem ? " " : "") + textoMatch[1];
            i++;
          } else {
            break;
          }
        }

        if (nome) {
          itens.push({
            tipo: "PASSAGEM",
            nome,
            funcao: local,
            posicaoPalavras: posicaoAtual,
            timecodeCalculado: "00:00",
          });
        }
      }

      // Contar palavras da linha (texto normal)
      if (!linha.match(/^\[|^\(|^"/)) {
        posicaoAtual += linha.split(/\s+/).filter((p) => p).length;
      }

      i++;
    }

    return itens;
  };

  // 🧮 Calcular timecodes automáticos
  const calcularTimecodes = () => {
    if (!duracaoVT || !laudaTexto.trim()) {
      setErro("Carregue o VT e insira a lauda");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const sonorasEPassagens = parsearLauda(laudaTexto);

      // Contar total de palavras na lauda
      const totalPalavras = laudaTexto.split(/\s+/).filter((p) => p).length;

      // Calcular timecodes
      sonorasEPassagens.forEach((item) => {
        const posicaoRelativa = totalPalavras > 0 ? item.posicaoPalavras / totalPalavras : 0;
        const segundos = Math.round(posicaoRelativa * duracaoVT);
        item.timecodeCalculado = formatarTimecode(segundos);
      });

      setAnalise({
        duracaoSegundos: duracaoVT,
        totalPalavras,
        sonorasEPassagens,
      });

      console.log("✅ Timecodes calculados com sucesso!");
    } catch (err) {
      setErro("Erro ao processar lauda");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarTimecode = (segundos: number): string => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800">
      <h1 className="text-2xl font-bold mb-6 text-zinc-100">
        🎬 Calculadora de Timecodes Automática
      </h1>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. UPLOAD DO VT */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
          1️⃣ Carregar VT
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            <Upload size={16} />
            {videoFile ? "Mudar VT" : "Selecionar VT"}
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />

          {duracaoVT && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-sm">
                <strong>VT carregado:</strong> {formatarTimecode(duracaoVT)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. COLA DA LAUDA */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
          2️⃣ Colar/Editar Lauda
        </h2>
        <textarea
          ref={laudaInputRef}
          value={laudaTexto}
          onChange={(e) => setLaudaTexto(e.target.value)}
          placeholder="Cole aqui o texto da lauda com [SONORA] e [PASSAGEM]..."
          className="w-full h-48 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-zinc-500 mt-2">
          Formato esperado: [SONORA] (NOME) (FUNCAO) "texto..." [PASSAGEM] etc
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. BOTÃO DE CÁLCULO */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <button
          onClick={calcularTimecodes}
          disabled={!duracaoVT || !laudaTexto.trim() || loading}
          className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          <Clock size={18} />
          {loading ? "Processando..." : "🧮 CALCULAR TIMECODES"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. ERROS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {erro && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-2 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {erro}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 5. RESULTADOS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {analise && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
            📊 Resultado da Análise
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Duração VT</p>
              <p className="text-xl font-bold text-blue-400">{formatarTimecode(analise.duracaoSegundos)}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Palavras</p>
              <p className="text-xl font-bold text-purple-400">{analise.totalPalavras}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Itens Encontrados</p>
              <p className="text-xl font-bold text-green-400">{analise.sonorasEPassagens.length}</p>
            </div>
          </div>

          {/* Tabela de resultados */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-[10px] font-bold text-zinc-500">Tipo</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold text-zinc-500">Nome</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold text-zinc-500">Função/Local</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold text-zinc-500">Palavra</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold text-zinc-500">Timecode</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold text-zinc-500">Duração</th>
                </tr>
              </thead>
              <tbody>
                {analise.sonorasEPassagens.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          item.tipo === "SONORA"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-200">{item.nome}</td>
                    <td className="py-2 px-3 text-zinc-400 text-[12px]">{item.funcao || "-"}</td>
                    <td className="py-2 px-3 text-right text-zinc-400">{item.posicaoPalavras}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-green-400">
                      {item.timecodeManual || item.timecodeCalculado}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-400">
                      {item.duracao ? `${item.duracao}s` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-zinc-500 mt-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            💡 <strong>Dica:</strong> Os timecodes foram calculados proporcionalmente.
            Use os valores da coluna "Timecode" como referência e ajuste manualmente se necessário.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 6. AJUDA */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-[12px] text-zinc-400">
        <p className="font-bold text-zinc-300 mb-2">📝 Como usar:</p>
        <ol className="list-decimal list-inside space-y-1 text-[11px]">
          <li>Carregue o arquivo de vídeo (VT)</li>
          <li>Cole a lauda com as marcações [SONORA] e [PASSAGEM]</li>
          <li>Clique em "CALCULAR TIMECODES"</li>
          <li>O sistema calculará automaticamente onde cada item aparece no vídeo</li>
          <li>Use os timecodes como base e ajuste manualmente se necessário</li>
        </ol>
      </div>
    </div>
  );
}

export default TimecodeCalculator;
