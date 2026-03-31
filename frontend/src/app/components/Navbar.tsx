import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, Search, Bell, MessageSquare, 
  User, Menu, X, LogOut, Settings, Bookmark, 
  ChevronDown, Building2, MapPin, Clock, ArrowRight, FileText,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getJobs } from "../lib/api";
import type { Job } from "../lib/types";

// ─────────────────────────────────────────────────────────
// Debounce Hook
// ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─────────────────────────────────────────────────────────
// Search Bar Component
// ─────────────────────────────────────────────────────────
function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<Job[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const recent = localStorage.getItem("recentSearches");
    if (recent) setRecentSearches(JSON.parse(recent));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      getJobs({ search: debouncedQuery, limit: 5 })
        .then(res => setSuggestions(res.items))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter(t => t !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    saveRecentSearch(term);
    setIsFocused(false);
    navigate(`/jobs?search=${encodeURIComponent(term)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (query.trim() ? suggestions.length : recentSearches.length);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (query.trim() && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex].title);
        } else if (!query.trim() && recentSearches[selectedIndex]) {
          handleSearch(recentSearches[selectedIndex]);
        }
      } else {
        handleSearch(query);
      }
    }
  };

  return (
    <div className="relative group hidden lg:block" ref={searchRef}>
      <motion.div
        animate={{
          width: isFocused ? 320 : 220,
          backgroundColor: isFocused ? "#ffffff" : "#f8f9fb",
          boxShadow: isFocused 
            ? "0 4px 20px rgba(59, 130, 246, 0.15)" 
            : "0 0px 0px rgba(0,0,0,0)"
        }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center gap-2 h-11 px-4 rounded-full border border-transparent transition-colors duration-300 group-hover:bg-white group-hover:border-slate-200 focus-within:border-blue-500/40 relative z-50"
      >
        <button onClick={() => handleSearch(query)}>
          <Search className={`w-[18px] h-[18px] transition-colors ${isFocused ? "text-blue-500" : "text-slate-400"}`} />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={onKeyDown}
          placeholder="Search jobs here"
          onFocus={() => setIsFocused(true)}
          className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
        />
      </motion.div>

      <AnimatePresence>
        {isFocused && (query.trim() || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] left-0 w-[400px] bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden py-3 z-50"
          >
            {!query.trim() ? (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Searches</div>
                {recentSearches.map((term, idx) => (
                  <div
                    key={term}
                    onClick={() => handleSearch(term)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selectedIndex === idx ? "bg-slate-50" : "hover:bg-slate-50"}`}
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 flex-1">{term}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">Suggestions</div>
                {suggestions.length > 0 ? (
                  suggestions.map((job, idx) => (
                    <div
                      key={job.id}
                      onClick={() => handleSearch(job.title)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex flex-col gap-1 px-4 py-2.5 cursor-pointer transition-colors ${selectedIndex === idx ? "bg-blue-50/50" : "hover:bg-blue-50/50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-semibold text-slate-800">{job.title}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-5.5 text-xs text-slate-500">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No matching jobs found
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Drodown Components
// ─────────────────────────────────────────────────────────
function ServicesMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  let timeoutId: any = null;

  const handleEnter = () => { clearTimeout(timeoutId); setIsOpen(true); };
  const handleLeave = () => { timeoutId = setTimeout(() => setIsOpen(false), 150); };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
        Services
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[800px] bg-white rounded-2xl shadow-[0_16px_40px_rgb(0,0,0,0.12)] border border-slate-100/80 overflow-hidden flex z-50 p-6 gap-8"
          >
            {/* Column 1 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
                <FileText className="w-4 h-4" />
                Resume Writing
              </div>
              <ul className="space-y-3">
                <li><Link to="/services/text-resume" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors block p-2 rounded-lg hover:bg-slate-50">Text Resume</Link></li>
                <li><Link to="/services/visual-resume" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors block p-2 rounded-lg hover:bg-slate-50">Visual Resume</Link></li>
                <li><Link to="/services/resume-critique" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors block p-2 rounded-lg hover:bg-slate-50">Resume Critique</Link></li>
              </ul>
            </div>
            {/* Column 2 */}
            <div className="flex-1 border-l border-slate-100 pl-8">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4">
                <Zap className="w-4 h-4" />
                Recruiter Visibility
              </div>
              <ul className="space-y-3">
                <li><Link to="/services/resume-display" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors block p-2 rounded-lg hover:bg-slate-50">Resume Display</Link></li>
              </ul>
            </div>
            {/* Column 3 */}
            <div className="flex-1 border-l border-slate-100 pl-8 bg-slate-50/50 -m-6 p-6">
              <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
                <Bookmark className="w-4 h-4" />
                Free Resources
              </div>
              <ul className="space-y-3">
                <li><Link to="/services/resume-maker" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors block p-2 rounded-lg hover:bg-white">Resume Maker</Link></li>
                <li><Link to="/services/resume-samples" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors block p-2 rounded-lg hover:bg-white">Resume Samples</Link></li>
                <li><Link to="/services/job-letters" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors block p-2 rounded-lg hover:bg-white">Job Letter Samples</Link></li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmployersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  let timeoutId: any = null;

  const handleEnter = () => { clearTimeout(timeoutId); setIsOpen(true); };
  const handleLeave = () => { timeoutId = setTimeout(() => setIsOpen(false), 150); };

  return (
    <div className="relative hidden md:block" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
        For Employers
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
             initial={{ opacity: 0, y: 10, scale: 0.98 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 5, scale: 0.98 }}
             transition={{ duration: 0.15 }}
             className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden py-2 z-50 origin-top-right"
          >
            <Link to="/employer/buy" className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">Buy Online</Link>
            <Link to="/employer/cloud" className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">Talent Cloud</Link>
            <div className="h-px bg-slate-100 my-1 font-medium" />
            <Link to="/login" className="block px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50/50 transition-colors">Employer Login</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Nav Items
// ─────────────────────────────────────────────────────────
function DesktopMenu() {
  const location = useLocation();

  return (
    <div className="hidden md:flex items-center gap-1 xl:gap-2 ml-8">
      <Link to="/jobs" className={`px-4 py-2 text-[15px] font-medium transition-colors duration-200 hover:text-blue-600 ${location.pathname === '/jobs' ? "text-blue-600 font-semibold" : "text-slate-600"}`}>
        Jobs
      </Link>
      <Link to="/companies" className={`px-4 py-2 text-[15px] font-medium transition-colors duration-200 hover:text-blue-600 ${location.pathname === '/companies' ? "text-blue-600 font-semibold" : "text-slate-600"}`}>
        Companies
      </Link>
      <ServicesMegaMenu />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────────────────
function UserDropdown({ user, logout }: { user: any; logout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors focus:outline-none border border-transparent hover:border-slate-200"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-sm">
          {user?.name?.charAt(0) || "U"}
        </div>
        <span className="text-sm font-semibold text-slate-700 hidden lg:block">
          {user?.name || "User"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100/60 overflow-hidden py-2 z-50 origin-top-right"
          >
            <div className="px-4 py-3 border-b border-slate-100/80 mb-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link to="/my-applications" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
              <Briefcase className="w-4 h-4" /> My Applications
            </Link>
            <Link to="/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
              <Bookmark className="w-4 h-4" /> Saved Jobs
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            
            <div className="h-px bg-slate-100/80 my-1 font-medium" />
            
            <button 
              onClick={() => { setIsOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mobile Drawer Component
// ─────────────────────────────────────────────────────────
function MobileDrawer({ isOpen, onClose, isAuthenticated, user, logout }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Menu</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
              <Link to="/jobs" onClick={onClose} className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors">Jobs</Link>
              <Link to="/companies" onClick={onClose} className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors">Companies</Link>
              <Link to="/services" onClick={onClose} className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors">Services</Link>
              
              <div className="h-px bg-slate-100 my-4" />

              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={() => { logout(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50/50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 px-2 mt-4">
                  <Link to="/login" onClick={onClose} className="flex justify-center items-center py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Login</Link>
                  <Link to="/register" onClick={onClose} className="flex justify-center items-center py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all">Sign Up Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────
// Main Navbar Component
// ─────────────────────────────────────────────────────────
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        initial={{ backgroundColor: "rgba(255, 255, 255, 1)", borderBottomColor: "rgba(226, 232, 240, 0)" }}
        animate={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 1)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
          borderBottomColor: isScrolled ? "rgba(226, 232, 240, 0.8)" : "rgba(226, 232, 240, 0)",
          boxShadow: isScrolled ? "0 4px 25px -10px rgba(0, 0, 0, 0.08)" : "0 0px 0px 0px rgba(0,0,0,0)"
        }}
        style={{ borderBottomWidth: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[88px] flex items-center justify-between">
          
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 mr-4 transition-transform hover:scale-[1.02]">
              <img src="/logo.svg" alt="HYREIN Logo" className="h-[60px] w-auto object-contain" />
            </Link>
            <DesktopMenu />
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <SearchBar />
            <EmployersDropdown />

            <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-4 mr-0 lg:mr-2">
              <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-full transition-all">
                <Bell className="w-[1.2rem] h-[1.2rem]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>

            {isAuthenticated ? (
              <UserDropdown user={user} logout={() => { logout(); navigate("/"); }} />
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 tracking-wide rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all duration-300">
                  Register
                </Link>
              </div>
            )}

            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      <MobileDrawer 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isAuthenticated={isAuthenticated}
        user={user}
        logout={() => { logout(); navigate("/"); }}
      />
    </>
  );
}
