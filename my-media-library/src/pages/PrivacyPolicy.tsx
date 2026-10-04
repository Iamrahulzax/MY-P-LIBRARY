import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  HardDrive,
  FileText,
  UserCheck,
  HelpCircle,
  ArrowLeft,
  Share2
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { games, movies, profile, exportLibrary, resetToDefault } = useLibrary();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExport = () => {
    const data = exportLibrary();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-shelf-privacy-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to clear your local modifications and reset your library to defaults? This action will remove custom items and ratings stored on this browser.'
      )
    ) {
      resetToDefault();
      alert('Your local data has been reset to defaults.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="privacy-page-container animate-fade-in">
      {/* Top Breadcrumb & Action Row */}
      <div className="privacy-top-bar">
        <Link to="/" className="btn-secondary privacy-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Shelf</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="btn-secondary privacy-share-btn"
          title="Copy page link"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 size={15} color="#10b981" />
              <span style={{ color: '#34d399' }}>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={15} />
              <span>Share Policy</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Header */}
      <header className="privacy-hero">
        <div className="privacy-hero-badge">
          <ShieldCheck size={18} color="#22c55e" />
          <span>Privacy First • Zero Cloud Surveillance</span>
        </div>
        <h1 className="privacy-hero-title">
          Privacy Policy & <span className="privacy-gradient-text">Data Security</span>
        </h1>
        <p className="privacy-hero-subtitle">
          Vault & Shelf is architected to keep your gaming and movie collection 100% under your control.
          We don't track you, we don't sell your data, and your media entries never leave your device without your explicit permission.
        </p>

        <div className="privacy-meta-chips">
          <div className="privacy-chip">
            <span className="dot dot-green" />
            <span>Effective Date: <strong>October 2026</strong></span>
          </div>
          <div className="privacy-chip">
            <Lock size={13} color="#818cf8" />
            <span>Architecture: <strong>Client-Side Local Storage</strong></span>
          </div>
          <div className="privacy-chip">
            <EyeOff size={13} color="#38bdf8" />
            <span>Tracking Cookies: <strong>None (0%)</strong></span>
          </div>
        </div>
      </header>

      {/* Live Data Transparency Inspector */}
      <section className="privacy-transparency-card">
        <div className="transparency-header">
          <div className="transparency-title-wrap">
            <div className="transparency-icon-box">
              <HardDrive size={22} color="#6366f1" />
            </div>
            <div>
              <h2 className="transparency-title">Live Transparency Inspector</h2>
              <p className="transparency-subtitle">
                Here is the exact data currently stored in your browser's Local Storage for this session:
              </p>
            </div>
          </div>
          <div className="transparency-badge">
            <Sparkles size={14} color="#fbbf24" />
            <span>Live Device Session</span>
          </div>
        </div>

        <div className="transparency-stats-grid">
          <div className="transparency-stat-box">
            <span className="stat-label">Stored Games</span>
            <span className="stat-value" style={{ color: '#38bdf8' }}>{games.length}</span>
            <span className="stat-sub">in <code>vault_shelf_games_v2</code></span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Stored Movies</span>
            <span className="stat-value" style={{ color: '#a855f7' }}>{movies.length}</span>
            <span className="stat-sub">in <code>vault_shelf_movies_v2</code></span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Profile Profile</span>
            <span className="stat-value" style={{ color: '#34d399', fontSize: '18px' }}>
              {profile.name}
            </span>
            <span className="stat-sub">in <code>vault_shelf_user_profile_v1</code></span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Cloud Sync State</span>
            <span className="stat-value" style={{ color: '#94a3b8', fontSize: '16px' }}>Offline / Local</span>
            <span className="stat-sub">0 requests to third-party ad brokers</span>
          </div>
        </div>

        <div className="transparency-actions-bar">
          <div className="transparency-actions-info">
            <UserCheck size={16} color="#34d399" />
            <span>You own 100% of this data. You can export a JSON backup or wipe local storage at any time.</span>
          </div>
          <div className="transparency-btn-group">
            <button
              type="button"
              onClick={handleExport}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px', gap: '8px' }}
            >
              <Download size={15} />
              <span>Download My Data (JSON)</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px', gap: '8px', color: '#f87171' }}
            >
              <RotateCcw size={15} />
              <span>Reset Local Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Policy Sections */}
      <div className="privacy-sections-grid">
        {/* Section 1 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Database size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 01</div>
            <h3>What Information We Store & Where</h3>
            <p>
              Vault & Shelf operates as a <strong>privacy-by-design, client-first web application</strong>.
              All your customized media records, ratings, personal review notes, backlog tags, and custom profile details
              are persisted directly inside your web browser using HTML5 <code>window.localStorage</code>.
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Game Entries:</strong> Titles, genres, platform selections, playtime hours, review thoughts, ratings, and status tags (Playing, Completed, Dropped, Backlog).
              </li>
              <li>
                <strong>Movie Entries:</strong> Movie titles, director credits, release years, personal reviews, rewatch tags, and streaming/viewing status.
              </li>
              <li>
                <strong>User Profile:</strong> Local display nickname, collector tagline, and chosen avatar preset.
              </li>
              <li>
                <strong>Cache Data:</strong> Verified poster image URLs cached temporarily to optimize rendering speeds.
              </li>
            </ul>
          </div>
        </article>

        {/* Section 2 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <EyeOff size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 02</div>
            <h3>What We NEVER Collect</h3>
            <p>
              We firmly believe personal libraries should remain personal. The application is completely free of intrusive monitoring software:
            </p>
            <div className="privacy-callout-box">
              <div className="callout-item">
                <CheckCircle2 size={16} color="#ef4444" />
                <span><strong>No Account Sign-in Required:</strong> No email address, password, phone number, or KYC.</span>
              </div>
              <div className="callout-item">
                <CheckCircle2 size={16} color="#ef4444" />
                <span><strong>No Telemetry or User Fingerprinting:</strong> No Canvas fingerprinting or background location tracking.</span>
              </div>
              <div className="callout-item">
                <CheckCircle2 size={16} color="#ef4444" />
                <span><strong>No Behavioral Advertising:</strong> We do not run Google Ads, Meta Pixel, or behavioral tracking scripts.</span>
              </div>
              <div className="callout-item">
                <CheckCircle2 size={16} color="#ef4444" />
                <span><strong>No Data Monetization:</strong> Your gaming tastes and cinema preferences are never packaged or sold to advertisers.</span>
              </div>
            </div>
          </div>
        </article>

        {/* Section 3 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <ExternalLink size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 03</div>
            <h3>Third-Party Media Assets & CDNs</h3>
            <p>
              To present high-definition covers and movie trailers, the application requests public media assets:
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Official Box Art & Media CDNs:</strong> Game covers and movie posters are loaded from verified public CDNs (e.g. Wikimedia Commons, TMDB, official game studio press kits, Unsplash). When your browser retrieves these images, standard HTTP headers (like IP address and User-Agent) are processed by those CDNs solely to deliver the image file.
              </li>
              <li>
                <strong>YouTube Trailer Links:</strong> If you click to view a YouTube trailer modal or link, YouTube's privacy policy and terms of service apply to that interaction.
              </li>
              <li>
                <strong>Web Fonts:</strong> Web fonts are loaded via Google Fonts. Google may log generic request data according to their public fonts privacy policy.
              </li>
            </ul>
          </div>
        </article>

        {/* Section 4 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <FileText size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 04</div>
            <h3>Cookies & Storage Policies</h3>
            <p>
              Vault & Shelf does not use persistent HTTP tracking cookies. Instead, the application utilizes:
            </p>
            <div className="privacy-table-wrapper">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Storage Key</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>vault_shelf_games_v2</code></td>
                    <td>LocalStorage</td>
                    <td>Saves your added games, playtime, and reviews</td>
                    <td>Until user resets or clears browser</td>
                  </tr>
                  <tr>
                    <td><code>vault_shelf_movies_v2</code></td>
                    <td>LocalStorage</td>
                    <td>Saves your movie log, ratings, and watch dates</td>
                    <td>Until user resets or clears browser</td>
                  </tr>
                  <tr>
                    <td><code>vault_shelf_user_profile_v1</code></td>
                    <td>LocalStorage</td>
                    <td>Saves your nickname, custom tagline, and avatar</td>
                    <td>Until user resets or clears browser</td>
                  </tr>
                  <tr>
                    <td><code>media_poster_cache_v1</code></td>
                    <td>LocalStorage</td>
                    <td>Speeds up poster rendering & avoids broken links</td>
                    <td>Until user resets or clears browser</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>

        {/* Section 5 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Lock size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 05</div>
            <h3>Your Data Rights (GDPR & CCPA Friendly)</h3>
            <p>
              Because your information stays in your local browser sandbox, you already possess instant, autonomous control that exceeds conventional GDPR and CCPA requirements:
            </p>
            <div className="rights-grid">
              <div className="rights-box">
                <h4>Right to Access & Portability</h4>
                <p>Click "Download My Data (JSON)" at any time to receive a standardized, human-readable backup of your entire media catalogue.</p>
              </div>
              <div className="rights-box">
                <h4>Right to Rectification</h4>
                <p>Edit any title, review, rating, or tag directly through the card edit modals with immediate local update.</p>
              </div>
              <div className="rights-box">
                <h4>Right to Erasure ("Forget Me")</h4>
                <p>Delete individual entries with the trash icon or hit "Reset Local Data" to immediately wipe all local database keys.</p>
              </div>
              <div className="rights-box">
                <h4>Zero Vendor Lock-in</h4>
                <p>Move your JSON backup to another computer, browser, or script at any moment without proprietary barriers.</p>
              </div>
            </div>
          </div>
        </article>

        {/* Section 6 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <HelpCircle size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Section 06</div>
            <h3>Contact & Open Source Attribution</h3>
            <p>
              Have questions or suggestions regarding data management or security practices in Vault & Shelf?
              This project is built and maintained as an open portfolio piece and personal library.
            </p>
            <div className="privacy-contact-box">
              <div>
                <strong>Developer & Maintainer:</strong> Rahul (@Iamrahulzax)
              </div>
              <div>
                <strong>GitHub Profile:</strong>{' '}
                <a
                  href="https://github.com/Iamrahulzax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="privacy-link"
                >
                  https://github.com/Iamrahulzax
                </a>
              </div>
              <div>
                <strong>Source Repository:</strong> Gaming Parlour & Media Vault Workspace
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Footer Navigation CTA */}
      <div className="privacy-footer-cta">
        <div>
          <h3>Ready to explore your library?</h3>
          <p>Your games and movies are safe on your local shelf.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
            Go to Dashboard
          </Link>
          <Link to="/games" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Browse Games
          </Link>
          <Link to="/movies" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
