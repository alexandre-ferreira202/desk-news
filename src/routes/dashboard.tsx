import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchPortais, type PortalFeed, type PortalNews } from "@/lib/portais.functions";
import { 
  BarChart, Bar, LineChart, Line, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, ScatterChart, Scatter
} from "recharts";
import { 
  Users, FileText, Globe, Play, 
  TrendingUp, Radio, AlertCircle, Clock, Award,
  Zap, CheckCircle, AlertTriangle, Sparkles,
  BarChart3, Flame, Loader2, ExternalLink, Calendar
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: () => <Dashboard />,
  head: () => ({ meta: [{ title: "Dashboard - DeskNews" }] }),
});

function Dashboard() {
  const [metrics, setMetrics] = useState({
    pautas: 0,
    materias: 0,
    publicadas: 0,
    em_producao: 0,
    espelhos: 0,
    usuarios: 0,
  });

  const [statusData, setStatusData] = useState<any[]>([]);
  const [topReporters, setTopReporters] = useState<any[]>([]);
  const [ultimasMaterias, setUltimasMaterias] = useState<any[]>([]);
  const [ultimasPautas, setUltimasPautas] = useState<any[]>([]);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [turnoData, setTurnoData] = useState<any[]>([]);
  const [portalNews, setPortalNews] = useState<PortalFeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: pautasData } = await supabase
          .from("pautas")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        const { data: materiasData } = await supabase
          .from("materias")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        const { data: espelhosData } = await supabase
          .from("espelho_blocos")
          .select("*")
          .limit(50);

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id")
          .limit(100);

        const pautas = (pautasData || []) as any[];
        const materias = (materiasData || []) as any[];
        const espelhos = (espelhosData || []) as any[];

        const publicadas = materias.filter(m => m.status === "publicado").length;
        const em_producao = materias.filter(m => m.status === "rascunho" || m.status === "revisao").length;

        setMetrics({
          pautas: pautas.length,
          materias: materias.length,
          publicadas,
          em_producao,
          espelhos: espelhos.length,
          usuarios: profilesData?.length || 0,
        });

        setStatusData([
          { name: "Publicado", value: materias.filter(m => m.status === "publicado").length },
          { name: "Rascunho", value: materias.filter(m => m.status === "rascunho").length },
          { name: "Revisão", value: materias.filter(m => m.status === "revisao").length },
        ]);

        const reporterMap: Record<string, number> = {};
        pautas.forEach(p => {
          if (p.reporter) {
            reporterMap[p.reporter] = (reporterMap[p.reporter] || 0) + 1;
          }
        });
        const reporters = Object.entries(reporterMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({
            name: name.substring(0, 20),
            materias: count,
          }));
        setTopReporters(reporters);

        setUltimasMaterias(materias.slice(0, 5));
        setUltimasPautas(pautas.slice(0, 5));

        const turnoMap: Record<string, number> = {
          "Manhã": 0,
          "Tarde": 0,
          "Noite": 0,
        };
        pautas.forEach(p => {
          if (p.turno && turnoMap[p.turno] !== undefined) {
            turnoMap[p.turno]++;
          }
        });
        const totalPautas = pautas.length || 1;
        const turnoDataFormatted = Object.entries(turnoMap).map(([turno, quantidade]) => ({
          turno,
          quantidade,
          percentual: Math.round((quantidade / totalPautas) * 100),
        }));
        setTurnoData(turnoDataFormatted);

        const lastWeek = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString("pt-BR", { weekday: "short" });
          
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const producao = materias.filter(m => {
            const created = new Date(m.created_at);
            return created >= dayStart && created <= dayEnd;
          }).length;

          lastWeek.push({
            day: dayStr.substring(0, 3).toUpperCase(),
            producao: producao,
            date: date.toLocaleDateString("pt-BR"),
          });
        }
        setProductionData(lastWeek);

        try {
          const feeds = await fetchPortais();
          const topFeeds = feeds
            .filter(f => f.items && f.items.length > 0)
            .slice(0, 5);
          setPortalNews(topFeeds);
        } catch (err) {
          console.error("Erro ao buscar portais:", err);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dashboard");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#22c55e]/10 to-blue-500/5 rounded-full blur-3xl animate-pulse opacity-50"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl opacity-50" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="border-b border-[#22c55e]/20 pb-4 mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()}
          </p>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-mono uppercase text-white">Dashboard</h1>
            <span className="text-[#6b7280] font-mono text-2xl font-light select-none">—</span>
            <img src="/logo1.png" alt="DeskNews" className="h-6 opacity-80" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#22c55e] mx-auto mb-4" />
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">INICIALIZANDO...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <MetricCard label="Pautas" value={metrics.pautas} />
              <MetricCard label="Matérias" value={metrics.materias} />
              <MetricCard label="Publicadas" value={metrics.publicadas} />
              <MetricCard label="Produção" value={metrics.em_producao} />
              <MetricCard label="Espelhos" value={metrics.espelhos} />
              <MetricCard label="Autores" value={metrics.usuarios} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <PremiumCard title="Produção 7 dias">
                {productionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#22c55e20" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0f0f12", border: "1px solid #22c55e40", borderRadius: "0.5rem" }} />
                      <Bar dataKey="producao" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs">SEM DADOS</div>
                )}
              </PremiumCard>

              <PremiumCard title="Status das Matérias">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={{ fill: "#e2e8f0", fontSize: 11 }} outerRadius={80} fill="#22c55e" dataKey="value">
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f0f12", border: "1px solid #22c55e40" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs">SEM DADOS</div>
                )}
              </PremiumCard>

              <PremiumCard title="Top Repórteres">
                <div className="space-y-3">
                  {topReporters.length > 0 ? (
                    topReporters.map((reporter, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a21] rounded-md border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all">
                        <span className="text-xs font-mono text-slate-300">{reporter.name}</span>
                        <span className="text-xs font-black text-[#22c55e] font-mono">{reporter.materias}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 text-xs">SEM DADOS</div>
                  )}
                </div>
              </PremiumCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PremiumCard title="Últimas Matérias">
                <div className="space-y-3">
                  {ultimasMaterias.length > 0 ? (
                    ultimasMaterias.map((materia: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border border-l-4 transition-all ${
                          materia.status === "publicado"
                            ? "border-[#22c55e] border-l-[#22c55e] bg-[#22c55e]/5"
                            : materia.status === "rascunho"
                            ? "border-[#f59e0b]/30 border-l-[#f59e0b] bg-[#f59e0b]/5"
                            : "border-[#3b82f6]/30 border-l-[#3b82f6] bg-[#3b82f6]/5"
                        }`}
                      >
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1 font-mono">{materia.titulo || "---"}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-600 font-mono">{new Date(materia.created_at).toLocaleDateString("pt-BR")}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono uppercase text-xs tracking-wider ${
                            materia.status === "publicado" ? "bg-[#22c55e]/30 text-[#22c55e]" :
                            materia.status === "rascunho" ? "bg-[#f59e0b]/30 text-[#f59e0b]" :
                            "bg-[#3b82f6]/30 text-[#3b82f6]"
                          }`}>
                            {materia.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 text-xs">SEM DADOS</div>
                  )}
                </div>
              </PremiumCard>

              <PremiumCard title="Últimas Pautas">
                <div className="space-y-3">
                  {ultimasPautas.length > 0 ? (
                    ultimasPautas.map((pauta: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all border-l-2 border-l-[#22c55e]"
                      >
                        <p className="text-xs font-semibold text-slate-200 truncate font-mono">{pauta.titulo || pauta.retranca || "---"}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-mono">
                          <span>{pauta.tipo || "PAUTA"}</span>
                          <span className="text-[#22c55e]">•</span>
                          <span>{pauta.turno || "---"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 text-xs">SEM DADOS</div>
                  )}
                </div>
              </PremiumCard>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 border-b border-[#22c55e]/20 pb-4">
                <div className="h-2 w-2 rounded-full bg-[#22c55e]"></div>
                <h2 className="text-xl font-black font-mono uppercase">Mundo</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {portalNews.length > 0 ? (
                  portalNews.map((portal, pidx) => (
                    <PremiumCard key={pidx} title={portal.portal}>
                      <div className="space-y-3">
                        {portal.items && portal.items.slice(0, 3).map((news: PortalNews, nidx: number) => (
                          <a
                            key={nidx}
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 hover:bg-[#1a1a21]/80 transition-all group"
                          >
                            <p className="text-xs font-semibold text-slate-300 line-clamp-2 group-hover:text-[#22c55e] transition-colors font-mono">
                              {news.title}
                            </p>
                            {news.description && (
                              <p className="text-xs text-slate-600 mt-2 line-clamp-1 font-mono">
                                {news.description}
                              </p>
                            )}
                            {news.pubDate && (
                              <p className="text-xs text-slate-700 mt-2 flex items-center gap-1 font-mono">
                                {new Date(news.pubDate).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-3 text-[#22c55e] group-hover:text-[#16a34a]">
                              <span className="text-xs font-semibold font-mono">Ir</span>
                              <ExternalLink size={11} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </PremiumCard>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-8 text-slate-500 font-mono text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                    CARREGANDO...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 text-center backdrop-blur-lg">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Dashboard DeskNews</p>
              <p className="text-xs text-slate-600 font-mono mt-1">
                {new Date().toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300">
      <p className="text-xs text-slate-600 font-mono uppercase tracking-widest mb-2">{label}</p>
      <div className="text-2xl font-black text-[#22c55e] font-mono">{value}</div>
    </div>
  );
}

function PremiumCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300 h-full">
        <h2 className="text-sm font-black mb-4 text-white font-mono uppercase tracking-widest">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
