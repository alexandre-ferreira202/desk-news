"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Type,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Lock,
  Unlock,
  Upload,
  X,
  Save,
  Download,
  FileUp,
  Trash2,
  Check,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

type TarjaConfig = {
  tarjaCustomPng: string | null
  tarjaScaleX: number
  tarjaScaleY: number
  tarjaScaleLock: boolean
  tarjaX: number
  tarjaY: number
  font1Size: number
  font1X: number
  font1Y: number
  font2Size: number
  font2X: number
  font2Y: number
}

const PRESET_KEY = "gc_tarja_presets"

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </label>
  )
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative">
        <select className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  )
}

function Slider({
  label,
  value,
  onChange,
  display,
  min = 0,
  max = 100,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  display: string
  min?: number
  max?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{display.replace("{v}", String(value))}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider"
        aria-label={label}
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</span>
  )
}

function ActionButton({
  children,
  variant = "ghost",
  className,
  onClick,
}: {
  children: React.ReactNode
  variant?: "primary" | "danger" | "ghost"
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 rounded-lg px-3 text-xs font-semibold uppercase tracking-wider transition-colors",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "danger" && "bg-destructive text-white hover:bg-destructive/90",
        variant === "ghost" && "border border-border bg-secondary text-foreground hover:bg-accent",
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── Tarja preview (shared by modal + mini chip) ──────────────────────────────

function TarjaRender({
  cfg,
  line1,
  line2,
  scale = 1,
}: {
  cfg: TarjaConfig
  line1: string
  line2: string
  scale?: number
}) {
  if (!line1 && !line2) return null
  return (
    <div
      className="absolute"
      style={{
        left: `${cfg.tarjaX}%`,
        top: `${cfg.tarjaY}%`,
        transform: "translate(-50%, -50%)",
        width: `${cfg.tarjaScaleX}%`,
      }}
    >
      {cfg.tarjaCustomPng ? (
        <div className="relative leading-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cfg.tarjaCustomPng || "/placeholder.svg"} alt="Tarja personalizada" className="block w-full" />
          {line1 && (
            <div
              className="absolute whitespace-nowrap font-sans font-black uppercase text-white"
              style={{
                left: `${cfg.font1X}%`,
                top: `${cfg.font1Y}%`,
                fontSize: Math.max(3, cfg.font1Size * scale),
                transform: "translateY(-50%)",
                textShadow: "0 1px 4px rgba(0,0,0,0.85)",
              }}
            >
              {line1}
            </div>
          )}
          {line2 && (
            <div
              className="absolute whitespace-nowrap font-sans uppercase text-zinc-200"
              style={{
                left: `${cfg.font2X}%`,
                top: `${cfg.font2Y}%`,
                fontSize: Math.max(3, cfg.font2Size * scale),
                transform: "translateY(-50%)",
                textShadow: "0 1px 4px rgba(0,0,0,0.85)",
              }}
            >
              {line2}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-stretch overflow-hidden rounded-sm shadow-lg">
          <div className="w-1 shrink-0 bg-destructive" />
          <div className="min-w-0 flex-1 bg-black/90 px-2.5 py-1.5">
            {line1 && (
              <div
                className="truncate font-sans font-black uppercase leading-tight text-white"
                style={{ fontSize: Math.max(6, cfg.font1Size * scale) }}
              >
                {line1}
              </div>
            )}
            {line2 && (
              <div
                className="truncate font-sans uppercase leading-tight text-muted-foreground"
                style={{ fontSize: Math.max(5, cfg.font2Size * scale) }}
              >
                {line2}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Config Layer / Tarja Modal ────────────────────────────────────────────────

function ConfigTarjaModal({
  open,
  onClose,
  cfg,
  setCfg,
  line1,
  line2,
}: {
  open: boolean
  onClose: () => void
  cfg: TarjaConfig
  setCfg: React.Dispatch<React.SetStateAction<TarjaConfig>>
  line1: string
  line2: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const presetImportRef = useRef<HTMLInputElement>(null)
  const [presetMenuOpen, setPresetMenuOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetNameInput, setPresetNameInput] = useState("")
  const [savedPresets, setSavedPresets] = useState<Record<string, TarjaConfig>>({})

  // Load presets from localStorage on mount (client-only)
  useEffect(() => {
    try {
      setSavedPresets(JSON.parse(localStorage.getItem(PRESET_KEY) || "{}"))
    } catch {
      setSavedPresets({})
    }
  }, [])

  const set = useCallback(
    <K extends keyof TarjaConfig>(key: K, val: TarjaConfig[K]) => setCfg((c) => ({ ...c, [key]: val })),
    [setCfg],
  )

  const persistPresets = (next: Record<string, TarjaConfig>) => {
    setSavedPresets(next)
    localStorage.setItem(PRESET_KEY, JSON.stringify(next))
  }

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.includes("png")) return
    const reader = new FileReader()
    reader.onload = () => set("tarjaCustomPng", reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSavePreset = () => {
    const name = presetNameInput.trim()
    if (!name) return
    persistPresets({ ...savedPresets, [name]: cfg })
    setShowSaveDialog(false)
    setPresetNameInput("")
    setPresetMenuOpen(false)
  }

  const handleApplyPreset = (name: string) => {
    const p = savedPresets[name]
    if (p) setCfg({ ...p })
    setPresetMenuOpen(false)
  }

  const handleDeletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = { ...savedPresets }
    delete next[name]
    persistPresets(next)
  }

  const handleExportPreset = () => {
    const name = presetNameInput.trim() || "preset_gc"
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name}.gcpreset.json`
    a.click()
    URL.revokeObjectURL(url)
    setPresetMenuOpen(false)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target?.result as string) as Partial<TarjaConfig>
        setCfg((c) => ({ ...c, ...p }))
      } catch {
        // ignore invalid file
      }
    }
    reader.readAsText(file)
    e.target.value = ""
    setPresetMenuOpen(false)
  }

  if (!open) return null

  const presetNames = Object.keys(savedPresets)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">Config de Camada / Tarja</span>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => {
                setPresetMenuOpen((v) => !v)
                setShowSaveDialog(false)
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary transition-colors",
                presetMenuOpen ? "bg-accent" : "bg-secondary hover:bg-accent",
              )}
            >
              <Save className="size-3.5" /> Preset <ChevronDown className="size-3" />
            </button>

            {presetMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
                {!showSaveDialog ? (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-accent"
                  >
                    <Save className="size-3.5" /> Salvar config atual
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Nome do preset
                    </span>
                    <input
                      autoFocus
                      value={presetNameInput}
                      onChange={(e) => setPresetNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePreset()
                        if (e.key === "Escape") setShowSaveDialog(false)
                      }}
                      placeholder="Ex: Jornal da Manhã"
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePreset}
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground"
                      >
                        <Check className="size-3" /> Salvar
                      </button>
                      <button
                        onClick={() => setShowSaveDialog(false)}
                        className="flex-1 rounded-md border border-border bg-secondary py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExportPreset}
                  className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-accent"
                >
                  <Download className="size-3.5" /> Exportar (.json)
                </button>
                <button
                  onClick={() => presetImportRef.current?.click()}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-accent"
                >
                  <FileUp className="size-3.5" /> Importar (.json)
                </button>
                <input
                  ref={presetImportRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />

                {presetNames.length > 0 && (
                  <div className="border-t border-border">
                    <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Presets salvos
                    </div>
                    {presetNames.map((name) => (
                      <div key={name} className="flex items-center border-t border-border/50">
                        <button
                          onClick={() => handleApplyPreset(name)}
                          className="flex flex-1 items-center gap-2 px-4 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-accent"
                        >
                          {savedPresets[name]?.tarjaCustomPng ? (
                            <ImageIcon className="size-3.5 text-primary" />
                          ) : (
                            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                          )}
                          {name}
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(name, e)}
                          className="px-3 py-2.5 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remover preset ${name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="size-3.5" /> Fechar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 overflow-y-auto p-5">
          {/* Live preview */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Preview ao vivo</SectionLabel>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                <span className="text-[11px] uppercase tracking-[0.3em] text-white/10">Sinal de vídeo</span>
              </div>
              <TarjaRender cfg={cfg} line1={line1} line2={line2} />
              {!line1 && !line2 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Digite nas linhas do GC para ver o preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PNG upload */}
          <div className="flex flex-col gap-2">
            <SectionLabel>PNG personalizado (tarja)</SectionLabel>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-accent"
              >
                <Upload className="size-4" /> Buscar arquivo .PNG
              </button>
              {cfg.tarjaCustomPng && (
                <button
                  onClick={() => set("tarjaCustomPng", null)}
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/20"
                >
                  <X className="size-3.5" /> Remover
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            {cfg.tarjaCustomPng ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cfg.tarjaCustomPng || "/placeholder.svg"}
                  alt="Pré-visualização da tarja PNG"
                  className="mx-auto block max-h-20 object-contain"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFile(e.dataTransfer.files?.[0])
                }}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-5 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50"
              >
                <ImageIcon className="size-4" /> Arraste um PNG aqui ou clique para buscar
              </div>
            )}
          </div>

          {/* Scale */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Escala da tarja</SectionLabel>
              <button
                onClick={() => set("tarjaScaleLock", !cfg.tarjaScaleLock)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  cfg.tarjaScaleLock
                    ? "border border-primary/40 bg-primary/10 text-primary"
                    : "border border-border bg-secondary text-muted-foreground",
                )}
              >
                {cfg.tarjaScaleLock ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                {cfg.tarjaScaleLock ? "Proporcional" : "Livre"}
              </button>
            </div>
            <Slider
              label="Largura X"
              min={10}
              max={200}
              value={cfg.tarjaScaleX}
              display="{v}%"
              onChange={(v) => setCfg((c) => ({ ...c, tarjaScaleX: v, ...(c.tarjaScaleLock ? { tarjaScaleY: v } : {}) }))}
            />
            <Slider
              label="Altura Y"
              min={10}
              max={200}
              value={cfg.tarjaScaleY}
              display="{v}%"
              onChange={(v) => setCfg((c) => ({ ...c, tarjaScaleY: v, ...(c.tarjaScaleLock ? { tarjaScaleX: v } : {}) }))}
            />
          </div>

          {/* Position + mini map */}
          <div className="flex flex-col gap-3">
            <SectionLabel>Posição na tela</SectionLabel>
            <Slider label="Posição X" value={cfg.tarjaX} display="{v}%" onChange={(v) => set("tarjaX", v)} />
            <Slider label="Posição Y" value={cfg.tarjaY} display="{v}%" onChange={(v) => set("tarjaY", v)} />
            <div className="relative h-14 w-full overflow-hidden rounded-lg border border-border bg-background">
              <div
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_0_8px] shadow-primary"
                style={{ left: `${cfg.tarjaX}%`, top: `${cfg.tarjaY}%` }}
              />
            </div>
          </div>

          {/* Font controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <SectionLabel>Fonte — Linha 1</SectionLabel>
              </div>
              <Slider label="Tamanho" min={6} max={48} value={cfg.font1Size} display="{v}px" onChange={(v) => set("font1Size", v)} />
              <Slider label="Pos. X" value={cfg.font1X} display="{v}%" onChange={(v) => set("font1X", v)} />
              <Slider label="Pos. Y" value={cfg.font1Y} display="{v}%" onChange={(v) => set("font1Y", v)} />
            </div>
            <div className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-chart-3" />
                <SectionLabel>Fonte — Linha 2</SectionLabel>
              </div>
              <Slider label="Tamanho" min={6} max={40} value={cfg.font2Size} display="{v}px" onChange={(v) => set("font2Size", v)} />
              <Slider label="Pos. X" value={cfg.font2X} display="{v}%" onChange={(v) => set("font2X", v)} />
              <Slider label="Pos. Y" value={cfg.font2Y} display="{v}%" onChange={(v) => set("font2Y", v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main GC Panel ──────────────────────────────────────────────────────────────

const DEFAULT_CFG: TarjaConfig = {
  tarjaCustomPng: null,
  tarjaScaleX: 80,
  tarjaScaleY: 80,
  tarjaScaleLock: true,
  tarjaX: 50,
  tarjaY: 85,
  font1Size: 14,
  font1X: 8,
  font1Y: 35,
  font2Size: 10,
  font2X: 8,
  font2Y: 70,
}

export function GcPanel() {
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [onAir, setOnAir] = useState(false)
  const [layerOpen, setLayerOpen] = useState(false)
  const [cfg, setCfg] = useState<TarjaConfig>(DEFAULT_CFG)

  return (
    <section className="flex flex-col gap-4">
      {/* Take / Cut row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => (line1 || line2) && setOnAir(true)}
          className="h-12 rounded-lg bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          GC Take
        </button>
        <button
          onClick={() => setOnAir(false)}
          className="h-12 rounded-lg bg-destructive text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-destructive/90"
        >
          GC Cut
        </button>
        <button className="h-10 rounded-lg border border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent">
          GC Clip
        </button>
        <button className="h-10 rounded-lg border border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent">
          Pular
        </button>
      </div>

      {/* Full GC editor */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full transition-colors",
              onAir ? "bg-primary shadow-[0_0_8px] shadow-primary" : "bg-muted-foreground/40",
            )}
          />
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Type className="size-4 text-primary" />
            Gerador de Caracteres
          </h3>
          {onAir && (
            <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              ● No ar
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <Field label="Linha 1 — Nome" placeholder="Nome do entrevistado" value={line1} onChange={setLine1} />
            <Field label="Linha 2 — Cargo" placeholder="Cargo / função" value={line2} onChange={setLine2} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Tipo de fonte" options={["Vivol", "Geist", "Inter", "Roboto"]} />
              <SelectField label="Estilo" options={["Regular", "Bold", "Light"]} />
            </div>
          </div>

          {/* Live preview chip */}
          <div className="flex flex-col gap-1.5 lg:w-44">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Pré-visualização
            </span>
            <div className="relative flex aspect-video flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-black">
              {line1 || line2 ? (
                <div className="absolute inset-x-1 bottom-1">
                  <TarjaRender cfg={{ ...cfg, tarjaX: 50, tarjaY: 78 }} line1={line1} line2={line2} scale={0.34} />
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground">Tarja GC completa</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick sliders mirror the layer config */}
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Slider
            label="Tamanho da tarja"
            min={10}
            max={200}
            value={cfg.tarjaScaleX}
            display="{v}%"
            onChange={(v) => setCfg((c) => ({ ...c, tarjaScaleX: v, ...(c.tarjaScaleLock ? { tarjaScaleY: v } : {}) }))}
          />
          <Slider label="Posição X" value={cfg.tarjaX} display="{v}%" onChange={(v) => setCfg((c) => ({ ...c, tarjaX: v }))} />
          <Slider label="Posição Y" value={cfg.tarjaY} display="{v}%" onChange={(v) => setCfg((c) => ({ ...c, tarjaY: v }))} />
          <Slider label="Fonte L1" min={6} max={48} value={cfg.font1Size} display="{v}px" onChange={(v) => setCfg((c) => ({ ...c, font1Size: v }))} />
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ActionButton variant="primary">Fade In</ActionButton>
          <ActionButton variant="danger" onClick={() => setOnAir(false)}>
            Fade Out
          </ActionButton>
          <ActionButton variant="ghost">Update Live</ActionButton>
          <ActionButton variant="ghost">Fade</ActionButton>
          <ActionButton variant="ghost">Fore</ActionButton>
          <ActionButton variant="ghost" onClick={() => setLayerOpen(true)}>
            <span className="flex items-center justify-center gap-1.5">
              <Layers className="size-3.5" />
              Config Tarja
            </span>
          </ActionButton>
        </div>
      </div>

      <ConfigTarjaModal
        open={layerOpen}
        onClose={() => setLayerOpen(false)}
        cfg={cfg}
        setCfg={setCfg}
        line1={line1}
        line2={line2}
      />
    </section>
  )
}
