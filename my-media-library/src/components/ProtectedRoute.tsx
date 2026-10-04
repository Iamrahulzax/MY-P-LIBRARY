import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = true }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '520px',
          width: '100%',
          background: 'rgba(16, 24, 39, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.15)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#f87171'
          }}>
            <ShieldAlert size={34} />
          </div>

          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '10px',
            letterSpacing: '0.02em'
          }}>
            Restricted Admin Area
          </h2>

          <p style={{
            fontSize: '14.5px',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}>
            Access to this administrative route requires verified security credentials. Your attempt has been logged for security auditing.
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/login"
              state={{ from: location }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #00ff88 0%, #059669 100%)',
                color: '#05080f',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 0 16px rgba(0, 255, 136, 0.3)'
              }}
            >
              <KeyRound size={16} /> Authenticate as Admin
            </Link>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <ArrowLeft size={16} /> Return to Safety
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
