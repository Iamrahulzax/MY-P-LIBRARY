import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  minimal?: boolean;
  className?: string;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`}
      aria-hidden="true"
    >
      {/* Minimalist Vault Arch / Monogram "V" */}
      <path
        d="M7.5 7.5L16 20.5L24.5 7.5"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Media Shelf Bar Line */}
      <path
        d="M6 25.5H26"
        stroke="#ffffff"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Center Media Accent (Chai amber-orange) */}
      <circle cx="16" cy="10.5" r="2" fill="#FF7D0C" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  minimal = false,
  className = ''
}) => {
  const badgeDimensions = {
    sm: { box: 30, icon: 18, nameSize: 15, tagSize: 9.5 },
    md: { box: 38, icon: 22, nameSize: 18, tagSize: 10.5 },
    lg: { box: 46, icon: 26, nameSize: 22, tagSize: 12 }
  }[size];

  return (
    <div className={`brand-logo-container brand-size-${size} ${className}`}>
      {/* Aesthetic Minimal Logo Badge */}
      <div
        className="logo-badge"
        style={{
          width: `${badgeDimensions.box}px`,
          height: `${badgeDimensions.box}px`,
          minWidth: `${badgeDimensions.box}px`,
          minHeight: `${badgeDimensions.box}px`,
          maxWidth: `${badgeDimensions.box}px`,
          maxHeight: `${badgeDimensions.box}px`
        }}
        aria-label="Vault & Shelf Logo"
      >
        <LogoIcon size={badgeDimensions.icon} />
      </div>

      {/* Clean Brand Typography */}
      {!minimal && (
        <div className="brand-text-wrapper">
          <span
            className="brand-name"
            style={{ fontSize: `${badgeDimensions.nameSize}px`, fontFamily: 'var(--font-brand)' }}
          >
            Vault <span className="brand-accent-amp" style={{ color: '#FF7D0C', fontWeight: 600 }}>&</span> Shelf
          </span>
          {showTagline && (
            <span
              className="brand-tagline"
              style={{ fontSize: `${badgeDimensions.tagSize}px`, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}
            >
              Media Library
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
