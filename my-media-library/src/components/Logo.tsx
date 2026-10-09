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
      <defs>
        {/* Sleek Vault Gradient (Indigo -> Violet -> Pink) */}
        <linearGradient id="vaultGradPrimary" x1="6" y1="6" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Media Shelf Bar Gradient */}
        <linearGradient id="shelfGradBar" x1="5" y1="25" x2="27" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Ambient Glow */}
        <radialGradient id="logoCoreGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle interior ambient radiance */}
      <circle cx="16" cy="14" r="9" fill="url(#logoCoreGlow)" />

      {/* Minimalist Vault Arch / Monogram "V" */}
      <path
        d="M7.5 7.5L16 20.5L24.5 7.5"
        stroke="url(#vaultGradPrimary)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Aesthetic Media Shelf Line (Base foundation) */}
      <path
        d="M6 25.5H26"
        stroke="url(#shelfGradBar)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Center Media Gem / Play Diamond */}
      <circle cx="16" cy="10.5" r="1.8" fill="#F472B6" />
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
            style={{ fontSize: `${badgeDimensions.nameSize}px` }}
          >
            Vault <span className="brand-accent-amp">&</span> Shelf
          </span>
          {showTagline && (
            <span
              className="brand-tagline"
              style={{ fontSize: `${badgeDimensions.tagSize}px` }}
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
