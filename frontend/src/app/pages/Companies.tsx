import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getCompanies, Company } from "../lib/api";
import { Search, MapPin, Building2, Star } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CompanyLogo } from "../components/CompanyLogo";

const COMPANY_TYPES = ["MNC", "Startup", "Fintech", "Edtech"];

export function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getCompanies({ search, type: selectedType })
      .then(res => setCompanies(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedType]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <div className="bg-white border-b border-slate-200 py-16 mt-20 md:mt-[88px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Discover Top Companies</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Research potential employers, read reviews, and explore open roles at the world's most innovative workplaces.
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search company by name..."
                className="pl-12 h-14 bg-slate-50 border-slate-200 text-lg rounded-xl focus-visible:ring-blue-500/30"
              />
            </div>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
               <button 
                 onClick={() => setSelectedType("")}
                 className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${selectedType === "" ? "bg-white shadow text-blue-600 ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"}`}
               >
                 All
               </button>
               {COMPANY_TYPES.map(type => (
                 <button 
                   key={type}
                   onClick={() => setSelectedType(type)}
                   className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${selectedType === type ? "bg-white shadow text-blue-600 ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"}`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[320px] bg-slate-100/80 animate-pulse rounded-2xl border border-slate-100" />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companies.map(company => (
              <div key={company._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col h-full group">
                 <div className="flex items-start justify-between mb-5">
                    <div className="w-16 h-16 rounded-xl border border-slate-100 p-2.5 bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden relative">
                      <CompanyLogo 
                        name={company.name} 
                        defaultLogoUrl={company.logo} 
                        className="w-full h-full" 
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1.5 rounded-lg text-sm font-bold border border-yellow-100/50">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                      {company.rating.toFixed(1)}
                    </div>
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-800 mb-1">{company.name}</h3>
                 <div className="flex items-center gap-3 text-slate-500 mb-5 text-sm font-medium">
                   <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-400" /> {company.type}</div>
                   <span className="text-slate-300">•</span>
                   <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" /> {company.location}</div>
                 </div>

                 <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                   {company.description}
                 </p>

                 <div className="flex flex-wrap gap-2 mb-8">
                   {company.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-xs font-semibold tracking-wide">
                       {tag}
                     </span>
                   ))}
                 </div>

                 <div className="mt-auto">
                    <Button variant="outline" className="w-full justify-center group hover:bg-slate-50 border-slate-200 hover:border-blue-200 hover:text-blue-600 font-semibold h-11 rounded-xl">
                      View Open Jobs
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No matching companies found</h3>
            <p className="text-slate-500 mb-6 font-medium">Try removing your selected filter or adjusting your search terms.</p>
            <Button onClick={() => { setSearch(""); setSelectedType(""); }} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-12 shadow-md hover:shadow-lg transition-all">Clear All Filters</Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
