import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Fetch featured items (3 per type)
export function useFeatured(type) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/content/${type}/featured`)
      .then(res => setData(res.data))
      .catch(err => console.error('useFeatured error:', err))
      .finally(() => setLoading(false));
  }, [type]);

  return { ...data, loading };
}

// Fetch all items with load-more (9 per page)
export function useContentList(type) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback((p) => {
    setLoading(true);
    api.get(`/content/${type}?page=${p}&limit=9`)
      .then(res => {
        if (p === 1) {
          setItems(res.data.items);
        } else {
          setItems(prev => [...prev, ...res.data.items]);
        }
        setTotal(res.data.total);
        setHasMore(res.data.hasMore);
        setPage(p);
      })
      .catch(err => console.error('useContentList error:', err))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPage(page + 1);
    }
  };

  return { items, total, loading, hasMore, loadMore, remaining: total - items.length };
}

// Fetch single item detail
export function useContentDetail(type, slug) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !slug) return;
    setLoading(true);
    api.get(`/content/${type}/${slug}`)
      .then(res => setItem(res.data))
      .catch(err => {
        console.error('useContentDetail error:', err);
        setError(err.response?.data?.error || 'Not found');
      })
      .finally(() => setLoading(false));
  }, [type, slug]);

  return { item, loading, error };
}
