import { Link } from "react-router";
import { Briefcase, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--primary-900)] text-[var(--text-inverse)] py-16">
      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Minds Solutions" className="h-12 w-auto object-contain drop-shadow-sm" />
            </div>
            <p className="text-sm text-[var(--text-inverse)]/80 leading-relaxed">
              Connecting talented professionals with their dream careers.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--text-inverse)]">For Candidates</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-applications" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  My Applications
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--text-inverse)]">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-[var(--text-inverse)]/80 hover:text-[var(--text-inverse)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--text-inverse)]">Connect With Us</h4>
            <p className="text-sm text-[var(--text-inverse)]/80 mb-4">
              support@jobportal.com
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-[var(--text-inverse)]/60">
            © 2026 JobPortal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
