import React, { useState, useEffect } from 'react';
import { resolveMediaImage } from '../../utils/imageResolver';
import { Gamepad2, Film } from 'lucide-react';

interface MediaPosterProps {
  title: string;
  type: 'game' | 'movie';
  year?: number;
  platform?: string;
  customCover?: string;
  alt?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'cinema' | 'banner' | 'square';
  style?: React.CSSProperties;
}

export const MediaPoster: React.FC<MediaPosterProps> = ({
  title,
  type,
  year,
  platform,
  customCover,
  alt,
  className = '',
  aspectRatio = 'portrait',
  style = {}
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (customCover && customCover.trim()) {
      const c = customCover.trim();
      if (c.startsWith('http') || c.startsWith('/') || c.startsWith('blob:') || c.startsWith('data:')) {
        return c;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !customCover);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Resolve image
    resolveMediaImage(type, title, year, platform, customCover)
      .then((url) => {
        if (!isMounted) return;
        if (url) {
          setImageUrl(url);
          setHasError(false);
        } else {
          setImageUrl(null);
          setHasError(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [title, type, year, platform, customCover]);

  // Determine aspect ratio class / style
  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (aspectRatio) {
      case 'cinema':
        return { aspectRatio: '2 / 3' };
      case 'portrait':
        return { aspectRatio: type === 'movie' ? '2 / 3' : '3 / 4' };
      case 'banner':
        return { aspectRatio: '16 / 9' };
      case 'square':
        return { aspectRatio: '1 / 1' };
      default:
        return { aspectRatio: '2 / 3' };
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0c1017',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(style?.height === '100%' ? {} : getAspectRatioStyle()),
    ...style
  };

  if (hasError || (!isLoading && !imageUrl)) {
    // Compact icon-only fallback for square thumbnails (e.g. Timeline)
    if (aspectRatio === 'square') {
      return (
        <div
          className={`media-poster-fallback ${className}`}
          style={{
            ...containerStyle,
            background: type === 'game'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #3b0764 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: type === 'game' ? 'var(--primary-light)' : '#c084fc',
            userSelect: 'none'
          }}
          title={title}
        >
          {type === 'game' ? <Gamepad2 size={20} /> : <Film size={20} />}
        </div>
      );
    }

    // Wide horizontal banner fallback for Detail modal header
    if (aspectRatio === 'banner') {
      return (
        <div
          className={`media-poster-fallback ${className}`}
          style={{
            ...containerStyle,
            aspectRatio: 'unset',
            height: '100%',
            background: type === 'game'
              ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.25), transparent 70%), linear-gradient(135deg, #131b2e 0%, #090d16 100%)'
              : 'radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.25), transparent 70%), linear-gradient(135deg, #241333 0%, #090d16 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: type === 'game' ? 'var(--primary-light)' : '#c084fc',
            userSelect: 'none'
          }}
          title={title}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: type === 'game' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {type === 'game' ? <Gamepad2 size={24} /> : <Film size={24} />}
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{title}</span>
        </div>
      );
    }

    return (
      <div
        className={`media-poster-fallback ${className}`}
        style={{
          ...containerStyle,
          background: type === 'game'
            ? 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.25), transparent 70%), linear-gradient(135deg, #131b2e 0%, #090d16 100%)'
            : 'radial-gradient(circle at 50% 30%, rgba(192, 132, 252, 0.25), transparent 70%), linear-gradient(135deg, #241333 0%, #090d16 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px 16px',
          textAlign: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: '4px',
            background: type === 'game' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(168, 85, 247, 0.25)',
            color: type === 'game' ? 'var(--primary-light)' : '#c084fc'
          }}>
            {type === 'game' ? (platform || 'GAME') : 'CINEMA'}
          </span>
          {year && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {year}
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: type === 'game' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)',
            border: `1px solid ${type === 'game' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: type === 'game' ? 'var(--primary-light)' : '#c084fc',
            boxShadow: `0 0 16px ${type === 'game' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`
          }}>
            {type === 'game' ? <Gamepad2 size={24} /> : <Film size={24} />}
          </div>
          <strong style={{
            fontSize: '13px',
            color: '#fff',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            {title}
          </strong>
        </div>

        <span style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          Vault & Shelf Edition
        </span>
      </div>
    );
  }

  return (
    <div className={`media-poster-container ${className}`} style={containerStyle}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #0c1017 0%, #151c2e 50%, #0c1017 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1
          }}
        />
      )}

      {/* Real Poster Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt || title}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: aspectRatio === 'banner' ? 'center 20%' : 'center',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease, transform 0.4s ease'
          }}
          className="media-poster-img"
        />
      )}
    </div>
  );
};

export default MediaPoster;
