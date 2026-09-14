import React, { useState, useEffect } from 'react';
import { resolveMediaImage } from '../../utils/imageResolver';
import { Gamepad2, Film, ImageOff } from 'lucide-react';

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    resolveMediaImage(type, title, year, platform, customCover)
      .then((url) => {
        if (!isMounted) return;
        if (url) {
          setImageUrl(url);
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
    ...getAspectRatioStyle(),
    ...style
  };

  if (hasError || (!isLoading && !imageUrl)) {
    return (
      <div
        className={`media-poster-fallback ${className}`}
        style={{
          ...containerStyle,
          background: type === 'game'
            ? 'linear-gradient(135deg, #131b2e 0%, #090d16 100%)'
            : 'linear-gradient(135deg, #241333 0%, #090d16 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          textAlign: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: type === 'game' ? 'var(--primary-light)' : '#c084fc'
        }}>
          {type === 'game' ? <Gamepad2 size={20} /> : <Film size={20} />}
        </div>
        <strong style={{
          fontSize: '12px',
          color: '#e2e8f0',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </strong>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ImageOff size={10} />
          Poster Unavailable
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
