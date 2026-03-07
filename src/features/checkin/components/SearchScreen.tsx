import { useState } from 'react';
import { useCheckInStore } from '@/stores/checkInStore';
import { useGuestSearch, useCheckInStats } from '@/hooks/useGuestSearch';
import { formatName } from '@/lib/helpers';
import type { Guest } from '@/types/common';

export function SearchScreen() {
  const store = useCheckInStore();
  const { data, isLoading } = useGuestSearch();
  const { data: stats, refetch } = useCheckInStats();
  const [spinning, setSpinning] = useState(false);

  const handleGuestClick = (guest: Guest) => {
    if (guest.status === 'checked_in') {
      store.showOverlay('duplicate', guest);
    } else {
      store.showOverlay('success', guest);
    }
  };

  const handleRefresh = () => {
    setSpinning(true);
    refetch();
    setTimeout(() => setSpinning(false), 600);
  };

  const clearSearch = () => store.setSearchQuery('');

  // Count guests by status
  const allGuests = data?.guests ?? [];
  const pendingCount = stats?.pending ?? 0;
  const checkedCount = stats?.checkedIn ?? 0;
  const totalCount = stats?.total ?? 0;

  return (
    <div className="search-layout">
      {/* Search Header */}
      <div className="search-header">
        <button className="back-btn" onClick={() => store.setScreen('scanner')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="search-title">Guest Search</span>
        <button className={`refresh-btn ${spinning ? 'spinning' : ''}`} onClick={handleRefresh}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <svg className="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, email or code..."
          value={store.searchQuery}
          onChange={(e) => store.setSearchQuery(e.target.value)}
        />
        {store.searchQuery && (
          <button className="search-clear" onClick={clearSearch}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {([
          { key: 'all' as const, label: 'All', count: totalCount },
          { key: 'pending' as const, label: 'Pending', count: pendingCount },
          { key: 'checked_in' as const, label: 'Checked In', count: checkedCount },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            className={`filter-tab ${store.searchFilter === key ? 'active' : ''}`}
            onClick={() => store.setSearchFilter(key)}
          >
            {label}
            <span className="filter-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="results-list">
        {isLoading && (
          <div className="empty-state visible">
            <div className="empty-state-icon">
              <span className="spinner" />
            </div>
            <span className="empty-state-title">Searching...</span>
          </div>
        )}

        {!isLoading && allGuests.length === 0 && (
          <div className="empty-state visible">
            <div className="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="empty-state-title">
              {store.searchQuery
                ? 'No results found'
                : store.searchFilter !== 'all'
                  ? `No ${store.searchFilter === 'checked_in' ? 'checked-in' : 'pending'} guests`
                  : 'No guests registered yet'}
            </span>
            <span className="empty-state-desc">
              {store.searchQuery
                ? `Try a different name, email or code${store.searchFilter !== 'all' ? ', or change the filter' : ''}`
                : store.searchFilter !== 'all'
                  ? 'No guests match this filter'
                  : 'Guests will appear here once they register'}
            </span>
          </div>
        )}

        {allGuests.map((guest) => {
          const checkedIn = guest.status === 'checked_in';
          const timeStr = guest.checkedInAt
            ? new Date(guest.checkedInAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            : '';

          return (
            <div key={guest.id} className="result-card" onClick={() => handleGuestClick(guest)}>
              <div className="result-status">
                <span className={`status-dot ${checkedIn ? 'status-checked' : 'status-pending'}`} />
              </div>
              <div className="result-info">
                <span className="result-name">{formatName(guest.firstName, guest.lastName)}</span>
                <span className="result-meta">{guest.email} · {guest.code}</span>
              </div>
              {checkedIn ? (
                <span className="result-time">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {timeStr}
                </span>
              ) : (
                <span className="result-tap">Tap to check in</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
