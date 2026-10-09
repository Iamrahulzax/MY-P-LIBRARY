import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import {
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  type SecurityEvent,
  sanitizeInput
} from '../utils/security';
import {
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Database,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  LogOut,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';

const Admin: React.FC = () => {
  const { logout, changePassword, apiKeys, updateApiKeys } = useAuth();
  const { games, movies, resetToDefault } = useLibrary();

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // API Key vault state
  const [tmdbInput, setTmdbInput] = useState(apiKeys.tmdbKey);
  const [rawgInput, setRawgInput] = useState(apiKeys.rawgKey);
  const [vaultSavedMsg, setVaultSavedMsg] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<SecurityEvent[]>(getSecurityAuditLogs);

  const refreshLogs = () => {
    setAuditLogs(getSecurityAuditLogs());
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all historical security audit events?')) {
      clearSecurityAuditLogs();
      setAuditLogs([]);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass !== confirmPass) {
      setPassMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    if (newPass.length < 8) {
      setPassMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePassword(currentPass, newPass);
      if (res.success) {
        setPassMsg({ text: res.message, isError: false });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        refreshLogs();
      } else {
        setPassMsg({ text: res.message, isError: true });
      }
    } catch {
      setPassMsg({ text: 'An unexpected error occurred.', isError: true });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveApiVault = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiKeys({
      tmdbKey: sanitizeInput(tmdbInput, 100),
      rawgKey: sanitizeInput(rawgInput, 100)
    });
    setVaultSavedMsg(true);
    refreshLogs();
    setTimeout(() => setVaultSavedMsg(false), 3000);
  };

  const handleResetDatabase = () => {
    const confirmation = window.prompt(
      'SECURITY CONFIRMATION: Type "RESET" in all capitals to restore the default sample library. This will purge all custom user additions.'
    );
    if (confirmation === 'RESET') {
      resetToDefault();
      refreshLogs();
      alert('Library database successfully restored to default verified entries.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div className="admin-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00ff88 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#05080f',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
          }}>
            <Shield size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              Security Command Center
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0' }}>
              Administrative controls, cryptographic credentials, API vaults, and live security audit logs.
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '9px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={16} /> Terminate Admin Session
        </button>
      </div>

      {/* Security Status Grid */}
      <div className="admin-status-grid">
        <div style={{
          background: 'rgba(16, 24, 39, 0.75)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#00ff88', marginTop: '2px' }}><ShieldCheck size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password Security</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>PBKDF2-SHA256</div>
            <div style={{ fontSize: '12px', color: '#00ff88', marginTop: '4px' }}>100,000 rounds + random salt</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 24, 39, 0.75)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#818cf8', marginTop: '2px' }}><Lock size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route Protection</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Role-Based Access</div>
            <div style={{ fontSize: '12px', color: '#818cf8', marginTop: '4px' }}>RBAC Admin Guard active</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 24, 39, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#38bdf8', marginTop: '2px' }}><Sliders size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XSS Defense</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Sanitizer & CSP</div>
            <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>HTML entity & URL filtering</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 24, 39, 0.75)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#fbbf24', marginTop: '2px' }}><Database size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Database Store</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{games.length} Games • {movies.length} Movies</div>
            <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>Prototype Pollution Protected</div>
          </div>
        </div>
      </div>

      <div className="admin-two-col-grid">
        {/* Section 1: Change Master Password */}
        <div style={{
          background: 'rgba(12, 17, 27, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Key size={20} color="#00ff88" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Master Admin Password
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px', lineHeight: 1.5 }}>
            Update your administrative passkey. The password will be hashed on your machine using PBKDF2 with 100,000 SHA-256 iterations and a cryptographically secure 16-byte salt.
          </p>

          {passMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              background: passMsg.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              border: `1px solid ${passMsg.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
              color: passMsg.isError ? '#fca5a5' : '#86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {passMsg.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(18, 24, 38, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="admin-form-row-2">
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(18, 24, 38, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(18, 24, 38, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              style={{
                marginTop: '6px',
                background: 'linear-gradient(135deg, #00ff88 0%, #059669 100%)',
                color: '#05080f',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 16px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} />
              {isChangingPass ? 'Computing PBKDF2 Hash...' : 'Update Master Password'}
            </button>
          </form>
        </div>

        {/* Section 2: Secure API Key Vault */}
        <div style={{
          background: 'rgba(12, 17, 27, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} color="#818cf8" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                API Key Protection Vault
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px'
              }}
            >
              {showKeys ? <EyeOff size={15} /> : <Eye size={15} />}
              {showKeys ? 'Hide' : 'Reveal'}
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px', lineHeight: 1.5 }}>
            Store your third-party API keys securely in the local browser vault. These keys are never committed to git repositories or publicly exposed in unauthenticated contexts.
          </p>

          {vaultSavedMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>API Key Vault updated securely!</span>
            </div>
          )}

          <form onSubmit={handleSaveApiVault} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                TMDB Movie Database API Key
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={tmdbInput}
                onChange={(e) => setTmdbInput(e.target.value)}
                placeholder="Optional (The Movie Database API Key)"
                style={{
                  width: '100%',
                  background: 'rgba(18, 24, 38, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                RAWG Video Games Database API Key
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={rawgInput}
                onChange={(e) => setRawgInput(e.target.value)}
                placeholder="Optional (RAWG API Key)"
                style={{
                  width: '100%',
                  background: 'rgba(18, 24, 38, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '6px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '11px 16px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={16} /> Save to Encrypted Vault
            </button>
          </form>
        </div>
      </div>

      {/* Section 3: Live Security Audit Trail */}
      <div className="admin-section-card" style={{
        background: 'rgba(12, 17, 27, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Live Security Event Audit Trail ({auditLogs.length})
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={refreshLogs}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={handleClearLogs}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>
          Real-time records of security-sensitive operations: authentication attempts, rate-limiting actions, prototype checks, and administrative data modifications.
        </p>

        {auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>
            No security events logged yet.
          </div>
        ) : (
          <div className="admin-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px' }}>Event</th>
                  <th style={{ padding: '10px 14px' }}>Severity</th>
                  <th style={{ padding: '10px 14px' }}>Details</th>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => {
                  const badgeColor =
                    log.severity === 'high' ? '#ef4444' : log.severity === 'medium' ? '#f59e0b' : '#10b981';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e2e8f0' }}>
                        <code>{log.type}</code>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: badgeColor,
                          background: `${badgeColor}22`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${badgeColor}44`
                        }}>
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{log.details}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: Privileged Database Maintenance */}
      <div className="admin-section-card" style={{
        background: 'rgba(12, 17, 27, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={20} color="#f87171" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Privileged Database Operations
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
          Critical administrative actions that affect the entire collection. Actions are protected by strict confirmation dialogs and logged in the security audit trail.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDatabase}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trash2 size={16} /> Factory Reset Library Database
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
