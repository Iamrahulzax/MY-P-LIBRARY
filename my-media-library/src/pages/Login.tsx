import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput } from '../utils/security';
import { Shield, Lock, User, KeyRound, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isAuthenticated, isAdmin, isLockedOut, lockoutRemainingSec } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = sanitizeInput(username, 50);
    if (!cleanUser || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanUser, password);
      if (res.success) {
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('An unexpected error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(12, 17, 27, 0.95)',
        border: '1px solid rgba(0, 255, 136, 0.25)',
        borderRadius: '16px',
        padding: '36px 30px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 136, 0.1)',
        backdropFilter: 'blur(16px)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--primary, #00ff88)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.25)'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '6px'
          }}>
            Admin Security Gateway
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.5
          }}>
            Authenticate with PBKDF2-SHA256 encrypted master credentials to unlock administrative controls.
          </p>
        </div>

        {/* Lockout Banner */}
        {isLockedOut && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#f87171',
            fontSize: '13.5px'
          }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Security Lockout Engaged</strong>
              <div>Too many attempts. Retry in {Math.ceil(lockoutRemainingSec / 60)}m ({lockoutRemainingSec}s).</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && !isLockedOut && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '6px'
            }}>
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                disabled={isLockedOut || isLoading}
                style={{
                  width: '100%',
                  background: 'rgba(18, 24, 38, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 42px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '6px'
            }}>
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLockedOut || isLoading}
                style={{
                  width: '100%',
                  background: 'rgba(18, 24, 38, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 42px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLockedOut || isLoading}
            style={{
              marginTop: '6px',
              background: isLockedOut
                ? '#334155'
                : 'linear-gradient(135deg, #00ff88 0%, #059669 100%)',
              color: isLockedOut ? '#94a3b8' : '#05080f',
              border: 'none',
              borderRadius: '10px',
              padding: '13px 20px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isLockedOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isLockedOut ? 'none' : '0 0 20px rgba(0, 255, 136, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <KeyRound size={18} />
            {isLoading ? 'Verifying Hashes...' : 'Authorize Session'}
          </button>
        </form>

        {/* Initial Credentials Tip */}
        <div style={{
          marginTop: '24px',
          padding: '14px 16px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          fontSize: '12.5px',
          color: '#c7d2fe',
          lineHeight: 1.5
        }}>
          <strong style={{ color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle2 size={15} /> First Time Setup Credentials:
          </strong>
          Default username: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#00ff88' }}>admin</code> •
          Password: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#00ff88' }}>VaultAdmin2026!</code><br />
          <em>(You can update this to your own custom password once signed in)</em>
        </div>

        {/* Return link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to Library Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
