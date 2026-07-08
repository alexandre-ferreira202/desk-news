import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from "react";
import { b as Route, d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { MonitorPlay, FolderOpen, RefreshCw, Film, CheckCircle2, HardDrive, FileCheck, FileX, VolumeX, Volume2, PowerOff, Youtube, X, Play, Grid2X2, SkipBack, Square, Pause, SkipForward, Type, Sliders, Image } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
import { u as useAutoCredits } from "./useAutoCredits-sOhlO_wH.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
import "clsx";
import "tailwind-merge";
function SliderRow({ label, min, max, value, onChange, unit = "", accentColor = "#ec4899" }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ jsx("label", { style: { fontSize: 9, color: "#71717a", width: 72, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.1em" }, children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        min,
        max,
        value,
        onChange: (e) => onChange(Number(e.target.value)),
        style: { flex: 1, height: 4, accentColor, cursor: "pointer" }
      }
    ),
    /* @__PURE__ */ jsxs("span", { style: { fontSize: 9, fontFamily: "monospace", color: "#a1a1aa", width: 36, textAlign: "right" }, children: [
      value,
      unit
    ] })
  ] });
}
function SectionLabel({ children }) {
  return /* @__PURE__ */ jsx("span", { style: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#52525b"
  }, children });
}
function ConfigTarjaModal({
  open,
  onClose,
  // Tarja PNG
  tarjaCustomPng,
  setTarjaCustomPng,
  // Scale
  tarjaScaleX,
  setTarjaScaleX,
  tarjaScaleY,
  setTarjaScaleY,
  tarjaScaleLock,
  setTarjaScaleLock,
  // Position
  tarjaX,
  setTarjaX,
  tarjaY,
  setTarjaY,
  // Font Line 1
  font1Size,
  setFont1Size,
  font1X,
  setFont1X,
  font1Y,
  setFont1Y,
  // Font Line 2
  font2Size,
  setFont2Size,
  font2X,
  setFont2X,
  font2Y,
  setFont2Y,
  // Preview text
  gcLine1,
  gcLine2
}) {
  const fileInputRef = useRef(null);
  const presetImportRef = useRef(null);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gc_tarja_presets") || "{}");
    } catch {
      return {};
    }
  });
  const handleFile = (file) => {
    if (!file || !file.type.includes("png")) return;
    const reader = new FileReader();
    reader.onload = () => setTarjaCustomPng(reader.result);
    reader.readAsDataURL(file);
  };
  const handleSavePreset = () => {
    const name = presetNameInput.trim();
    if (!name) return;
    const preset = {
      tarjaCustomPng,
      tarjaScaleX,
      tarjaScaleY,
      tarjaScaleLock,
      tarjaX,
      tarjaY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    };
    const updated = { ...savedPresets, [name]: preset };
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
    setShowSaveDialog(false);
    setPresetNameInput("");
    setPresetMenuOpen(false);
  };
  const handleApplyPreset = (name) => {
    const p = savedPresets[name];
    if (!p) return;
    if (p.tarjaCustomPng !== void 0) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== void 0) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== void 0) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== void 0) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== void 0) setTarjaX(p.tarjaX);
    if (p.tarjaY !== void 0) setTarjaY(p.tarjaY);
    if (p.font1Size !== void 0) setFont1Size(p.font1Size);
    if (p.font1X !== void 0) setFont1X(p.font1X);
    if (p.font1Y !== void 0) setFont1Y(p.font1Y);
    if (p.font2Size !== void 0) setFont2Size(p.font2Size);
    if (p.font2X !== void 0) setFont2X(p.font2X);
    if (p.font2Y !== void 0) setFont2Y(p.font2Y);
    setPresetMenuOpen(false);
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
      tarjaScaleX,
      tarjaScaleY,
      tarjaScaleLock,
      tarjaX,
      tarjaY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.gcpreset.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPresetMenuOpen(false);
  };
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        handleApplyPresetObj(p);
      } catch {
        alert("Arquivo de preset inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
    setPresetMenuOpen(false);
  };
  const handleApplyPresetObj = (p) => {
    if (p.tarjaCustomPng !== void 0) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== void 0) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== void 0) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== void 0) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== void 0) setTarjaX(p.tarjaX);
    if (p.tarjaY !== void 0) setTarjaY(p.tarjaY);
    if (p.font1Size !== void 0) setFont1Size(p.font1Size);
    if (p.font1X !== void 0) setFont1X(p.font1X);
    if (p.font1Y !== void 0) setFont1Y(p.font1Y);
    if (p.font2Size !== void 0) setFont2Size(p.font2Size);
    if (p.font2X !== void 0) setFont2X(p.font2X);
    if (p.font2Y !== void 0) setFont2Y(p.font2Y);
  };
  if (!open) return null;
  const presetNames = Object.keys(savedPresets);
  return /* @__PURE__ */ jsx("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxs("div", { style: {
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
    gap: 0
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: "1px solid #27272a"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 16 }, children: "🎞" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e4e4e7" }, children: "Config Layer / Tarja" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, position: "relative" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setPresetMenuOpen((v) => !v);
                setShowSaveDialog(false);
              },
              style: {
                background: presetMenuOpen ? "#3f3f46" : "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                padding: "4px 12px",
                color: "#a78bfa",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
              onMouseLeave: (e) => e.currentTarget.style.background = presetMenuOpen ? "#3f3f46" : "#27272a",
              children: [
                /* @__PURE__ */ jsx("span", { children: "💾" }),
                " PRESET ",
                /* @__PURE__ */ jsx("span", { style: { fontSize: 8 }, children: presetMenuOpen ? "▲" : "▼" })
              ]
            }
          ),
          presetMenuOpen && /* @__PURE__ */ jsxs("div", { style: {
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 12,
            minWidth: 260,
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            overflow: "hidden"
          }, children: [
            !showSaveDialog ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowSaveDialog(true),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #27272a",
                  color: "#a78bfa",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "💾 Salvar config atual como preset"
              }
            ) : /* @__PURE__ */ jsxs("div", { style: { padding: "12px 16px", borderBottom: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 8 }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }, children: "Nome do programa / preset" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  autoFocus: true,
                  value: presetNameInput,
                  onChange: (e) => setPresetNameInput(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") handleSavePreset();
                    if (e.key === "Escape") setShowSaveDialog(false);
                  },
                  placeholder: "Ex: Jornal da Manhã",
                  style: {
                    background: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#e4e4e7",
                    fontSize: 11,
                    fontFamily: "monospace",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box"
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6 }, children: [
                /* @__PURE__ */ jsx("button", { onClick: handleSavePreset, style: { flex: 1, padding: "7px 0", borderRadius: 6, background: "#7c3aed", border: "none", color: "#fff", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }, children: "✓ Salvar" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowSaveDialog(false), style: { flex: 1, padding: "7px 0", borderRadius: 6, background: "#27272a", border: "1px solid #3f3f46", color: "#a1a1aa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }, children: "Cancelar" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleExportPreset,
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #27272a",
                  color: "#34d399",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "📤 Exportar preset (.json)"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => presetImportRef.current?.click(),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: presetNames.length > 0 ? "1px solid #27272a" : "none",
                  color: "#60a5fa",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "📥 Importar preset (.json)"
              }
            ),
            /* @__PURE__ */ jsx("input", { ref: presetImportRef, type: "file", accept: ".json,.gcpreset.json", style: { display: "none" }, onChange: handleImportFile }),
            presetNames.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { padding: "8px 16px 4px", fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }, children: "PRESETS SALVOS" }),
              presetNames.map((name) => /* @__PURE__ */ jsxs(
                "div",
                {
                  style: { display: "flex", alignItems: "center", borderTop: "1px solid #1f1f23" },
                  children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => handleApplyPreset(name),
                        style: {
                          flex: 1,
                          padding: "10px 16px",
                          background: "transparent",
                          border: "none",
                          color: "#e4e4e7",
                          fontSize: 11,
                          fontWeight: 600,
                          textAlign: "left",
                          cursor: "pointer",
                          textTransform: "none",
                          letterSpacing: 0
                        },
                        onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                        children: [
                          savedPresets[name]?.tarjaCustomPng ? "🖼 " : "⚙️ ",
                          name
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => handleDeletePreset(name, e),
                        style: {
                          padding: "10px 14px",
                          background: "transparent",
                          border: "none",
                          color: "#52525b",
                          fontSize: 12,
                          cursor: "pointer"
                        },
                        onMouseEnter: (e) => e.currentTarget.style.color = "#ef4444",
                        onMouseLeave: (e) => e.currentTarget.style.color = "#52525b",
                        title: "Remover preset",
                        children: "✕"
                      }
                    )
                  ]
                },
                name
              ))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            style: {
              background: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              padding: "4px 10px",
              color: "#a1a1aa",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            },
            onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
            onMouseLeave: (e) => e.currentTarget.style.background = "#27272a",
            children: "✕ Fechar"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: 20, display: "flex", flexDirection: "column", gap: 20 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "Preview ao Vivo" }),
        /* @__PURE__ */ jsxs("div", { style: {
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #3f3f46"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsx("span", { style: { color: "#ffffff18", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.3em" }, children: "SINAL DE VÍDEO" }) }),
          (gcLine1 || gcLine2) && /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            left: `${tarjaX}%`,
            top: `${tarjaY}%`,
            transform: "translate(-50%, -50%)",
            width: `${tarjaScaleX}%`
          }, children: tarjaCustomPng ? /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: tarjaCustomPng,
                alt: "tarja",
                style: { width: "100%", display: "block", height: "auto" }
              }
            ),
            gcLine1 && /* @__PURE__ */ jsx("div", { style: {
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
              fontFamily: "sans-serif"
            }, children: gcLine1 }),
            gcLine2 && /* @__PURE__ */ jsx("div", { style: {
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
              fontFamily: "sans-serif"
            }, children: gcLine2 })
          ] }) : (
            /* Fallback: tarja com faixa escura */
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "stretch",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.6)"
            }, children: [
              /* @__PURE__ */ jsx("div", { style: { width: 4, background: "#dc2626", flexShrink: 0 } }),
              /* @__PURE__ */ jsxs("div", { style: { background: "rgba(0,0,0,0.88)", padding: "6px 10px", flex: 1, minWidth: 0 }, children: [
                gcLine1 && /* @__PURE__ */ jsx("div", { style: {
                  fontSize: font1Size,
                  fontWeight: 900,
                  color: "#fff",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                  lineHeight: 1.2
                }, children: gcLine1 }),
                gcLine2 && /* @__PURE__ */ jsx("div", { style: {
                  fontSize: font2Size,
                  fontWeight: 400,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                  lineHeight: 1.2
                }, children: gcLine2 })
              ] })
            ] })
          ) }),
          !gcLine1 && !gcLine2 && /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsx("span", { style: { color: "#52525b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em" }, children: "Digite nas linhas do GC para ver o preview" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "PNG Personalizado (Tarja)" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => fileInputRef.current?.click(),
              style: {
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#27272a",
                border: "1px solid #3f3f46",
                color: "#e4e4e7",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 8
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
              onMouseLeave: (e) => e.currentTarget.style.background = "#27272a",
              children: "📁 Buscar arquivo .PNG"
            }
          ),
          tarjaCustomPng && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTarjaCustomPng(null),
              style: {
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer"
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)",
              onMouseLeave: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)",
              children: "✕ Remover"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/png",
            style: { display: "none" },
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }
          }
        ),
        tarjaCustomPng && /* @__PURE__ */ jsx("div", { style: {
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #3f3f46",
          background: "#09090b"
        }, children: /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "Tarja PNG", style: { width: "100%", display: "block", maxHeight: 80, objectFit: "contain" } }) }),
        !tarjaCustomPng && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              border: "2px dashed #3f3f46",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#52525b",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer"
            },
            onClick: () => fileInputRef.current?.click(),
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            },
            children: "🖼 Arraste um PNG aqui ou clique para buscar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsx(SectionLabel, { children: "Escala da Tarja" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTarjaScaleLock((v) => !v),
              style: {
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.15s",
                background: tarjaScaleLock ? "rgba(236,72,153,0.12)" : "#27272a",
                border: tarjaScaleLock ? "1px solid rgba(236,72,153,0.4)" : "1px solid #3f3f46",
                color: tarjaScaleLock ? "#f472b6" : "#71717a"
              },
              children: tarjaScaleLock ? "🔒 PROPORCIONAL" : "🔓 LIVRE"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Largura X", min: 10, max: 200, value: tarjaScaleX, unit: "%", onChange: (v) => {
          setTarjaScaleX(v);
          if (tarjaScaleLock) setTarjaScaleY(v);
        } }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Altura Y", min: 10, max: 200, value: tarjaScaleY, unit: "%", onChange: (v) => {
          setTarjaScaleY(v);
          if (tarjaScaleLock) setTarjaScaleX(v);
        } })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "Posição na Tela" }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Posição X", min: 0, max: 100, value: tarjaX, unit: "%", onChange: setTarjaX }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Posição Y", min: 0, max: 100, value: tarjaY, unit: "%", onChange: setTarjaY }),
        /* @__PURE__ */ jsx("div", { style: { position: "relative", width: "100%", height: 56, background: "#09090b", borderRadius: 8, border: "1px solid #27272a", overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          left: `${tarjaX}%`,
          top: `${tarjaY}%`,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ec4899",
          border: "2px solid #fff",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 8px rgba(236,72,153,0.8)",
          transition: "all 0.05s"
        } }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e" } }),
            /* @__PURE__ */ jsx(SectionLabel, { children: "Fonte — Linha 1" })
          ] }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Tamanho", min: 6, max: 48, value: font1Size, unit: "px", onChange: setFont1Size, accentColor: "#22c55e" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. X", min: 0, max: 100, value: font1X, unit: "%", onChange: setFont1X, accentColor: "#22c55e" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. Y", min: 0, max: 100, value: font1Y, unit: "%", onChange: setFont1Y, accentColor: "#22c55e" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" } }),
            /* @__PURE__ */ jsx(SectionLabel, { children: "Fonte — Linha 2" })
          ] }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Tamanho", min: 6, max: 40, value: font2Size, unit: "px", onChange: setFont2Size, accentColor: "#3b82f6" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. X", min: 0, max: 100, value: font2X, unit: "%", onChange: setFont2X, accentColor: "#3b82f6" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. Y", min: 0, max: 100, value: font2Y, unit: "%", onChange: setFont2Y, accentColor: "#3b82f6" })
        ] })
      ] })
    ] })
  ] }) });
}
function GcPanel({
  // Opcional: receber callbacks externos
  onTake,
  onClear,
  // Props controlled: quando definidas, o painel reflete os valores externos
  externalLine1,
  externalLine2
}) {
  const [gcLine1, setGcLine1] = useState(externalLine1 || "");
  const [gcLine2, setGcLine2] = useState(externalLine2 || "");
  const [gcDuration, setGcDuration] = useState(0);
  const [gcVisible, setGcVisible] = useState(false);
  useEffect(() => {
    if (externalLine1 !== void 0) setGcLine1(externalLine1);
  }, [externalLine1]);
  useEffect(() => {
    if (externalLine2 !== void 0) setGcLine2(externalLine2);
  }, [externalLine2]);
  const [layerOpen, setLayerOpen] = useState(false);
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(80);
  const [tarjaScaleY, setTarjaScaleY] = useState(80);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(85);
  const [font1Size, setFont1Size] = useState(14);
  const [font1X, setFont1X] = useState(8);
  const [font1Y, setFont1Y] = useState(35);
  const [font2Size, setFont2Size] = useState(10);
  const [font2X, setFont2X] = useState(8);
  const [font2Y, setFont2Y] = useState(70);
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1e3);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);
  const handleTake = useCallback(() => {
    if (!gcLine1 && !gcLine2) return;
    setGcVisible(true);
    onTake?.({
      line1: gcLine1,
      line2: gcLine2,
      tarjaPng: tarjaCustomPng || null,
      tarjaX,
      tarjaY,
      tarjaScaleX,
      tarjaScaleY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    });
  }, [gcLine1, gcLine2, tarjaCustomPng, tarjaX, tarjaY, tarjaScaleX, tarjaScaleY, font1Size, font1X, font1Y, font2Size, font2X, font2Y, onTake]);
  const handleClear = useCallback(() => {
    setGcVisible(false);
    onClear?.();
  }, [onClear]);
  const handleSkip = useCallback(() => {
    setGcLine1("");
    setGcLine2("");
    setGcVisible(false);
  }, []);
  const panelStyle = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 24,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    minWidth: 320,
    maxWidth: 420,
    position: "relative"
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
    boxSizing: "border-box"
  };
  const labelStyle = {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#52525b",
    fontWeight: 700
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
    cursor: "pointer"
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
    outline: "none"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: panelStyle, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: gcVisible ? "#22c55e" : "#52525b",
          boxShadow: gcVisible ? "0 0 8px #22c55e" : "none",
          transition: "all 0.3s"
        } }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#71717a" }, children: "GC — Gerador de Caracteres" }),
        gcVisible && /* @__PURE__ */ jsx("span", { style: {
          marginLeft: "auto",
          fontSize: 8,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#22c55e",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          padding: "2px 8px",
          borderRadius: 99,
          animation: "pulse 1.5s infinite"
        }, children: "● NO AR" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "3fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Linha 1 — Nome / Título" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: gcLine1,
                onChange: (e) => setGcLine1(e.target.value),
                placeholder: "Nome / Título",
                style: inputStyle,
                onFocus: (e) => e.target.style.borderColor = "rgba(239,68,68,0.4)",
                onBlur: (e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Linha 2 — Cargo / Informação" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: gcLine2,
                onChange: (e) => setGcLine2(e.target.value),
                placeholder: "Cargo / Informação",
                style: inputStyle,
                onFocus: (e) => e.target.style.borderColor = "rgba(239,68,68,0.4)",
                onBlur: (e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Duração:" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: gcDuration,
                onChange: (e) => setGcDuration(Number(e.target.value)),
                style: selectStyle,
                children: [
                  /* @__PURE__ */ jsx("option", { value: 0, children: "Manual" }),
                  /* @__PURE__ */ jsx("option", { value: 3, children: "3s" }),
                  /* @__PURE__ */ jsx("option", { value: 5, children: "5s" }),
                  /* @__PURE__ */ jsx("option", { value: 10, children: "10s" }),
                  /* @__PURE__ */ jsx("option", { value: 15, children: "15s" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          position: "relative",
          background: "#09090b",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }, children: [
          /* @__PURE__ */ jsx("span", { style: { position: "absolute", fontSize: 7, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.1em", top: 4, left: 0, right: 0, textAlign: "center" }, children: "GC LIVE PREV" }),
          gcLine1 || gcLine2 ? /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            bottom: 4,
            left: 4,
            right: 4
          }, children: tarjaCustomPng ? /* @__PURE__ */ jsxs("div", { style: { position: "relative", lineHeight: 0 }, children: [
            /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "tarja", style: { width: "100%", borderRadius: 2 } }),
            gcLine1 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font1X}%`,
              top: `${font1Y}%`,
              fontSize: Math.max(4, font1Size * 0.35),
              fontWeight: 900,
              color: "#fff",
              whiteSpace: "nowrap",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)"
            }, children: gcLine1 }),
            gcLine2 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font2X}%`,
              top: `${font2Y}%`,
              fontSize: Math.max(3, font2Size * 0.35),
              color: "#d4d4d8",
              whiteSpace: "nowrap",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)"
            }, children: gcLine2 })
          ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "stretch", borderRadius: 2, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 2, background: "#dc2626", flexShrink: 0 } }),
            /* @__PURE__ */ jsxs("div", { style: { background: "rgba(0,0,0,0.88)", padding: "3px 5px", flex: 1, minWidth: 0 }, children: [
              gcLine1 && /* @__PURE__ */ jsx("div", { style: { color: "#fff", fontWeight: 900, fontSize: 7, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.3 }, children: gcLine1 }),
              gcLine2 && /* @__PURE__ */ jsx("div", { style: { color: "#a1a1aa", fontSize: 6, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.3 }, children: gcLine2 })
            ] })
          ] }) }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleTake,
            style: {
              ...btnBase,
              background: "#16a34a",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(22,163,74,0.35)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#15803d";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#16a34a";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "GC TAKE"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleClear,
            style: {
              ...btnBase,
              background: "#dc2626",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(220,38,38,0.3)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "GC CLEAR"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSkip,
            style: {
              ...btnBase,
              background: "#3f3f46",
              color: "#d4d4d8"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#52525b";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#3f3f46";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "PULAR"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { borderTop: "1px solid #27272a", paddingTop: 16 }, children: [
        /* @__PURE__ */ jsx("div", { style: { marginBottom: 10 }, children: /* @__PURE__ */ jsx("span", { style: {
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#52525b"
        }, children: "⚙️ Ajustes & Efeitos" }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setLayerOpen(true),
            style: {
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
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#3f3f46";
              e.currentTarget.style.borderColor = "#52525b";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = layerOpen ? "#3f3f46" : "#27272a";
              e.currentTarget.style.borderColor = "#3f3f46";
            },
            children: [
              /* @__PURE__ */ jsx("span", { children: "🎞" }),
              "LAYER — Config Tarja",
              tarjaCustomPng && /* @__PURE__ */ jsx("span", { style: {
                marginLeft: "auto",
                fontSize: 8,
                fontWeight: 900,
                background: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.4)",
                color: "#f472b6",
                padding: "2px 8px",
                borderRadius: 99,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }, children: "PNG ativo" })
            ]
          }
        )
      ] }),
      gcVisible && /* @__PURE__ */ jsxs("div", { style: {
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 12,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "gcPulse 1s infinite" } }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }, children: [
          "GC Ativo — ",
          gcLine1,
          gcLine2 ? ` | ${gcLine2}` : ""
        ] }),
        gcDuration > 0 && /* @__PURE__ */ jsxs("span", { style: { marginLeft: "auto", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }, children: [
          gcDuration,
          "s"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ConfigTarjaModal,
      {
        open: layerOpen,
        onClose: () => setLayerOpen(false),
        tarjaCustomPng,
        setTarjaCustomPng,
        tarjaScaleX,
        setTarjaScaleX,
        tarjaScaleY,
        setTarjaScaleY,
        tarjaScaleLock,
        setTarjaScaleLock,
        tarjaX,
        setTarjaX,
        tarjaY,
        setTarjaY,
        font1Size,
        setFont1Size,
        font1X,
        setFont1X,
        font1Y,
        setFont1Y,
        font2Size,
        setFont2Size,
        font2X,
        setFont2X,
        font2Y,
        setFont2Y,
        gcLine1,
        gcLine2
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes gcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      ` })
  ] });
}
function calcularDuracaoEstimada(texto) {
  if (!texto) return 0;
  const palavras = texto.trim().split(/\s+/).length;
  return Math.ceil(palavras / 2.5);
}
function formatarTimecode(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}
function normalizarTag(linha) {
  const m = linha.match(/^\[(.+)\]$/);
  if (!m) return null;
  return m[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}
function parsarSonorasEPassagens(estrutura) {
  const sonoras = [];
  const passagens = [];
  const itensLauda = [];
  let producao = null;
  let ordem = 0;
  if (!estrutura) {
    console.log("⚠️ Estrutura vazia");
    return {
      sonoras,
      passagens,
      producao,
      itensLauda
    };
  }
  console.log("📖 Parseando estrutura com NOVO FORMATO:", estrutura);
  const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    const tag = normalizarTag(linha);
    if (tag === "SONORA") {
      console.log("🎤 Encontrado [SONORA] (tag raw:", linha, "→", tag, ")");
      let nome = "";
      let funcao = "";
      let texto = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          if (i + 1 < linhas.length) {
            const funcaoLinha = linhas[i + 1];
            const funcaoMatch = funcaoLinha.match(/^\(([^)]+)\)$/);
            if (funcaoMatch) {
              funcao = funcaoMatch[1].trim();
              i++;
            }
          }
        }
      }
      let timecodeManual = void 0;
      if (i + 1 < linhas.length) {
        const tcLinha = linhas[i + 1];
        const tcMatch = tcLinha.match(/^\((\d{1,2}):(\d{2})\)$/);
        if (tcMatch) {
          timecodeManual = parseInt(tcMatch[1]) * 60 + parseInt(tcMatch[2]);
          i++;
          console.log(`⏱️ Timecode manual encontrado: ${timecodeManual}s`);
        }
      }
      while (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        if (normalizarTag(proximaLinha) !== null) {
          break;
        }
        const textoMatch = proximaLinha.match(/^"(.+)"$/);
        if (textoMatch) {
          texto += (texto ? " " : "") + textoMatch[1];
          i++;
        } else {
          break;
        }
      }
      if (nome) {
        const duracaoEstimada = calcularDuracaoEstimada(texto);
        sonoras.push({
          nome,
          funcao,
          texto,
          duracaoEstimada,
          timecodeInicio: timecodeManual
        });
        itensLauda.push({
          tipo: "SONORA",
          nome: "SONORA",
          valor: `${nome} - ${funcao}`,
          ordem: ordem++
        });
        console.log("✅ Sonora adicionada:", {
          nome,
          funcao,
          duracao: duracaoEstimada + "s",
          timecode: timecodeManual !== void 0 ? timecodeManual + "s" : "automático"
        });
      }
    }
    if (tag === "PASSAGEM") {
      console.log("🎥 Encontrado [PASSAGEM] (raw:", linha, "→", tag, ")");
      let nome = "";
      let local = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          if (i + 1 < linhas.length) {
            const localLinha = linhas[i + 1];
            const localMatch = localLinha.match(/^\(([^)]+)\)$/);
            if (localMatch) {
              local = localMatch[1].trim();
              i++;
            }
          }
        }
      }
      if (nome) {
        passagens.push({
          nome,
          local
        });
        itensLauda.push({
          tipo: "PASSAGEM",
          nome: "PASSAGEM",
          valor: `${nome} - ${local}`,
          ordem: ordem++
        });
        console.log("✅ Passagem adicionada:", {
          nome,
          local
        });
      }
    }
    if (tag === "IMAGENS") {
      console.log("🎞️ Encontrado [IMAGENS] (raw:", linha, "→", tag, ")");
      let cinegrafista = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          cinegrafista = nomeMatch[1].trim();
          i++;
        }
      }
      itensLauda.push({
        tipo: "IMAGENS",
        nome: "IMAGENS",
        valor: cinegrafista,
        ordem: ordem++
      });
      console.log("✅ Imagens adicionado:", cinegrafista);
    }
    if (tag === "PRODUCAO") {
      console.log("🎬 Encontrado [PRODUÇÃO] (raw:", linha, "→", tag, ")");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          producao = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "PRODUÇÃO",
            nome: "PRODUÇÃO",
            valor: producao,
            ordem: ordem++
          });
          console.log("✅ Produção adicionada:", producao);
        }
      }
    }
    if (tag === "EDTEXTO") {
      console.log("📝 Encontrado [ED. TEXTO] (raw:", linha, "→", tag, ")");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edTexto = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "ED_TEXTO",
            nome: "ED_TEXTO",
            valor: edTexto,
            ordem: ordem++
          });
          console.log("✅ Ed. Texto adicionado:", edTexto);
        }
      }
    }
    if (tag === "EDIMAGEM" || tag === "EDIMAGENS") {
      console.log("🖼️ Encontrado [ED. IMAGEM] (raw:", linha, "→", tag, ")");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edImagem = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "ED_IMAGEM",
            nome: "ED_IMAGEM",
            valor: edImagem,
            ordem: ordem++
          });
          console.log("✅ Ed. Imagens adicionado:", edImagem);
        }
      }
    }
    i++;
  }
  console.log("📋 Total de sonoras parseadas:", sonoras.length);
  console.log("📋 Total de passagens parseadas:", passagens.length);
  console.log("📋 Total de itens da lauda:", itensLauda.length);
  console.log("📊 Resultado final:", {
    sonoras,
    passagens,
    producao,
    itensLauda
  });
  return {
    sonoras,
    passagens,
    producao,
    itensLauda
  };
}
async function calcularTimecodesViaIA(estrutura, itensLauda, duracaoRealVT, sonorasManuais) {
  const creditosParaCalcuar = itensLauda.filter((it) => ["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo));
  if (!creditosParaCalcuar.length) return [];
  creditosParaCalcuar.filter((it) => it.tipo === "SONORA").every((it) => {
    const sepIdx = it.valor?.indexOf(" - ") ?? -1;
    const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
    return sonorasManuais.some((s) => s.nome.trim().toUpperCase() === nome.toUpperCase() && s.timecodeInicio !== void 0);
  });
  const creditosDescricao = creditosParaCalcuar.map((it, idx) => {
    const sepIdx = it.valor?.indexOf(" - ") ?? -1;
    const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
    const complemento = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
    const manualSonora = it.tipo === "SONORA" ? sonorasManuais.find((s) => s.nome.trim().toUpperCase() === nome.toUpperCase()) : void 0;
    const tcManual = manualSonora?.timecodeInicio !== void 0 ? `timecode_manual=${manualSonora.timecodeInicio}s` : "sem_timecode_manual";
    return `${idx + 1}. tipo=${it.tipo} nome="${nome}" complemento="${complemento}" ${tcManual}`;
  }).join("\n");
  const prompt = `Você é um assistente de playout de telejornalismo. Analise a lauda abaixo e calcule o timecode exato (em segundos) em que cada crédito deve aparecer na tela durante a exibição do VT.

DURAÇÃO TOTAL DO VT: ${duracaoRealVT} segundos

LAUDA COMPLETA:
${estrutura}

CRÉDITOS QUE PRECISAM DE TIMECODE:
${creditosDescricao}

REGRAS PARA CALCULAR:
- Velocidade de locução em português brasileiro: ~150 palavras por minuto (2,5 palavras/segundo)
- Cada SONORA começa quando o texto antes dela termina de ser lido
- A duração de uma SONORA é estimada pelo número de palavras entre aspas (mesma taxa 2,5 p/s), mínimo 4s
- PASSAGEM: aparece quando o repórter entra em cena (após o off anterior terminar)
- ED_TEXTO e ED_IMAGEM: aparecem nos últimos 20% do VT, respeitando a ordem
- REPÓRTER: aparece nos primeiros 3 segundos do VT
- Se houver timecode_manual, USE EXATAMENTE esse valor para o início
- Todos os timecodes devem estar entre 1 e ${duracaoRealVT - 1} segundos
- Distribua os créditos de forma que não se sobreponham (respeite duracao + 1s de gap)

Responda APENAS com JSON válido, sem markdown, neste formato exato:
{
  "timecodes": [
    {"index": 1, "inicio": 12, "duracao": 8},
    {"index": 2, "inicio": 35, "duracao": 5}
  ]
}`;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1e3,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.content?.map((b) => b.type === "text" ? b.text : "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("🤖 Timecodes calculados pela IA:", parsed.timecodes);
    const timeline = [];
    creditosParaCalcuar.forEach((it, idx) => {
      const tc = parsed.timecodes.find((t) => t.index === idx + 1);
      if (!tc) return;
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const complemento = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      let line1 = "";
      let line2 = "";
      if (it.tipo === "SONORA") {
        line1 = nome;
        line2 = complemento;
      } else if (it.tipo === "PASSAGEM") {
        line1 = nome;
        line2 = "REPÓRTER" + (complemento ? ` — ${complemento}` : "");
      } else if (it.tipo === "ED_TEXTO") {
        line1 = it.valor || "";
        line2 = "ED. TEXTO";
      } else if (it.tipo === "ED_IMAGEM") {
        line1 = it.valor || "";
        line2 = "ED. IMAGEM";
      } else if (it.tipo === "REPÓRTER") {
        line1 = it.valor || "";
        line2 = "REPÓRTER";
      }
      if (line1) {
        timeline.push({
          line1,
          line2,
          inicio: Math.max(1, Math.min(tc.inicio, duracaoRealVT - 1)),
          duracao: Math.max(3, tc.duracao)
        });
      }
    });
    return timeline.sort((a, b) => a.inicio - b.inicio);
  } catch (err) {
    console.error("⚠️ Erro na API de timecodes — fallback para contagem de palavras:", err);
    return construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais);
  }
}
function construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais) {
  if (!itensLauda.length || !duracaoRealVT) return [];
  const totalPalavras = itensLauda.reduce((acc, it) => acc + (it.valor ? it.valor.split(/\s+/).length : 0), 0);
  let palavrasAcumuladas = 0;
  const timeline = [];
  itensLauda.forEach((it) => {
    const palavrasItem = it.valor ? it.valor.split(/\s+/).length : 0;
    const posicaoAntes = totalPalavras > 0 ? palavrasAcumuladas / totalPalavras : 0;
    palavrasAcumuladas += palavrasItem;
    if (!["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo)) return;
    let inicio = Math.min(Math.round(posicaoAntes * duracaoRealVT), Math.max(0, duracaoRealVT - 1));
    let duracao = 4;
    let line1 = "";
    let line2 = "";
    if (it.tipo === "SONORA") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      line2 = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      const normLine1 = line1.toUpperCase().trim();
      const manual = sonorasManuais.find((s) => s.nome.trim().toUpperCase() === normLine1);
      if (manual?.timecodeInicio !== void 0) inicio = manual.timecodeInicio;
      if (manual?.duracaoEstimada) duracao = manual.duracaoEstimada;
    } else if (it.tipo === "PASSAGEM") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const local = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      line2 = "REPÓRTER" + (local ? ` — ${local}` : "");
    } else if (it.tipo === "ED_TEXTO") {
      line1 = it.valor || "";
      line2 = "ED. TEXTO";
    } else if (it.tipo === "ED_IMAGEM") {
      line1 = it.valor || "";
      line2 = "ED. IMAGEM";
    } else if (it.tipo === "REPÓRTER") {
      line1 = it.valor || "";
      line2 = "REPÓRTER";
    }
    if (line1) timeline.push({
      line1,
      line2,
      inicio,
      duracao
    });
  });
  return timeline.sort((a, b) => a.inicio - b.inicio);
}
async function detectCodec(file) {
  try {
    const buffer = await file.slice(0, 512).arrayBuffer();
    const text = String.fromCharCode(...new Uint8Array(buffer));
    if (text.includes("avc1") || text.includes("avc3") || text.includes("h264")) return "H.264";
    if (text.includes("hvc1") || text.includes("hev1") || text.includes("hevc")) return "H.265/HEVC";
    if (text.includes("av01")) return "AV1";
    const blobUrl = URL.createObjectURL(file);
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.src = blobUrl;
      const t = setTimeout(() => {
        v.src = "";
        v.load();
        resolve("Outro");
      }, 3e3);
      v.onloadedmetadata = () => {
        clearTimeout(t);
        v.src = "";
        v.load();
        resolve("H.264");
      };
      v.onerror = () => {
        clearTimeout(t);
        URL.revokeObjectURL(blobUrl);
        v.src = "";
        resolve("Erro");
      };
    });
  } catch {
    return "Erro";
  }
}
function getVideoDuration(blobUrl) {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = blobUrl;
    const t = setTimeout(() => {
      v.src = "";
      resolve(null);
    }, 4e3);
    v.onloadedmetadata = () => {
      clearTimeout(t);
      const d = isFinite(v.duration) ? v.duration : null;
      v.src = "";
      resolve(d);
    };
    v.onerror = () => {
      clearTimeout(t);
      v.src = "";
      resolve(null);
    };
  });
}
function formatDuration(secs) {
  if (secs === null || isNaN(secs) || !isFinite(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
function buildCamEmbedUrl(rawUrl, opts = {
  mute: true
}) {
  const ytId = extractYoutubeId(rawUrl);
  if (ytId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: opts.mute ? "1" : "0",
      rel: "0",
      playsinline: "1"
    });
    if (opts.enableApi) {
      params.set("enablejsapi", "1");
      if (typeof window !== "undefined") params.set("origin", window.location.origin);
    }
    return {
      url: `https://www.youtube.com/embed/${ytId}?${params.toString()}`,
      isYoutube: true
    };
  }
  return {
    url: rawUrl,
    isYoutube: false
  };
}
function PlayoutPage() {
  const {
    date,
    programa
  } = Route.useSearch();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [globalItemIndex, setGlobalItemIndex] = useState({});
  const [fileStatus, setFileStatus] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [dirHandle, setDirHandle] = useState(null);
  const [isDirReady, setIsDirReady] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [isScanningFiles, setIsScanningFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pgmFile, setPgmFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgmProgress, setPgmProgress] = useState(0);
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(false);
  const [multiviewActive, setMultiviewActive] = useState(false);
  const [activeCam, setActiveCam] = useState(null);
  const [camSources, setCamSources] = useState([null, null, null, null]);
  const [camSourceTypes, setCamSourceTypes] = useState([null, null, null, null]);
  const [isCamPreview, setIsCamPreview] = useState(false);
  const [previewCamIdx, setPreviewCamIdx] = useState(null);
  const [pgmCamUrl, setPgmCamUrl] = useState(null);
  const [pgmCamVolume, setPgmCamVolume] = useState(100);
  const [pgmCamMuted, setPgmCamMuted] = useState(false);
  const [pgmCamIsYoutube, setPgmCamIsYoutube] = useState(false);
  const [materiaAtual, setMateriaAtual] = useState(null);
  const sonorasMapRef = useRef(/* @__PURE__ */ new Map());
  const sonorasDisparadosRef = useRef(/* @__PURE__ */ new Set());
  const [sonorasTimeline, setSonorasTimeline] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [gcVisible, setGcVisible] = useState(false);
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");
  const [gcCreditsQueue, setGcCreditsQueue] = useState([]);
  const [gcDuration, setGcDuration] = useState(0);
  const [gcHistory, setGcHistory] = useState([]);
  const [gcPresets, setGcPresets] = useState({
    "Repórter em Campo": {
      line1: "",
      line2: "Repórter em Campo"
    },
    "Âncora": {
      line1: "",
      line2: "Âncora"
    },
    "Especialista": {
      line1: "",
      line2: "Especialista"
    }
  });
  const [gcPanelOpen, setGcPanelOpen] = useState(false);
  const {
    extractCredits
  } = useAutoCredits({
    apiKey: "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7",
    autoPopulate: true,
    deduplicate: true
  });
  const [tarjaVisible, setTarjaVisible] = useState(false);
  const [legendasAtivas, setLegendasAtivas] = useState(false);
  const [legendaTexto, setLegendaTexto] = useState("");
  const [legendaFinal, setLegendaFinal] = useState("");
  useRef(null);
  const whisperMediaRecorderRef = useRef(null);
  const whisperStreamDestRef = useRef(null);
  const whisperIsRunningRef = useRef(false);
  const legendaTimeoutRef = useRef(null);
  const [ccSegmentos, setCcSegmentos] = useState([]);
  const [ccTextoAtual, setCcTextoAtual] = useState("");
  const [tarjaPanelOpen, setTarjaPanelOpen] = useState(false);
  const [tarjaHue, setTarjaHue] = useState(0);
  const [tarjaSaturation, setTarjaSaturation] = useState(100);
  const [tarjaAlpha, setTarjaAlpha] = useState(90);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(85);
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(100);
  const [tarjaScaleY, setTarjaScaleY] = useState(100);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaText, setTarjaText] = useState("TARJA");
  const [tarjaFont, setTarjaFont] = useState("sans-serif");
  const [tarjaBold, setTarjaBold] = useState(true);
  const [tarjaItalic, setTarjaItalic] = useState(false);
  const [tarjaPanelPos, setTarjaPanelPos] = useState({
    x: 200,
    y: 200
  });
  const tarjaDragRef = useRef(null);
  const tarjaFileInputRef = useRef(null);
  const [meFrames, setMeFrames] = useState([null, null, null, null]);
  const [meActiveFrame, setMeActiveFrame] = useState(null);
  const meFileInputRefs = useRef([null, null, null, null]);
  const handleMeFrameLoad = (id, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMeFrames((prev) => {
        const next = [...prev];
        next[id] = reader.result;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };
  const handleMeFrameClick = (id) => {
    if (!meFrames[id]) {
      meFileInputRefs.current[id]?.click();
      return;
    }
    setMeActiveFrame((prev) => {
      const next = prev === id ? null : id;
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({
          type: next !== null ? "me_frame_show" : "me_frame_hide",
          frame: next !== null ? meFrames[id] : null
        }));
      }
      return next;
    });
  };
  const handleMeFrameClear = (id, e) => {
    e.stopPropagation();
    setMeFrames((prev) => {
      const next = [...prev];
      next[id] = null;
      return next;
    });
    if (meActiveFrame === id) {
      setMeActiveFrame(null);
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({
          type: "me_frame_hide"
        }));
      }
    }
  };
  const vuLevelLRef = useRef(0);
  const vuLevelRRef = useRef(0);
  const vuCanvasRef = useRef(null);
  const vuAudioCtxRef = useRef(null);
  const vuSplitterRef = useRef(null);
  const vuAnalyserLRef = useRef(null);
  const vuAnalyserRRef = useRef(null);
  const vuRafRef = useRef(null);
  const vuStreamDestRef = useRef(null);
  const [blockRemainingTime, setBlockRemainingTime] = useState(0);
  const [generalJournalTime, setGeneralJournalTime] = useState(0);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [transValue, setTransValue] = useState(0);
  const [playerAOpacity, setPlayerAOpacity] = useState(1);
  const [playerBOpacity, setPlayerBOpacity] = useState(0);
  const [playerAZ, setPlayerAZ] = useState(10);
  const [playerBZ, setPlayerBZ] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [removedLaudaOrdens, setRemovedLaudaOrdens] = useState({});
  const handleItemFinished = useCallback(() => {
    setIsPlaying(false);
    setPgmProgress(100);
    setTimeout(() => {
      setItems((prev) => {
        const finishedIndex = currentIndex - 1;
        if (finishedIndex >= 0 && prev[finishedIndex]) {
          const itemToRemove = prev[finishedIndex];
          const newList = prev.filter((_, idx) => idx !== finishedIndex);
          const newIndex = Math.max(0, currentIndex - 1);
          setCurrentIndex(newIndex);
          setCurrentItemId(newList[newIndex]?.id ?? null);
          toast.success(`"${itemToRemove.assunto}" exibido e removido.`);
          return newList;
        }
        return prev;
      });
    }, 500);
  }, [items, currentIndex]);
  const pgmRemainingTime = pgmFile?.duration ? Math.max(0, pgmFile.duration - pgmCurrentTime) : 0;
  const [activePlayer, setActivePlayer] = useState("A");
  const [clock, setClock] = useState("--:--:--");
  const pvwRef = useRef(null);
  const camVideoRefs = useRef([null, null, null, null]);
  const pgmARef = useRef(null);
  const pgmBRef = useRef(null);
  const pgmCamIframeRef = useRef(null);
  const blobUrlsRef = useRef(/* @__PURE__ */ new Map());
  const WS_URL = "ws://localhost:4242";
  const pgmChannelRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressTimeRef = useRef(null);
  useRef(null);
  const laudaSnapshotRef = useRef([]);
  const sonorasSnapshotRef = useRef([]);
  const estruturaSnapshotRef = useRef("");
  const timelineJsonRef = useRef(null);
  useEffect(() => {
    if (!materiaAtual?.materia_id || !pgmFile?.duration) {
      sonorasMapRef.current.clear();
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline([]);
      timelineJsonRef.current = null;
      return;
    }
    laudaSnapshotRef.current = materiaAtual.itensLauda;
    sonorasSnapshotRef.current = materiaAtual.sonoras || [];
    estruturaSnapshotRef.current = materiaAtual._estrutura || "";
    if (timelineJsonRef.current && timelineJsonRef.current.length > 0) {
      const map = /* @__PURE__ */ new Map();
      const timeline = [];
      timelineJsonRef.current.forEach((c) => {
        const funcao = c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM");
        const key = `${c.valor}|${funcao}`;
        map.set(key, {
          inicio: c.timecode,
          duracao: c.duracao ?? 5
        });
        timeline.push({
          nome: c.valor,
          funcao,
          timecodeInicio: c.timecode,
          duracao: c.duracao ?? 5
        });
      });
      sonorasMapRef.current = map;
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
      console.log(`⏱️ useEffect: ${timeline.length} timecode(s) do timeline_json aplicados (VT=${pgmFile.duration}s)`);
      return;
    }
    const aplicarTimeline = (creditosTimeline, resetDisparados = true) => {
      const map = /* @__PURE__ */ new Map();
      const timeline = [];
      creditosTimeline.forEach((cred) => {
        const key = `${cred.line1}|${cred.line2}`;
        map.set(key, {
          inicio: cred.inicio,
          duracao: cred.duracao
        });
        timeline.push({
          nome: cred.line1,
          funcao: cred.line2,
          timecodeInicio: cred.inicio,
          duracao: cred.duracao
        });
        console.log(`⏱️ CRÉDITO (VT=${pgmFile.duration}s): ${cred.line1} → ${cred.inicio}s por ${cred.duracao}s`);
      });
      sonorasMapRef.current = map;
      if (resetDisparados) sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
    };
    const fallback = construirTimelineFallback(laudaSnapshotRef.current, pgmFile.duration, sonorasSnapshotRef.current);
    aplicarTimeline(fallback);
    if (estruturaSnapshotRef.current) {
      console.log("🤖 Calculando timecodes via IA...");
      calcularTimecodesViaIA(estruturaSnapshotRef.current, laudaSnapshotRef.current, pgmFile.duration, sonorasSnapshotRef.current).then((creditosIA) => {
        if (creditosIA.length > 0) {
          console.log("✅ Timecodes da IA aplicados:", creditosIA);
          aplicarTimeline(creditosIA, false);
          toast.success(`⏱ ${creditosIA.length} timecode(s) calculado(s) pela IA`, {
            duration: 2500
          });
        }
      }).catch((err) => {
        console.warn("⚠️ IA de timecodes falhou, mantendo fallback:", err);
      });
    }
  }, [materiaAtual?.materia_id, pgmFile?.duration]);
  useEffect(() => {
    if (!isPlaying || sonorasTimeline.length === 0) return;
    sonorasMapRef.current.forEach((timing, sonoraKey) => {
      if (sonorasDisparadosRef.current.has(sonoraKey)) return;
      if (pgmCurrentTime >= timing.inicio) {
        const pipeIdx = sonoraKey.indexOf("|");
        const nome = pipeIdx >= 0 ? sonoraKey.slice(0, pipeIdx) : sonoraKey;
        const funcao = pipeIdx >= 0 ? sonoraKey.slice(pipeIdx + 1) : "";
        console.log(`🎤 AUTO-CRÉDITO: ${nome} (${funcao}) | previsto=${timing.inicio}s | real=${pgmCurrentTime.toFixed(2)}s`);
        sonorasDisparadosRef.current.add(sonoraKey);
        handleGcTake(nome.trim(), funcao.trim(), timing.duracao);
      }
    });
  }, [pgmCurrentTime, isPlaying]);
  useEffect(() => {
    if (!isPlaying) {
      sonorasDisparadosRef.current.clear();
    }
  }, [isPlaying]);
  useEffect(() => {
    const t = setInterval(() => setClock((/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", {
      hour12: false
    })), 1e3);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const el = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!el) return;
    let ctx = vuAudioCtxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      vuAudioCtxRef.current = ctx;
    }
    let splitter = vuSplitterRef.current;
    let analyserL = vuAnalyserLRef.current;
    let analyserR = vuAnalyserRRef.current;
    if (!splitter || !analyserL || !analyserR) {
      splitter = ctx.createChannelSplitter(2);
      analyserL = ctx.createAnalyser();
      analyserR = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserR.fftSize = 256;
      splitter.connect(analyserL, 0);
      splitter.connect(analyserR, 1);
      vuSplitterRef.current = splitter;
      vuAnalyserLRef.current = analyserL;
      vuAnalyserRRef.current = analyserR;
    }
    if (!vuStreamDestRef.current) {
      vuStreamDestRef.current = ctx.createMediaStreamDestination();
    }
    const sharedDest = vuStreamDestRef.current;
    try {
      const source = ctx.createMediaElementSource(el);
      source.connect(splitter);
      source.connect(ctx.destination);
      source.connect(sharedDest);
    } catch {
    }
    const dataL = new Uint8Array(analyserL.frequencyBinCount);
    const dataR = new Uint8Array(analyserR.frequencyBinCount);
    const tick = () => {
      analyserL.getByteFrequencyData(dataL);
      analyserR.getByteFrequencyData(dataR);
      const avgL = dataL.reduce((a, b) => a + b, 0) / dataL.length;
      const avgR = dataR.reduce((a, b) => a + b, 0) / dataR.length;
      vuLevelLRef.current = Math.min(100, Math.round(avgL / 255 * 100));
      vuLevelRRef.current = Math.min(100, Math.round(avgR / 255 * 100));
      const canvas = vuCanvasRef.current;
      if (canvas) {
        const ctx2d = canvas.getContext("2d");
        if (ctx2d) {
          const W = canvas.width, H = canvas.height;
          const rowH = Math.floor(H / 2) - 2;
          const BARS = 50;
          const barW = Math.floor((W - (BARS - 1)) / BARS);
          ctx2d.clearRect(0, 0, W, H);
          [vuLevelLRef.current, vuLevelRRef.current].forEach((level, row) => {
            const yOff = row * (rowH + 4);
            const active = Math.round(level / 100 * BARS);
            for (let i = 0; i < BARS; i++) {
              const x = i * (barW + 1);
              ctx2d.fillStyle = i < active ? i < 35 ? "#22c55e" : i < 45 ? "#eab308" : "#ef4444" : "rgba(255,255,255,0.08)";
              ctx2d.fillRect(x, yOff, barW, rowH);
            }
          });
        }
      }
      vuRafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (vuRafRef.current) cancelAnimationFrame(vuRafRef.current);
    };
  }, [activePlayer, pgmFile]);
  const sendPgmCamCommand = useCallback((func, args = []) => {
    const win = pgmCamIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({
      event: "command",
      func,
      args
    }), "*");
  }, []);
  useEffect(() => {
    if (!pgmCamUrl || !pgmCamIsYoutube) return;
    const t = setTimeout(() => {
      sendPgmCamCommand(pgmCamMuted ? "mute" : "unMute");
      sendPgmCamCommand("setVolume", [pgmCamVolume]);
    }, 350);
    return () => clearTimeout(t);
  }, [pgmCamUrl, pgmCamIsYoutube, pgmCamVolume, pgmCamMuted, sendPgmCamCommand]);
  const handleCamOffAir = useCallback(() => {
    if (!pgmCamUrl) return;
    sendPgmCamCommand("stopVideo");
    setPgmCamUrl(null);
    setPgmCamIsYoutube(false);
    setPgmCamMuted(false);
    setPgmCamVolume(100);
    setPgmFile(null);
    setIsPlaying(false);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
      type: "cam_off"
    }));
    toast.info("CAM retirada do ar — vídeo e áudio encerrados");
  }, [pgmCamUrl, sendPgmCamCommand]);
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      pgmChannelRef.current = ws;
      ws.onopen = () => console.log("[WS] Conectado ao relay server");
      ws.onclose = () => {
        console.warn("[WS] Desconectado. Tentando reconectar em 3s...");
        setTimeout(connect, 3e3);
      };
      ws.onerror = (err) => console.error("[WS] Erro:", err);
    };
    connect();
    return () => {
      pgmChannelRef.current?.close();
    };
  }, []);
  useCallback((overrides = {}) => {
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
      type: "pgm_state",
      ...overrides
    }));
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
      if (!activeEl || !activeEl.src) return;
      if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
        type: "pgm_sync",
        currentTime: activeEl.currentTime
      }));
    }, 2e3);
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer]);
  useEffect(() => () => {
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
  }, []);
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1e3);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);
  useEffect(() => {
    const estrutura = estruturaSnapshotRef.current || materiaAtual?._estrutura || "";
    const duracao = pgmFile?.duration;
    if (!estrutura || !duracao) {
      setCcSegmentos([]);
      setCcTextoAtual("");
      return;
    }
    const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);
    const blocos = [];
    let i = 0;
    while (i < linhas.length) {
      const linha = linhas[i];
      if (/^\[SONORA\]/i.test(linha) || /^\[SONORA\]/.test(linha.toUpperCase())) {
        let nomeSonora = "";
        let textoSonora = "";
        i++;
        while (i < linhas.length && !/^\[/.test(linhas[i])) {
          if (/^\(.+\)$/.test(linhas[i])) {
            if (!nomeSonora) nomeSonora = linhas[i].slice(1, -1);
          } else if (/^".+"$/.test(linhas[i])) {
            textoSonora += (textoSonora ? " " : "") + linhas[i].slice(1, -1);
          }
          i++;
        }
        if (textoSonora) blocos.push({
          tipo: "SONORA",
          texto: textoSonora,
          nomeSonora
        });
        continue;
      }
      if (/^\[.+\]$/.test(linha) || /^\(.+\)$/.test(linha)) {
        i++;
        continue;
      }
      if (linha.length > 3) blocos.push({
        tipo: "OFF",
        texto: linha
      });
      i++;
    }
    const PALAVRAS_POR_SEG = 2.5;
    const MAX_PALAVRAS = 7;
    const blocosDuracao = blocos.map((b) => {
      const palavras = b.texto.split(/\s+/).length;
      return Math.max(1, palavras / PALAVRAS_POR_SEG);
    });
    const totalEstimado = blocosDuracao.reduce((a, b) => a + b, 0);
    const escala = duracao / Math.max(totalEstimado, 1);
    const segmentos = [];
    let cursor = 0;
    blocos.forEach((bloco, idx) => {
      const duracaoBloco = blocosDuracao[idx] * escala;
      const palavras = bloco.texto.split(/\s+/).filter(Boolean);
      const totalPalavrasBloco = palavras.length;
      for (let w = 0; w < palavras.length; w += MAX_PALAVRAS) {
        const chunk = palavras.slice(w, w + MAX_PALAVRAS).join(" ");
        const posInicio = cursor + w / totalPalavrasBloco * duracaoBloco;
        const posFim = cursor + (w + MAX_PALAVRAS) / totalPalavrasBloco * duracaoBloco;
        segmentos.push({
          texto: chunk,
          inicio: Math.round(posInicio * 10) / 10,
          fim: Math.min(Math.round(posFim * 10) / 10, duracao)
        });
      }
      cursor += duracaoBloco;
    });
    setCcSegmentos(segmentos);
    setCcTextoAtual("");
    console.log(`[CC] ${segmentos.length} segmentos · escala=${escala.toFixed(2)}x · ${duracao}s`);
  }, [materiaAtual?.materia_id, pgmFile?.duration]);
  useEffect(() => {
    if (!legendasAtivas || !isPlaying || !ccSegmentos.length) return;
    let atual;
    for (const s of ccSegmentos) {
      if (pgmCurrentTime >= s.inicio) atual = s;
      else break;
    }
    const texto = atual?.texto ?? "";
    setCcTextoAtual((prev) => prev !== texto ? texto : prev);
  }, [pgmCurrentTime, legendasAtivas, isPlaying, ccSegmentos]);
  useEffect(() => {
    if (!legendasAtivas || !isPlaying) setCcTextoAtual("");
  }, [legendasAtivas, isPlaying]);
  useEffect(() => {
    if (!legendasAtivas) {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try {
          whisperMediaRecorderRef.current.stop();
        } catch {
        }
      }
      whisperMediaRecorderRef.current = null;
      whisperStreamDestRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
      return;
    }
    const groqKey = "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7";
    const videoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!videoEl) {
      console.warn("[CC] Nenhum elemento de vídeo disponível");
      return;
    }
    let mediaStream;
    try {
      mediaStream = videoEl.captureStream ? videoEl.captureStream() : videoEl.mozCaptureStream?.();
      if (!mediaStream) throw new Error("captureStream não suportado");
    } catch (e) {
      console.warn("[CC] captureStream falhou:", e);
      toast.error("CC: browser não suporta captureStream");
      return;
    }
    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("[CC] Nenhuma track de áudio no stream — vídeo está tocando?");
      toast.error("CC: sem áudio no VT (está tocando?)");
      return;
    }
    const audioOnlyStream = new MediaStream(audioTracks);
    whisperIsRunningRef.current = true;
    console.log("[CC] captureStream OK —", audioTracks.length, "track(s) de áudio");
    const CHUNK_MS = 5e3;
    const recordChunk = () => {
      if (!whisperIsRunningRef.current) return;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";
      let recorder;
      try {
        recorder = new MediaRecorder(audioOnlyStream, {
          mimeType
        });
      } catch (e) {
        console.warn("[CC] MediaRecorder falhou:", e);
        return;
      }
      whisperMediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        if (!whisperIsRunningRef.current) return;
        const blob = new Blob(chunks, {
          type: mimeType
        });
        console.log("[CC] chunk:", blob.size, "bytes, mime:", mimeType);
        if (blob.size < 500) {
          console.log("[CC] chunk vazio/silêncio, pulando");
          recordChunk();
          return;
        }
        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");
          formData.append("model", "whisper-large-v3-turbo");
          formData.append("language", "pt");
          formData.append("response_format", "text");
          const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`
            },
            body: formData
          });
          if (res.ok) {
            const text = (await res.text()).trim();
            console.log("[CC] transcrição:", text);
            if (text && text.length > 2) {
              setLegendaFinal(text);
              if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
              legendaTimeoutRef.current = setTimeout(() => setLegendaFinal(""), 5e3);
            }
          } else {
            const err = await res.text().catch(() => "");
            console.warn("[CC] Groq erro", res.status, err);
          }
        } catch (err) {
          console.warn("[CC] fetch erro:", err);
        }
        if (whisperIsRunningRef.current) recordChunk();
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, CHUNK_MS);
    };
    recordChunk();
    return () => {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try {
          whisperMediaRecorderRef.current.stop();
        } catch {
        }
      }
      whisperMediaRecorderRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
    };
  }, [legendasAtivas, activePlayer, isPlaying]);
  const normalizeText = useCallback((text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  }, []);
  const getFileName = useCallback((assunto) => {
    if (!assunto) return "";
    const normalized = normalizeText(assunto);
    const found = localFiles.find((f) => {
      const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
      return normalizedFile === normalized;
    });
    return found?.name || "";
  }, [normalizeText, localFiles]);
  const getFileUrl = useCallback(async (assunto) => {
    if (!assunto) return null;
    const fileName = getFileName(assunto);
    if (dirHandle) {
      if (blobUrlsRef.current.has(fileName)) return blobUrlsRef.current.get(fileName);
      try {
        const fh = await dirHandle.getFileHandle(fileName);
        const file = await fh.getFile();
        const url = URL.createObjectURL(file);
        blobUrlsRef.current.set(fileName, url);
        return url;
      } catch {
        return null;
      }
    }
    return `/materias/${fileName}`;
  }, [dirHandle, getFileName]);
  const verifyFiles = useCallback(async (itemsToVerify, handle) => {
    const h = handle ?? dirHandle;
    setIsVerifying(true);
    const upd = {};
    await Promise.all(itemsToVerify.map(async (item) => {
      const fn = getFileName(item.assunto);
      if (h) {
        try {
          await h.getFileHandle(fn);
          upd[item.id] = true;
        } catch {
          upd[item.id] = false;
        }
      } else {
        try {
          const r = await fetch(`/materias/${fn}`, {
            method: "HEAD"
          });
          upd[item.id] = r.ok;
        } catch {
          upd[item.id] = false;
        }
      }
    }));
    setFileStatus((prev) => ({
      ...prev,
      ...upd
    }));
    setIsVerifying(false);
  }, [dirHandle, getFileName]);
  useEffect(() => {
    const autoPreview = async () => {
      if (!selectedFile && items.length > 0 && currentIndex < items.length && items[currentIndex]?.assunto) {
        const url = await getFileUrl(items[currentIndex].assunto);
        if (url && pvwRef.current && pvwRef.current.src !== url) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
      }
    };
    autoPreview();
  }, [currentIndex, items, getFileUrl, selectedFile]);
  useEffect(() => {
    if (items.length > 0) verifyFiles(items);
  }, [items, verifyFiles]);
  useEffect(() => {
    if (localFiles.length === 0 || items.length === 0) return;
    const reordered = items.map((item) => {
      const normalizedItem = normalizeText(item.assunto);
      return localFiles.find((f) => {
        const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
        return normalizedFile === normalizedItem;
      });
    }).filter((f) => f !== void 0);
    const used = new Set(reordered.map((f) => f.name));
    const remaining = localFiles.filter((f) => !used.has(f.name));
    setLocalFiles([...reordered, ...remaining]);
  }, [items, normalizeText]);
  const load = useCallback(async () => {
    const {
      rows: blocks
    } = await db.query(`SELECT id, ordem FROM espelho_blocos
       WHERE data_edicao = $1 AND programa ILIKE $2
       ORDER BY ordem`, [date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), programa || "Jornal da Manhã"]);
    if (blocks?.length) {
      const blocoIds = blocks.map((b) => b.id);
      const placeholders = blocoIds.map((_, idx) => `$${idx + 1}`).join(", ");
      const {
        rows: rawItens
      } = await db.query(`SELECT id, bloco_id, assunto, cabeca, tempo, materia_id, ordem, formato
         FROM espelho_itens
         WHERE bloco_id IN (${placeholders})`, blocoIds);
      const ordenado = [];
      blocks.forEach((bloco) => {
        const itensDoBloco = (rawItens || []).filter((i) => String(i.bloco_id) === String(bloco.id)).sort((a, b) => a.ordem - b.ordem);
        ordenado.push(...itensDoBloco);
      });
      setItems(ordenado);
      if (ordenado.length) verifyFiles(ordenado);
    } else {
      setItems([]);
    }
  }, [date, programa, verifyFiles]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const indexMap = {};
    items.forEach((item, idx) => {
      indexMap[item.id] = idx + 1;
    });
    setGlobalItemIndex(indexMap);
  }, [items]);
  useEffect(() => {
    if (currentItemId) {
      const idx = items.findIndex((i) => i.id === currentItemId);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [items, currentItemId, currentIndex]);
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 4e3);
    return () => {
      clearInterval(interval);
    };
  }, [load]);
  useEffect(() => {
    if (materiaAtual?.itensLauda?.length === 0) {
      console.log("🧹 LAUDA VAZIA - Limpando cache de créditos...");
      setGcCreditsQueue([]);
      setGcLine1("");
      setGcLine2("");
      if (gcVisible) setGcVisible(false);
    }
  }, [materiaAtual?.itensLauda?.length]);
  const scanLocalFiles = useCallback(async (handle) => {
    setIsScanningFiles(true);
    setLocalFiles([]);
    const found = [];
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
        const fileHandle = entry;
        const file = await fileHandle.getFile();
        const codec = await detectCodec(file);
        const sizeMB = file.size / 1024 / 1024;
        const blobUrl = URL.createObjectURL(file);
        const duration = await getVideoDuration(blobUrl);
        found.push({
          name,
          codec,
          sizeMB: Math.round(sizeMB * 100) / 100,
          lastModified: new Date(file.lastModified).toLocaleString("pt-BR"),
          blobUrl,
          duration
        });
      }
    }
    if (items.length > 0) {
      const reordered = items.map((item) => {
        const normalizedItem = normalizeText(item.assunto);
        return found.find((f) => {
          const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
          return normalizedFile === normalizedItem;
        });
      }).filter((f) => f !== void 0);
      const used = new Set(reordered.map((f) => f.name));
      const remaining = found.filter((f) => !used.has(f.name));
      setLocalFiles([...reordered, ...remaining]);
    } else {
      setLocalFiles(found);
    }
    setIsScanningFiles(false);
  }, [items, normalizeText]);
  const handleSelectDir = async () => {
    if (typeof window === "undefined" || !window.showDirectoryPicker) {
      toast.error("Seu navegador não suporta a seleção de pastas ou o site não está em HTTPS. Certifique-se de usar Chrome ou Edge e acessar via HTTPS ou localhost.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: "read"
      });
      setDirHandle(handle);
      setIsDirReady(true);
      setShowWelcomeModal(false);
      await scanLocalFiles(handle);
      toast.success("Pasta vinculada com sucesso!");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Erro ao selecionar pasta:", err);
      toast.error("Erro ao selecionar pasta");
    }
  };
  const preloadInactivePlayer = useCallback((blobUrl, currentActivePlayer) => {
    const inactiveEl = currentActivePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (!inactiveEl) return;
    inactiveEl.pause();
    inactiveEl.src = blobUrl;
    inactiveEl.muted = true;
    inactiveEl.preload = "auto";
    const onReady = () => {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
      inactiveEl.muted = false;
      inactiveEl.removeEventListener("canplay", onReady);
    };
    inactiveEl.addEventListener("canplay", onReady);
    inactiveEl.load();
  }, []);
  const itemsRef = useRef(items);
  const localFilesRef = useRef(localFiles);
  const activePlayerRef = useRef(activePlayer);
  const pgmCamUrlRef = useRef(pgmCamUrl);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    localFilesRef.current = localFiles;
  }, [localFiles]);
  useEffect(() => {
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);
  useEffect(() => {
    pgmCamUrlRef.current = pgmCamUrl;
  }, [pgmCamUrl]);
  const getFileUrlRef = useRef(getFileUrl);
  const getFileNameRef = useRef(getFileName);
  const preloadInactivePlayerRef = useRef(preloadInactivePlayer);
  const sendPgmCamCommandRef = useRef(sendPgmCamCommand);
  useEffect(() => {
    getFileUrlRef.current = getFileUrl;
  }, [getFileUrl]);
  useEffect(() => {
    getFileNameRef.current = getFileName;
  }, [getFileName]);
  useEffect(() => {
    preloadInactivePlayerRef.current = preloadInactivePlayer;
  }, [preloadInactivePlayer]);
  useEffect(() => {
    sendPgmCamCommandRef.current = sendPgmCamCommand;
  }, [sendPgmCamCommand]);
  useEffect(() => {
    const ch = new BroadcastChannel("desknews_playout_sync");
    ch.onmessage = async (event) => {
      if (event.data?.type !== "RODA_VT") return;
      const {
        materiaId,
        assunto,
        itemId
      } = event.data?.payload ?? {};
      console.log("[Playout] RODA_VT recebido →", {
        materiaId,
        assunto,
        itemId
      });
      const currentItems = itemsRef.current;
      const targetItem = currentItems.find((i) => i.id === itemId || materiaId && i.materia_id === materiaId || i.assunto === assunto);
      if (targetItem) {
        const idx = currentItems.findIndex((i) => i.id === targetItem.id);
        if (idx !== -1) {
          setCurrentIndex(idx);
          setCurrentItemId(targetItem.id);
        }
      }
      const currentLocalFiles = localFilesRef.current;
      const currentActivePlayer = activePlayerRef.current;
      const currentPgmCamUrl = pgmCamUrlRef.current;
      const expectedFileName = getFileNameRef.current(assunto);
      const file = currentLocalFiles.find((f) => f.name === expectedFileName);
      const url = file?.blobUrl ?? await getFileUrlRef.current(assunto);
      if (url && file) {
        if (pvwRef.current) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
        setSelectedFile(file);
        preloadInactivePlayerRef.current(file.blobUrl, currentActivePlayer);
        if (currentPgmCamUrl) sendPgmCamCommandRef.current("stopVideo");
        const aEl = pgmARef.current;
        const bEl = pgmBRef.current;
        if (bEl) {
          bEl.pause();
          bEl.src = "";
        }
        if (aEl) {
          aEl.pause();
          aEl.oncanplay = null;
          const rodaVtAC = new AbortController();
          const startPlay = () => {
            aEl.play().then(() => {
              setPgmCamUrl(null);
              setPgmCamIsYoutube(false);
              setPgmCamMuted(false);
              setPgmCamVolume(100);
              setPgmFile(file);
              setIsPlaying(true);
              setPlayerAOpacity(1);
              setPlayerAZ(10);
              setPlayerBOpacity(0);
              setPlayerBZ(0);
              setActivePlayer("A");
              setPgmProgress(0);
              setPgmCurrentTime(0);
            }).catch(() => {
            });
          };
          const isSameSrc = aEl.src === file.blobUrl;
          if (isSameSrc && aEl.readyState >= 3) {
            aEl.currentTime = 0;
            startPlay();
          } else {
            aEl.addEventListener("canplay", () => {
              rodaVtAC.abort();
              startPlay();
            }, {
              once: true,
              signal: rodaVtAC.signal
            });
            aEl.src = file.blobUrl;
            aEl.load();
          }
        }
        if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
          type: "pgm_take",
          fileName: file.name
        }));
        toast.success(`▶ AUTO-PLAY: "${assunto}"`, {
          duration: 3e3
        });
      } else {
        console.warn("[Playout] RODA_VT: arquivo não encontrado →", assunto);
        toast.warning(`⚠ VT não encontrado na pasta: "${assunto}"`, {
          duration: 4e3
        });
      }
      if (materiaId) {
        try {
          const [{
            rows
          }, {
            rows: itemRows
          }] = await Promise.all([db.query(`SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
                 FROM materias WHERE id = $1`, [materiaId]), itemId ? db.query(`SELECT tempo FROM espelho_itens WHERE id = $1`, [itemId]) : Promise.resolve({
            rows: []
          })]);
          const data = rows?.[0];
          if (data) {
            const {
              sonoras,
              passagens,
              producao,
              itensLauda: itensEstrutura
            } = parsarSonorasEPassagens(data.estrutura);
            setGcLine1("");
            setGcLine2("");
            setGcCreditsQueue([]);
            setGcVisible(false);
            setRemovedLaudaOrdens((prev) => {
              const n = {
                ...prev
              };
              delete n[data.id];
              return n;
            });
            let creditsList = [];
            let itensLauda = itensEstrutura;
            let timelineJsonParsed = null;
            if (data.timeline_json) {
              try {
                timelineJsonParsed = JSON.parse(data.timeline_json);
              } catch {
                timelineJsonParsed = null;
              }
            }
            if (timelineJsonParsed && timelineJsonParsed.length > 0) {
              timelineJsonRef.current = timelineJsonParsed;
              itensLauda = timelineJsonParsed.map((c, idx) => ({
                tipo: c.tipo,
                nome: c.tipo,
                valor: c.valor,
                ordem: idx
              }));
              creditsList = timelineJsonParsed.map((c) => ({
                line1: c.valor,
                line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")
              }));
              console.log("[Playout] RODA_VT: usando timeline_json da Redação →", creditsList.length, "créditos");
            } else {
              if (data.editor_texto) creditsList.push({
                line1: data.editor_texto,
                line2: "ED. TEXTO"
              });
              if (data.editor_imagem) creditsList.push({
                line1: data.editor_imagem,
                line2: "ED. IMAGEM"
              });
              if (data.credito_reporter) creditsList.push({
                line1: data.credito_reporter,
                line2: "REPÓRTER"
              });
              let laudaOrdem = itensLauda.length;
              if (data.editor_texto && !itensLauda.some((it) => it.tipo === "ED_TEXTO")) itensLauda.push({
                tipo: "ED_TEXTO",
                nome: "ED_TEXTO",
                valor: data.editor_texto,
                ordem: laudaOrdem++
              });
              if (data.editor_imagem && !itensLauda.some((it) => it.tipo === "ED_IMAGEM")) itensLauda.push({
                tipo: "ED_IMAGEM",
                nome: "ED_IMAGEM",
                valor: data.editor_imagem,
                ordem: laudaOrdem++
              });
              if (data.credito_reporter && !itensLauda.some((it) => it.tipo === "REPÓRTER")) itensLauda.push({
                tipo: "REPÓRTER",
                nome: "REPÓRTER",
                valor: data.credito_reporter,
                ordem: laudaOrdem++
              });
              console.log("[Playout] RODA_VT: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
            }
            setGcCreditsQueue(creditsList);
            if (creditsList.length > 0) {
              setGcLine1(creditsList[0].line1);
              setGcLine2(creditsList[0].line2);
            }
            setMateriaAtual({
              materia_id: data.id,
              titulo: data.titulo,
              editor_texto: data.editor_texto,
              editor_imagem: data.editor_imagem,
              credito_reporter: data.credito_reporter,
              sonoras,
              passagens,
              producao,
              itensLauda,
              _estrutura: data.estrutura
            });
            console.log("[Playout] RODA_VT: lauda carregada →", data.titulo);
            if (timelineJsonParsed && timelineJsonParsed.length > 0) {
              const map = /* @__PURE__ */ new Map();
              const tl = [];
              timelineJsonParsed.forEach((c) => {
                const key = `${c.valor}|${c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")}`;
                map.set(key, {
                  inicio: c.timecode,
                  duracao: c.duracao ?? 5
                });
                tl.push({
                  nome: c.valor,
                  funcao: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM"),
                  timecodeInicio: c.timecode,
                  duracao: c.duracao ?? 5
                });
              });
              laudaSnapshotRef.current = itensLauda;
              sonorasSnapshotRef.current = sonoras;
              estruturaSnapshotRef.current = data.estrutura;
              sonorasMapRef.current = map;
              sonorasDisparadosRef.current.clear();
              setSonorasTimeline(tl);
              console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) do timeline_json aplicados diretamente`);
            } else if (data.estrutura && itensLauda.length > 0) {
              const tempoEspelho = itemRows?.[0]?.tempo;
              let duracaoPrevia = 90;
              if (tempoEspelho) {
                const partes = tempoEspelho.split(":").map(Number);
                if (partes.length === 2) duracaoPrevia = partes[0] * 60 + partes[1];
                else if (partes.length === 1) duracaoPrevia = partes[0];
              }
              console.log(`[Playout] RODA_VT: calculando timecodes via IA (duração prevista: ${duracaoPrevia}s)`);
              laudaSnapshotRef.current = itensLauda;
              sonorasSnapshotRef.current = sonoras;
              estruturaSnapshotRef.current = data.estrutura;
              const timelineFallback = construirTimelineFallback(itensLauda, duracaoPrevia, sonoras);
              if (timelineFallback.length > 0) {
                const map = /* @__PURE__ */ new Map();
                const tl = [];
                timelineFallback.forEach((cred) => {
                  map.set(`${cred.line1}|${cred.line2}`, {
                    inicio: cred.inicio,
                    duracao: cred.duracao
                  });
                  tl.push({
                    nome: cred.line1,
                    funcao: cred.line2,
                    timecodeInicio: cred.inicio,
                    duracao: cred.duracao
                  });
                });
                sonorasMapRef.current = map;
                sonorasDisparadosRef.current.clear();
                setSonorasTimeline(tl);
                console.log(`[Playout] RODA_VT: ${tl.length} crédito(s) posicionados (fallback) com ${duracaoPrevia}s`);
              }
              calcularTimecodesViaIA(data.estrutura, itensLauda, duracaoPrevia, sonoras).then((creditosIA) => {
                if (creditosIA.length === 0) return;
                const map = /* @__PURE__ */ new Map();
                const tl = [];
                creditosIA.forEach((cred) => {
                  map.set(`${cred.line1}|${cred.line2}`, {
                    inicio: cred.inicio,
                    duracao: cred.duracao
                  });
                  tl.push({
                    nome: cred.line1,
                    funcao: cred.line2,
                    timecodeInicio: cred.inicio,
                    duracao: cred.duracao
                  });
                });
                sonorasMapRef.current = map;
                setSonorasTimeline(tl);
                console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) calculado(s) pela IA (${duracaoPrevia}s)`);
                toast.success(`⏱ ${creditosIA.length} crédito(s) posicionados pela IA`, {
                  duration: 2500
                });
              }).catch((err) => console.warn("[Playout] RODA_VT: IA de timecodes falhou:", err));
            }
            if (data.estrutura) {
              extractCredits(data.estrutura, data.editor_texto || void 0, data.credito_reporter || void 0).then((autoCredits) => {
                if (autoCredits.length === 0) return;
                setGcCreditsQueue((prev) => {
                  const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
                  const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
                  if (novos.length === 0) return prev;
                  const novaFila = [...prev, ...novos];
                  if (prev.length === 0 && novaFila.length > 0) {
                    setGcLine1(novaFila[0].line1);
                    setGcLine2(novaFila[0].line2);
                  }
                  return novaFila;
                });
                toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
              }).catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
            }
          }
        } catch (err) {
          console.error("[Playout] RODA_VT: erro ao carregar lauda →", err);
        }
      }
    };
    return () => {
      ch.close();
    };
  }, []);
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    if (pvwRef.current) {
      pvwRef.current.src = file.blobUrl;
      pvwRef.current.load();
    }
    preloadInactivePlayer(file.blobUrl, activePlayer);
  };
  const sendCamToPreview = (camIndex) => {
    const camEl = camVideoRefs.current[camIndex];
    const pvw = pvwRef.current;
    if (!pvw) return;
    if (!camEl || !camEl.src) {
      setIsCamPreview(true);
      setPreviewCamIdx(camIndex);
      setSelectedFile(null);
      return;
    }
    const src = camEl.src;
    const time = camEl.currentTime;
    if (pvw.src !== src) {
      pvw.src = src;
      pvw.load();
      pvw.addEventListener("loadedmetadata", () => {
        pvw.currentTime = time;
        pvw.play().catch(() => {
        });
      }, {
        once: true
      });
    } else {
      pvw.currentTime = time;
    }
    setIsCamPreview(true);
    setPreviewCamIdx(camIndex);
    setSelectedFile(null);
  };
  const handleSelectFromPlaylist = async (assunto) => {
    const url = await getFileUrl(assunto);
    if (url && pvwRef.current && pvwRef.current.src !== url) {
      pvwRef.current.src = url;
      pvwRef.current.load();
    }
    const expectedFileName = getFileName(assunto);
    const file = localFiles.find((f) => f.name === expectedFileName);
    if (file) {
      setSelectedFile(file);
      preloadInactivePlayer(file.blobUrl, activePlayer);
    }
  };
  const [dragOverLauda, setDragOverLauda] = useState(false);
  const [draggedFromLauda, setDraggedFromLauda] = useState(null);
  const [draggedLaudaIndex, setDraggedLaudaIndex] = useState(null);
  const handleReorderLauda = (fromIndex, toIndex) => {
    if (!materiaAtual) return;
    const novaLauda = [...materiaAtual.itensLauda];
    const [removed] = novaLauda.splice(fromIndex, 1);
    novaLauda.splice(toIndex, 0, removed);
    setMateriaAtual((prev) => prev ? {
      ...prev,
      itensLauda: novaLauda
    } : null);
  };
  const handleDropNaLauda = async (item) => {
    setDragOverLauda(false);
    console.log("🎬 DEBUG: VT arrastado para LAUDA", {
      item,
      materia_id: item.materia_id
    });
    if (!item.materia_id) {
      toast.error("❌ Este item não tem matéria vinculada.");
      console.warn("⚠️ materia_id vazio:", item);
      return;
    }
    try {
      console.log("🔍 Buscando matéria com ID:", item.materia_id);
      const {
        rows: materiaRows
      } = await db.query(`SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
         FROM materias WHERE id = $1`, [item.materia_id]);
      const data = materiaRows?.[0];
      if (!data) {
        console.error("❌ Matéria não encontrada com ID:", item.materia_id);
        toast.error("❌ Matéria não encontrada no banco.");
        return;
      }
      console.log("✅ Matéria encontrada:", data);
      console.log("📄 Estrutura/Lauda:", data.estrutura);
      const {
        sonoras,
        passagens,
        producao,
        itensLauda
      } = parsarSonorasEPassagens(data.estrutura);
      console.log("📋 Itens parseados:", {
        sonoras,
        passagens,
        producao,
        itensLauda
      });
      setGcLine1("");
      setGcLine2("");
      setGcCreditsQueue([]);
      setGcVisible(false);
      setRemovedLaudaOrdens((prev) => {
        const novo = {
          ...prev
        };
        delete novo[data.id];
        return novo;
      });
      let creditsList = [];
      let timelineJsonParsed = null;
      if (data.timeline_json) {
        try {
          timelineJsonParsed = JSON.parse(data.timeline_json);
        } catch {
          timelineJsonParsed = null;
        }
      }
      if (timelineJsonParsed && timelineJsonParsed.length > 0) {
        timelineJsonRef.current = timelineJsonParsed;
        itensLauda.length = 0;
        timelineJsonParsed.forEach((c, idx) => {
          itensLauda.push({
            tipo: c.tipo,
            nome: c.tipo,
            valor: c.valor,
            ordem: idx
          });
        });
        creditsList = timelineJsonParsed.map((c) => ({
          line1: c.valor,
          line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")
        }));
        console.log("[Playout] Drag: usando timeline_json da Redação →", creditsList.length, "créditos");
      } else {
        timelineJsonRef.current = null;
        if (data.editor_texto) creditsList.push({
          line1: data.editor_texto,
          line2: "ED. TEXTO"
        });
        if (data.editor_imagem) creditsList.push({
          line1: data.editor_imagem,
          line2: "ED. IMAGEM"
        });
        if (data.credito_reporter) creditsList.push({
          line1: data.credito_reporter,
          line2: "REPÓRTER"
        });
        let laudaOrdem = itensLauda.length;
        creditsList.forEach((cred) => {
          itensLauda.push({
            tipo: cred.line2.replace("ED. ", "ED_"),
            nome: cred.line2,
            valor: cred.line1,
            ordem: laudaOrdem++
          });
        });
        console.log("[Playout] Drag: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
      }
      console.log("📋 Créditos carregados:", creditsList);
      setGcCreditsQueue(creditsList);
      if (creditsList.length > 0) {
        setGcLine1(creditsList[0].line1);
        setGcLine2(creditsList[0].line2);
      }
      setMateriaAtual({
        materia_id: data.id,
        titulo: data.titulo,
        editor_texto: data.editor_texto,
        editor_imagem: data.editor_imagem,
        credito_reporter: data.credito_reporter,
        sonoras,
        passagens,
        producao,
        itensLauda,
        _estrutura: data.estrutura
      });
      console.log("✅ LAUDA carregada com", itensLauda.length, "itens");
      if (data.estrutura) {
        extractCredits(data.estrutura, data.editor_texto || void 0, data.credito_reporter || void 0).then((autoCredits) => {
          if (autoCredits.length === 0) return;
          setGcCreditsQueue((prev) => {
            const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
            const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
            if (novos.length === 0) return prev;
            const novaFila = [...prev, ...novos];
            if (prev.length === 0 && novaFila.length > 0) {
              setGcLine1(novaFila[0].line1);
              setGcLine2(novaFila[0].line2);
            }
            return novaFila;
          });
          toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
        }).catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
      }
      toast.success(`✅ Lauda carregada: ${data.titulo} (${itensLauda.length} itens)`);
    } catch (err) {
      console.error("❌ Erro ao carregar créditos:", err);
      toast.error(`❌ Erro: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };
  const handlePlayPausePgm = async () => {
    if (!pgmFile) return;
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    try {
      if (isPlaying) {
        pgmVideoEl.pause();
        setIsPlaying(false);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
          type: "pgm_pause",
          currentTime: pgmVideoEl.currentTime
        }));
      } else {
        await pgmVideoEl.play();
        setIsPlaying(true);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
          type: "pgm_play",
          currentTime: pgmVideoEl.currentTime
        }));
      }
    } catch (err) {
      toast.error("Erro ao reproduzir vídeo");
    }
  };
  const handleStop = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.pause();
    pgmVideoEl.currentTime = 0;
    setIsPlaying(false);
    setPgmProgress(0);
    setPgmCurrentTime(0);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
      type: "pgm_stop"
    }));
  };
  const handleCue = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.currentTime = 0;
    setPgmProgress(0);
    setPgmCurrentTime(0);
  };
  const handleTake = () => {
    if (isCamPreview && previewCamIdx !== null) {
      const srcType = camSourceTypes[previewCamIdx];
      const rawUrl = camSources[previewCamIdx];
      const camEl = camVideoRefs.current[previewCamIdx];
      const camNum = previewCamIdx + 1;
      if (srcType === "url" && rawUrl) {
        const {
          url: embedUrl,
          isYoutube
        } = buildCamEmbedUrl(rawUrl, {
          mute: false,
          enableApi: true
        });
        if (pgmCamUrl) sendPgmCamCommand("stopVideo");
        setPgmCamUrl(embedUrl);
        setPgmCamIsYoutube(isYoutube);
        setPgmCamVolume(100);
        setPgmCamMuted(false);
        setIsPlaying(true);
        const camFile = {
          name: `CAM ${camNum}`,
          sizeMB: 0,
          lastModified: "",
          codec: "H.264",
          blobUrl: "",
          duration: null
        };
        setPgmFile(camFile);
        toast.success(`CAM ${camNum} → PROGRAM`);
      } else if (srcType === "file" && camEl && camEl.src) {
        const src = camEl.src;
        const time = camEl.currentTime;
        const aEl2 = pgmARef.current;
        const bEl2 = pgmBRef.current;
        if (aEl2) {
          if (pgmCamUrl) sendPgmCamCommand("stopVideo");
          if (bEl2) {
            bEl2.pause();
            bEl2.src = "";
          }
          setPgmCamUrl(null);
          setPgmCamIsYoutube(false);
          setPgmCamMuted(false);
          setPgmCamVolume(100);
          aEl2.src = src;
          aEl2.load();
          aEl2.addEventListener("loadedmetadata", () => {
            aEl2.currentTime = time;
            aEl2.muted = false;
            aEl2.volume = 1;
            aEl2.play().catch(() => {
            });
          }, {
            once: true
          });
          setPlayerAOpacity(1);
          setPlayerAZ(10);
          setPlayerBOpacity(0);
          setPlayerBZ(0);
          setActivePlayer("A");
          setIsPlaying(true);
          const camFile = {
            name: `CAM ${camNum}`,
            sizeMB: 0,
            lastModified: "",
            codec: "H.264",
            blobUrl: src,
            duration: camEl.duration || null
          };
          setPgmFile(camFile);
          toast.success(`CAM ${camNum} → PROGRAM`);
        }
      }
      if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
        type: "cam_pgm",
        cam: camNum
      }));
      return;
    }
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    const aEl = pgmARef.current;
    const bEl = pgmBRef.current;
    const fileToPlay = selectedFile;
    if (!aEl) return;
    if (bEl) {
      bEl.pause();
      bEl.src = "";
    }
    aEl.pause();
    aEl.oncanplay = null;
    const canplayAC = new AbortController();
    const startPlay = () => {
      aEl.play().then(() => {
        setPgmFile(fileToPlay);
        setIsPlaying(true);
        setPgmCamUrl(null);
        setPgmCamIsYoutube(false);
        setPgmCamMuted(false);
        setPgmCamVolume(100);
        setPlayerAOpacity(1);
        setPlayerAZ(10);
        setPlayerBOpacity(0);
        setPlayerBZ(0);
        setActivePlayer("A");
        setPgmProgress(0);
        setPgmCurrentTime(0);
        if (progressBarRef.current) progressBarRef.current.style.width = "0%";
        if (progressTimeRef.current) progressTimeRef.current.textContent = "0:00";
      }).catch((err) => {
        console.error("Erro ao dar play no PGM:", err);
        toast.error("Erro ao reproduzir vídeo");
      });
    };
    if (pgmCamUrl) sendPgmCamCommand("stopVideo");
    const isSameSrc = aEl.src === fileToPlay.blobUrl;
    if (isSameSrc && aEl.readyState >= 3) {
      aEl.currentTime = 0;
      startPlay();
    } else {
      aEl.addEventListener("canplay", () => {
        canplayAC.abort();
        startPlay();
      }, {
        once: true,
        signal: canplayAC.signal
      });
      aEl.src = fileToPlay.blobUrl;
      aEl.load();
    }
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
      type: "pgm_take",
      fileName: fileToPlay.name
    }));
    toast.success(`"${fileToPlay.name}" enviado para o ar!`);
  };
  const applyTransOpacity = useCallback((value, currentActivePlayer = "A") => {
    const incomingOpacity = value / 100;
    const outgoingOpacity = 1 - incomingOpacity;
    if (currentActivePlayer === "A") {
      setPlayerAOpacity(outgoingOpacity);
      setPlayerBOpacity(incomingOpacity);
    } else {
      setPlayerBOpacity(outgoingOpacity);
      setPlayerAOpacity(incomingOpacity);
    }
  }, []);
  const handleTransition = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (inactiveEl) {
      if (!inactiveEl.src || inactiveEl.src === window.location.href) {
        inactiveEl.src = selectedFile.blobUrl;
        inactiveEl.load();
      }
      inactiveEl.currentTime = 0;
      if (activePlayer === "A") {
        setPlayerBOpacity(0);
        setPlayerBZ(0);
      } else {
        setPlayerAOpacity(0);
        setPlayerAZ(0);
      }
      inactiveEl.play().catch(() => {
      });
    }
  };
  const handleTransComplete = () => {
    if (!selectedFile) return;
    setPgmFile(selectedFile);
    const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    const nextPlayer = activePlayer === "A" ? "B" : "A";
    if (activeEl) {
      activeEl.pause();
      activeEl.src = "";
    }
    if (nextPlayer === "B") {
      setPlayerAOpacity(0);
      setPlayerAZ(0);
      setPlayerBOpacity(1);
      setPlayerBZ(10);
    } else {
      setPlayerBOpacity(0);
      setPlayerBZ(0);
      setPlayerAOpacity(1);
      setPlayerAZ(10);
    }
    setActivePlayer(nextPlayer);
    setIsPlaying(true);
    setTransValue(0);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({
      type: "pgm_take",
      fileName: selectedFile.name
    }));
    toast.success(`Fusão concluída: "${selectedFile.name}"`);
  };
  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentItemId(items[nextIndex]?.id ?? null);
    } else {
      toast.warning("Fim da playlist");
    }
  };
  const handleSeek = (e) => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl || !pgmFile?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * pgmFile.duration;
    pgmVideoEl.currentTime = time;
    setPgmCurrentTime(time);
    setPgmProgress(percent * 100 % 100);
  };
  const h264Count = localFiles.filter((f) => f.codec === "H.264").length;
  localFiles.filter((f) => f.codec !== "H.264").length;
  const totalSizeMB = localFiles.reduce((sum, f) => sum + f.sizeMB, 0);
  const removerItemDaLaudaPorNome = useCallback((nome) => {
    setMateriaAtual((prev) => {
      if (!prev) return null;
      const nomeLower = nome.trim().toUpperCase();
      const novaLauda = prev.itensLauda.filter((it) => {
        const sepIdx = it.valor?.indexOf(" - ") ?? -1;
        const itemNome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim().toUpperCase() : (it.valor || "").trim().toUpperCase();
        return itemNome !== nomeLower;
      });
      if (novaLauda.length === prev.itensLauda.length) return prev;
      return {
        ...prev,
        itensLauda: novaLauda
      };
    });
  }, []);
  const removerItemDaLaudaPorNomeRef = useRef(removerItemDaLaudaPorNome);
  useEffect(() => {
    removerItemDaLaudaPorNomeRef.current = removerItemDaLaudaPorNome;
  }, [removerItemDaLaudaPorNome]);
  const handleGcTake = useCallback(
    (nome, funcao, autoDuration) => {
      setGcLine1(nome.toUpperCase());
      setGcLine2(funcao.toUpperCase());
      setGcVisible(true);
      removerItemDaLaudaPorNomeRef.current(nome);
      if (autoDuration && autoDuration > 0) {
        setGcDuration(autoDuration);
        console.log(`✅ GC: "${nome}" por ${autoDuration}s`);
        setTimeout(() => {
          setGcVisible(false);
        }, autoDuration * 1e3);
      } else {
        setGcDuration(0);
      }
      setGcHistory((prev) => [...prev, {
        line1: nome,
        line2: funcao
      }]);
    },
    []
    // deps vazio — usa refs para tudo que muda
  );
  const handleGcTakeQueue = () => {
    setGcVisible(true);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
      type: "gc_show",
      line1: gcLine1,
      line2: gcLine2
    }));
    if (gcLine1) removerItemDaLaudaPorNome(gcLine1);
    if (gcLine1 || gcLine2) {
      setGcHistory((prev) => [{
        line1: gcLine1,
        line2: gcLine2
      }, ...prev].slice(0, 2));
    }
    if (gcCreditsQueue.length > 0) {
      const novaFila = gcCreditsQueue.slice(1);
      setGcCreditsQueue(novaFila);
      if (novaFila.length > 0) {
        setGcLine1(novaFila[0].line1);
        setGcLine2(novaFila[0].line2);
      } else {
        setGcLine1("");
        setGcLine2("");
        toast.success("✓ Todos os créditos foram exibidos!");
      }
    }
  };
  const handleGcClear = () => {
    setGcVisible(false);
    setGcLine1("");
    setGcLine2("");
    setGcCreditsQueue([]);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
      type: "gc_hide"
    }));
  };
  const handleGcSkip = () => {
    if (gcCreditsQueue.length === 0) return;
    const novaFila = gcCreditsQueue.slice(1);
    setGcCreditsQueue(novaFila);
    if (novaFila.length > 0) {
      setGcLine1(novaFila[0].line1);
      setGcLine2(novaFila[0].line2);
      toast("⏭ Crédito pulado");
    } else {
      setGcLine1("");
      setGcLine2("");
      toast("⏭ Fila de créditos esvaziada");
    }
  };
  const handleApplyPreset = (presetName) => {
    const preset = gcPresets[presetName];
    if (preset) {
      setGcLine1(preset.line1);
      setGcLine2(preset.line2);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 text-white flex flex-col overflow-hidden font-sans", style: {
    backgroundColor: "#121212",
    color: "white"
  }, children: [
    showWelcomeModal && !isDirReady && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "border rounded-2xl p-8 flex flex-col items-center gap-6 w-[420px]", style: {
      backgroundColor: "#1a1a1a",
      borderColor: "#00E676"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl", style: {
        backgroundColor: "#00E67620"
      }, children: /* @__PURE__ */ jsx(MonitorPlay, { className: "h-8 w-8", style: {
        color: "#00E676"
      } }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight text-white", children: "DeskNews Exibição" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-2", children: "Selecione a pasta onde estão os VTs para iniciar o playout." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: handleSelectDir, disabled: isScanningFiles, className: "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] w-full justify-center text-black", style: {
        backgroundColor: "#00E676"
      }, children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "h-5 w-5" }),
        "Vincular Pasta de VTs"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowWelcomeModal(false), className: "text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors", children: "Pular por agora" })
    ] }) }),
    /* @__PURE__ */ jsxs("header", { className: "h-14 border-b flex items-center justify-between px-4 shrink-0 relative z-30", style: {
      backgroundColor: "#1a1a1a",
      borderColor: "#2a2a2a"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg", style: {
          backgroundColor: "#00E67615"
        }, children: /* @__PURE__ */ jsx(MonitorPlay, { className: "h-4 w-4", style: {
          color: "#00E676"
        } }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-sm font-black tracking-[0.2em] uppercase", style: {
          color: "#00E676"
        }, children: "DESKNEWS" }),
        isDirReady && dirHandle && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-2 py-0.5 rounded-full border ml-1", style: {
          backgroundColor: "#00E67610",
          borderColor: "#00E67630"
        }, children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "h-2.5 w-2.5", style: {
            color: "#00E676"
          } }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase font-semibold", style: {
            color: "#00E676"
          }, children: dirHandle.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5", children: "Bloco" }),
          /* @__PURE__ */ jsx("div", { className: "text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500", children: formatDuration(blockRemainingTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-0.5", children: "VT" }),
          /* @__PURE__ */ jsx("div", { className: cn("text-[28px] font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300", pgmRemainingTime <= 5 ? "text-red-500 animate-pulse" : pgmRemainingTime <= 10 ? "text-red-500" : ""), style: {
            color: pgmRemainingTime > 10 ? "#00E676" : void 0
          }, children: formatDuration(pgmRemainingTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5", children: "Jornal" }),
          /* @__PURE__ */ jsx("div", { className: "text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500", children: formatDuration(generalJournalTime) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("button", { onClick: handleSelectDir, disabled: isScanningFiles, className: cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]", isDirReady ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500" : "animate-pulse text-black font-bold"), style: !isDirReady ? {
          backgroundColor: "#00E676",
          borderColor: "#00E676"
        } : {
          backgroundColor: "transparent"
        }, children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "h-3 w-3" }),
          isDirReady ? "TROCAR" : "VINCULAR"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => verifyFiles(items), disabled: isVerifying, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all active:scale-[0.98]", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: cn("h-3 w-3", isVerifying && "animate-spin") }),
          "IMP."
        ] }),
        isDirReady && dirHandle && /* @__PURE__ */ jsxs("button", { onClick: () => scanLocalFiles(dirHandle), disabled: isScanningFiles, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]", style: {
          borderColor: "#00E67640",
          color: "#00E676",
          backgroundColor: "#00E67610"
        }, children: [
          /* @__PURE__ */ jsx(Film, { className: cn("h-3 w-3", isScanningFiles && "animate-spin") }),
          isScanningFiles ? "SCAN..." : "SCAN"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pl-3 border-l border-zinc-800 ml-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-600 font-bold uppercase tracking-widest block", children: "ON AIR" }),
          /* @__PURE__ */ jsx("span", { className: "text-base font-mono font-bold tabular-nums leading-none", style: {
            color: "#00E676"
          }, children: clock })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-[260px] shrink-0 border-r flex flex-col overflow-hidden", style: {
        backgroundColor: "#181818",
        borderColor: "#2a2a2a"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-2.5 border-b flex items-center justify-between", style: {
          backgroundColor: "#1f1f1f",
          borderColor: "#2a2a2a"
        }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400", children: "VTs do Jornal" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-zinc-600 mt-0.5", children: [
              items.length,
              " matérias · ",
              localFiles.length,
              " arquivos"
            ] })
          ] }),
          localFiles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-0.5 text-[9px] font-mono", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", style: {
              color: "#00E676"
            }, children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5" }),
              h264Count,
              " H.264"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-zinc-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(HardDrive, { className: "h-2.5 w-2.5" }),
              (totalSizeMB / 1024).toFixed(1),
              "GB"
            ] })
          ] })
        ] }),
        localFiles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-b", style: {
          borderColor: "#2a2a2a"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5", style: {
            backgroundColor: "#1f1f1f"
          }, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-500 font-black uppercase tracking-widest", children: "PASTA LOCAL" }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", style: {
            maxHeight: "36vh"
          }, children: localFiles.map((f) => {
            const isSelected = selectedFile?.name === f.name;
            const isOnAir = pgmFile?.name === f.name;
            const isH264 = f.codec === "H.264";
            return /* @__PURE__ */ jsxs("button", { onClick: () => handleSelectFile(f), className: cn("w-full text-left px-3 py-2 border-b border-white/[0.03] transition-all flex items-center gap-2", isOnAir ? "border-l-2" : isSelected ? "border-l-2" : "border-l-2 border-l-transparent"), style: {
              backgroundColor: isOnAir ? "#ff000015" : isSelected ? "#00E67610" : "transparent",
              borderLeftColor: isOnAir ? "#ef4444" : isSelected ? "#00E676" : "transparent"
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "shrink-0", children: isOnAir ? /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" }) : isSelected ? /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full", style: {
                backgroundColor: "#00E676"
              } }) : /* @__PURE__ */ jsx(Film, { className: cn("h-3 w-3", isH264 ? "text-zinc-600" : "text-yellow-500") }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono truncate leading-tight", style: {
                  color: isOnAir ? "#ef4444" : isSelected ? "#00E676" : "#e4e4e7"
                }, children: f.name.replace(".mp4", "") }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                  /* @__PURE__ */ jsx("span", { className: cn("text-[8px] px-1 py-0 rounded border font-bold uppercase", codecBadgeClass(f.codec)), children: f.codec === "Verificando..." ? "..." : f.codec }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-zinc-600 font-mono", children: [
                    formatDuration(f.duration),
                    " · ",
                    f.sizeMB,
                    "MB"
                  ] })
                ] })
              ] }),
              isOnAir && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[8px] text-red-500 font-bold uppercase animate-pulse", children: "AR" })
            ] }, f.name);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 border-b", style: {
            backgroundColor: "#1f1f1f",
            borderColor: "#2a2a2a"
          }, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-500 font-black uppercase tracking-widest", children: "ESPELHO — FILA DO DIA" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
            /* @__PURE__ */ jsx("table", { className: "w-full text-left text-zinc-400", children: /* @__PURE__ */ jsx("tbody", { className: "text-xs font-mono divide-y divide-white/5", children: items.map((item, idx) => {
              const isOnAir = idx === currentIndex - 1;
              const isNext = idx === currentIndex;
              const isDone = idx < currentIndex - 1;
              const exists = fileStatus[item.id];
              const expectedFileName = getFileName(item.assunto);
              localFiles.find((f) => f.name === expectedFileName);
              const handleDeleteItem = (e) => {
                e.stopPropagation();
                setItems((prev) => prev.filter((_, i) => i !== idx));
                if (currentIndex > idx) {
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }
                toast.info(`"${item.assunto}" removido da fila`);
              };
              return /* @__PURE__ */ jsxs("tr", { draggable: true, onDragStart: (e) => {
                e.dataTransfer.setData("materia_id", item.materia_id || "");
                e.dataTransfer.setData("item_index", String(idx));
                e.dataTransfer.setData("drag_source", "espelho");
                e.dataTransfer.effectAllowed = "move";
              }, onDragOver: (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }, onDrop: (e) => {
                e.preventDefault();
                const source = e.dataTransfer.getData("drag_source");
                if (source === "espelho") {
                  const fromIdx = Number(e.dataTransfer.getData("item_index"));
                  if (fromIdx !== idx) {
                    setItems((prevItems) => {
                      const novaOrdem = [...prevItems];
                      const [draggedItem] = novaOrdem.splice(fromIdx, 1);
                      novaOrdem.splice(idx, 0, draggedItem);
                      return novaOrdem;
                    });
                  }
                }
              }, onClick: () => handleSelectFromPlaylist(item.assunto), className: cn("transition-colors duration-200 cursor-grab active:cursor-grabbing group", isDone && "opacity-30"), style: {
                backgroundColor: isOnAir ? "#ff000010" : void 0
              }, children: [
                /* @__PURE__ */ jsx("td", { className: "px-2 py-2 w-12 text-center font-bold", children: isOnAir ? /* @__PURE__ */ jsx("span", { className: "text-red-500 animate-pulse text-[9px]", children: "● AR" }) : isNext ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold", style: {
                  color: "#00E676"
                }, children: "NEXT" }) : /* @__PURE__ */ jsx("span", { className: "text-zinc-600 text-[9px]", children: globalItemIndex[item.id] || idx + 1 }) }),
                /* @__PURE__ */ jsx("td", { className: "px-1 py-2 w-6 text-center", children: exists ? /* @__PURE__ */ jsx(FileCheck, { className: "h-3 w-3 mx-auto", style: {
                  color: "#00E676"
                } }) : /* @__PURE__ */ jsx(FileX, { className: "h-3 w-3 text-red-500 mx-auto" }) }),
                /* @__PURE__ */ jsx("td", { className: cn("px-2 py-2 font-bold text-[10px]", isOnAir ? "text-white" : "text-zinc-400"), children: item.assunto }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right text-zinc-600 text-[9px]", children: item.tempo || "0:00" }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right text-[9px]", children: /* @__PURE__ */ jsx("button", { onClick: handleDeleteItem, className: "text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-bold", title: "Remover da fila", children: "✕" }) })
              ] }, item.id);
            }) }) }),
            items.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-8 text-center text-zinc-600 text-xs italic", children: "Nenhuma matéria publicada para hoje." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-y-auto p-3 gap-3", style: {
        backgroundColor: "#121212"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full", style: {
                  backgroundColor: "#00E676"
                } }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", style: {
                  color: "#00E676"
                }, children: "Preview" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 truncate max-w-[120px]", children: selectedFile ? selectedFile.name.replace(".mp4", "") : "Nenhum arquivo" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-black rounded-lg overflow-hidden border", style: {
              borderColor: isCamPreview ? "#f97316" : "#00E67630"
            }, children: [
              /* @__PURE__ */ jsx("video", { ref: pvwRef, className: "w-full h-full object-contain", muted: true, playsInline: true, preload: "metadata", style: {
                display: isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" ? "none" : "block"
              } }),
              isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" && camSources[previewCamIdx] && (() => {
                const rawUrl = camSources[previewCamIdx];
                const {
                  url: embedUrl
                } = buildCamEmbedUrl(rawUrl, {
                  mute: true
                });
                return /* @__PURE__ */ jsx("iframe", { src: embedUrl, className: "absolute inset-0 w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, style: {
                  border: "none"
                } }, embedUrl);
              })(),
              isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" && /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: [
                /* @__PURE__ */ jsx(VolumeX, { className: "h-2.5 w-2.5" }),
                " mudo"
              ] }),
              isCamPreview && previewCamIdx !== null && /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 left-1.5 bg-orange-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: [
                "CAM ",
                previewCamIdx + 1
              ] }),
              !selectedFile && !isCamPreview && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
                /* @__PURE__ */ jsx(Film, { className: "h-7 w-7" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest", children: "Clique em um VT H.264" })
              ] }),
              selectedFile && /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 left-1.5", children: /* @__PURE__ */ jsx("span", { className: cn("text-[8px] font-bold px-1 py-0.5 rounded border uppercase", codecBadgeClass(selectedFile.codec)), children: selectedFile.codec === "Verificando..." ? "..." : selectedFile.codec }) }),
              selectedFile?.duration && /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-1.5 text-[9px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 rounded", children: formatDuration(selectedFile.duration) }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/50", children: /* @__PURE__ */ jsx("button", { onClick: handleTake, className: "text-black font-bold text-sm px-6 py-2 rounded-xl transition-all active:scale-[0.98]", style: {
                backgroundColor: "#00E676"
              }, children: "TAKE" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: cn("h-1.5 w-1.5 rounded-full bg-red-500", isPlaying && "animate-pulse") }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-red-500", children: "Program" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("button", { onClick: () => setLegendasAtivas((v) => !v), title: legendasAtivas ? "Desligar legendas" : "Ligar legendas — teleprompter sincronizado com a lauda", className: "flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all", style: {
                  backgroundColor: legendasAtivas ? ccTextoAtual ? "#00E67630" : "#1a3a1a" : "#252525",
                  borderColor: legendasAtivas ? ccTextoAtual ? "#00E676" : "#00E67440" : "#3a3a3a",
                  color: legendasAtivas ? "#00E676" : "#52525b"
                }, children: [
                  legendasAtivas ? /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full animate-pulse inline-block mr-0.5 ${ccTextoAtual ? "bg-emerald-400" : "bg-emerald-700"}` }) : null,
                  "CC",
                  legendasAtivas && /* @__PURE__ */ jsx("span", { className: "text-[7px] opacity-60 ml-0.5", children: ccTextoAtual ? "AO VIVO" : "LAUDA" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 truncate max-w-[120px]", children: pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-black rounded-lg overflow-hidden border-2", style: {
              borderColor: meActiveFrame !== null ? "#00E676" : isPlaying ? "#ef4444" : "#ef444430",
              boxShadow: meActiveFrame !== null ? "0 0 20px rgba(0,230,118,0.5)" : isPlaying ? "0 0 20px rgba(239,68,68,0.2)" : "none"
            }, children: [
              /* @__PURE__ */ jsx("video", { ref: pgmARef, className: "absolute inset-0 w-full h-full object-contain transition-opacity duration-300", style: {
                opacity: playerAOpacity,
                zIndex: playerAZ
              }, playsInline: true, preload: "auto", onTimeUpdate: (e) => {
                if (activePlayer !== "A") return;
                const el = e.currentTarget;
                const t = el.currentTime;
                const d = el.duration;
                setPgmCurrentTime(t);
                if (d) setPgmProgress(t / d * 100);
                if (progressBarRef.current) progressBarRef.current.style.width = d ? `${t / d * 100}%` : "0%";
                if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
              }, onEnded: handleItemFinished }),
              /* @__PURE__ */ jsx("video", { ref: pgmBRef, className: "absolute inset-0 w-full h-full object-contain transition-opacity duration-300", style: {
                opacity: playerBOpacity,
                zIndex: playerBZ
              }, playsInline: true, preload: "auto", onTimeUpdate: (e) => {
                if (activePlayer !== "B") return;
                const el = e.currentTarget;
                const t = el.currentTime;
                const d = el.duration;
                setPgmCurrentTime(t);
                if (d) setPgmProgress(t / d * 100);
                if (progressBarRef.current) progressBarRef.current.style.width = d ? `${t / d * 100}%` : "0%";
                if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
              }, onEnded: () => {
                if (activePlayer !== "B") return;
                handleItemFinished();
              } }),
              pgmCamUrl && /* @__PURE__ */ jsx("iframe", { ref: pgmCamIframeRef, src: pgmCamUrl, className: "absolute inset-0 w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, style: {
                border: "none",
                zIndex: 5
              } }, pgmCamUrl),
              !pgmFile && !pgmCamUrl && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
                /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-900" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest", children: "IDLE" })
              ] }),
              isPlaying && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse", children: [
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-white animate-pulse" }),
                " NO AR"
              ] }),
              pgmFile && items[currentIndex - 1]?.cabeca && /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-4 right-4 z-30", children: /* @__PURE__ */ jsxs("div", { className: "bg-black/90 border-l-4 border-red-600 px-3 py-1.5", children: [
                "//",
                /* @__PURE__ */ jsx("div", { className: "text-[9px] text-zinc-400", children: items[currentIndex - 1]?.assunto })
              ] }) }),
              legendasAtivas && /* @__PURE__ */ jsx("div", { className: "absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none", style: {
                zIndex: 45
              }, children: ccTextoAtual ? /* @__PURE__ */ jsx("div", { className: "w-full text-center px-4 py-2", style: {
                backgroundColor: "rgba(0,0,0,0.92)",
                borderBottom: "3px solid #00E676",
                borderTop: "1px solid rgba(0,230,118,0.2)"
              }, children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold leading-snug block", style: {
                fontSize: "14px",
                letterSpacing: "0.02em",
                textShadow: "0 1px 4px rgba(0,0,0,0.9)"
              }, children: ccTextoAtual }) }) : /* @__PURE__ */ jsxs("div", { className: "px-4 py-1.5 flex items-center gap-2", style: {
                backgroundColor: "rgba(0,18,6,0.93)",
                borderBottom: "3px solid #00E676",
                borderTop: "1px solid rgba(0,230,118,0.2)",
                width: "100%",
                justifyContent: "center"
              }, children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold uppercase", style: {
                  color: "#00E676",
                  fontSize: "12px",
                  letterSpacing: "0.14em"
                }, children: "CC — AGUARDANDO ÁUDIO..." })
              ] }) }),
              gcVisible && (gcLine1 || gcLine2) && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 animate-in slide-in-from-bottom duration-300", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded", children: [
                /* @__PURE__ */ jsx("div", { className: "w-1 bg-red-600 shrink-0" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-black/90 px-2 py-1.5 flex-1 min-w-0", children: [
                  gcLine1 && /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-[10px] uppercase tracking-wide leading-tight truncate", children: gcLine1 }),
                  gcLine2 && /* @__PURE__ */ jsx("div", { className: "text-zinc-400 text-[8px] uppercase tracking-widest truncate mt-0.5", children: gcLine2 })
                ] })
              ] }) }),
              tarjaVisible && /* @__PURE__ */ jsx("div", { className: "absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none", style: {
                left: `${tarjaX}%`,
                top: `${tarjaY}%`
              }, children: tarjaCustomPng ? /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "Tarja", style: {
                opacity: tarjaAlpha / 100,
                width: `${tarjaScaleX * 1.2}px`,
                height: `${tarjaScaleY * 0.4}px`,
                objectFit: "contain"
              } }) : /* @__PURE__ */ jsx("div", { className: "px-3 py-1 rounded-sm shadow-lg", style: {
                backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,35%,${tarjaAlpha / 100})`,
                borderLeft: `3px solid hsla(${tarjaHue},${tarjaSaturation}%,70%,0.9)`,
                fontFamily: tarjaFont,
                fontWeight: tarjaBold ? "bold" : "normal",
                fontStyle: tarjaItalic ? "italic" : "normal",
                fontSize: `${Math.round(tarjaScaleY * 0.12)}px`,
                color: `hsl(${tarjaHue},${tarjaSaturation}%,88%)`,
                whiteSpace: "nowrap",
                transform: `scaleX(${tarjaScaleX / 100})`,
                transformOrigin: "left center"
              }, children: tarjaText || "TARJA" }) }),
              meActiveFrame !== null && meFrames[meActiveFrame] && /* @__PURE__ */ jsx("img", { src: meFrames[meActiveFrame], alt: `Frame ${meActiveFrame + 1}`, className: "absolute inset-0 w-full h-full object-contain z-50 pointer-events-none" })
            ] }),
            pgmCamUrl && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1 px-1.5 py-1 rounded-lg border border-red-600/30", style: {
              backgroundColor: "#1a0a0a"
            }, children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setPgmCamMuted((m) => !m), title: pgmCamMuted ? "Reativar áudio da CAM" : "Mutar áudio da CAM", className: "text-zinc-400 hover:text-white transition-colors shrink-0", children: pgmCamMuted || pgmCamVolume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: pgmCamMuted ? 0 : pgmCamVolume, disabled: !pgmCamIsYoutube, onChange: (e) => {
                const v = Number(e.target.value);
                setPgmCamVolume(v);
                setPgmCamMuted(v === 0);
              }, className: "flex-1 h-1 accent-red-500 disabled:opacity-30", title: pgmCamIsYoutube ? "Volume da CAM (PGM)" : "Volume controlado pela plataforma de origem" }),
              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-zinc-500 w-8 text-right shrink-0", children: pgmCamMuted ? "MUDO" : `${pgmCamVolume}%` }),
              /* @__PURE__ */ jsxs("button", { onClick: handleCamOffAir, title: "Tirar CAM do ar (encerra vídeo e áudio)", className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-red-400 border border-red-700/50 hover:bg-red-600/20 transition-all active:scale-[0.97] shrink-0", children: [
                /* @__PURE__ */ jsx(PowerOff, { className: "h-2.5 w-2.5" }),
                " off"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5 mt-1.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[3px] text-[8px] font-mono font-bold text-zinc-600", children: [
                /* @__PURE__ */ jsx("span", { children: "L" }),
                /* @__PURE__ */ jsx("span", { children: "R" })
              ] }),
              /* @__PURE__ */ jsx("canvas", { ref: vuCanvasRef, width: 200, height: 16, className: "flex-1 rounded-sm", style: {
                imageRendering: "pixelated",
                height: "16px",
                width: "100%"
              } })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Youtube, { className: "h-3 w-3 text-red-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-red-500", children: multiviewActive ? "MULTIVIEW" : "YouTube" })
              ] }),
              youtubeVisible && /* @__PURE__ */ jsxs("button", { onClick: () => {
                setYoutubeVisible(false);
                setYoutubeUrl("");
                setYoutubeInput("");
              }, className: "text-[8px] font-bold uppercase text-zinc-600 hover:text-red-400 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" }),
                " Fechar"
              ] })
            ] }),
            multiviewActive ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1 aspect-video bg-black rounded-lg overflow-hidden border border-cyan-600/20", children: [1, 2, 3, 4].map((cam) => {
              const idx = cam - 1;
              const src = camSources[idx];
              const srcType = camSourceTypes[idx];
              const hasSrc = !!src;
              const isActive = activeCam === cam;
              const handleCamSelect = () => {
                setActiveCam(cam);
                sendCamToPreview(idx);
                if (pgmChannelRef.current?.readyState === 1) {
                  pgmChannelRef.current.send(JSON.stringify({
                    type: "cam_take",
                    cam
                  }));
                }
                toast.success(`CAM ${cam} → PREVIEW`);
              };
              const getEmbedUrl = (rawUrl) => buildCamEmbedUrl(rawUrl, {
                mute: true
              }).url;
              return /* @__PURE__ */ jsxs("div", { className: "relative bg-black flex items-center justify-center cursor-pointer transition-all duration-150 group", style: {
                border: isActive ? "2px solid #f97316" : "1px solid rgba(8,145,178,0.3)"
              }, onClick: handleCamSelect, onDoubleClick: handleCamSelect, children: [
                hasSrc && srcType === "file" && /* @__PURE__ */ jsx("video", { ref: (el) => {
                  camVideoRefs.current[idx] = el;
                }, src: src ?? void 0, className: "absolute inset-0 w-full h-full object-cover", muted: true, loop: true, autoPlay: true, playsInline: true, preload: "auto" }),
                hasSrc && srcType === "url" && /* @__PURE__ */ jsx("iframe", { src: getEmbedUrl(src), className: "absolute inset-0 w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, style: {
                  border: "none",
                  pointerEvents: "none"
                } }, src),
                !hasSrc && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5 text-zinc-700 group-hover:text-zinc-500 transition-colors px-2 text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold", children: [
                    "CAM ",
                    cam
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-[7px] opacity-60 leading-tight", children: "📂 arquivo ou 🔗 link" })
                ] }),
                isActive && /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-1 bg-orange-500 text-black text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: "PVW" }),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-1 right-1 z-20 flex gap-0.5", onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxs("label", { className: "bg-black/80 border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-300 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all", title: "Carregar arquivo de vídeo", children: [
                    "📂",
                    /* @__PURE__ */ jsx("input", { type: "file", accept: "video/*", className: "hidden", onChange: (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setCamSources((prev) => {
                        const n = [...prev];
                        n[idx] = url;
                        return n;
                      });
                      setCamSourceTypes((prev) => {
                        const n = [...prev];
                        n[idx] = "file";
                        return n;
                      });
                      e.target.value = "";
                    } })
                  ] }),
                  /* @__PURE__ */ jsx("button", { className: "bg-black/80 border border-zinc-600 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all", title: "Colar link (YouTube, Instagram, Facebook...)", onClick: (e) => {
                    e.stopPropagation();
                    const link = window.prompt(`CAM ${cam} — cole o link (YouTube, Instagram, Facebook, etc):`);
                    if (!link?.trim()) return;
                    setCamSources((prev) => {
                      const n = [...prev];
                      n[idx] = link.trim();
                      return n;
                    });
                    setCamSourceTypes((prev) => {
                      const n = [...prev];
                      n[idx] = "url";
                      return n;
                    });
                  }, children: "🔗" }),
                  hasSrc && /* @__PURE__ */ jsx("button", { className: "bg-black/80 border border-red-800 text-red-500 hover:text-red-300 hover:border-red-400 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all", title: "Remover fonte", onClick: (e) => {
                    e.stopPropagation();
                    setCamSources((prev) => {
                      const n = [...prev];
                      n[idx] = null;
                      return n;
                    });
                    setCamSourceTypes((prev) => {
                      const n = [...prev];
                      n[idx] = null;
                      return n;
                    });
                    if (activeCam === cam) {
                      setActiveCam(null);
                      setIsCamPreview(false);
                      setPreviewCamIdx(null);
                    }
                  }, children: "✕" })
                ] })
              ] }, cam);
            }) }) : /* @__PURE__ */ jsx("div", { className: "relative aspect-video bg-black rounded-lg overflow-hidden border border-red-600/20", style: {
              boxShadow: youtubeVisible ? "0 0 20px rgba(239,68,68,0.15)" : "none"
            }, children: youtubeVisible && youtubeUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("iframe", { src: youtubeUrl, className: "absolute inset-0 w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, title: "YouTube Monitor", style: {
                border: "none"
              } }, youtubeUrl),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-700/90 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase pointer-events-none z-10 animate-pulse", children: [
                /* @__PURE__ */ jsx(Youtube, { className: "h-2.5 w-2.5 text-white" }),
                " AO VIVO"
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
              /* @__PURE__ */ jsx(Youtube, { className: "h-7 w-7" }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest text-center px-3", children: "Cole o link e clique em Abrir" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
              /* @__PURE__ */ jsx("input", { type: "text", value: youtubeInput, onChange: (e) => setYoutubeInput(e.target.value), onKeyDown: (e) => {
                if (e.key === "Enter") {
                  if (multiviewActive && activeCam !== null) {
                    const idx = activeCam - 1;
                    setCamSources((prev) => {
                      const n = [...prev];
                      n[idx] = youtubeInput.trim();
                      return n;
                    });
                    setCamSourceTypes((prev) => {
                      const n = [...prev];
                      n[idx] = "url";
                      return n;
                    });
                    toast.success(`Link → CAM ${activeCam}`);
                    setYoutubeInput("");
                  } else {
                    const id = extractYoutubeId(youtubeInput);
                    if (id) {
                      setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                      setYoutubeVisible(true);
                    } else toast.error("Link do YouTube inválido.");
                  }
                }
              }, placeholder: multiviewActive && activeCam !== null ? `Link para CAM ${activeCam}...` : "youtube.com/watch?v=...", className: "flex-1 px-2 py-1.5 rounded-lg border text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all", style: {
                backgroundColor: "#1a1a1a",
                borderColor: multiviewActive && activeCam !== null ? "#f97316" : "#2a2a2a"
              } }),
              /* @__PURE__ */ jsxs("button", { onClick: () => {
                if (multiviewActive && activeCam !== null) {
                  const idx = activeCam - 1;
                  const link = youtubeInput.trim();
                  if (!link) return;
                  setCamSources((prev) => {
                    const n = [...prev];
                    n[idx] = link;
                    return n;
                  });
                  setCamSourceTypes((prev) => {
                    const n = [...prev];
                    n[idx] = "url";
                    return n;
                  });
                  toast.success(`Link → CAM ${activeCam}`);
                  setYoutubeInput("");
                } else {
                  const id = extractYoutubeId(youtubeInput);
                  if (id) {
                    setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                    setYoutubeVisible(true);
                  } else toast.error("Link do YouTube inválido.");
                }
              }, className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-red-600/50 transition-all active:scale-[0.98] shrink-0", style: {
                backgroundColor: multiviewActive && activeCam !== null ? "#f97316" : "#ef4444",
                borderColor: multiviewActive && activeCam !== null ? "#fb923c" : void 0
              }, children: [
                /* @__PURE__ */ jsx(Play, { className: "h-2.5 w-2.5" }),
                multiviewActive && activeCam !== null ? `CAM ${activeCam}` : "Abrir"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => {
                setMultiviewActive(!multiviewActive);
                if (multiviewActive) {
                  setActiveCam(null);
                  setIsCamPreview(false);
                  setPreviewCamIdx(null);
                }
              }, className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-cyan-600/50 transition-all active:scale-[0.98] shrink-0", style: {
                backgroundColor: "#0891b2"
              }, title: "4 Câmeras", children: [
                /* @__PURE__ */ jsx(Grid2X2, { className: "h-2.5 w-2.5" }),
                "Multi"
              ] })
            ] }),
            multiviewActive && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 mt-1", children: [1, 2, 3, 4].map((cam) => /* @__PURE__ */ jsxs("button", { onClick: () => {
              setActiveCam(cam);
              sendCamToPreview(cam - 1);
              if (pgmChannelRef.current?.readyState === 1) {
                pgmChannelRef.current.send(JSON.stringify({
                  type: "cam_take",
                  cam
                }));
              }
              toast.success(`CAM ${cam} → PREVIEW`);
            }, className: "flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all active:scale-[0.97]", style: {
              backgroundColor: activeCam === cam ? "#f97316" : "#00E676",
              borderColor: activeCam === cam ? "#fb923c" : "#00E67650",
              color: "#000"
            }, children: [
              "CAM ",
              cam
            ] }, cam)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[auto_1fr_auto_1fr_auto_auto] gap-0 flex-1 min-h-0", children: [
          /* @__PURE__ */ jsxs("div", { className: cn("border rounded-xl p-3 flex flex-col overflow-hidden transition-all duration-200", dragOverLauda ? "border-pink-500" : ""), style: {
            backgroundColor: "#1a1a1a",
            borderColor: dragOverLauda ? "#ec4899" : "#2a2a2a",
            boxShadow: dragOverLauda ? "0 0 16px rgba(236,72,153,0.2)" : "none"
          }, onDragOver: (e) => {
            e.preventDefault();
            setDragOverLauda(true);
          }, onDragLeave: () => setDragOverLauda(false), onDrop: (e) => {
            e.preventDefault();
            const idx = Number(e.dataTransfer.getData("item_index"));
            const droppedItem = items[idx];
            if (droppedItem) handleDropNaLauda(droppedItem);
            else setDragOverLauda(false);
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "pb-2 border-b-2 border-pink-500 mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-pink-400", children: "📋 LAUDA" }),
              dragOverLauda && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-pink-400 animate-pulse ml-1", children: "⬇ Solte aqui" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full ml-auto border border-pink-500/20", children: [
                materiaAtual?.itensLauda?.length ?? 0,
                " ITENS"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 overflow-y-auto flex-1", children: materiaAtual?.itensLauda && materiaAtual.itensLauda.length > 0 ? materiaAtual.itensLauda.map((item, idx) => {
              let bgColor = "bg-zinc-700";
              let borderColor = "border-zinc-600";
              let textColor = "text-white";
              let hoverColor = "hover:bg-zinc-600";
              let icon = "📌";
              switch (item.tipo) {
                case "SONORA":
                  bgColor = "bg-emerald-600";
                  borderColor = "border-emerald-500";
                  hoverColor = "hover:bg-emerald-700";
                  icon = "🎤";
                  break;
                case "PASSAGEM":
                  bgColor = "bg-amber-600";
                  borderColor = "border-amber-500";
                  hoverColor = "hover:bg-amber-700";
                  icon = "🎥";
                  break;
                case "PRODUÇÃO":
                  bgColor = "bg-orange-600";
                  borderColor = "border-orange-500";
                  hoverColor = "hover:bg-orange-700";
                  icon = "🎬";
                  break;
                case "ED_TEXTO":
                  bgColor = "bg-blue-600";
                  borderColor = "border-blue-500";
                  hoverColor = "hover:bg-blue-700";
                  icon = "📝";
                  break;
                case "ED_IMAGEM":
                  bgColor = "bg-pink-600";
                  borderColor = "border-pink-500";
                  hoverColor = "hover:bg-pink-700";
                  icon = "🖼️";
                  break;
                case "REPÓRTER":
                  bgColor = "bg-cyan-600";
                  borderColor = "border-cyan-500";
                  hoverColor = "hover:bg-cyan-700";
                  icon = "🎙️";
                  break;
                case "IMAGENS":
                  bgColor = "bg-purple-600";
                  borderColor = "border-purple-500";
                  hoverColor = "hover:bg-purple-700";
                  icon = "🎞️";
                  break;
              }
              return /* @__PURE__ */ jsxs("button", { draggable: true, onDragStart: (e) => {
                e.dataTransfer.setData("drag_source", "lauda");
                e.dataTransfer.setData("lauda_index", String(idx));
                e.dataTransfer.effectAllowed = "move";
                setDraggedFromLauda(item);
                setDraggedLaudaIndex(idx);
              }, onDragOver: (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }, onDrop: (e) => {
                e.preventDefault();
                const source = e.dataTransfer.getData("drag_source");
                if (source === "lauda") {
                  const fromIdx = Number(e.dataTransfer.getData("lauda_index"));
                  if (fromIdx !== idx) handleReorderLauda(fromIdx, idx);
                }
                setDraggedFromLauda(null);
                setDraggedLaudaIndex(null);
              }, onDragEnd: () => {
                setDraggedFromLauda(null);
                setDraggedLaudaIndex(null);
              }, onClick: () => {
                const valor = item.valor || "";
                const novoCredito = {
                  line1: "",
                  line2: ""
                };
                if ((item.tipo === "SONORA" || item.tipo === "PASSAGEM") && valor.includes(" - ")) {
                  const partes = valor.split(" - ");
                  novoCredito.line1 = partes[0]?.trim() || valor;
                  novoCredito.line2 = partes[1]?.trim() || "";
                } else {
                  novoCredito.line1 = valor;
                  novoCredito.line2 = item.tipo?.replace("_", " ") || "";
                }
                setGcCreditsQueue((prev) => {
                  const novaFila = [...prev, novoCredito];
                  if (novaFila.length === 1) {
                    setGcLine1(novoCredito.line1);
                    setGcLine2(novoCredito.line2);
                  }
                  return novaFila;
                });
                if (materiaAtual?.materia_id) {
                  setRemovedLaudaOrdens((prev) => {
                    const novoSet = new Set(prev[materiaAtual.materia_id] || []);
                    novoSet.add(item.ordem);
                    return {
                      ...prev,
                      [materiaAtual.materia_id]: novoSet
                    };
                  });
                  setMateriaAtual((prev) => {
                    if (!prev) return null;
                    const novaLauda = prev.itensLauda.filter((it) => it.ordem !== item.ordem);
                    return {
                      ...prev,
                      itensLauda: novaLauda
                    };
                  });
                }
                toast.success(`"${valor}" → GC`);
              }, className: cn(`${bgColor} ${hoverColor} border ${borderColor} rounded-lg px-2.5 py-2 transition-all flex items-center justify-between gap-2 min-w-0 cursor-grab active:cursor-grabbing font-bold text-xs uppercase tracking-wide`, draggedLaudaIndex === idx && "opacity-50 scale-95", `${textColor} shadow-md hover:shadow-lg`), title: `Clique para enviar ao GC: ${item.valor}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: icon }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[8px] font-black opacity-80 leading-none", children: [
                      "[",
                      item.tipo.replace("_", ". "),
                      "]"
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold truncate text-white", children: item.valor })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[9px] font-black bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10", children: "GC" })
              ] }, idx);
            }) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-2 text-zinc-700 border-2 border-dashed border-white/5 rounded-xl", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🎬" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-center px-3", children: "Arraste uma matéria da fila aqui" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-4 flex flex-col gap-3 w-[380px]", style: {
            backgroundColor: "#1a1a1a",
            borderColor: "#2a2a2a"
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { ref: progressTimeRef, className: "text-[9px] font-mono text-zinc-600 w-8 text-right tabular-nums", children: formatDuration(pgmCurrentTime) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group", onClick: handleSeek, children: /* @__PURE__ */ jsx("div", { ref: progressBarRef, className: "h-full rounded-full transition-none relative", style: {
                width: `${pgmProgress}%`,
                backgroundColor: "#ef4444"
              }, children: /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" }) }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 w-8 tabular-nums", children: formatDuration(pgmFile?.duration ?? null) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-zinc-600 truncate", children: pgmFile?.name.replace(".mp4", "") || "Nenhum arquivo no PGM" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ jsxs("button", { onClick: handleCue, title: "CUE", className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group", style: {
                backgroundColor: "#1f1f1f"
              }, children: [
                /* @__PURE__ */ jsx(SkipBack, { className: "h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400", children: "CUE" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleStop, title: "STOP", className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-red-500/30 transition-all active:scale-[0.98] group", style: {
                backgroundColor: "#1f1f1f"
              }, children: [
                /* @__PURE__ */ jsx(Square, { className: "h-4 w-4 text-zinc-500 group-hover:text-red-500 transition-colors" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-400", children: "STOP" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handlePlayPausePgm, title: isPlaying ? "PAUSE" : "PLAY", className: cn("flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border transition-all active:scale-[0.98]", isPlaying ? "border-yellow-500/30 text-yellow-400" : "text-black font-bold border-transparent"), style: {
                backgroundColor: isPlaying ? "#78350f20" : "#00E676"
              }, children: [
                isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4 text-yellow-400" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 text-black" }),
                /* @__PURE__ */ jsx("span", { className: cn("text-[8px] font-bold uppercase tracking-widest", isPlaying ? "text-yellow-400" : "text-black"), children: isPlaying ? "PAUSE" : "PLAY" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleTake, title: "TAKE", className: "flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all active:scale-[0.98]", style: {
                backgroundColor: "#00E676",
                borderColor: "#00E67650"
              }, children: [
                /* @__PURE__ */ jsx(MonitorPlay, { className: "h-4 w-4 text-black" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-black", children: "TAKE" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleSkip, title: "SKIP", className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group", style: {
                backgroundColor: "#1f1f1f"
              }, children: [
                /* @__PURE__ */ jsx(SkipForward, { className: "h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400", children: "SKIP" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t pt-3 flex flex-col gap-2", style: {
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1", children: [
                /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400", children: "⚙ TRANSIÇÃO" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold", style: {
                  color: transValue > 0 ? "#facc15" : "#52525b"
                }, children: [
                  transValue,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative flex items-center w-full rounded-xl overflow-hidden", style: {
                height: 48,
                cursor: "ew-resize",
                backgroundColor: "#0a0a0a",
                border: "1px solid #2a2a2a"
              }, onMouseDown: (e) => {
                handleTransition();
                const rect = e.currentTarget.getBoundingClientRect();
                const onMove = (ev) => {
                  const pct = Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width * 100));
                  setTransValue(Math.round(pct));
                  applyTransOpacity(Math.round(pct), activePlayer);
                };
                const onUp = (ev) => {
                  const pct = Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width * 100));
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                  if (pct >= 95) {
                    handleTransComplete();
                  } else {
                    setTransValue(0);
                    setPlayerAOpacity(activePlayer === "A" ? 1 : 0);
                    setPlayerAZ(activePlayer === "A" ? 10 : 0);
                    setPlayerBOpacity(activePlayer === "B" ? 1 : 0);
                    setPlayerBZ(activePlayer === "B" ? 10 : 0);
                    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                    if (inactiveEl) {
                      inactiveEl.pause();
                      inactiveEl.src = "";
                    }
                  }
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }, onTouchStart: (e) => {
                handleTransition();
                const rect = e.currentTarget.getBoundingClientRect();
                const onMove = (ev) => {
                  const touch = ev.touches[0];
                  const pct = Math.min(100, Math.max(0, (touch.clientX - rect.left) / rect.width * 100));
                  setTransValue(Math.round(pct));
                  applyTransOpacity(Math.round(pct), activePlayer);
                };
                const onEnd = (ev) => {
                  const touch = ev.changedTouches[0];
                  const pct = Math.min(100, Math.max(0, (touch.clientX - rect.left) / rect.width * 100));
                  window.removeEventListener("touchmove", onMove);
                  window.removeEventListener("touchend", onEnd);
                  if (pct >= 95) {
                    handleTransComplete();
                  } else {
                    setTransValue(0);
                    setPlayerAOpacity(activePlayer === "A" ? 1 : 0);
                    setPlayerAZ(activePlayer === "A" ? 10 : 0);
                    setPlayerBOpacity(activePlayer === "B" ? 1 : 0);
                    setPlayerBZ(activePlayer === "B" ? 10 : 0);
                    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                    if (inactiveEl) {
                      inactiveEl.pause();
                      inactiveEl.src = "";
                    }
                  }
                };
                window.addEventListener("touchmove", onMove);
                window.addEventListener("touchend", onEnd);
              }, title: "Arraste para fazer fusão — solte no fim para confirmar", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0", style: {
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 3,
                  background: "#27272a"
                } }),
                /* @__PURE__ */ jsx("div", { className: "absolute", style: {
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 3,
                  width: `${transValue}%`,
                  background: "linear-gradient(90deg, #3b82f6, #00E676)",
                  boxShadow: transValue > 0 ? "0 0 8px rgba(0,230,118,0.6)" : "none"
                } }),
                [25, 50, 75].map((tick) => /* @__PURE__ */ jsx("div", { className: "absolute", style: {
                  left: `${tick}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 1,
                  height: 14,
                  background: "rgba(255,255,255,0.12)"
                } }, tick)),
                /* @__PURE__ */ jsx("div", { className: "absolute rounded-full flex items-center justify-center transition-shadow", style: {
                  left: `${transValue}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 34,
                  height: 34,
                  zIndex: 10,
                  background: transValue > 0 ? "radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)" : "radial-gradient(circle at 35% 35%, #52525b, #27272a)",
                  boxShadow: transValue > 0 ? "0 0 16px rgba(37,99,235,0.7)" : "0 2px 6px rgba(0,0,0,0.5)",
                  border: "2px solid rgba(255,255,255,0.15)"
                }, children: /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 text-white fill-white" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-bold", style: {
                  color: "#3b82f6"
                }, children: "PGM" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-bold text-zinc-600", children: "PVW" })
              ] }),
              transValue > 0 && /* @__PURE__ */ jsxs("p", { className: "text-center text-[9px] font-mono", style: {
                color: "#00E676"
              }, children: [
                "Transição ativa: ",
                transValue,
                "% — Solte em 95%+ para confirmar"
              ] })
            ] })
          ] }),
          materiaAtual && sonorasTimeline.length > 0 && pgmFile?.duration && /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-2 mt-0", style: {
            backgroundColor: "#1a1a1a",
            borderColor: "#2a2a2a"
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 border-b", style: {
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", style: {
                color: "#00E676"
              }, children: "⏱ TIMELINE VT" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-600", children: [
                formatarTimecode(Math.round(pgmCurrentTime)),
                " / ",
                formatarTimecode(Math.round(pgmFile.duration))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative h-5 rounded-full overflow-hidden", style: {
              backgroundColor: "#0a0a0a",
              border: "1px solid #2a2a2a"
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 rounded-full transition-none", style: {
                width: `${pgmCurrentTime / pgmFile.duration * 100}%`,
                backgroundColor: isPlaying ? "#ef4444" : "#3f3f46"
              } }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-0.5", style: {
                left: `${pgmCurrentTime / pgmFile.duration * 100}%`,
                backgroundColor: "#ffffff",
                boxShadow: "0 0 4px rgba(255,255,255,0.8)"
              } }),
              sonorasTimeline.map((cr, idx) => {
                const pct = Math.min(99, cr.timecodeInicio / pgmFile.duration * 100);
                const jaPAssou = pgmCurrentTime >= cr.timecodeInicio;
                return /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-0.5 transition-colors", style: {
                  left: `${pct}%`,
                  backgroundColor: jaPAssou ? "#22c55e" : "#facc15",
                  opacity: jaPAssou ? 0.5 : 1
                }, title: `${cr.nome} (${cr.funcao}) — ${formatarTimecode(cr.timecodeInicio)}` }, idx);
              })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 max-h-28 overflow-y-auto", children: sonorasTimeline.map((cr, idx) => {
              const jaPassou = pgmCurrentTime >= cr.timecodeInicio + cr.duracao;
              const ativo = pgmCurrentTime >= cr.timecodeInicio && pgmCurrentTime < cr.timecodeInicio + cr.duracao;
              const proximo = !jaPassou && !ativo && sonorasTimeline.findIndex((c) => !(pgmCurrentTime >= c.timecodeInicio + c.duracao)) === idx;
              return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-1 rounded-lg transition-all", style: {
                backgroundColor: ativo ? "#00E67615" : jaPassou ? "#1a1a1a" : "#252525",
                border: `1px solid ${ativo ? "#00E676" : jaPassou ? "#2a2a2a" : proximo ? "#facc1550" : "#2a2a2a"}`
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full shrink-0", style: {
                  backgroundColor: ativo ? "#00E676" : jaPassou ? "#3f3f46" : "#facc15"
                } }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[9px] font-bold text-white truncate", children: cr.nome }),
                  /* @__PURE__ */ jsx("div", { className: "text-[8px] text-zinc-500 truncate", children: cr.funcao })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono shrink-0", style: {
                  color: ativo ? "#00E676" : "#52525b"
                }, children: formatarTimecode(cr.timecodeInicio) }),
                ativo && /* @__PURE__ */ jsx("span", { className: "text-[7px] font-black uppercase tracking-widest animate-pulse shrink-0", style: {
                  color: "#00E676"
                }, children: "NO AR" }),
                jaPassou && /* @__PURE__ */ jsx("span", { className: "text-[7px] font-bold uppercase tracking-widest shrink-0 text-zinc-600", children: "✓" })
              ] }, idx);
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 w-[480px] overflow-y-auto", style: {
            backgroundColor: "#121212"
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-3", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Type, { className: "h-3 w-3 text-zinc-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "GC — Gerador" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[2fr_1fr] gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Linha 1 — Nome" }),
                    /* @__PURE__ */ jsx("input", { type: "text", value: gcLine1, onChange: (e) => setGcLine1(e.target.value), placeholder: "Nome / Título", className: "w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all", style: {
                      backgroundColor: "#252525",
                      borderColor: "#333"
                    } })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Linha 2 — Cargo" }),
                    /* @__PURE__ */ jsx("input", { type: "text", value: gcLine2, onChange: (e) => setGcLine2(e.target.value), placeholder: "Cargo / Informação", className: "w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all", style: {
                      backgroundColor: "#252525",
                      borderColor: "#333"
                    } })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600 shrink-0", children: "Dur.:" }),
                    /* @__PURE__ */ jsxs("select", { value: gcDuration, onChange: (e) => setGcDuration(Number(e.target.value)), className: "flex-1 border rounded px-1.5 py-1 text-[9px] font-mono text-zinc-200 focus:outline-none transition-all", style: {
                      backgroundColor: "#252525",
                      borderColor: "#333"
                    }, children: [
                      /* @__PURE__ */ jsx("option", { value: 0, children: "Manual" }),
                      /* @__PURE__ */ jsx("option", { value: 3, children: "3s" }),
                      /* @__PURE__ */ jsx("option", { value: 5, children: "5s" }),
                      /* @__PURE__ */ jsx("option", { value: 10, children: "10s" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-video bg-black rounded border border-zinc-800 overflow-hidden", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-zinc-800 text-[6px] uppercase tracking-widest", children: "GC Prev" }),
                  gcLine1 || gcLine2 ? /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 px-0.5 pb-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-red-600 shrink-0" }),
                    /* @__PURE__ */ jsxs("div", { className: "bg-black/90 px-1 py-0.5 flex-1 min-w-0", children: [
                      gcLine1 && /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-[6px] uppercase truncate", children: gcLine1 }),
                      gcLine2 && /* @__PURE__ */ jsx("div", { className: "text-zinc-400 text-[5px] uppercase truncate", children: gcLine2 })
                    ] })
                  ] }) }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                /* @__PURE__ */ jsx("button", { onClick: handleGcTakeQueue, className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98]", style: {
                  backgroundColor: "#00E67620",
                  borderColor: "#00E67640",
                  color: "#00E676"
                }, children: "GC TAKE" }),
                /* @__PURE__ */ jsx("button", { onClick: handleGcClear, className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-red-500/30 text-[9px] font-bold uppercase tracking-widest text-red-400 transition-all active:scale-[0.98]", style: {
                  backgroundColor: "#ef444420"
                }, children: "GC CLR" }),
                /* @__PURE__ */ jsx("button", { onClick: handleGcSkip, disabled: gcCreditsQueue.length === 0, className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-600 text-[9px] font-bold uppercase tracking-widest text-zinc-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed", style: {
                  backgroundColor: "#252525"
                }, children: "PULAR" }),
                /* @__PURE__ */ jsxs("button", { onClick: () => setGcPanelOpen(true), className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]", style: {
                  backgroundColor: "#7c3aed20",
                  borderColor: "#7c3aed40",
                  color: "#c084fc"
                }, children: [
                  /* @__PURE__ */ jsx(Sliders, { className: "h-3 w-3" }),
                  "Personalizar"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t pt-2 flex flex-col gap-1.5", style: {
                borderColor: "#2a2a2a"
              }, children: [
                /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Presets Rápidos:" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1", children: Object.keys(gcPresets).map((presetName) => /* @__PURE__ */ jsx("button", { onClick: () => handleApplyPreset(presetName), className: "w-full px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all active:scale-95", style: {
                  backgroundColor: "#252525"
                }, children: presetName }, presetName)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-3", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "⚙️ AJUSTES & EFEITOS" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setTarjaPanelOpen((v) => !v), className: cn("flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]", tarjaPanelOpen ? "border-zinc-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"), style: {
                  backgroundColor: tarjaPanelOpen ? "#3f3f46" : "#252525"
                }, title: "Abrir controles da tarja", children: "🎞 TARJA" }),
                /* @__PURE__ */ jsx("button", { onClick: () => {
                  const next = !tarjaVisible;
                  setTarjaVisible(next);
                  pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
                    type: next ? "tarja_show" : "tarja_hide"
                  }));
                }, className: cn("flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"), style: {
                  backgroundColor: tarjaVisible ? "#00E67620" : "#252525",
                  borderColor: tarjaVisible ? "#00E67640" : "#3f3f46",
                  color: tarjaVisible ? "#00E676" : "#71717a"
                }, children: tarjaVisible ? "● TARJA ON" : "○ TARJA OFF" }),
                /* @__PURE__ */ jsx("button", { disabled: true, className: "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-zinc-800 text-[9px] font-bold text-zinc-700 transition-all opacity-40 cursor-default", style: {
                  backgroundColor: "#1a1a1a"
                }, children: "—" }),
                /* @__PURE__ */ jsx("button", { onClick: () => {
                  const now = Date.now();
                  if (now - lastClickTime < 300) {
                    if (materiaAtual?.materia_id) {
                      setMateriaAtual({
                        ...materiaAtual,
                        itensLauda: []
                      });
                      toast.success("Lauda limpa!");
                    }
                    setDoubleClickCount(0);
                    setLastClickTime(0);
                  } else {
                    setDoubleClickCount(1);
                    setLastClickTime(now);
                  }
                }, className: "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-red-500/20 text-[9px] font-bold uppercase text-red-400 transition-all active:scale-[0.98]", style: {
                  backgroundColor: "#7f1d1d30"
                }, title: "Clique 2x para deletar toda a lauda", children: "🗑️ ERASE" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-2", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "🖼️ FRAMES & OVERLAY" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]", children: [0, 1, 2, 3].map((id) => /* @__PURE__ */ jsxs("button", { onClick: () => handleMeFrameClick(id), className: cn("aspect-square bg-[#121212] border-2 rounded flex flex-col items-center justify-center transition-all group overflow-hidden relative", meActiveFrame === id ? "border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.5)]" : "border-[#2a2a2a] hover:border-[#00E676]"), title: meFrames[id] ? `FRAME ${id + 1}` : "Carregar PNG", children: [
                meFrames[id] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("img", { src: meFrames[id], alt: `Frame ${id + 1}`, className: "absolute inset-0 w-full h-full object-contain p-1" }),
                  /* @__PURE__ */ jsx("button", { onClick: (e) => handleMeFrameClear(id, e), title: "Remover imagem", className: "absolute top-0.5 right-0.5 z-20 flex items-center justify-center w-4 h-4 rounded-full bg-black/70 border border-zinc-600 text-zinc-400 hover:text-red-400 hover:border-red-400 transition-all", children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" }) })
                ] }) : /* @__PURE__ */ jsx(Image, { className: "text-slate-600 group-hover:text-[#00E676]", size: 18 }),
                /* @__PURE__ */ jsxs("span", { className: cn("text-[9px] mt-1 z-10 px-1 rounded", meActiveFrame === id ? "text-[#00E676] font-bold bg-black/60" : "text-slate-500 bg-black/60"), children: [
                  "FRAME ",
                  id + 1
                ] }),
                /* @__PURE__ */ jsx("input", { ref: (el) => {
                  meFileInputRefs.current[id] = el;
                }, type: "file", accept: "image/png", className: "hidden", onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMeFrameLoad(id, file);
                  e.target.value = "";
                } })
              ] }, id)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "pb-2 border-b-2 border-zinc-700 mb-3 flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-600", children: "— VAGA" }) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/5 rounded-xl", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-center px-3 text-zinc-700", children: "Disponível" }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl" }) }),
            /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a"
            }, children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl" }) })
          ] })
        ] }),
        tarjaPanelOpen && /* @__PURE__ */ jsxs("div", { className: "fixed z-[9999] border rounded-2xl shadow-2xl w-80 select-none", style: {
          left: tarjaPanelPos.x,
          top: tarjaPanelPos.y,
          backgroundColor: "#1a1a1a",
          borderColor: "#3a3a3a"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 rounded-t-2xl cursor-grab active:cursor-grabbing border-b", style: {
            backgroundColor: "#252525",
            borderColor: "#333"
          }, onMouseDown: (e) => {
            tarjaDragRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              startPX: tarjaPanelPos.x,
              startPY: tarjaPanelPos.y
            };
            const onMove = (ev) => {
              if (!tarjaDragRef.current) return;
              setTarjaPanelPos({
                x: tarjaDragRef.current.startPX + ev.clientX - tarjaDragRef.current.startX,
                y: tarjaDragRef.current.startPY + ev.clientY - tarjaDragRef.current.startY
              });
            };
            const onUp = () => {
              tarjaDragRef.current = null;
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }, children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-300", children: "🎞 Controles da Tarja" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => {
                const next = !tarjaVisible;
                setTarjaVisible(next);
                pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
                  type: next ? "tarja_show" : "tarja_hide"
                }));
              }, className: "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all", style: {
                backgroundColor: tarjaVisible ? "#00E67620" : "#252525",
                borderColor: tarjaVisible ? "#00E67640" : "#3f3f46",
                color: tarjaVisible ? "#00E676" : "#71717a"
              }, children: tarjaVisible ? "● ON" : "○ OFF" }),
              /* @__PURE__ */ jsx("button", { onClick: () => setTarjaPanelOpen(false), className: "text-zinc-500 hover:text-red-400 font-bold transition-colors", children: "✕" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Caractere / Texto" }),
              /* @__PURE__ */ jsx("input", { type: "text", value: tarjaText, onChange: (e) => setTarjaText(e.target.value), placeholder: "Nome da tarja...", className: "w-full border rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all", style: {
                backgroundColor: "#252525",
                borderColor: "#3a3a3a"
              } }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsxs("select", { value: tarjaFont, onChange: (e) => setTarjaFont(e.target.value), className: "flex-1 border rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none transition-all", style: {
                  backgroundColor: "#252525",
                  borderColor: "#3a3a3a"
                }, children: [
                  /* @__PURE__ */ jsx("option", { value: "sans-serif", children: "Sans-Serif" }),
                  /* @__PURE__ */ jsx("option", { value: "serif", children: "Serif" }),
                  /* @__PURE__ */ jsx("option", { value: "monospace", children: "Monospace" }),
                  /* @__PURE__ */ jsx("option", { value: "Arial, sans-serif", children: "Arial" }),
                  /* @__PURE__ */ jsx("option", { value: "'Times New Roman', serif", children: "Times New Roman" }),
                  /* @__PURE__ */ jsx("option", { value: "'Courier New', monospace", children: "Courier New" }),
                  /* @__PURE__ */ jsx("option", { value: "Georgia, serif", children: "Georgia" }),
                  /* @__PURE__ */ jsx("option", { value: "Impact, sans-serif", children: "Impact" }),
                  /* @__PURE__ */ jsx("option", { value: "Verdana, sans-serif", children: "Verdana" })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setTarjaBold((v) => !v), className: "px-3 py-1.5 rounded-lg border text-[11px] font-black tracking-widest transition-all", style: {
                  backgroundColor: tarjaBold ? "#00E67620" : "#252525",
                  borderColor: tarjaBold ? "#00E67640" : "#3a3a3a",
                  color: tarjaBold ? "#00E676" : "#71717a"
                }, children: "B" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setTarjaItalic((v) => !v), className: "px-3 py-1.5 rounded-lg border text-[11px] italic font-bold tracking-widest transition-all", style: {
                  backgroundColor: tarjaItalic ? "#00E67620" : "#252525",
                  borderColor: tarjaItalic ? "#00E67640" : "#3a3a3a",
                  color: tarjaItalic ? "#00E676" : "#71717a"
                }, children: "I" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full px-3 py-2 rounded-lg border text-center truncate text-[13px]", style: {
                backgroundColor: "#0a0a0a",
                borderColor: "#2a2a2a",
                fontFamily: tarjaFont,
                fontWeight: tarjaBold ? "bold" : "normal",
                fontStyle: tarjaItalic ? "italic" : "normal",
                color: `hsl(${tarjaHue}, ${tarjaSaturation}%, 80%)`
              }, children: tarjaText || "Prévia do texto" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Cor da Tarja" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Hue" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 360, value: tarjaHue, onChange: (e) => setTarjaHue(Number(e.target.value)), className: "flex-1 h-1.5 accent-pink-500", style: {
                  background: `linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))`
                } }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaHue,
                  "°"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Saturação" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: tarjaSaturation, onChange: (e) => setTarjaSaturation(Number(e.target.value)), className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaSaturation,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full h-5 rounded-md border border-zinc-700", style: {
                backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,40%,${tarjaAlpha / 100})`
              } })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Opacidade (Alpha)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: tarjaAlpha, onChange: (e) => setTarjaAlpha(Number(e.target.value)), className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaAlpha,
                  "%"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Escala" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setTarjaScaleLock((v) => !v), className: "flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all", style: {
                  backgroundColor: tarjaScaleLock ? "#00E67620" : "#252525",
                  borderColor: tarjaScaleLock ? "#00E67450" : "#3f3f46",
                  color: tarjaScaleLock ? "#00E676" : "#71717a"
                }, children: tarjaScaleLock ? "🔒 LOCK" : "🔓 FREE" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Largura X" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 10, max: 400, value: tarjaScaleX, onChange: (e) => {
                  const v = Number(e.target.value);
                  if (tarjaScaleLock) {
                    setTarjaScaleX(v);
                    setTarjaScaleY(v);
                  } else setTarjaScaleX(v);
                }, className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaScaleX,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Altura Y" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 10, max: 400, value: tarjaScaleY, onChange: (e) => {
                  const v = Number(e.target.value);
                  if (tarjaScaleLock) {
                    setTarjaScaleX(v);
                    setTarjaScaleY(v);
                  } else setTarjaScaleY(v);
                }, className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaScaleY,
                  "%"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Posição na Tela" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "X (horiz.)" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: tarjaX, onChange: (e) => setTarjaX(Number(e.target.value)), className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaX,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Y (vert.)" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: tarjaY, onChange: (e) => setTarjaY(Number(e.target.value)), className: "flex-1 h-1.5 accent-pink-500" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                  tarjaY,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "relative w-full h-14 rounded-lg border border-zinc-700 overflow-hidden", style: {
                backgroundColor: "#252525"
              }, children: /* @__PURE__ */ jsx("div", { className: "absolute w-2.5 h-2.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-75", style: {
                left: `${tarjaX}%`,
                top: `${tarjaY}%`,
                backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,50%,0.8)`
              } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-zinc-700 pt-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "PNG Personalizado" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => tarjaFileInputRef.current?.click(), className: "flex-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest text-zinc-200 transition-all active:scale-95", style: {
                  backgroundColor: "#2a2a2a",
                  borderColor: "#3a3a3a"
                }, children: "📁 PERSONALIZAR" }),
                tarjaCustomPng && /* @__PURE__ */ jsx("button", { onClick: () => setTarjaCustomPng(null), className: "px-3 py-2 rounded-xl border border-red-500/30 text-[9px] font-bold text-red-400 transition-all active:scale-95", style: {
                  backgroundColor: "#7f1d1d40"
                }, children: "✕ Remover" })
              ] }),
              tarjaCustomPng && /* @__PURE__ */ jsx("div", { className: "w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center", style: {
                aspectRatio: `${tarjaScaleX} / ${tarjaScaleY}`
              }, children: /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "Tarja custom", className: "w-full h-full object-contain" }) }),
              /* @__PURE__ */ jsx("input", { ref: tarjaFileInputRef, type: "file", accept: "image/png", className: "hidden", onChange: (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setTarjaCustomPng(reader.result);
                reader.readAsDataURL(file);
                e.target.value = "";
              } })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
      __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `
    } }),
    gcPanelOpen && /* @__PURE__ */ jsx(GcPanel, { open: gcPanelOpen, onClose: () => setGcPanelOpen(false), gcLine1, setGcLine1, gcLine2, setGcLine2, gcDuration, setGcDuration, gcVisible, setGcVisible, gcCreditsQueue, setGcCreditsQueue, onTake: handleGcTakeQueue, onClear: handleGcClear, onSkip: handleGcSkip })
  ] });
}
function codecBadgeClass(codec) {
  switch (codec) {
    case "H.264":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "H.265/HEVC":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "AV1":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Verificando...":
      return "text-zinc-400 bg-zinc-700/40 border-zinc-600/30";
    case "Erro":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    default:
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  }
}
export {
  PlayoutPage as component
};
