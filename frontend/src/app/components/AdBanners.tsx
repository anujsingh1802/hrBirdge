import { useEffect, useState } from 'react';
import { getSettings } from '../lib/api';
import type { SiteConfig } from '../lib/types';

export function AdBanners() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = () => {
      getSettings().then((data) => {
        if (mounted && data) {
          setConfig(data);
        }
      }).catch(console.error);
    };
    
    fetchSettings();
    window.addEventListener('settingsUpdated', fetchSettings);
    
    return () => { 
      mounted = false; 
      window.removeEventListener('settingsUpdated', fetchSettings);
    };
  }, []);

  if (!config || !config.isBannerEnabled) {
    return null;
  }

  // Common banner link wrapper
  const BannerLink = ({ url, img, alt, className }: { url: string, img: string, alt: string, className?: string }) => {
    if (!img) return null;
    const content = <img src={img} alt={alt} className="w-full object-contain rounded-lg shadow-sm hover:shadow-md transition-shadow" />;
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`block ${className}`}>
        {content}
      </a>
    ) : (
      <div className={`block ${className}`}>
        {content}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Inline Banners (Shown only on smaller screens) */}
      <div className="xl:hidden w-full bg-[var(--bg-muted)] border-b border-[var(--border-soft)] p-4 flex flex-col md:flex-row gap-4 items-center justify-center relative z-50">
         {config.leftBannerImage && (
           <BannerLink 
             url={config.leftBannerUrl} 
             img={config.leftBannerImage} 
             alt="Promo Left"
             className="w-full max-w-sm"
           />
         )}
         {config.rightBannerImage && (
           <BannerLink 
             url={config.rightBannerUrl} 
             img={config.rightBannerImage} 
             alt="Promo Right" 
             className="w-full max-w-sm"
           />
         )}
      </div>

      {/* Desktop Fixed Side Banners (Shown only on screens wide enough to not overlap 1280px container) */}
      {/* We use xl:block as the container is max-w-7xl (1280px). If screen is > 1600px, there is room for 160px banners. */}
      {config.leftBannerImage && (
        <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 w-[160px] 2xl:w-[200px] z-[40]">
          <BannerLink 
            url={config.leftBannerUrl} 
            img={config.leftBannerImage} 
            alt="Promo Left" 
          />
        </div>
      )}

      {config.rightBannerImage && (
        <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 w-[160px] 2xl:w-[200px] z-[40]">
          <BannerLink 
            url={config.rightBannerUrl} 
            img={config.rightBannerImage} 
            alt="Promo Right" 
          />
        </div>
      )}
    </>
  );
}
