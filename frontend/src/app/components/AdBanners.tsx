import { useEffect, useRef, useState } from 'react';
import { getSettings } from '../lib/api';
import type { SiteConfig } from '../lib/types';

export function AdBanners() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = () => {
      getSettings().then((data) => {
        if (mounted && data) setConfig(data);
      }).catch(console.error);
    };

    fetchSettings();
    window.addEventListener('settingsUpdated', fetchSettings);
    return () => {
      mounted = false;
      window.removeEventListener('settingsUpdated', fetchSettings);
    };
  }, []);

  if (!config || !config.isBannerEnabled) return null;

  return (
    <>
      {/* Mobile/Tablet Inline Banners */}
      <div className="xl:hidden w-full bg-[var(--bg-muted)] border-b border-[var(--border-soft)] px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-center z-50">
        {config.leftBannerImage && (
          <MobileBanner url={config.leftBannerUrl} img={config.leftBannerImage} alt="Promo Left" />
        )}
        {config.rightBannerImage && (
          <MobileBanner url={config.rightBannerUrl} img={config.rightBannerImage} alt="Promo Right" />
        )}
      </div>

      {/* Desktop Left Banner */}
      {config.leftBannerImage && (
        <div className="hidden xl:block fixed z-40" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
          <HoverExpandBanner url={config.leftBannerUrl} img={config.leftBannerImage} alt="Promo Left" />
        </div>
      )}

      {/* Desktop Right Banner */}
      {config.rightBannerImage && (
        <div className="hidden xl:block fixed z-40" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
          <HoverExpandBanner url={config.rightBannerUrl} img={config.rightBannerImage} alt="Promo Right" />
        </div>
      )}
    </>
  );
}

// Desktop banner: default 170x210, expands to natural size on hover
function HoverExpandBanner({ url, img, alt }: { url: string; img: string; alt: string }) {
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const handleLoad = () => {
    if (imgRef.current) {
      setNaturalSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    width: hovered && naturalSize ? `${Math.min(naturalSize.w, 400)}px` : '170px',
    height: hovered && naturalSize ? `${Math.min(naturalSize.h, 500)}px` : '210px',
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: hovered
      ? '0 12px 32px rgba(0,0,0,0.22)'
      : '0 4px 16px rgba(0,0,0,0.12)',
    transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s ease',
    cursor: url ? 'pointer' : 'default',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: hovered ? 'contain' : 'cover',
    display: 'block',
    transition: 'object-fit 0s',
  };

  const content = (
    <div
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img ref={imgRef} src={img} alt={alt} style={imgStyle} onLoad={handleLoad} />
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        {content}
      </a>
    );
  }

  return content;
}

// Mobile banner: full width, no hover expand
function MobileBanner({ url, img, alt }: { url: string; img: string; alt: string }) {
  const imageEl = (
    <img
      src={img}
      alt={alt}
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      }}
    />
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs block">
        {imageEl}
      </a>
    );
  }
  return <div className="w-full max-w-xs">{imageEl}</div>;
}
