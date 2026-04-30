import { useState, useEffect, useMemo } from "react";
import axios from "axios";

// --- UI COMPONENTS ---
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
    <div className="h-56 animate-shimmer bg-slate-50" />
    <div className="p-8 flex flex-col flex-grow">
      <div className="w-20 h-2 animate-shimmer rounded bg-slate-100 mb-4" />
      <div className="w-full h-4 animate-shimmer rounded bg-slate-100 mb-2" />
      <div className="w-2/3 h-4 animate-shimmer rounded bg-slate-100 mb-8" />
      <div className="mt-auto space-y-3">
        <div className="w-full h-11 animate-shimmer rounded-lg bg-slate-50" />
      </div>
    </div>
  </div>
);

const Footer = ({ onNavigate, contactPhone, contactEmail, onSupportClick }) => (
  <footer className="bg-slate-900 text-white pt-16 pb-8 px-6 mt-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-slate-900 font-bold text-xs">EL</div>
          <span className="text-lg font-bold tracking-tight">EquipLink</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">The premier marketplace for high-quality industrial and computing equipment infrastructure.</p>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-200">Inventory</h4>
        <ul className="space-y-4 text-sm text-slate-400">
          {["Power", "Building", "Computing", "Industrial"].map((cat) => (
            <li key={cat}><button onClick={() => onNavigate(cat)} className="hover:text-white transition-colors">{cat} Equipment</button></li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-200">Support</h4>
        <ul className="space-y-4 text-sm text-slate-400 font-medium">
          <li><button onClick={() => onSupportClick('how')} className="hover:text-white transition-colors">How it Works</button></li>
          <li><button onClick={() => onSupportClick('safety')} className="hover:text-white transition-colors">Safety Tips</button></li>
          <li><button onClick={() => onSupportClick('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-200">Connect</h4>
        <div className="space-y-4">
          <button onClick={() => window.open(`https://wa.me/${contactPhone}`)} className="block w-full py-3 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all text-center border border-slate-700">WhatsApp Support</button>
          <a href={`mailto:${contactEmail}`} className="block w-full py-3 bg-transparent rounded-lg text-xs font-bold hover:bg-slate-800 transition-all text-center border border-slate-700">Email Inquiry</a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase font-medium">
      <p>© {new Date().getFullYear()} EquipLink Inventory Systems</p>
      <div className="flex gap-6">
        <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">Contact via Email</a>
      </div>
    </div>
  </footer>
);

function App() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({});
  const [supportContent, setSupportContent] = useState(null);

const API_BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8087"           // Use this while coding locally
  : "https://equiplink-api.onrender.com"; // Use this when the site is live
  
  const ADMIN_PASS = "1234";
  const MY_PHONE = "254768407749";
  const MY_EMAIL = "henryabahenya@gmail.com";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
    if (localStorage.getItem("adminAuth") === "true") setIsAdmin(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE_URL);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleToggleSold = async (item) => {
    setProcessing(true);
    const newStatus = item.status === "Sold" ? "Available" : "Sold";
    try {
      const res = await axios.put(`${API_BASE_URL}/${item.id}`, { ...item, status: newStatus });
      setMaterials(prev => prev.map(m => String(m.id) === String(item.id) ? res.data : m));
    } catch (err) { alert("Failed to update status"); }
    setProcessing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    setProcessing(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setMaterials(prev => prev.filter(m => String(m.id) !== String(id)));
    } catch (err) { alert("Delete failed"); }
    setProcessing(false);
  };

  const handleSave = async () => {
    setProcessing(true);
    const entryData = { ...formData, status: formData.status || "Available" };
    try {
      if (modalType === "edit") {
        const res = await axios.put(`${API_BASE_URL}/${selectedMaterial.id}`, entryData);
        setMaterials(prev => prev.map(m => String(m.id) === String(selectedMaterial.id) ? res.data : m));
      } else {
        const res = await axios.post(API_BASE_URL, entryData);
        setMaterials(prev => [...prev, res.data]);
      }
      setModalOpen(false);
    } catch (err) { alert("Save error"); }
    setProcessing(false);
  };

  const filteredMaterials = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return materials.filter((m) => {
      const matchesSearch = 
        m.name?.toLowerCase().includes(term) || 
        m.type?.toLowerCase().includes(term) || 
        m.price?.toString().includes(term);
      const matchesCat = category === "All" || (m.type || "").toLowerCase().includes(category.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [materials, debouncedSearch, category]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {processing && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={resetFilters}>
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform">EL</div>
            <span className="text-lg font-bold tracking-tight">EquipLink</span>
          </div>
          <div className="relative hidden md:block">
            <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-full px-5 py-2 text-sm outline-none w-80 focus:ring-2 ring-slate-100 transition-all pl-10" />
            <span className="absolute left-4 top-2.5 opacity-30 text-xs">🔍</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {isAdmin ? (
            <div className="flex gap-4">
              <button onClick={() => { setModalType("add"); setFormData({}); setModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg transition-all">Add Listing</button>
              <button onClick={() => {setIsAdmin(false); localStorage.removeItem("adminAuth")}} className="text-rose-500 text-xs font-bold uppercase tracking-tighter">Logout</button>
            </div>
          ) : <button onClick={() => setShowLogin(true)} className="text-slate-400 text-xs font-bold hover:text-slate-900 transition-colors">Staff Access</button>}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {["All", "Power", "Building", "Computing", "Industrial"].map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${category === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}>{cat}</button>
          ))}
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-700">
            {filteredMaterials.map((m) => (
              <div key={m.id} className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col ${m.status === "Sold" ? "opacity-75" : ""}`}>
                <div className="h-56 relative overflow-hidden bg-slate-100">
                  <img src={m.image} alt={m.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${m.status === "Sold" ? "grayscale" : ""}`} />
                  {m.status === "Sold" && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <span className="bg-white text-slate-900 px-4 py-1 rounded font-black text-xs tracking-tighter shadow-2xl">SOLD</span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {setFormData(m); setModalType("edit"); setSelectedMaterial(m); setModalOpen(true)}} className="bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white text-[10px] font-bold">EDIT</button>
                      <button onClick={() => handleToggleSold(m)} className="bg-slate-900/90 text-white p-2 rounded-lg shadow-sm text-[10px] font-bold">{m.status === "Sold" ? "RESTOCK" : "MARK SOLD"}</button>
                      <button onClick={() => handleDelete(m.id)} className="bg-rose-500 text-white p-2 rounded-lg shadow-sm text-[10px] font-bold">DEL</button>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.type}</span>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{m.name}</h3>
                  <p className="text-lg font-black text-slate-900 mt-auto pt-4">KES {m.price}</p>
                  <div className="mt-6 flex flex-col gap-2">
                    <button onClick={() => { setSelectedMaterial(m); setModalType("view"); setModalOpen(true); }} className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all">Details</button>
                    <button disabled={m.status === "Sold"} onClick={() => window.open(`https://wa.me/${MY_PHONE}?text=Query: ${m.name}`)} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${m.status === "Sold" ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
                      {m.status === "Sold" ? "Out of Stock" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 animate-in zoom-in-95 duration-500">
            
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">No items found</h3>
            <p className="text-slate-400 text-sm max-w-xs text-center leading-relaxed mb-8">
              We couldn't find any results for "{search || category}" in our current inventory.
            </p>
            <button onClick={resetFilters} className="px-8 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all">Clear all filters</button>
          </div>
        )}
      </main>

      <Footer onNavigate={(cat) => {setCategory(cat); window.scrollTo(0,0)}} contactPhone={MY_PHONE} contactEmail={MY_EMAIL} onSupportClick={(type) => {
        const info = {
          how: { title: "How it Works", body: "We list verified equipment. Click 'Connect' to chat with us on WhatsApp for procurement and delivery details." },
          safety: { title: "Safety Tips", body: "Inspect all items before final release. We handle safe staging in secured locations." },
          terms: { title: "Terms of Service", body: "Items are sold as-is. All sales are final once physical inspection is signed off." }
        };
        setSupportContent(info[type]);
      }} />

      {/* SUPPORT MODAL */}
      {supportContent && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2">{supportContent.title}</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-8">{supportContent.body}</p>
            <button onClick={() => setSupportContent(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}

      {/* ADMIN MODALS */}
      {showLogin && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="font-black text-slate-900 mb-8 uppercase tracking-tighter text-xl">Staff Access</h3>
            <input type="password" placeholder="••••" value={passkey} onChange={(e) => setPasskey(e.target.value)} className="w-full bg-slate-100 p-5 rounded-2xl mb-4 text-center text-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" />
            <button onClick={() => passkey === ADMIN_PASS ? (setIsAdmin(true), localStorage.setItem("adminAuth","true"), setShowLogin(false), setPasskey("")) : alert("Denied")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest">Login</button>
            <button onClick={() => setShowLogin(false)} className="mt-6 text-[10px] text-slate-400 font-bold uppercase">Cancel</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{modalType === "add" ? "New Inventory" : modalType === "edit" ? "Modify Listing" : "Product Specs"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors text-xl">✕</button>
            </div>
            {(modalType === "add" || modalType === "edit") ? (
              <div className="grid grid-cols-1 gap-5">
                {["name", "type", "price", "image", "details"].map((f) => (
                  <div key={f}>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">{f}</label>
                    <input value={formData[f] || ""} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 focus:border-slate-900 outline-none transition-all" />
                  </div>
                ))}
                <button onClick={handleSave} className="bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-4">Save</button>
              </div>
            ) : (
              selectedMaterial && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl"><p className="text-sm text-slate-600 leading-relaxed italic">"{selectedMaterial.details || "No special notes."}"</p></div>
                  <div className="text-xs space-y-4 px-2">
                    <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-400 font-bold">CATEGORY</span><span className="font-black">{selectedMaterial.type}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-400 font-bold">STATUS</span><span className={`font-black ${selectedMaterial.status === 'Sold' ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedMaterial.status?.toUpperCase()}</span></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;