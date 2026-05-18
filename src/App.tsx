import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Folder,
  ArrowLeft,
  Eye,
  Search,
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface BatchHeader {
  total_images: number;
  passed: number;
  failed: number;
  batch_accuracy: number;
}

interface ImageMetadata {
  image_name: string;
  status: "PASSED" | "FAILED" | "ACCEPTED" | "REJECTED";
  processed_time: string;
  yield_percentage: number;
}

interface BatchResponse {
  header: BatchHeader;
  images: ImageMetadata[];
}

interface BatchInfo {
  batch_name: string;
}

interface InspectionItem {
  id: string;
  batch: string;
  medicine: string;
  status: "PASSED" | "REJECTED";
  defects: number;
  timestamp: string;
  imageData: string | null;
  totalPills: number;
  goodPills: number;
  defectivePills: number;
  totalStrips: number;
  defectPercentage: number;
  defectDetected: boolean;
  confidenceScores: number[];
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, color, darkMode }: { title: string; value: string | number; color: string; darkMode: boolean }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-105 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500">{title}</p>
    <div className="flex items-center justify-between">
      <h2 className={`text-5xl font-black font-mono tracking-tighter ${color}`}>{value}</h2>
      <Activity size={24} className={`${darkMode ? 'text-white' : 'text-slate-900'} opacity-10`} />
    </div>
  </div>
);

