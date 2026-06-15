import { useState, useRef, useCallback, useEffect } from "react";

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderRow({ label, min, max, value, onChange, unit = "", accentColor = "#ec4899" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label style={{ fontSize: 9, color: "#71717a", width: 72, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
      <span style={{ fontSize: 9, fontFamily: "monospace", color: "#a1a1aa", width: 36, textAlign: "right" }}>
        {value}{unit}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#52525b",
    }}>
      {children}
    </span>
  );
}

// ─── Modal: Config Tarja (simplificado) ──────────────────────────────────────

function ConfigTarjaModal({
  open,
  onClose,
  tarjaCustomPng,
  setTarjaCustomPng,
  tarjaScaleX, setTarjaScaleX,
  tarjaScaleY, setTarjaScaleY,
  tarjaScaleLock, setTarjaScaleLock,
  tarjaX, setTarjaX,
  tarjaY, setTarjaY,
  font1Size, setFont1Size,
  font1X, setFont1X,
  font1Y, setFont1Y,
  font2Size, setFont2Size,
  font2X, setFont2X,
  font2Y, setFont2Y,
  gcLine1, gcLine2,
}) {
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.includes("png")) return;
    const reader = new FileReader();
    reader.onload = () => setTarjaCustomPng(reader.result);
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 20,
        width: "100%",
        maxWidth: 640,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #27272a",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🎞</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#f4f4f5" }}>Config Tarja</span>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#a1a1aa",
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* PNG Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>PNG Customizado</SectionLabel>
            <button onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "11px 16px", borderRadius: 12, border: "1px solid #3f3f46",
                background: "#27272a", color: "#e4e4e7", fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s",
              }}>
              📁 Selecionar PNG
            </button>
            <input ref={fileInputRef} type="file" accept="image/png" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {tarjaCustomPng && (
              <div style={{ width: "100%", overflow: "hidden", borderRadius: 8, border: "1px solid #27272a" }}>
                <img src={tarjaCustomPng} alt="Tarja preview" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
          </div>

          {/* Scale */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Escala</SectionLabel>
            <SliderRow label="Largura X" min={10} max={400} value={tarjaScaleX}
              onChange={(v) => { if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleX(v); }}
              unit="%" />
            {!tarjaScaleLock && (
              <SliderRow label="Altura Y" min={10} max={400} value={tarjaScaleY}
                onChange={setTarjaScaleY} unit="%" />
            )}
            <button onClick={() => setTarjaScaleLock(!tarjaScaleLock)}
              style={{
                padding: "8px 12px", borderRadius: 8, border: "1px solid #3f3f46",
                background: tarjaScaleLock ? "#3f3f46" : "#27272a", color: tarjaScaleLock ? "#fde68a" : "#a1a1aa",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}>
              {tarjaScaleLock ? "🔒 Proporção Bloqueada" : "🔓 Proporção Livre"}
            </button>
          </div>

          {/* Position */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Posição</SectionLabel>
            <SliderRow label="X (horiz.)" min={0} max={100} value={tarjaX} onChange={setTarjaX} unit="%" />
            <SliderRow label="Y (vert.)" min={0} max={100} value={tarjaY} onChange={setTarjaY} unit="%" />
          </div>

          {/* Font 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Linha 1 (Título)</SectionLabel>
            <SliderRow label="Tamanho" min={12} max={96} value={font1Size} onChange={setFont1Size} unit="px" />
            <SliderRow label="Posição X" min={0} max={100} value={font1X} onChange={setFont1X} unit="%" />
            <SliderRow label="Posição Y" min={0} max={100} value={font1Y} onChange={setFont1Y} unit="%" />
          </div>

          {/* Font 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Linha 2 (Descrição)</SectionLabel>
            <SliderRow label="Tamanho" min={8} max={64} value={font2Size} onChange={setFont2Size} unit="px" />
            <SliderRow label="Posição X" min={0} max={100} value={font2X} onChange={setFont2X} unit="%" />
            <SliderRow label="Posição Y" min={0} max={100} value={font2Y} onChange={setFont2Y} unit="%" />
          </div>

          {/* Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Preview</SectionLabel>
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, border: "1px solid #27272a", overflow: "hidden", backgroundColor: "#0a0a0a", position: "relative" }}>
              {tarjaCustomPng ? (
                <div style={{ position: "relative", lineHeight: 0, width: "100%", height: "100%" }}>
                  <img src={tarjaCustomPng} alt="tarja" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {gcLine1 && (
                    <div style={{
                      position: "absolute",
                      left: `${font1X}%`,
                      top: `${font1Y}%`,
                      fontSize: Math.max(4, font1Size * 0.35),
                      fontWeight: 900,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      transform: "translateY(-50%)",
                      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    }}>
                      {gcLine1}
                    </div>
                  )}
                  {gcLine2 && (
                    <div style={{
                      position: "absolute",
                      left: `${font2X}%`,
                      top: `${font2Y}%`,
                      fontSize: Math.max(3, font2Size * 0.35),
                      color: "#d4d4d8",
                      whiteSpace: "nowrap",
                      transform: "translateY(-50%)",
                      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    }}>
                      {gcLine2}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#71717a" }}>
                  {gcLine1 || gcLine2 ? `${gcLine1} | ${gcLine2}` : "Preview"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 8, padding: "16px 20px",
          borderTop: "1px solid #27272a",
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 16px", borderRadius: 12, border: "1px solid #3f3f46",
            background: "#27272a", color: "#e4e4e7", fontSize: 11, fontWeight: 700,
            cursor: "pointer", transition: "all 0.15s",
          }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GC Panel Component ────────────────────────────────────────────────────────

export default function GCPanel({
  // GC states
  gcLine1, setGcLine1,
  gcLine2, setGcLine2,
  gcVisible, setGcVisible,
  gcDuration, setGcDuration,
  // Tarja states
  tarjaCustomPng, setTarjaCustomPng,
  tarjaScaleX, setTarjaScaleX,
  tarjaScaleY, setTarjaScaleY,
  tarjaScaleLock, setTarjaScaleLock,
  tarjaX, setTarjaX,
  tarjaY, setTarjaY,
  font1Size, setFont1Size,
  font1X, setFont1X,
  font1Y, setFont1Y,
  font2Size, setFont2Size,
  font2X, setFont2X,
  font2Y, setFont2Y,
}) {
  const [layerOpen, setLayerOpen] = useState(false);

  const btnBase = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer",
    transition: "all 0.15s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  };

  const handleTake = () => {
    setGcVisible(true);
    setGcDuration(3);
  };

  const handleClear = () => {
    setGcVisible(false);
    setGcLine1("");
    setGcLine2("");
  };

  const handleSkip = () => {
    setGcLine1("");
    setGcLine2("");
  };

  return (
    <>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0,
        border: "1px solid #2a2a2a", borderRadius: 12, padding: 12,
        backgroundColor: "#1a1a1a", overflowY: "auto",
      }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 8, borderBottom: "1px solid #27272a" }}>
          <span style={{ fontSize: 14 }}>🎞</span>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a1a1aa" }}>
            GC Panel
          </span>
        </div>

        {/* ── Inputs (2 colunas) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 8, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Linha 1
            </label>
            <input type="text" value={gcLine1} onChange={(e) => setGcLine1(e.target.value)}
              placeholder="Nome"
              style={{
                padding: "8px 10px", borderRadius: 8, border: "1px solid #2a2a2a",
                background: "#0a0a0a", color: "#e4e4e7", fontSize: 10, fontFamily: "monospace",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 8, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Linha 2
            </label>
            <input type="text" value={gcLine2} onChange={(e) => setGcLine2(e.target.value)}
              placeholder="Função"
              style={{
                padding: "8px 10px", borderRadius: 8, border: "1px solid #2a2a2a",
                background: "#0a0a0a", color: "#e4e4e7", fontSize: 10, fontFamily: "monospace",
              }}
            />
          </div>
        </div>

        {/* ── Preview (ajustado para a coluna) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 8, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Preview
          </span>
          {tarjaCustomPng ? (
            <div style={{ position: "relative", lineHeight: 0, borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a2a" }}>
              <img src={tarjaCustomPng} alt="tarja" style={{ width: "100%", borderRadius: 2 }} />
              {gcLine1 && (
                <div style={{
                  position: "absolute",
                  left: `${font1X}%`,
                  top: `${font1Y}%`,
                  fontSize: Math.max(4, font1Size * 0.25),
                  fontWeight: 900,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  transform: "translateY(-50%)",
                  fontFamily: "sans-serif",
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                }}>
                  {gcLine1}
                </div>
              )}
              {gcLine2 && (
                <div style={{
                  position: "absolute",
                  left: `${font2X}%`,
                  top: `${font2Y}%`,
                  fontSize: Math.max(3, font2Size * 0.25),
                  color: "#d4d4d8",
                  whiteSpace: "nowrap",
                  transform: "translateY(-50%)",
                  fontFamily: "sans-serif",
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                }}>
                  {gcLine2}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, border: "1px dashed #3f3f46",
              background: "#0a0a0a", padding: "16px", minHeight: 60,
              color: "#71717a", fontSize: 10, fontWeight: 700,
            }}>
              {gcLine1 || gcLine2 ? `${gcLine1} | ${gcLine2}` : "Preview"}
            </div>
          )}
        </div>

        {/* ── Botões de Ação ── */}
        <div style={{ display: "flex", gap: 6, flexDirection: "column", marginTop: 4 }}>
          <button onClick={handleTake} style={{
            ...btnBase,
            background: "#16a34a",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ✓ TAKE
          </button>
          <button onClick={handleClear} style={{
            ...btnBase,
            background: "#dc2626",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ✕ CLEAR
          </button>
          <button onClick={handleSkip} style={{
            ...btnBase,
            background: "#3f3f46",
            color: "#d4d4d8",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#52525b"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3f3f46"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ⊳ PULAR
          </button>
        </div>

        {/* ── Layer Config Button ── */}
        <div style={{ borderTop: "1px solid #27272a", paddingTop: 12, marginTop: 8 }}>
          <button onClick={() => setLayerOpen(true)} style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            background: layerOpen ? "#3f3f46" : "#27272a",
            border: "1px solid #3f3f46",
            color: "#e4e4e7",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#3f3f46"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = layerOpen ? "#3f3f46" : "#27272a"; }}
          >
            <span>🎞</span>
            LAYER CONFIG
            {tarjaCustomPng && (
              <span style={{
                marginLeft: "auto",
                fontSize: 7, fontWeight: 900,
                background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.4)",
                color: "#f472b6", padding: "2px 6px", borderRadius: 99,
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                PNG ✓
              </span>
            )}
          </button>
        </div>

        {/* ── Status Indicator ── */}
        {gcVisible && (
          <div style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 10,
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", animation: "gcPulse 1s infinite" }} />
            <span style={{ fontSize: 8, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              GC ATIVO
            </span>
            {gcDuration > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 8, color: "#4ade80", fontFamily: "monospace", fontWeight: 700 }}>
                {gcDuration}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Config Tarja ── */}
      <ConfigTarjaModal
        open={layerOpen}
        onClose={() => setLayerOpen(false)}
        tarjaCustomPng={tarjaCustomPng}
        setTarjaCustomPng={setTarjaCustomPng}
        tarjaScaleX={tarjaScaleX} setTarjaScaleX={setTarjaScaleX}
        tarjaScaleY={tarjaScaleY} setTarjaScaleY={setTarjaScaleY}
        tarjaScaleLock={tarjaScaleLock} setTarjaScaleLock={setTarjaScaleLock}
        tarjaX={tarjaX} setTarjaX={setTarjaX}
        tarjaY={tarjaY} setTarjaY={setTarjaY}
        font1Size={font1Size} setFont1Size={setFont1Size}
        font1X={font1X} setFont1X={setFont1X}
        font1Y={font1Y} setFont1Y={setFont1Y}
        font2Size={font2Size} setFont2Size={setFont2Size}
        font2X={font2X} setFont2X={setFont2X}
        font2Y={font2Y} setFont2Y={setFont2Y}
        gcLine1={gcLine1}
        gcLine2={gcLine2}
      />

      <style>{`
        @keyframes gcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
