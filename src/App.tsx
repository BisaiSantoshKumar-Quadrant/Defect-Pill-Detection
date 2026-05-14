import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Camera,
  History,
  Sun,
  Moon,
  Database,
  X,
  Maximize2,
  LayoutDashboard,
  BarChart3,
  Settings,
  Package,
  Zap,
} from "lucide-react";

// Grounded Data Structure
interface InspectionItem {
  id: string;
  batch: string;
  medicine: string;
  status: "PASSED" | "REJECTED";
  defects: number;
  timestamp: string;
  imageData: string | null; // Storing the specific frame for drill-down
  totalPills: number;
  goodPills: number;
  defectivePills: number;
  totalStrips: number;
  defectPercentage: number;
  defectDetected: boolean;
  confidenceScores: number[];
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [history, setHistory] = useState<InspectionItem[]>([]);
  const [stats, setStats] = useState({ total: 0, defects: 0 });
  const [selectedInspection, setSelectedInspection] = useState<InspectionItem | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // WebSocket Integration for Kafka Stream
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 1. Live Feed Update
      if (data.image && !data.status) {
        setCurrentFrame(data.image);
      }

      // 2. Inspection Result Update (Grounded to ai_worker.py logic)
      if (data.status) {
        const newItem: InspectionItem = {
  id: Math.random().toString(36).substr(2, 9),

  batch: data.filename || `BATCH-${Math.floor(Date.now() / 1000)}`,

  medicine: "Pill Strip Alpha",

  status: data.status === "ACCEPTED"
    ? "PASSED"
    : "REJECTED",

  defects: data.defective_pills || 0,

  timestamp: new Date().toLocaleTimeString(),

  imageData: data.image || null,

  // NEW DATA
  totalPills: data.total_pills || 0,

  goodPills: data.good_pills || 0,

  defectivePills: data.defective_pills || 0,

  totalStrips: data.total_strips || 0,

  defectPercentage: data.defect_percentage || 0,

  defectDetected: data.defect_detected || false,

  confidenceScores: data.confidence_scores || [],
};

        setHistory((prev) => [newItem, ...prev].slice(0, 20));
        setStats((prev) => ({
          total: prev.total + 1,
          defects: newItem.status === "REJECTED" ? prev.defects + 1 : prev.defects,
        }));
      }
    };

    return () => socket.close();
  }, []);

  const themeClass = darkMode ? "bg-[#060608] text-white" : "bg-slate-50 text-slate-900";
  const cardClass = darkMode ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-white border-slate-200 shadow-sm";
  const sidebarClass = darkMode ? "bg-[#0a0a0c] border-white/5" : "bg-white border-slate-200";
  const subTextClass = darkMode ? "text-slate-500" : "text-slate-600";

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Analytics", icon: BarChart3 },
    { name: "Inventory", icon: Package },
    { name: "Settings", icon: Settings },
  ];

  const renderDashboard = () => (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Monitor</h1>
          <div className={`flex items-center gap-3 mt-2 font-mono text-xs ${subTextClass}`}>
            <Database size={14} className="text-cyan-500" />
            <span>Kafka Cluster: ONLINE</span>
            <span className="opacity-30">|</span>
            <span>Model: YOLOv8-Pill-Custom</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl border transition-all ${darkMode ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-black tracking-widest ${connected ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
            {connected ? "LIVE_LINK" : "OFFLINE"}
          </div>
        </div>
      </header>

      {/* Global Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Units" value={stats.total} color={darkMode ? "text-white" : "text-slate-900"} darkMode={darkMode} />
        <StatCard title="Defects Detected" value={stats.defects} color="text-rose-500" darkMode={darkMode} />
        <StatCard title="Yield Rate" value={stats.total > 0 ? `${(((stats.total - stats.defects) / stats.total) * 100).toFixed(2)}%` : "100%"} color="text-cyan-400" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Inspection Viewport */}
        <div className={`xl:col-span-2 rounded-[2rem] p-6 border transition-colors duration-500 ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Camera className="text-cyan-400" size={24} />
              <h2 className={`font-bold text-xl uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Active Inspection Stream</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono opacity-60 text-white">REC 1080P_60</span>
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group shadow-2xl">
            {currentFrame ? (
              <img 
                src={`data:image/jpeg;base64,${currentFrame}`} 
                alt="Live AI Stream" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Waiting for Kafka Buffer...</p>
              </div>
            )}
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-mono text-cyan-400 font-bold mb-1">TELEMETRY_v2</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] opacity-80 text-white">
                <span>Latency: 42ms</span>
                <span>CPU: 14%</span>
                <span>IOU: 0.45</span>
                <span>Conf: 0.82</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable History Ledger - SCROLLABLE FIXED VIEWPORT */}
        <div className={`rounded-[2rem] p-6 border transition-colors duration-500 flex flex-col h-full ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <History className="text-cyan-400" size={22} />
              <h2 className={`font-bold text-xl uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Event Ledger</h2>
            </div>
            <span className={`text-[10px] font-mono italic ${subTextClass}`}>Recent History</span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[460px]">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Activity size={48} className={darkMode ? 'text-white' : 'text-slate-900'} />
                <p className="text-xs font-bold uppercase tracking-widest mt-4 text-center">Awaiting Events</p>
              </div>
            )}
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedInspection(item)}
                className={`w-full text-left p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between ${
                  item.status === 'PASSED' 
                    ? 'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30' 
                    : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                      item.status === 'PASSED' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.status}
                    </span>
                    <span className={`text-[10px] font-mono ${subTextClass}`}>{item.timestamp}</span>
                  </div>
                  <p className={`text-xs font-bold truncate w-32 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.batch}</p>
                </div>
                <Maximize2 size={14} className="opacity-20" />
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div className={`mt-4 pt-4 border-t text-[10px] text-center font-mono uppercase tracking-widest opacity-40 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              Scroll to view more events
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderPlaceholder = (title: string) => (
    <div className="flex flex-col items-center justify-center h-[70vh] opacity-50">
      <div className="bg-cyan-500/10 p-8 rounded-full mb-6">
        <Zap className="text-cyan-400 w-16 h-16 animate-pulse" />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-widest mb-2">{title}</h2>
      <p className="font-mono text-sm">Component initialized. Data loading from primary AI node...</p>
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${themeClass}`}>
      {/* Side Navigation - FUNCTIONAL */}
      <aside className={`w-20 lg:w-64 border-r transition-colors duration-500 flex flex-col ${sidebarClass}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-cyan-500/20 p-3 rounded-xl">
            <Shield className="text-cyan-400" />
          </div>
          <div className="hidden lg:block">
            <h1 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>PharmaVision</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">AI Node 01</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button 
                key={item.name} 
                onClick={() => setActiveTab(item.name)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400' 
                    : darkMode 
                      ? 'text-white/40 hover:bg-white/5' 
                      : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span className="hidden lg:inline">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 hidden lg:block">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Node Efficiency</p>
            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mb-1">
              <div className="bg-cyan-500 h-full w-[85%]" />
            </div>
            <p className="text-[10px] font-mono text-right opacity-50">85.4%</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {activeTab === "Dashboard" ? renderDashboard() : renderPlaceholder(activeTab)}
      </main>

      {/* Drill-down Inspection Modal */}

{selectedInspection && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
    <div 
      className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      onClick={() => setSelectedInspection(null)} 
    />
    <div
      className={`relative w-full max-w-5xl h-[85vh] rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-500 ${
        darkMode ? 'bg-[#0c0c0e] border-white/10' : 'bg-white border-slate-200'
      }`}
    >
      {/* Close Button */}
      <button 
        onClick={() => setSelectedInspection(null)}
        className={`absolute top-6 right-6 p-2 rounded-full z-20 transition-all ${
          darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
        }`}
      >
        <X size={20} />
      </button>

      {/* Left Side: Evidence Viewport */}
      <div className="lg:w-3/5 bg-black relative flex items-center justify-center border-r border-white/5">
        <div className="absolute top-6 left-8 z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">Evidence_Frame</span>
          </div>
        </div>
        
        {selectedInspection.imageData ? (
          <img 
            src={`data:image/jpeg;base64,${selectedInspection.imageData}`} 
            alt="Evidence" 
            className="w-full h-full object-contain p-4 lg:p-12"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 opacity-30">
            <Camera size={48} className="text-white" />
            <p className="font-mono text-xs text-white uppercase tracking-widest">No Image Captured</p>
          </div>
        )}
      </div>

      {/* Right Side: Detailed Analysis */}
      <div className={`lg:w-2/5 flex flex-col h-full ${darkMode ? 'bg-[#0a0a0c]' : 'bg-slate-50/50'}`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${
              selectedInspection.status === 'PASSED' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {selectedInspection.status}
            </span>
            <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Report #{selectedInspection.id.slice(0,8)}</span>
          </div>
          <h3 className={`text-3xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Analysis Report
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
          <div className="space-y-8 py-4">
            {/* Group: Core Identity */}
            <section>
              <p className="text-[10px] font-black text-cyan-500 mb-4 uppercase tracking-[0.2em]">General Information</p>
              <div className="space-y-3">
                <DetailRow label="Batch Identity" value={selectedInspection.batch} darkMode={darkMode} />
                <DetailRow label="Capture Time" value={selectedInspection.timestamp} darkMode={darkMode} />
                <DetailRow label="Product Type" value={selectedInspection.medicine} darkMode={darkMode} />
              </div>
            </section>

            {/* Group: ML Telemetry */}
            <section>
              <p className="text-[10px] font-black text-rose-500 mb-4 uppercase tracking-[0.2em]">Pill Counter Metrics</p>
              <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white border border-slate-200'}`}>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Good</p>
                  <p className="text-2xl font-black text-cyan-400">{selectedInspection.goodPills}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Defects</p>
                  <p className="text-2xl font-black text-rose-500">{selectedInspection.defectivePills}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Yield Rate</p>
                  <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {(100 - selectedInspection.defectPercentage).toFixed(1)}%
                  </p>
                </div>
              </div>
            </section>

            {/* Group: Confidence Metadata */}
            <section className="pb-8">
              <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Model Confidence</p>
              <div className="space-y-3">
                <DetailRow 
                  label="Avg Confidence" 
                  value={`${(selectedInspection.confidenceScores.reduce((a, b) => a + b, 0) / (selectedInspection.confidenceScores.length || 1)).toFixed(2)}`} 
                  darkMode={darkMode} 
                />
                <DetailRow 
                  label="Defect Detected" 
                  value={selectedInspection.defectDetected ? "YES" : "NO"} 
                  highlight={selectedInspection.defectDetected ? "text-rose-500" : "text-cyan-400"}
                  darkMode={darkMode} 
                />
              </div>
            </section>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-8 border-t ${darkMode ? 'border-white/5' : 'border-slate-200 bg-white'}`}>
          <button 
            onClick={() => setSelectedInspection(null)}
            className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-xs hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// Sub-components
const StatCard = ({ title, value, color, darkMode }: any) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${darkMode ? 'bg-white/5 border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>{title}</p>
    <div className="flex items-center justify-between">
      <h2 className={`text-4xl font-black font-mono tracking-tighter ${color}`}>{value}</h2>
      <Activity size={24} className={`${darkMode ? 'text-white' : 'text-slate-900'} opacity-10`} />
    </div>
  </div>
);

const DetailRow = ({ label, value, highlight, darkMode }: any) => (
  <div className={`flex justify-between items-center border-b pb-3 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
    <span className={`text-[10px] uppercase font-bold tracking-wider text-slate-500`}>{label}</span>
    <span className={`text-sm font-black font-mono ${highlight || (darkMode ? 'text-slate-200' : 'text-slate-700')}`}>{value}</span>
  </div>
);