const DetailRow = ({ label, value, highlight, darkMode }: { label: string; value: string | number; highlight?: string; darkMode: boolean }) => (
  <div className={`flex justify-between items-center border-b pb-5 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{label}</span>
    <span className={`text-sm font-black font-mono ${highlight || (darkMode ? 'text-slate-200' : 'text-slate-700')}`}>{value}</span>
  </div>
);

const KPICard = ({ title, value, icon: Icon, color, darkMode }: { title: string; value: string | number; icon: React.ElementType; color: string; darkMode: boolean }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
    <div className="flex items-center justify-between mb-5">
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</span>
       <div className={`p-2.5 rounded-xl bg-opacity-10 ${color.replace('text', 'bg')} ${color}`}>
         <Icon size={18} />
       </div>
    </div>
    <div className="text-4xl font-black font-mono tracking-tighter">{value}</div>
  </div>
);

// ─── ProcessData (Analytics) Component ───────────────────────────────────────

const ProcessData = ({ darkMode }: { darkMode: boolean }) => {
  const [viewMode, setViewMode] = useState<"folders" | "details">("folders");
  const [batchData, setBatchData] = useState<BatchResponse | null>(null);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cardClass = darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm";
  const textClass = darkMode ? "text-white" : "text-slate-900";
  const subTextClass = darkMode ? "text-slate-400" : "text-slate-500";

  useEffect(() => {
    fetch("http://localhost:8000/batches")
      .then((res) => res.json())
      .then((data: BatchInfo[]) => setBatches(data))
      .catch((err) => console.error("Failed to fetch batches", err));
  }, []);

  const fetchBatch = async (batchName: string) => {
    setIsLoading(true);
    setSelectedBatch(batchName);
    try {
      const response = await fetch(`http://localhost:8000/batches/${batchName}`);
      const data: BatchResponse = await response.json();
      setBatchData(data);
      setViewMode("details");
    } catch (error) {
      console.error("Failed to fetch batch", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredImages = batchData?.images.filter((img: ImageMetadata) => 
    img.image_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (viewMode === "folders") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${textClass}`}>Inspection Archives</h1>
          <p className={`mt-1 font-medium ${subTextClass}`}>Select a batch folder to view detailed process analytics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {batches.map((batch) => (
            <button
              key={batch.batch_name}
              onClick={() => fetchBatch(batch.batch_name)}
              className={`group flex flex-col items-center p-6 rounded-[2rem] border transition-all hover:scale-105 hover:border-cyan-500/50 ${cardClass}`}
            >
              <div className="relative mb-4">
                <Folder size={64} className="text-cyan-500/20 group-hover:text-cyan-500 transition-colors fill-cyan-500/5" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={24} className="text-cyan-500" />
                </div>
              </div>
              <span className={`text-xs font-black uppercase tracking-widest text-center break-all ${textClass}`}>
                {batch.batch_name}
              </span>
              <span className="text-[10px] mt-2 opacity-40 font-mono">DIR_STORAGE_01</span>
            </button>
          ))}
          {batches.length === 0 && (
            <div className="col-span-full py-24 text-center opacity-30">
               <Database size={48} className="mx-auto mb-4" />
               <p className="text-xs font-black uppercase tracking-[0.3em]">No Batches Found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode("folders")}
            className={`p-3 rounded-2xl border transition-all ${cardClass} hover:border-cyan-500/50 text-cyan-500`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Archive</span>
              <ChevronRight size={10} className="opacity-30" />
              <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${textClass}`}>{selectedBatch}</span>
            </div>
            <h1 className={`text-4xl font-black tracking-tight ${textClass}`}>Batch Analytics</h1>
          </div>
        </div>
        <button 
          onClick={() => fetchBatch(selectedBatch)}
          className={`p-3 rounded-2xl border transition-all ${cardClass} hover:border-cyan-500/50`}
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin text-cyan-500" : "text-slate-400"} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="Total Processed" value={batchData?.header.total_images || 0} icon={Package} color="text-blue-500" darkMode={darkMode} />
        <KPICard title="Units Passed" value={batchData?.header.passed || 0} icon={CheckCircle2} color="text-emerald-500" darkMode={darkMode} />
        <KPICard title="Units Rejected" value={batchData?.header.failed || 0} icon={XCircle} color="text-rose-500" darkMode={darkMode} />
        <KPICard title="AI Accuracy" value={`${batchData?.header.batch_accuracy || 0}%`} icon={Zap} color="text-cyan-500" darkMode={darkMode} />
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden ${cardClass}`}>
        <div className="p-8 border-b border-inherit flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-cyan-500/10 rounded-xl">
               <Database size={18} className="text-cyan-500" />
             </div>
             <h2 className="font-black uppercase tracking-widest text-xs opacity-60">Inspection Ledger</h2>
          </div>
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search image ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm focus:outline-none focus:border-cyan-500/50 transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Asset Identifier</th>
                <th className="px-8 py-5">Process Timestamp</th>
                <th className="px-8 py-5">Yield Quality</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filteredImages.map((img: ImageMetadata, index: number) => {
                const isSuccess = img.status === "PASSED" || img.status === "ACCEPTED";
                return (
                  <tr key={index} className="group hover:bg-cyan-500/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        {img.status}
                      </div>
                    </td>
                    <td className={`px-8 py-5 font-mono text-xs font-bold ${textClass} max-w-[200px] truncate`}>{img.image_name}</td>
                    <td className="px-8 py-5 text-xs font-medium opacity-60"><Calendar size={12} className="inline mr-2" />{img.processed_time}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono w-10">{img.yield_percentage}%</span>
                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${img.yield_percentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedImage(`http://localhost:8000/batches/${selectedBatch}/image/${img.image_name}`);
                          setShowModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500 hover:text-black transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className={`relative max-w-5xl w-full rounded-[3rem] border shadow-2xl overflow-hidden p-8 flex flex-col ${cardClass} animate-in zoom-in-95`}>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500"><Eye size={20} /></div>
                   <h2 className="font-black uppercase tracking-tighter text-xl">Asset Inspection Detail</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-full hover:bg-white/10 text-slate-400"><X size={24} /></button>
             </div>
             <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-white/5">
                <img src={selectedImage} alt="Analysis" className="max-h-[65vh] object-contain" />
             </div>
             <div className="mt-8 flex justify-end">
                <button onClick={() => setShowModal(false)} className="px-10 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px]">Close Analysis</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main App Component ──────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = useState(false); // Default to Light
  const [connected, setConnected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [history, setHistory] = useState<InspectionItem[]>([]);
  const [stats, setStats] = useState({ total: 0, defects: 0 });
  const [selectedInspection, setSelectedInspection] = useState<InspectionItem | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.image) {
        setCurrentFrame(data.image);
      }
      if (data.status) {
        const newItem: InspectionItem = {
          id: Math.random().toString(36).substr(2, 9),
          batch: data.filename || `BATCH-${Math.floor(Date.now() / 1000)}`,
          medicine: "Pill Strip Alpha",
          status: data.status === "ACCEPTED" ? "PASSED" : "REJECTED",
          defects: data.defective_pills || 0,
          timestamp: new Date().toLocaleTimeString(),
          imageData: data.image || null,
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
  const sidebarClass = darkMode ? "bg-[#0a0a0c] border-white/5" : "bg-white border-slate-200";
  const cardClass = darkMode ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-white border-slate-200 shadow-sm";

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Monitor</h1>
          <div className="flex items-center gap-3 mt-2 font-mono text-xs opacity-60">
            <Database size={14} className="text-cyan-500" />
            <span className="font-black uppercase tracking-widest">Kafka Cluster: ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl border ${darkMode ? "border-white/10 text-yellow-400" : "border-slate-200 shadow-sm"}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-black ${connected ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
            {connected ? "LIVE_LINK" : "OFFLINE"}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Units" value={stats.total} color={darkMode ? "text-white" : "text-slate-900"} darkMode={darkMode} />
        <StatCard title="Defects Detected" value={stats.defects} color="text-rose-500" darkMode={darkMode} />
        <StatCard title="Yield Rate" value={stats.total > 0 ? `${(((stats.total - stats.defects) / stats.total) * 100).toFixed(2)}%` : "100%"} color="text-cyan-400" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`xl:col-span-2 rounded-[2.5rem] p-8 border ${cardClass}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Camera className="text-cyan-400" size={24} />
              <h2 className="font-black text-xl uppercase tracking-tighter">Live Visual Analytics</h2>
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Neural Engine Sync</span>
          </div>
          <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 flex items-center justify-center">
            {currentFrame ? <img src={`data:image/jpeg;base64,${currentFrame}`} className="w-full h-full object-contain" alt="Live" /> : <p className="text-xs font-black text-slate-500">Waiting for Stream Data...</p>}
          </div>
        </div>

        <div className={`rounded-[2.5rem] p-8 border ${cardClass} flex flex-col`}>
          <div className="flex items-center gap-4 mb-8">
            <History className="text-cyan-400" size={22} />
            <h2 className="font-black text-xl uppercase tracking-tighter">Event Ledger</h2>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[460px]">
            {history.map((item) => (
              <button key={item.id} onClick={() => setSelectedInspection(item)} className={`w-full text-left p-5 rounded-2xl border transition-all ${item.status === 'PASSED' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} flex items-center justify-between group`}>
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-400'}`}>{item.status}</span>
                     <span className="text-[10px] font-mono font-bold opacity-40">{item.timestamp}</span>
                   </div>
                   <p className="text-sm font-black truncate w-40">{item.batch}</p>
                </div>
                <Maximize2 size={16} className="opacity-0 group-hover:opacity-40" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-700 ${themeClass}`}>
      <aside className={`w-20 lg:w-72 border-r flex flex-col z-40 ${sidebarClass}`}>
        <div className="p-10 flex items-center gap-4">
          <div className="bg-cyan-500 p-3 rounded-2xl shadow-lg shadow-cyan-500/20"><Shield className="text-black" size={24} /></div>
          <div className="hidden lg:block"><h1 className="text-2xl font-black tracking-tighter uppercase leading-none">PharmaVision</h1><p className="text-[9px] text-cyan-500 font-black tracking-[0.4em] uppercase opacity-60">AI Intelligence</p></div>
        </div>
        <nav className="flex-1 px-6 space-y-3 mt-6">
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Batch History", icon: BarChart3 },
            // { name: "Inventory", icon: Package },
            { name: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-5 ${isActive ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20' : 'opacity-40 hover:opacity-100'}`}>
                <Icon size={20} /><span className="hidden lg:inline">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {activeTab === "Dashboard" && renderDashboard()}
        {activeTab === "Batch History" && <ProcessData darkMode={darkMode} />}
        {activeTab !== "Dashboard" && activeTab !== "Batch History" && <div className="flex flex-col items-center justify-center h-[70vh] opacity-20"><Zap size={64} className="mb-4 animate-pulse text-cyan-400" /><h2 className="text-3xl font-black uppercase tracking-widest">{activeTab} Loading</h2></div>}
      </main>

      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedInspection(null)} />
          <div className={`relative w-full max-w-5xl rounded-[3rem] border shadow-2xl overflow-hidden flex flex-col lg:flex-row ${darkMode ? 'bg-[#0c0c0e] border-white/10' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setSelectedInspection(null)} className="absolute top-8 right-8 p-3 rounded-full z-20 bg-black/10 text-white"><X size={20} /></button>
            <div className="lg:w-3/5 bg-black flex items-center justify-center relative">{selectedInspection.imageData ? <img src={`data:image/jpeg;base64,${selectedInspection.imageData}`} className="w-full h-full object-contain p-12" alt="Analysis" /> : <Camera size={64} className="text-white opacity-10" />}</div>
            <div className="lg:w-2/5 p-12 flex flex-col justify-between">
               <div>
                  <div className="flex items-center gap-2 mb-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedInspection.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-400'}`}>{selectedInspection.status}</span></div>
                  <h3 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">Inspection Audit</h3>
                  <div className="space-y-5">
                    <DetailRow label="Batch Identity" value={selectedInspection.batch} darkMode={darkMode} />
                    <DetailRow label="Yield Quality" value={`${(100 - selectedInspection.defectPercentage).toFixed(1)}%`} highlight="text-cyan-500" darkMode={darkMode} />
                    <DetailRow label="Model Confidence" value={(selectedInspection.confidenceScores.reduce((a, b) => a + b, 0) / (selectedInspection.confidenceScores.length || 1)).toFixed(2)} darkMode={darkMode} />
                  </div>
               </div>
               <button onClick={() => setSelectedInspection(null)} className="w-full py-6 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-xs mt-8">Acknowledge & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}