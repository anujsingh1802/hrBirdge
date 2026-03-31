import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Link, useLocation } from "react-router";

export function PlaceholderPage() {
  const location = useLocation();
  const rawPath = location.pathname.split("/").pop() || "Page";
  const title = rawPath.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-[88px]">
        <div className="bg-white/80 backdrop-blur-sm p-12 md:p-16 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-3xl w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm border border-blue-100/50 transform hover:scale-105 transition-transform duration-300">
            🚀
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-5">{title}</h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed font-medium">
            This module is currently being provisioned. We are preparing to launch a robust, enterprise-grade experience very soon.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all font-semibold text-base">
               <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl h-14 px-8 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-base transition-all">
               <Link to="/jobs">Browse Live Jobs</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
