/**
 * TimecodeSync.ts
 * ════════════════════════════════════════════════════════════════════════════
 * Sincronizador de créditos com timecode real do vídeo
 * 
 * Problema: Legendas/créditos aparecem em tempo fixo, ignorando a duração real do vídeo
 * Solução: Usar currentTime do vídeo como fonte de verdade para mostrar créditos
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface CreditoTimecode {
  nome: string;
  funcao: string;
  timecodeInicio: number; // segundos
  duracaoEstimada?: number; // segundos
  tipo: "SONORA" | "PASSAGEM" | "ED_TEXTO" | "ED_IMAGEM" | "PRODUÇÃO";
}

export interface CreditoAtivo {
  credito: CreditoTimecode;
  tempoDecorrido: number; // quanto tempo já apareceu
  percentualExibicao: number; // 0-100%
  deveriaEstarVisivel: boolean;
}

export class TimecodeSync {
  private videoRef: HTMLVideoElement | null = null;
  private creditos: CreditoTimecode[] = [];
  private timecodeAtual: number = 0;
  private creditosAtivos: Map<string, CreditoAtivo> = new Map();
  private listeners: ((ativos: CreditoAtivo[]) => void)[] = [];
  private animationFrameId: number | null = null;

  /**
   * Inicializa o sincronizador
   */
  constructor(videoElement: HTMLVideoElement) {
    this.videoRef = videoElement;
    this.setupVideoListeners();
  }

  /**
   * Setup dos listeners do vídeo
   */
  private setupVideoListeners() {
    if (!this.videoRef) return;

    // Atualiza timecode em tempo real (60 fps)
    this.videoRef.addEventListener("play", () => {
      this.startMonitoring();
    });

    this.videoRef.addEventListener("pause", () => {
      this.stopMonitoring();
    });

    this.videoRef.addEventListener("seeking", () => {
      this.updateCurrentTime();
    });

    this.videoRef.addEventListener("ended", () => {
      this.stopMonitoring();
      this.creditosAtivos.clear();
      this.notifyListeners();
    });
  }

  /**
   * Inicia monitoramento contínuo de timecode
   */
  private startMonitoring() {
    if (this.animationFrameId !== null) return;

    const update = () => {
      this.updateCurrentTime();
      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  /**
   * Para o monitoramento
   */
  private stopMonitoring() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Atualiza o timecode atual do vídeo
   */
  private updateCurrentTime() {
    if (!this.videoRef) return;

    const novoTimecode = this.videoRef.currentTime;

    // Só processa se o timecode mudou significativamente (>50ms)
    if (Math.abs(novoTimecode - this.timecodeAtual) > 0.05) {
      this.timecodeAtual = novoTimecode;
      this.processarCreditosAtivos();
    }
  }

  /**
   * Processa quais créditos devem estar visíveis agora
   */
  private processarCreditosAtivos() {
    const novosMapa = new Map<string, CreditoAtivo>();

    for (const credito of this.creditos) {
      const duracao = credito.duracaoEstimada || 4; // 4s padrão
      const tempoFinal = credito.timecodeInicio + duracao;

      // Verifica se está no intervalo de exibição
      if (
        this.timecodeAtual >= credito.timecodeInicio &&
        this.timecodeAtual < tempoFinal
      ) {
        const tempoDecorrido = this.timecodeAtual - credito.timecodeInicio;
        const percentualExibicao = (tempoDecorrido / duracao) * 100;

        const key = `${credito.nome}@${credito.timecodeInicio}`;

        novosMapa.set(key, {
          credito,
          tempoDecorrido,
          percentualExibicao: Math.min(percentualExibicao, 100),
          deveriaEstarVisivel: true,
        });
      }
    }

    // Detecta mudanças (entrada/saída de créditos)
    if (novosMapa.size !== this.creditosAtivos.size || this.creditosChanged(novosMapa)) {
      this.creditosAtivos = novosMapa;
      this.notifyListeners();
    }
  }

  /**
   * Verifica se houve mudança nos créditos ativos
   */
  private creditosChanged(novosMapa: Map<string, CreditoAtivo>): boolean {
    for (const key of novosMapa.keys()) {
      if (!this.creditosAtivos.has(key)) return true;
    }
    return false;
  }

  /**
   * Notifica listeners sobre mudanças nos créditos ativos
   */
  private notifyListeners() {
    const ativosArray = Array.from(this.creditosAtivos.values());
    this.listeners.forEach((listener) => listener(ativosArray));
  }

  /**
   * Define os créditos a sincronizar
   */
  setCreditos(novosCreditos: CreditoTimecode[]) {
    // Ordena por timecode
    this.creditos = novosCreditos.sort(
      (a, b) => a.timecodeInicio - b.timecodeInicio
    );

    console.log("🎬 Créditos configurados para sincronização:", this.creditos);

    // Reprocessa em caso de mudança durante a reprodução
    if (this.animationFrameId !== null) {
      this.processarCreditosAtivos();
    }
  }

  /**
   * Registra um listener para mudanças
   */
  onCreditosAtivosChanged(
    listener: (ativos: CreditoAtivo[]) => void
  ): () => void {
    this.listeners.push(listener);

    // Retorna função de desinscrição
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Obtém créditos atualmente ativos
   */
  getCreditosAtivos(): CreditoAtivo[] {
    return Array.from(this.creditosAtivos.values());
  }

  /**
   * Obtém timecode atual
   */
  getTimecodeAtual(): number {
    return this.timecodeAtual;
  }

  /**
   * Formata timecode para exibição (mm:ss)
   */
  static formatarTimecode(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos.toString().padStart(2, "0")}:${segs
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Converte tempo em formato "mm:ss" ou "m:ss" para segundos
   */
  static parseTimecode(timecodeStr: string): number {
    const partes = timecodeStr.split(":");
    if (partes.length !== 2) return 0;

    const minutos = parseInt(partes[0], 10);
    const segundos = parseInt(partes[1], 10);

    if (isNaN(minutos) || isNaN(segundos)) return 0;

    return minutos * 60 + segundos;
  }

  /**
   * Limpa recursos
   */
  destroy() {
    this.stopMonitoring();
    this.listeners = [];
    this.creditosAtivos.clear();
    this.videoRef = null;
  }
}
