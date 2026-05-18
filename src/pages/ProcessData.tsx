import { useEffect, useState } from "react";
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Eye, 
  Search,
  Calendar,
  RefreshCw,
  Database,
  Folder,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

// --- Interfaces ---

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

interface ProcessDataProps {
  darkMode: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  darkMode: boolean;
}

const ProcessData = ({ darkMode }: ProcessDataProps) => {
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

  // Fetch batch list on mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = () => {
    fetch("http://localhost:8000/batches")
      .then((res) => res.json())
      .then((data: BatchInfo[]) => {
        setBatches(data);
      })
      .catch((err) => console.error("Failed to fetch batches", err));
  };

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

  // Folder Navigation View
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

  // Analytics Detail View
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation & Header */}
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

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchBatch(selectedBatch)}
            className={`p-3 rounded-2xl border transition-all ${cardClass} hover:border-cyan-500/50`}
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin text-cyan-500" : "text-slate-400"} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          title="Total Processed" 
          value={batchData?.header.total_images || 0} 
          icon={Package} 
          color="text-blue-500" 
          darkMode={darkMode} 
        />
        <KPICard 
          title="Units Passed" 
          value={batchData?.header.passed || 0} 
          icon={CheckCircle2} 
          color="text-emerald-500" 
          darkMode={darkMode} 
        />
        <KPICard 
          title="Units Rejected" 
          value={batchData?.header.failed || 0} 
          icon={XCircle} 
          color="text-rose-500" 
          darkMode={darkMode} 
        />
        <KPICard 
          title="AI Accuracy" 
          value={`${batchData?.header.batch_accuracy || 0}%`} 
          icon={Zap} 
          color="text-cyan-500" 
          darkMode={darkMode} 
        />
      </div>

      {/* Main Content Area */}
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
                <th className="px-8 py-5">Verification Status</th>
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
                    <td className={`px-8 py-5 font-mono text-xs font-bold ${textClass} max-w-[200px] truncate`}>
                      {img.image_name}
                    </td>
                    <td className="px-8 py-5 text-xs font-medium opacity-60">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        {img.processed_time}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono w-10">{img.yield_percentage}%</span>
                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${img.yield_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedImage(`http://localhost:8000/batches/${selectedBatch}/image/${img.image_name}`);
                          setShowModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500 hover:text-black transition-all transform active:scale-95 group-hover:shadow-lg"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredImages.length === 0 && (
            <div className="py-24 text-center opacity-30">
               <Database size={48} className="mx-auto mb-4" />
               <p className="text-xs font-black uppercase tracking-[0.3em]">No Records found in Buffer</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className={`relative max-w-5xl w-full rounded-[3rem] border shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col ${cardClass} animate-in zoom-in-95 duration-300`}>
             <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-cyan-500/20 rounded-2xl">
                      <Eye size={20} className="text-cyan-500" />
                   </div>
                   <h2 className="font-black uppercase tracking-tighter text-xl">Asset Inspection Detail</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-full hover:bg-white/10 text-slate-400 transition-colors">
                  <XCircle size={24} />
                </button>
             </div>
             
             <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-white/5 shadow-inner">
                <img src={selectedImage} alt="Processed Inspection" className="max-h-[65vh] object-contain p-2" />
             </div>
             
             <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-10 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Close Analysis
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, darkMode }: KPICardProps) => (
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

export default ProcessData;