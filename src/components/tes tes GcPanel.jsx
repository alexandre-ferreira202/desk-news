import { useState, useRef, useCallback, useEffect } from "react";

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderRow({ label, min, max, value, onChange, unit = "", accentColor = "#ec4899" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <label style={{
        fontSize: 9,
        color: "#71717a",
        width: 72,
        flexShrink: 0,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 600,
      }}>
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          height: 4,
          accentColor,
          cursor: "pointer",
        }}
      />
      <span style={{
        fontSize: 9,
        fontFamily: "monospace",
        color: "#a1a1aa",
        width: 36,
        textAlign: "right",
        fontWeight: 700,
      }}>
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
      display: "block",
      marginBottom: 8,
      marginTop: 12,
    }}>
      {children}
    </span>
  );
}

// ─── Modal: Config Tarja ──────────────────────────────────────────────────────

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
  const presetImportRef = useRef(null);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedPresets, setSavedPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gc_tarja_presets") || "{}"); }
    catch { return {}; }
  });

  const handleFile = (file) => {
    if (!file || !file.type.includes("image")) return;
    const reader = new FileReader();
    reader.onload = () => setTarjaCustomPng(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSavePreset = () => {
    const name = presetNameInput.trim();
    if (!name) return;
    const preset = {
      tarjaCustomPng,
      tarjaScaleX, tarjaScaleY, tarjaScaleLock,
      tarjaX, tarjaY,
      font1Size, font1X, font1Y,
      font2Size, font2X, font2Y,
    };
    const updated = { ...savedPresets, [name]: preset };
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
    setShowSaveDialog(false);
    setPresetNameInput("");
  };

  const handleApplyPreset = (name) => {
    const p = savedPresets[name];
    if (!p) return;
    if (p.tarjaCustomPng !== undefined) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== undefined) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== undefined) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== undefined) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== undefined) setTarjaX(p.tarjaX);
    if (p.tarjaY !== undefined) setTarjaY(p.tarjaY);
    if (p.font1Size !== undefined) setFont1Size(p.font1Size);
    if (p.font1X !== undefined) setFont1X(p.font1X);
    if (p.font1Y !== undefined) setFont1Y(p.font1Y);
    if (p.font2Size !== undefined) setFont2Size(p.font2Size);
    if (p.font2X !== undefined) setFont2X(p.font2X);
    if (p.font2Y !== undefined) setFont2Y(p.font2Y);
  };

  const handleDeletePreset = (name, e) => {
    e.stopPropagation();
    const updated = { ...savedPresets };
    delete updated[name];
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
  };

  const handleExportPreset = () => {
    const name = presetNameInput.trim() || "preset_gc";
    const preset = {
      tarjaCustomPng,
      tarjaScaleX, tarjaScaleY, tarjaScaleLock,
      tarjaX, tarjaY,
      font1Size, font1X, font1Y,
      font2Size, font2X, font2Y,
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.gcpreset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        handleApplyPreset(p);
      } catch {
        alert("Arquivo de preset inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleApplyPresetObj = (p) => {
    if (p.tarjaCustomPng !== undefined) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== undefined) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== undefined) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== undefined) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== undefined) setTarjaX(p.tarjaX);
    if (p.tarjaY !== undefined) setTarjaY(p.tarjaY);
    if (p.font1Size !== undefined) setFont1Size(p.font1Size);
    if (p.font1X !== undefined) setFont1X(p.font1X);
    if (p.font1Y !== undefined) setFont1Y(p.font1Y);
    if (p.font2Size !== undefined) setFont2Size(p.font2Size);
    if (p.font2X !== undefined) setFont2X(p.font2X);
    if (p.font2Y !== undefined) setFont2Y(p.font2Y);
  };

  if (!open) return null;

  const presetNames = Object.keys(savedPresets);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <SectionLabel>📝 Texto — Linha 1</SectionLabel>
      <SliderRow label="Tamanho" min={10} max={200} value={font1Size} onChange={setFont1Size} unit="%" />
      <SliderRow label="Posição X" min={0} max={100} value={font1X} onChange={setFont1X} unit="%" />
      <SliderRow label="Posição Y" min={0} max={100} value={font1Y} onChange={setFont1Y} unit="%" />

      <SectionLabel>📝 Texto — Linha 2</SectionLabel>
      <SliderRow label="Tamanho" min={10} max={200} value={font2Size} onChange={setFont2Size} unit="%" />
      <SliderRow label="Posição X" min={0} max={100} value={font2X} onChange={setFont2X} unit="%" />
      <SliderRow label="Posição Y" min={0} max={100} value={font2Y} onChange={setFont2Y} unit="%" />

      <SectionLabel>📦 Escala & Posição</SectionLabel>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setTarjaScaleLock(!tarjaScaleLock)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #27272a",
            background: tarjaScaleLock ? "rgba(0,255,136,0.1)" : "#27272a",
            color: tarjaScaleLock ? "#00ff88" : "#a1a1aa",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          {tarjaScaleLock ? "🔒 Lock" : "🔓 Free"}
        </button>
      </div>
      <SliderRow label="Escala X" min={10} max={400} value={tarjaScaleX} onChange={(v) => { if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleX(v); }} unit="%" />
      <SliderRow label="Escala Y" min={10} max={400} value={tarjaScaleY} onChange={(v) => { if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleY(v); }} unit="%" />
      <SliderRow label="Posição X" min={0} max={100} value={tarjaX} onChange={setTarjaX} unit="%" />
      <SliderRow label="Posição Y" min={0} max={100} value={tarjaY} onChange={setTarjaY} unit="%" />

      {tarjaCustomPng && (
        <>
          <SectionLabel>🖼️ PNG Carregado</SectionLabel>
          <div style={{
            width: "100%",
            height: 120,
            borderRadius: 8,
            overflow: "hidden",
            background: "#0a0a0a",
            border: "1px solid #27272a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img src={tarjaCustomPng} alt="Tarja preview" style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }} />
          </div>
        </>
      )}

      <SectionLabel>💾 Presets</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: 6,
            background: "#16a34a",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 9,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          💾 Salvar
        </button>
        <button
          onClick={handleExportPreset}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: 6,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 9,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          📥 Exportar
        </button>
        <button
          onClick={() => presetImportRef.current?.click()}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: 6,
            background: "#8b5cf6",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 9,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          📤 Importar
        </button>
        <input
          ref={presetImportRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </div>

      {presetNames.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {presetNames.map((name) => (
            <div
              key={name}
              onClick={() => handleApplyPreset(name)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "#27272a",
                border: "1px solid #3f3f46",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
              }}
            >
              <span>{name}</span>
              <button
                onClick={(e) => handleDeletePreset(name, e)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: 12,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div style={{
          background: "#1a1a1a",
          border: "1px solid #27272a",
          borderRadius: 12,
          padding: 12,
        }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 700 }}>Nomear Preset</h3>
          <input
            type="text"
            value={presetNameInput}
            onChange={(e) => setPresetNameInput(e.target.value)}
            placeholder="Digite um nome"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #27272a",
              background: "#0a0a0a",
              color: "#e4e4e7",
              fontSize: 11,
              boxSizing: "border-box",
              marginBottom: 8,
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSavePreset}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 6,
                background: "#16a34a",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              Salvar
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 6,
                background: "#3f3f46",
                border: "none",
                color: "#e4e4e7",
                fontWeight: 700,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main GC Panel Component ──────────────────────────────────────────────────

export default function GcPanel({
  gcLine1 = "",
  setGcLine1 = () => {},
  gcLine2 = "",
  setGcLine2 = () => {},
  gcVisible = false,
  gcDuration = 0,
}) {
  const [layerOpen, setLayerOpen] = useState(false);
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(100);
  const [tarjaScaleY, setTarjaScaleY] = useState(100);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(50);
  const [font1Size, setFont1Size] = useState(100);
  const [font1X, setFont1X] = useState(50);
  const [font1Y, setFont1Y] = useState(50);
  const [font2Size, setFont2Size] = useState(80);
  const [font2X, setFont2X] = useState(50);
  const [font2Y, setFont2Y] = useState(60);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Preview */}
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #27272a",
          borderRadius: 8,
          padding: 12,
          minHeight: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          {gcLine1 && (
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#00ff88",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {gcLine1}
            </div>
          )}
          {gcLine2 && (
            <div style={{
              fontSize: 10,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {gcLine2}
            </div>
          )}
          {!gcLine1 && !gcLine2 && (
            <div style={{
              fontSize: 10,
              color: "#52525b",
              fontStyle: "italic",
            }}>
              Nenhum GC ativo
            </div>
          )}
        </div>

        {/* Config Button */}
        <button
          onClick={() => setLayerOpen(!layerOpen)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3f3f46";
            e.currentTarget.style.borderColor = "#52525b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = layerOpen ? "#3f3f46" : "#27272a";
            e.currentTarget.style.borderColor = "#3f3f46";
          }}
        >
          <span>⚙️</span>
          {layerOpen ? "Fechar Config" : "Config Tarja"}
        </button>

        {/* Config Panel */}
        {layerOpen && (
          <div style={{
            background: "rgba(30,30,35,0.6)",
            border: "1px solid #27272a",
            borderRadius: 8,
            padding: 12,
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            <ConfigTarjaModal
              open={true}
              onClose={() => setLayerOpen(false)}
              tarjaCustomPng={tarjaCustomPng}
              setTarjaCustomPng={setTarjaCustomPng}
              tarjaScaleX={tarjaScaleX}
              setTarjaScaleX={setTarjaScaleX}
              tarjaScaleY={tarjaScaleY}
              setTarjaScaleY={setTarjaScaleY}
              tarjaScaleLock={tarjaScaleLock}
              setTarjaScaleLock={setTarjaScaleLock}
              tarjaX={tarjaX}
              setTarjaX={setTarjaX}
              tarjaY={tarjaY}
              setTarjaY={setTarjaY}
              font1Size={font1Size}
              setFont1Size={setFont1Size}
              font1X={font1X}
              setFont1X={setFont1X}
              font1Y={font1Y}
              setFont1Y={setFont1Y}
              font2Size={font2Size}
              setFont2Size={setFont2Size}
              font2X={font2X}
              setFont2X={setFont2X}
              font2Y={font2Y}
              setFont2Y={setFont2Y}
              gcLine1={gcLine1}
              gcLine2={gcLine2}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes gcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
