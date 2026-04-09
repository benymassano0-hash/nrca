import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

const VISITOR_STORAGE_KEY = 'rcna_visitor_id';

const generateVisitorId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const next = generateVisitorId();
    localStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
  } catch (_) {
    return generateVisitorId();
  }
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const visitorId = getVisitorId();

    let userType = null;
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      userType = storedUser?.user_type || null;
    } catch (_) {}

    api.post('/analytics/track', {
      visitor_id: visitorId,
      page_path: `${location.pathname}${location.search || ''}`,
      user_type: userType,
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return null;
}

export default AnalyticsTracker;
