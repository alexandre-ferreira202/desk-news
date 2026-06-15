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

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get pautas
        const { data: pautasData } = await supabase
          .from("pautas")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        // Get materias
        const { data: materiasData } = await supabase
          .from("materias")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        // Get espelho_blocos (CORRIGIDO)
        const { data: espelhosData } = await supabase
          .from("espelho_blocos")
          .select("*")
          .limit(50);

        // Get users
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id")
          .limit(100);

        const pautas = (pautasData || []) as any[];
        const materias = (materiasData || []) as any[];
        const espelhos = (espelhosData || []) as any[];

        // Metrics
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

        // Status distribution
        setStatusData([
          { name: "Publicado", value: materias.filter(m => m.status === "publicado").length },
          { name: "Rascunho", value: materias.filter(m => m.status === "rascunho").length },
          { name: "Revisão", value: materias.filter(m => m.status === "revisao").length },
        ]);

        // Top reporters (real)
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

        // Latest articles
        setUltimasMaterias(materias.slice(0, 5));
        setUltimasPautas(pautas.slice(0, 5));

        // Shift distribution
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

        // Production last 7 days (REAL DATA)
        const lastWeek = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString("pt-BR", { weekday: "short" });
          
          // Count articles created on this day
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

        // Fetch portal news (TOP 5)
        try {
          const feeds = await fetchPortais();
          // Get only top 5 portals with content
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

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

  const isDarkMode = true; // Dark mode por padrão

  return (
    <div className="min-h-screen bg-[#0a0e27] text-[#e2e8f0] font-sans">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
              <p className="text-slate-400">Carregando dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header com Logo Dinâmica */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={isDarkMode ? "/logo1.png" : "/logo2.png"}
                  alt="DeskNews"
                  className="h-10 object-contain"
                />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-400">Visão em tempo real do seu newsroom</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <MetricCard 
                icon={FileText} 
                label="Pautas" 
                value={metrics.pautas}
                trend="up"
              />
              <MetricCard 
                icon={Radio} 
                label="Matérias" 
                value={metrics.materias}
                trend="up"
              />
              <MetricCard 
                icon={CheckCircle} 
                label="Publicadas" 
                value={metrics.publicadas}
                color="emerald"
                trend="up"
              />
              <MetricCard 
                icon={Clock} 
                label="Em Produção" 
                value={metrics.em_producao}
                color="amber"
                trend="up"
              />
              <MetricCard 
                icon={BarChart3} 
                label="Espelhos" 
                value={metrics.espelhos}
                color="purple"
                trend="up"
              />
              <MetricCard 
                icon={Users} 
                label="Usuários" 
                value={metrics.usuarios}
                color="pink"
                trend="up"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Production Chart */}
              <div className="lg:col-span-2">
                <PremiumCard title="Produção - Últimos 7 Dias" icon={TrendingUp}>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{
                            background: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: "12px",
                            backdropFilter: "blur(8px)",
                          }}
                        />
                        <Bar dataKey="producao" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </PremiumCard>
              </div>

              {/* Status Distribution */}
              <PremiumCard title="Status das Matérias" icon={FileText}>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} matérias`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </PremiumCard>
            </div>

            {/* Shift Distribution & Top Reporters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Shift Distribution */}
              <PremiumCard title="Distribuição por Turno" icon={Clock}>
                <div className="space-y-4">
                  {turnoData.map((turno, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">{turno.turno}</span>
                        <span className="text-slate-400">{turno.quantidade} pautas</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-pink-500'
                          }`}
                          style={{ width: `${turno.percentual}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500">{turno.percentual}%</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              {/* Top Reporters */}
              <PremiumCard title="Top Repórteres" icon={Award}>
                <div className="space-y-3">
                  {topReporters.map((reporter, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            idx === 0 ? 'bg-yellow-500/30 border border-yellow-500/50' :
                            idx === 1 ? 'bg-slate-500/30 border border-slate-500/50' :
                            idx === 2 ? 'bg-orange-500/30 border border-orange-500/50' :
                            'bg-blue-500/30 border border-blue-500/50'
                          }`}>
                            {idx + 1}
                          </div>
                          <p className="font-semibold text-sm">{reporter.name}</p>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg">
                          {reporter.materias}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </div>

            {/* Latest Articles & News */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Latest Articles */}
              <PremiumCard title="Últimas Matérias" icon={FileText}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ultimasMaterias.map((materia: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                        materia.status === "publicado"
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/40"
                          : materia.status === "rascunho"
                          ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/40"
                          : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/40"
                      }`}
                    >
                      <p className="text-sm font-bold text-white line-clamp-2">{materia.titulo || "Sem título"}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(materia.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          materia.status === "publicado" ? "bg-emerald-500/20 text-emerald-300" :
                          materia.status === "rascunho" ? "bg-amber-500/20 text-amber-300" :
                          "bg-blue-500/20 text-blue-300"
                        }`}>
                          {materia.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              {/* Latest Pautas */}
              <PremiumCard title="Últimas Pautas" icon={Play}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ultimasPautas.map((pauta: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                    >
                      <p className="text-sm font-bold text-white truncate">{pauta.titulo || pauta.retranca || "Sem título"}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <span>{pauta.tipo || "Pauta"}</span>
                        <span>•</span>
                        <span>{pauta.turno || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </div>

            {/* Happening in the World - Portal News */}
            <div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-400" />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Acontecendo no Mundo
                </span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {portalNews.length > 0 ? (
                  portalNews.map((portal, pidx) => (
                    <PremiumCard key={pidx} title={portal.portal} className="h-full">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {portal.items && portal.items.slice(0, 3).map((news: PortalNews, nidx: number) => (
                          <a
                            key={nidx}
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group"
                          >
                            <p className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-blue-300 transition-colors">
                              {news.title}
                            </p>
                            {news.description && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                {news.description}
                              </p>
                            )}
                            {news.pubDate && (
                              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(news.pubDate).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-3 text-blue-400 group-hover:text-blue-300">
                              <span className="text-xs font-semibold">Acessar</span>
                              <ExternalLink size={12} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </PremiumCard>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-8 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                    <p>Carregando notícias dos portais...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 relative px-6 py-4 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={16} className="text-purple-400" />
                <p className="text-sm text-slate-300 font-semibold">Dashboard DeskNews</p>
              </div>
              <p className="text-xs text-slate-500">
                Atualizado em {new Date().toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: any;
  label: string;
  value: number;
  color?: string;
  trend?: "up" | "down";
}

function MetricCard({ icon: Icon, label, value, color = "blue", trend = "up" }: MetricCardProps) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/30 group-hover:border-blue-500/60",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 group-hover:border-emerald-500/60",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/30 group-hover:border-amber-500/60",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/30 group-hover:border-purple-500/60",
    pink: "from-pink-500/10 to-pink-500/5 border-pink-500/30 group-hover:border-pink-500/60",
  };

  const iconColors = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
  };

  return (
    <div className="group relative cursor-pointer h-full">
      <div className={`relative h-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between`}>
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <Icon className={`w-5 h-5 ${iconColors[color as keyof typeof iconColors]} opacity-70`} />
        </div>
        <div>
          <div className="text-3xl font-black text-white tabular-nums">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PremiumCardProps {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
}

function PremiumCard({ title, icon: Icon, children, className = "" }: PremiumCardProps) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      
      <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl p-6 transition-all duration-300 h-full">
        <div className="flex items-center gap-3 mb-6">
          {Icon && <Icon size={20} className="text-blue-400 opacity-80" />}
          <h2 className="text-lg font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
