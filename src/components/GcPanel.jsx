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

// ─── Modal: Config Tarja ──────────────────────────────────────────────────────

function ConfigTarjaModal({
  open,
  onClose,
  // Tarja PNG
  tarjaCustomPng,
  setTarjaCustomPng,
  // Scale
  tarjaScaleX, setTarjaScaleX,
  tarjaScaleY, setTarjaScaleY,
  tarjaScaleLock, setTarjaScaleLock,
  // Position
  tarjaX, setTarjaX,
  tarjaY, setTarjaY,
  // Font Line 1
  font1Size, setFont1Size,
  font1X, setFont1X,
  font1Y, setFont1Y,
  // Font Line 2
  font2Size, setFont2Size,
  font2X, setFont2X,
  font2Y, setFont2Y,
  // Preview text
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
    if (!file || !file.type.includes("png")) return;
    const reader = new FileReader();
    reader.onload = () => setTarjaCustomPng(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Salvar preset ──
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
    setPresetMenuOpen(false);
  };

  // ── Aplicar preset salvo ──
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
    setPresetMenuOpen(false);
  };

  // ── Deletar preset ──
  const handleDeletePreset = (name, e) => {
    e.stopPropagation();
    const updated = { ...savedPresets };
    delete updated[name];
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
  };

  // ── Exportar preset para arquivo JSON ──
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
    a.href = url; a.download = `${name}.gcpreset.json`; a.click();
    URL.revokeObjectURL(url);
    setPresetMenuOpen(false);
  };

  // ── Importar preset de arquivo JSON ──
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        handleApplyPresetObj(p);
      } catch { alert("Arquivo de preset inválido."); }
    };
    reader.readAsText(file);
    e.target.value = "";
    setPresetMenuOpen(false);
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
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e4e4e7" }}>
              Config Layer / Tarja
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            {/* ── Botão PRESET ── */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setPresetMenuOpen(v => !v); setShowSaveDialog(false); }}
                style={{
                  background: presetMenuOpen ? "#3f3f46" : "#27272a",
                  border: "1px solid #3f3f46",
                  borderRadius: 8, padding: "4px 12px",
                  color: "#a78bfa", fontSize: 11, cursor: "pointer",
                  fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#3f3f46"}
                onMouseLeave={(e) => e.currentTarget.style.background = presetMenuOpen ? "#3f3f46" : "#27272a"}
              >
                <span>💾</span> PRESET <span style={{ fontSize: 8 }}>{presetMenuOpen ? "▲" : "▼"}</span>
              </button>

              {presetMenuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
                  background: "#18181b", border: "1px solid #3f3f46", borderRadius: 12,
                  minWidth: 260, boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  overflow: "hidden",
                }}>
                  {/* Salvar preset */}
                  {!showSaveDialog ? (
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "11px 16px", background: "transparent",
                        border: "none", borderBottom: "1px solid #27272a",
                        color: "#a78bfa", fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        cursor: "pointer", textAlign: "left",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      💾 Salvar config atual como preset
                    </button>
                  ) : (
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{ fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Nome do programa / preset</span>
                      <input
                        autoFocus
                        value={presetNameInput}
                        onChange={(e) => setPresetNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSavePreset(); if (e.key === "Escape") setShowSaveDialog(false); }}
                        placeholder="Ex: Jornal da Manhã"
                        style={{
                          background: "#09090b", border: "1px solid #3f3f46", borderRadius: 6,
                          padding: "6px 10px", color: "#e4e4e7", fontSize: 11, fontFamily: "monospace",
                          outline: "none", width: "100%", boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={handleSavePreset} style={{ flex: 1, padding: "7px 0", borderRadius: 6, background: "#7c3aed", border: "none", color: "#fff", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>
                          ✓ Salvar
                        </button>
                        <button onClick={() => setShowSaveDialog(false)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, background: "#27272a", border: "1px solid #3f3f46", color: "#a1a1aa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exportar para arquivo */}
                  <button
                    onClick={handleExportPreset}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "11px 16px", background: "transparent",
                      border: "none", borderBottom: "1px solid #27272a",
                      color: "#34d399", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    📤 Exportar preset (.json)
                  </button>

                  {/* Importar de arquivo */}
                  <button
                    onClick={() => presetImportRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "11px 16px", background: "transparent",
                      border: "none", borderBottom: presetNames.length > 0 ? "1px solid #27272a" : "none",
                      color: "#60a5fa", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    📥 Importar preset (.json)
                  </button>
                  <input ref={presetImportRef} type="file" accept=".json,.gcpreset.json" style={{ display: "none" }} onChange={handleImportFile} />

                  {/* Lista de presets salvos */}
                  {presetNames.length > 0 && (
                    <div>
                      <div style={{ padding: "8px 16px 4px", fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                        PRESETS SALVOS
                      </div>
                      {presetNames.map((name) => (
                        <div
                          key={name}
                          style={{ display: "flex", alignItems: "center", borderTop: "1px solid #1f1f23" }}
                        >
                          <button
                            onClick={() => handleApplyPreset(name)}
                            style={{
                              flex: 1, padding: "10px 16px", background: "transparent",
                              border: "none", color: "#e4e4e7", fontSize: 11, fontWeight: 600,
                              textAlign: "left", cursor: "pointer", textTransform: "none",
                              letterSpacing: 0,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            {savedPresets[name]?.tarjaCustomPng ? "🖼 " : "⚙️ "}{name}
                          </button>
                          <button
                            onClick={(e) => handleDeletePreset(name, e)}
                            style={{
                              padding: "10px 14px", background: "transparent", border: "none",
                              color: "#52525b", fontSize: 12, cursor: "pointer",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#52525b"}
                            title="Remover preset"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                background: "#27272a", border: "1px solid #3f3f46",
                borderRadius: 8, padding: "4px 10px",
                color: "#a1a1aa", fontSize: 11, cursor: "pointer",
                fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3f3f46"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#27272a"}
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Live Preview ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Preview ao Vivo</SectionLabel>
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              background: "#000",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #3f3f46",
            }}>
              {/* Simula cena de TV */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#ffffff18", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  SINAL DE VÍDEO
                </span>
              </div>

              {/* Tarja PNG ou fallback colorido */}
              {(gcLine1 || gcLine2) && (
                <div style={{
                  position: "absolute",
                  left: `${tarjaX}%`,
                  top: `${tarjaY}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${tarjaScaleX}%`,
                }}>
                  {tarjaCustomPng ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={tarjaCustomPng}
                        alt="tarja"
                        style={{ width: "100%", display: "block", height: "auto" }}
                      />
                      {/* Linha 1 sobre o PNG */}
                      {gcLine1 && (
                        <div style={{
                          position: "absolute",
                          left: `${font1X}%`,
                          top: `${font1Y}%`,
                          fontSize: font1Size,
                          fontWeight: 900,
                          color: "#fff",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                          transform: "translateY(-50%)",
                          fontFamily: "sans-serif",
                        }}>
                          {gcLine1}
                        </div>
                      )}
                      {/* Linha 2 sobre o PNG */}
                      {gcLine2 && (
                        <div style={{
                          position: "absolute",
                          left: `${font2X}%`,
                          top: `${font2Y}%`,
                          fontSize: font2Size,
                          fontWeight: 500,
                          color: "#d4d4d8",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                          transform: "translateY(-50%)",
                          fontFamily: "sans-serif",
                        }}>
                          {gcLine2}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback: tarja com faixa escura */
                    <div style={{
                      display: "flex",
                      alignItems: "stretch",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
                    }}>
                      <div style={{ width: 4, background: "#dc2626", flexShrink: 0 }} />
                      <div style={{ background: "rgba(0,0,0,0.88)", padding: "6px 10px", flex: 1, minWidth: 0 }}>
                        {gcLine1 && (
                          <div style={{
                            fontSize: font1Size,
                            fontWeight: 900,
                            color: "#fff",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            fontFamily: "sans-serif",
                            lineHeight: 1.2,
                          }}>
                            {gcLine1}
                          </div>
                        )}
                        {gcLine2 && (
                          <div style={{
                            fontSize: font2Size,
                            fontWeight: 400,
                            color: "#a1a1aa",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            fontFamily: "sans-serif",
                            lineHeight: 1.2,
                          }}>
                            {gcLine2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!gcLine1 && !gcLine2 && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#52525b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    Digite nas linhas do GC para ver o preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Upload de Imagem PNG ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>PNG Personalizado (Tarja)</SectionLabel>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, padding: "10px 14px",
                  borderRadius: 10, background: "#27272a",
                  border: "1px solid #3f3f46",
                  color: "#e4e4e7", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  cursor: "pointer", transition: "background 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#3f3f46"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#27272a"}
              >
                📁 Buscar arquivo .PNG
              </button>
              {tarjaCustomPng && (
                <button
                  onClick={() => setTarjaCustomPng(null)}
                  style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171", fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                >
                  ✕ Remover
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            {tarjaCustomPng && (
              <div style={{
                borderRadius: 8, overflow: "hidden", border: "1px solid #3f3f46",
                background: "#09090b",
              }}>
                <img src={tarjaCustomPng} alt="Tarja PNG" style={{ width: "100%", display: "block", maxHeight: 80, objectFit: "contain" }} />
              </div>
            )}
            {!tarjaCustomPng && (
              <div style={{
                border: "2px dashed #3f3f46", borderRadius: 8, padding: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                color: "#52525b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
                cursor: "pointer",
              }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
              >
                🖼 Arraste um PNG aqui ou clique para buscar
              </div>
            )}
          </div>

          {/* ── Controles da Tarja (Transform) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <SectionLabel>Escala da Tarja</SectionLabel>
              <button
                onClick={() => setTarjaScaleLock(v => !v)}
                style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 9,
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                  cursor: "pointer", transition: "all 0.15s",
                  background: tarjaScaleLock ? "rgba(236,72,153,0.12)" : "#27272a",
                  border: tarjaScaleLock ? "1px solid rgba(236,72,153,0.4)" : "1px solid #3f3f46",
                  color: tarjaScaleLock ? "#f472b6" : "#71717a",
                }}
              >
                {tarjaScaleLock ? "🔒 PROPORCIONAL" : "🔓 LIVRE"}
              </button>
            </div>
            <SliderRow label="Largura X" min={10} max={200} value={tarjaScaleX} unit="%" onChange={(v) => {
              setTarjaScaleX(v);
              if (tarjaScaleLock) setTarjaScaleY(v);
            }} />
            <SliderRow label="Altura Y" min={10} max={200} value={tarjaScaleY} unit="%" onChange={(v) => {
              setTarjaScaleY(v);
              if (tarjaScaleLock) setTarjaScaleX(v);
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Posição na Tela</SectionLabel>
            <SliderRow label="Posição X" min={0} max={100} value={tarjaX} unit="%" onChange={setTarjaX} />
            <SliderRow label="Posição Y" min={0} max={100} value={tarjaY} unit="%" onChange={setTarjaY} />
            {/* Mini Mapa */}
            <div style={{ position: "relative", width: "100%", height: 56, background: "#09090b", borderRadius: 8, border: "1px solid #27272a", overflow: "hidden" }}>
              <div style={{
                position: "absolute",
                left: `${tarjaX}%`,
                top: `${tarjaY}%`,
                width: 10, height: 10,
                borderRadius: "50%",
                background: "#ec4899",
                border: "2px solid #fff",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 8px rgba(236,72,153,0.8)",
                transition: "all 0.05s",
              }} />
            </div>
          </div>

          {/* ── Controles de Fonte ── */}
          <div style={{ display: "flex", gap: 16 }}>
            {/* Linha 1 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <SectionLabel>Fonte — Linha 1</SectionLabel>
              </div>
              <SliderRow label="Tamanho" min={6} max={48} value={font1Size} unit="px" onChange={setFont1Size} accentColor="#22c55e" />
              <SliderRow label="Pos. X" min={0} max={100} value={font1X} unit="%" onChange={setFont1X} accentColor="#22c55e" />
              <SliderRow label="Pos. Y" min={0} max={100} value={font1Y} unit="%" onChange={setFont1Y} accentColor="#22c55e" />
            </div>

            {/* Linha 2 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                <SectionLabel>Fonte — Linha 2</SectionLabel>
              </div>
              <SliderRow label="Tamanho" min={6} max={40} value={font2Size} unit="px" onChange={setFont2Size} accentColor="#3b82f6" />
              <SliderRow label="Pos. X" min={0} max={100} value={font2X} unit="%" onChange={setFont2X} accentColor="#3b82f6" />
              <SliderRow label="Pos. Y" min={0} max={100} value={font2Y} unit="%" onChange={setFont2Y} accentColor="#3b82f6" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main: GC Panel ───────────────────────────────────────────────────────────

export default function GcPanel({
  // Controlled state from playout.tsx
  gcLine1, setGcLine1,
  gcLine2, setGcLine2,
  gcDuration, setGcDuration,
  gcVisible, setGcVisible,
  gcCreditsQueue,
  // Callbacks
  onTake,
  onClear,
  onSkip,
  // Notifica o playout sempre que o PNG/posição/fonte da tarja mudar,
  // para que ele possa repassar isso pro output real (WebSocket).
  onLayerChange,
}) {

  // Layer / Tarja modal
  const [layerOpen, setLayerOpen] = useState(false);

  // Tarja PNG
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  // Scale
  const [tarjaScaleX, setTarjaScaleX] = useState(80);
  const [tarjaScaleY, setTarjaScaleY] = useState(80);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  // Position
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(85);
  // Font Line 1
  const [font1Size, setFont1Size] = useState(14);
  const [font1X, setFont1X] = useState(8);
  const [font1Y, setFont1Y] = useState(35);
  // Font Line 2
  const [font2Size, setFont2Size] = useState(10);
  const [font2X, setFont2X] = useState(8);
  const [font2Y, setFont2Y] = useState(70);

  // ── Repassa a config de layer da tarja pro playout sempre que mudar ──
  useEffect(() => {
    onLayerChange?.({
      tarjaCustomPng,
      tarjaScaleX, tarjaScaleY,
      tarjaX, tarjaY,
      font1Size, font1X, font1Y,
      font2Size, font2X, font2Y,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tarjaCustomPng,
    tarjaScaleX, tarjaScaleY,
    tarjaX, tarjaY,
    font1Size, font1X, font1Y,
    font2Size, font2X, font2Y,
  ]);

  const handleTake = useCallback(() => {
    onTake?.();
  }, [onTake]);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  // ── Styles ──
  const panelStyle = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    width: "100%",
    minWidth: 0,
    position: "relative",
    boxSizing: "border-box",
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(39,39,42,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 11,
    fontFamily: "monospace",
    color: "#e4e4e7",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#52525b",
    fontWeight: 700,
  };

  const selectStyle = {
    flex: 1,
    background: "rgba(39,39,42,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 10,
    fontFamily: "monospace",
    color: "#e4e4e7",
    outline: "none",
    cursor: "pointer",
  };

  const btnBase = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 16px",
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer",
    transition: "all 0.15s",
    border: "none",
    outline: "none",
  };

  return (
    <>
    <div style={panelStyle}>
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: gcVisible ? "#22c55e" : "#52525b",
            boxShadow: gcVisible ? "0 0 8px #22c55e" : "none",
            transition: "all 0.3s",
          }} />
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#71717a" }}>
            GC — Gerador de Caracteres
          </span>
          {gcVisible && (
            <span style={{
              marginLeft: "auto",
              fontSize: 8, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.15em", color: "#22c55e",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              padding: "2px 8px", borderRadius: 99,
              animation: "pulse 1.5s infinite",
            }}>
              ● NO AR
            </span>
          )}
        </div>

        {/* ── Inputs + Live Preview ── */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 12 }}>

          {/* Campos de entrada */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Linha 1 — Nome / Título</label>
              <input
                type="text"
                value={gcLine1}
                onChange={(e) => setGcLine1(e.target.value)}
                placeholder="Nome / Título"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "rgba(239,68,68,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Linha 2 — Cargo / Informação</label>
              <input
                type="text"
                value={gcLine2}
                onChange={(e) => setGcLine2(e.target.value)}
                placeholder="Cargo / Informação"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "rgba(239,68,68,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={labelStyle}>Duração:</label>
              <select
                value={gcDuration}
                onChange={(e) => setGcDuration(Number(e.target.value))}
                style={selectStyle}
              >
                <option value={0}>Manual</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
              </select>
            </div>
          </div>

          {/* Preview Miniatura */}
          <div style={{
            position: "relative",
            background: "#09090b",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ position: "absolute", fontSize: 7, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.1em", top: 4, left: 0, right: 0, textAlign: "center" }}>
              GC LIVE PREV
            </span>

            {(gcLine1 || gcLine2) ? (
              <div style={{ position: "absolute", bottom: 4, left: 4, right: 4 }}>
                {tarjaCustomPng ? (
                  /* ── Tarja PNG personalizada com texto sobreposto ── */
                  <div style={{ position: "relative", lineHeight: 0 }}>
                    <img
                      src={tarjaCustomPng}
                      alt="tarja"
                      style={{ width: "100%", borderRadius: 2, display: "block" }}
                    />
                    {gcLine1 && (
                      <div style={{
                        position: "absolute",
                        left: `${font1X}%`,
                        top: `${font1Y}%`,
                        fontSize: Math.max(4, font1Size * 0.32),
                        fontWeight: 900,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        transform: "translateY(-50%)",
                        fontFamily: "sans-serif",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                        letterSpacing: "0.03em",
                      }}>
                        {gcLine1}
                      </div>
                    )}
                    {gcLine2 && (
                      <div style={{
                        position: "absolute",
                        left: `${font2X}%`,
                        top: `${font2Y}%`,
                        fontSize: Math.max(3, font2Size * 0.32),
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
                  /* ── Sem PNG: exibe somente o texto com fundo escuro ── */
                  <div style={{ background: "rgba(0,0,0,0.82)", borderRadius: 3, padding: "4px 6px", borderLeft: "2px solid #dc2626" }}>
                    {gcLine1 && (
                      <div style={{ color: "#fff", fontWeight: 900, fontSize: 7, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.4 }}>
                        {gcLine1}
                      </div>
                    )}
                    {gcLine2 && (
                      <div style={{ color: "#a1a1aa", fontSize: 6, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                        {gcLine2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Botões de Ação ── */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleTake}
            style={{
              ...btnBase,
              background: "#16a34a",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.transform = "translateY(0)"; }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          >
            GC TAKE
          </button>

          <button
            onClick={handleClear}
            style={{
              ...btnBase,
              background: "#dc2626",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.transform = "translateY(0)"; }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          >
            GC CLEAR
          </button>

          <button
            onClick={handleSkip}
            style={{
              ...btnBase,
              background: "#3f3f46",
              color: "#d4d4d8",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#52525b"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3f3f46"; e.currentTarget.style.transform = "translateY(0)"; }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          >
            PULAR
          </button>
        </div>

        {/* ── Ajustes & Efeitos: botão Layer ── */}
        <div style={{ borderTop: "1px solid #27272a", paddingTop: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.15em", color: "#52525b",
            }}>
              ⚙️ Ajustes & Efeitos
            </span>
          </div>

          <button
            onClick={() => setLayerOpen(true)}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 14,
              background: layerOpen ? "#3f3f46" : "#27272a",
              border: "1px solid #3f3f46",
              color: "#e4e4e7",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#3f3f46"; e.currentTarget.style.borderColor = "#52525b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = layerOpen ? "#3f3f46" : "#27272a"; e.currentTarget.style.borderColor = "#3f3f46"; }}
          >
            <span>🎞</span>
            LAYER — Config Tarja
            {tarjaCustomPng && (
              <span style={{
                marginLeft: "auto",
                fontSize: 8, fontWeight: 900,
                background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.4)",
                color: "#f472b6", padding: "2px 8px", borderRadius: 99,
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                PNG ativo
              </span>
            )}
          </button>
        </div>

        {/* ── Indicador de status ── */}
        {gcVisible && (
          <div style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "gcPulse 1s infinite" }} />
            <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              GC Ativo — {gcLine1}{gcLine2 ? ` | ${gcLine2}` : ""}
            </span>
            {gcDuration > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }}>
                {gcDuration}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
