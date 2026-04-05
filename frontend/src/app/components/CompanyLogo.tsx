import React, { useEffect, useState, useRef } from 'react';
import { getCompanyLogo } from '../lib/api';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  name: string;
  defaultLogoUrl?: string; // Fallback if API totally fails
  className?: string;
  alt?: string;
}

export function CompanyLogo({ name, defaultLogoUrl, className = '', alt }: CompanyLogoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(false);

    // If it's empty, just show placeholder
    if (!name) {
      setError(true);
      setLoading(false);
      return;
    }

    getCompanyLogo(name)
      .then((url) => {
        if (mounted.current) {
          setSrc(url);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setError(true);
        }
      })
      .finally(() => {
        if (mounted.current) {
          setLoading(false);
        }
      });

    return () => {
      mounted.current = false;
    };
  }, [name]);

  const handleError = () => {
    setError(true);
  };

  // If we have an existing default direct from DB, we try that if the proxy fails or while loading? 
  // No, the proxy is safer because Clearbit links fail outright with DNS errors and console logs spam.
  
  if (loading) {
    return (
      <div className={`animate-pulse bg-slate-100 flex items-center justify-center rounded-xl border border-slate-100 ${className}`}>
        <Building2 className="w-1/3 h-1/3 text-slate-300" />
      </div>
    );
  }

  if (error || !src) {
    if (defaultLogoUrl && !defaultLogoUrl.includes('clearbit')) {
      return (
        <img 
          src={defaultLogoUrl} 
          alt={alt || `${name} Logo`} 
          className={`object-contain bg-white ${className}`} 
          onError={(e) => {
            // Ultimate fallback
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'C')}&background=random&color=fff&size=200`;
          }}
        />
      );
    }
    
    // Internal fallback stylized letter
    const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'C')}&background=random&color=fff&size=200&font-size=0.4`;
    return (
      <img 
        src={fallbackSrc} 
        alt={alt || `${name} Logo`} 
        className={`object-cover bg-white ${className}`} 
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || `${name} Logo`}
      onError={handleError}
      loading="lazy"
      className={`object-contain bg-white transition-opacity duration-300 ${className}`}
    />
  );
}
