import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface GcPanelProps {
  open: boolean;
  onClose: () => void;
  gcLine1: string;
  setGcLine1: (value: string) => void;
  gcLine2: string;
  setGcLine2: (value: string) => void;
  gcDuration: number;
  setGcDuration: (value: number) => void;
  gcVisible: boolean;
  setGcVisible: (value: boolean) => void;
  gcCreditsQueue: Array<{ line1: string; line2: string }>;
  setGcCreditsQueue: (value: Array<{ line1: string; line2: string }>) => void;
  onTake: () => void;
  onClear: () => void;
  onSkip: () => void;
}

function SliderRow({
  label,
  min,
  max,
  value,
  onChange,
  unit = "",
  accentColor = "#ec4899",
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  accentColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label
        style={{
          fontSize: 9,
          color: "#71717a",
          width: 72,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 4, accentColor, cursor: "pointer" }}
      />
      <span
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          color: "#a1a1aa",
          width: 36,
          textAlign: "right",
        }}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "#52525b",
      }}
    >
      {children}
    </span>
  );
}

export default function GcPanel({
  open,
  onClose,
  gcLine1,
  setGcLine1,
  gcLine2,
  setGcLine2,
  gcDuration,
  setGcDuration,
  gcVisible,
  setGcVisible,
  gcCreditsQueue,
  setGcCreditsQueue,
  onTake,
  onClear,
  onSkip,
}: GcPanelProps) {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== "undefined" ? Math.max(24, window.innerWidth / 2 - 260) : 100,
    y: typeof window !== "undefined" ? Math.max(24, window.innerHeight / 2 - 220) : 100,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* Camada invisível apenas para fechar ao clicar fora — sem escurecer/borrar o fundo */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
        }}
      />

      {/* Janela Flutuante */}
      <div
        ref={dragRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          width: 520,
          maxHeight: "80vh",
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header — arraste por aqui para mover a janela */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #27272a",
            background: "linear-gradient(135deg, #27272a 0%, #1f1f23 100%)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎞</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              GC Panel
            </span>
            <span style={{ fontSize: 10, color: "#71717a", marginLeft: 4 }}>⠿ arraste para mover</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#71717a",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "#27272a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#71717a";
              e.currentTarget.style.background = "none";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Seção: Texto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectionLabel>✍️ Texto</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#71717a",
                  }}
                >
                  Linha 1 — Nome
                </label>
                <input
                  type="text"
                  value={gcLine1}
                  onChange={(e) => setGcLine1(e.target.value)}
                  placeholder="Nome / Título"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    background: "#0a0a0a",
                    color: "#e4e4e7",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(124, 58, 237, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#27272a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#71717a",
                  }}
                >
                  Linha 2 — Cargo
                </label>
                <input
                  type="text"
                  value={gcLine2}
                  onChange={(e) => setGcLine2(e.target.value)}
                  placeholder="Cargo / Informação"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    background: "#0a0a0a",
                    color: "#e4e4e7",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(124, 58, 237, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#27272a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#71717a",
                    whiteSpace: "nowrap",
                  }}
                >
                  Duração:
                </label>
                <select
                  value={gcDuration}
                  onChange={(e) => setGcDuration(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    border: "1px solid #27272a",
                    borderRadius: 6,
                    background: "#0a0a0a",
                    color: "#e4e4e7",
                    fontSize: 11,
                    fontFamily: "monospace",
                    outline: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(124, 58, 237, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#27272a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value={0}>Manual</option>
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectionLabel>👁️ Preview</SectionLabel>
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                background: "#0a0a0a",
                border: "1px solid #27272a",
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {gcLine1 || gcLine2 ? (
                <div
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.9)",
                    borderTop: "2px solid #dc2626",
                  }}
                >
                  {gcLine1 && (
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 14,
                        textTransform: "uppercase",
                        lineHeight: 1.2,
                      }}
                    >
                      {gcLine1}
                    </div>
                  )}
                  {gcLine2 && (
                    <div
                      style={{
                        color: "#a1a1aa",
                        fontSize: 12,
                        textTransform: "uppercase",
                        lineHeight: 1.2,
                        marginTop: 2,
                      }}
                    >
                      {gcLine2}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#52525b",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Preview aqui
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer com Botões */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #27272a",
            background: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                onTake();
                onClose();
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 8,
                background: "#16a34a",
                color: "#fff",
                border: "none",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#15803d";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(22, 163, 74, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#16a34a";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(22, 163, 74, 0.3)";
              }}
            >
              ✓ GC TAKE
            </button>

            <button
              onClick={() => {
                onClear();
                onClose();
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 8,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b91c1c";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(220, 38, 38, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(220, 38, 38, 0.3)";
              }}
            >
              ✕ GC CLR
            </button>

            <button
              onClick={() => {
                onSkip();
                onClose();
              }}
              disabled={gcCreditsQueue.length === 0}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 8,
                background: "#3f3f46",
                color: "#d4d4d8",
                border: "none",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: gcCreditsQueue.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: gcCreditsQueue.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (gcCreditsQueue.length > 0) {
                  e.currentTarget.style.background = "#52525b";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3f3f46";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ⏭ PULAR
            </button>
          </div>

          {gcVisible && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "gcPulse 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: "#22c55e",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                GC ATIVO
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>,
    document.body
  );
}
