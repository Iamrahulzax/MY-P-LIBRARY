import React, { useState, useRef, useEffect } from 'react';
import { useLibrary, PRESET_AVATARS } from '../context/LibraryContext';
import { X, Check, Upload, Link as LinkIcon, Sparkles, User, ShieldCheck } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, stats } = useLibrary();

  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [favoriteGenre, setFavoriteGenre] = useState(profile.favoriteGenre || 'Sci-Fi / RPG');
  const [avatar, setAvatar] = useState(profile.avatar);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTagline(profile.tagline);
      setFavoriteGenre(profile.favoriteGenre || 'Sci-Fi / RPG');
      setAvatar(profile.avatar);
      setSavedToast(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Collector',
      tagline: tagline.trim() || 'Gaming & Movie Enthusiast',
      favoriteGenre: favoriteGenre.trim(),
      avatar: avatar.trim() || '/avatars/cat-dev.jpg'
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content profile-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0, fontSize: '20px' }}>Collector Profile & Avatar</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Personalize your library identity & select your profile picture
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Live Profile Card Preview */}
        <div
          style={{
            margin: '20px 24px 0 24px',
            padding: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={avatar}
              alt={name}
              onError={(e) => {
                // Fallback to cat avatar if custom image fails
                (e.target as HTMLImageElement).src = '/avatars/cat-dev.jpg';
              }}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #6366f1',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #0f172a',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
              title="Online Collector"
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {name || 'Collector'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                <ShieldCheck size={12} />
                Vault Master
              </span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8' }}>
              {tagline || 'Gaming & Movie Collector'}
            </p>

            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b' }}>
              <span>🎮 {stats.totalGames} Games</span>
              <span>🎬 {stats.totalMovies} Movies</span>
              <span>⭐ {stats.favoritesCount} Favorites</span>
            </div>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} style={{ padding: '24px' }}>
          {/* Avatar Selection Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>
                Choose Profile Avatar
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Click an avatar to select
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px'
              }}
            >
              {PRESET_AVATARS.map((item) => {
                const isSelected = avatar === item.url;
                const isCatDev = item.id === 'cat-dev';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvatar(item.url)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 8px 10px 8px',
                      borderRadius: '14px',
                      border: isSelected
                        ? '2px solid #818cf8'
                        : isCatDev
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected
                        ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.25), rgba(15, 23, 42, 0.8))'
                        : 'rgba(255, 255, 255, 0.03)',
                      boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    {/* Badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: isCatDev ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: isCatDev ? '#fbbf24' : '#cbd5e1'
                      }}
                    >
                      {item.tag}
                    </span>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#6366f1',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}

                    <img
                      src={item.url}
                      alt={item.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginTop: '12px',
                        marginBottom: '8px',
                        border: isSelected ? '2px solid #818cf8' : '2px solid transparent'
                      }}
                    />

                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#fff' : '#cbd5e1' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Avatar Upload or URL */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              marginBottom: '24px'
            }}
          >
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Want a custom picture? Upload from device or enter URL:
            </span>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                <Upload size={14} />
                <span>Upload From Computer</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', flex: 1, minWidth: '220px', gap: '6px' }}>
                <input
                  type="url"
                  placeholder="https://... image URL"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  <LinkIcon size={13} />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </div>

          {/* Text Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your collector name or gamertag"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Collector Tagline / Status</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Senior Gamer & Cinephile Dev"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Favorite Genres / Specialization</label>
              <input
                type="text"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                placeholder="e.g. Sci-Fi, RPG, Psychological Thriller"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
            {savedToast && (
              <span style={{ fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Saved!
              </span>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-add-item"
              style={{ padding: '10px 24px' }}
            >
              <Sparkles size={16} />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
