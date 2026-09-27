import React from 'react';
import { Search, X, Heart } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  statusOptions: { label: string; value: string; count?: number; color?: string }[];
  genreFilter: string;
  onGenreChange: (genre: string) => void;
  genreOptions: string[];
  ratingFilter: string;
  onRatingChange: (rating: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOptions: { label: string; value: string }[];
  placeholder?: string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  platformFilter?: string;
  onPlatformChange?: (platform: string) => void;
  platformOptions?: string[];
  isFavoriteOnly?: boolean;
  onFavoriteToggle?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  genreFilter,
  onGenreChange,
  genreOptions,
  ratingFilter,
  onRatingChange,
  sortBy,
  onSortChange,
  sortOptions,
  placeholder = 'Search by title, genre, year...',
  onClearFilters,
  hasActiveFilters,
  platformFilter,
  onPlatformChange,
  platformOptions,
  isFavoriteOnly,
  onFavoriteToggle
}) => {
  return (
    <div className="filter-bar">
      {/* Top Search & Dropdowns Row */}
      <div className="filter-row-top">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          {/* Platform Dropdown (if options provided) */}
          {platformOptions && platformOptions.length > 0 && onPlatformChange && (
            <select
              className="filter-select"
              value={platformFilter || 'ALL'}
              onChange={(e) => onPlatformChange(e.target.value)}
            >
              <option value="ALL">All Platforms</option>
              {platformOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          {/* Genre Dropdown */}
          <select
            className="filter-select"
            value={genreFilter}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="ALL">All Genres</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Rating Dropdown */}
          <select
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => onRatingChange(e.target.value)}
          >
            <option value="ALL">All Ratings</option>
            <option value="10">⭐ 10 / 10 Only</option>
            <option value="9">⭐ 9+ Rating</option>
            <option value="8">⭐ 8+ Rating</option>
            <option value="7">⭐ 7+ Rating</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Favorites Only Toggle */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={onFavoriteToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                background: isFavoriteOnly ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isFavoriteOnly ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                color: isFavoriteOnly ? '#fb7185' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
              title="Show favorites only"
            >
              <Heart size={14} fill={isFavoriteOnly ? '#f43f5e' : 'none'} color={isFavoriteOnly ? '#f43f5e' : 'currentColor'} />
              <span>Favorites</span>
            </button>
          )}

          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: '#f43f5e',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontWeight: 600
              }}
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Chips Row */}
      <div className="status-chips-row">
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`status-chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => onStatusChange(opt.value)}
            >
              {opt.color && (
                <span
                  className="chip-dot"
                  style={{ background: opt.color }}
                />
              )}
              {opt.label}
              {typeof opt.count === 'number' && (
                <span style={{
                  fontSize: '11px',
                  opacity: 0.8,
                  marginLeft: '4px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
