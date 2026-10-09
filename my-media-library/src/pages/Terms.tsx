import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import {
  FileText,
  Scale,
  Shield,
  Gamepad2,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

const Terms: React.FC = () => {
  const { exportLibrary } = useLibrary();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExport = () => {
    const data = exportLibrary();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-shelf-terms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/privacy" className="btn-secondary privacy-back-btn">
            <Shield size={15} />
            <span>Privacy Policy</span>
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
                <span>Share Terms</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <header className="privacy-hero">
        <div className="privacy-hero-badge" style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.12)' }}>
          <Scale size={18} color="#818cf8" />
          <span>Legal Agreement • Terms of Service</span>
        </div>
        <h1 className="privacy-hero-title">
          Terms & <span className="privacy-gradient-text">Conditions</span>
        </h1>
        <p className="privacy-hero-subtitle">
          Welcome to Vault & Shelf and GameZone Parlor. These terms govern your use of our personal media
          cataloging platform and gaming station portal. We believe in transparency, fair use, and respect for creative works.
        </p>

        <div className="privacy-meta-chips">
          <div className="privacy-chip">
            <Clock size={13} color="#34d399" />
            <span>Last Updated: <strong>October 2026</strong></span>
          </div>
          <div className="privacy-chip">
            <BookOpen size={13} color="#818cf8" />
            <span>Usage License: <strong>Personal & Non-Commercial</strong></span>
          </div>
          <div className="privacy-chip">
            <Sparkles size={13} color="#fbbf24" />
            <span>Fair Use: <strong>Editorial, Archival & Review</strong></span>
          </div>
        </div>
      </header>

      {/* Quick Summary Highlights */}
      <section className="privacy-transparency-card">
        <div className="transparency-header">
          <div className="transparency-title-wrap">
            <div className="transparency-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <Scale size={22} color="#c084fc" />
            </div>
            <div>
              <h2 className="transparency-title">Terms at a Glance</h2>
              <p className="transparency-subtitle">
                A brief overview of the key rights and rules when using this project:
              </p>
            </div>
          </div>
          <div className="transparency-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <Info size={14} />
            <span>Key Principles</span>
          </div>
        </div>

        <div className="transparency-stats-grid">
          <div className="transparency-stat-box">
            <span className="stat-label">Data Sovereignty</span>
            <span className="stat-value" style={{ color: '#38bdf8', fontSize: '18px' }}>100% Client-Side</span>
            <span className="stat-sub">Your lists, reviews, and logs stay in your browser.</span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Commercial Nature</span>
            <span className="stat-value" style={{ color: '#34d399', fontSize: '18px' }}>Non-Commercial</span>
            <span className="stat-sub">No subscriptions, no paywalls, no paid ads.</span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Trademarks & IP</span>
            <span className="stat-value" style={{ color: '#fbbf24', fontSize: '18px' }}>Respective Owners</span>
            <span className="stat-sub">Game & movie titles belong to original publishers.</span>
          </div>
          <div className="transparency-stat-box">
            <span className="stat-label">Parlor Bookings</span>
            <span className="stat-value" style={{ color: '#c084fc', fontSize: '18px' }}>Station Courtesy</span>
            <span className="stat-sub">Arrive on time, respect gaming rigs & gear.</span>
          </div>
        </div>

        <div className="transparency-actions-bar">
          <div className="transparency-actions-info">
            <CheckCircle2 size={16} color="#34d399" />
            <span>By accessing or using Vault & Shelf and GameZone Parlor, you agree to be bound by these terms.</span>
          </div>
          <div className="transparency-btn-group">
            <button
              type="button"
              onClick={handleExport}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px', gap: '8px' }}
            >
              <Download size={15} />
              <span>Export Library (JSON)</span>
            </button>
            <Link
              to="/privacy"
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px', gap: '8px', textDecoration: 'none' }}
            >
              <Shield size={15} />
              <span>Read Privacy Policy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Terms Articles */}
      <div className="privacy-sections-grid">
        {/* Section 1 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FileText size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 01</div>
            <h3>Acceptance of Terms</h3>
            <p>
              By accessing, browsing, or using the <strong>Vault & Shelf</strong> web application or the <strong>GameZone Parlor</strong> portal (collectively referred to as "the Service"), you signify your agreement to these Terms & Conditions.
            </p>
            <ul className="privacy-bullet-list">
              <li>If you do not agree with any of these terms, you are free to discontinue browsing or using the application at any time.</li>
              <li>The Service is provided for personal entertainment, media curation, and portfolio demonstration purposes.</li>
              <li>You must be at least 13 years old (or the applicable age of digital consent in your jurisdiction) to use the Service.</li>
            </ul>
          </div>
        </article>

        {/* Section 2 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Scale size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 02</div>
            <h3>Intellectual Property & Fair Use Disclaimer</h3>
            <p>
              Vault & Shelf is an enthusiast media collection organizer designed to help individuals track their own gaming adventures and cinema viewings.
            </p>
            <div className="privacy-callout-box">
              <div className="callout-item" style={{ borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.06)' }}>
                <CheckCircle2 size={16} color="#38bdf8" />
                <span>
                  <strong>Third-Party Trademarks:</strong> All game names, franchise titles, studio logos, character likenesses, and movie names (e.g. Sony PlayStation, Nintendo, Xbox, Valve/Steam, Warner Bros., Disney, A24) are the exclusive property of their respective copyright holders.
                </span>
              </div>
              <div className="callout-item" style={{ borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.06)' }}>
                <CheckCircle2 size={16} color="#38bdf8" />
                <span>
                  <strong>Cover Art & Media Assets:</strong> Video game cover posters, box art, and film posters displayed on the shelves are used under the principles of <em>Fair Use</em> (17 U.S. Code § 107) for non-commercial identification, cataloging, commentary, and cultural archiving.
                </span>
              </div>
              <div className="callout-item" style={{ borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.06)' }}>
                <CheckCircle2 size={16} color="#38bdf8" />
                <span>
                  <strong>No Affiliation or Endorsement:</strong> Vault & Shelf is an independent project and is not sponsored, authorized, or endorsed by any video game developer, film studio, or platform manufacturer.
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Section 3 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#34d399' }}>
            <Shield size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 03</div>
            <h3>User Content, Storage & Data Responsibility</h3>
            <p>
              You maintain full ownership of all customized notes, personal star ratings, review impressions, and custom entries you create within Vault & Shelf.
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Local Browser Storage:</strong> Data is saved within your browser’s <code>window.localStorage</code> sandbox. Because we do not run a centralized private server for your account, you are solely responsible for backing up your data using the built-in <em>Export Library (JSON)</em> tool.
              </li>
              <li>
                <strong>Cache Clearing:</strong> Clearing your browser history, site cookies, or local cache may wipe your stored items unless you have exported a JSON backup.
              </li>
              <li>
                <strong>Acceptable Content:</strong> You agree not to input malicious scripts, defamatory statements, or unlawful material into local review notes or custom cover fields.
              </li>
            </ul>
          </div>
        </article>

        {/* Section 4 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Gamepad2 size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 04</div>
            <h3>GameZone Parlor Station Etiquette</h3>
            <p>
              For visitors utilizing the GameZone Parlor interactive booking simulator and station portal:
            </p>
            <div className="rights-grid">
              <div className="rights-box">
                <h4>Station Scheduling</h4>
                <p>Slot reservations are coordinated to ensure fair access across high-end PC rigs, PS5 Pro stations, and racing simulator setups.</p>
              </div>
              <div className="rights-box">
                <h4>Hardware Respect</h4>
                <p>Users must treat gaming peripherals, mechanical keyboards, OLED monitors, and VR headsets with due care and diligence.</p>
              </div>
              <div className="rights-box">
                <h4>Community Decorum</h4>
                <p>Zero tolerance for harassment, cheating, intentional game griefing, or disruptive behavior towards fellow players.</p>
              </div>
              <div className="rights-box">
                <h4>Punctual Check-In</h4>
                <p>Players are expected to arrive at least 10 minutes prior to scheduled slots to ensure seamless station handovers.</p>
              </div>
            </div>
          </div>
        </article>

        {/* Section 5 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 05</div>
            <h3>Disclaimer of Warranties & Limitation of Liability</h3>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>No Warranty of Data Retention:</strong> While LocalStorage is reliable under standard operations, we make no warranty that your browser will never purge local keys due to operating system low-memory conditions, browser updates, or private browsing modes. Regular JSON backups are strongly recommended.
              </li>
              <li>
                <strong>External Links:</strong> The Service may link to external websites (e.g. YouTube trailer links, developer GitHub, CDN hosts). We have no control over the content, availability, or privacy practices of external third parties.
              </li>
              <li>
                <strong>Limitation of Liability:</strong> In no event shall the developer or contributors be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access or inability to access the application.
              </li>
            </ul>
          </div>
        </article>

        {/* Section 6 */}
        <article className="privacy-card">
          <div className="privacy-card-icon" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
            <ExternalLink size={22} />
          </div>
          <div className="privacy-card-content">
            <div className="section-number">Article 06</div>
            <h3>Open Source, Code License & Developer Contact</h3>
            <p>
              Vault & Shelf and GameZone Parlor are crafted as modern web engineering showcases and personal productivity projects.
            </p>
            <div className="privacy-contact-box">
              <div>
                <strong>Developer & Author:</strong> Rahul (<a href="https://github.com/Iamrahulzax" target="_blank" rel="noopener noreferrer" className="privacy-link">@Iamrahulzax</a>)
              </div>
              <div>
                <strong>GitHub Repository:</strong>{' '}
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
                <strong>Questions or Takedown Requests:</strong> If you are a copyright holder and believe any poster artwork or asset requires modification or attribution adjustment, please contact the maintainer via GitHub issues for immediate review.
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Footer Navigation CTA */}
      <div className="privacy-footer-cta">
        <div>
          <h3>Questions about our Terms or Privacy?</h3>
          <p>Read our full Privacy Policy or jump straight back to your library.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/privacy" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link to="/" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', textDecoration: 'none' }}>
            Shelf Dashboard
          </Link>
          <Link to="/games" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', textDecoration: 'none' }}>
            Browse Games
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
