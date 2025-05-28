// components/FeedGrid.js
import React, { useState, useEffect, useRef } from 'react';

export const FeedGrid = () => {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/feed?page=${page}&limit=10`);
      const data = await res.json();
      setFeed(prev => [...prev, ...data.feed]);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [page]);

  const lastItemRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {feed.map((item, i) => (
        <div
          key={item.id}
          ref={i === feed.length - 1 ? lastItemRef : null}
          style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}
        >
          <img src={item.s3Url} alt={item.title} style={{ width: '100%', height: 'auto' }} />
          <div style={{ padding: '8px' }}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        </div>
      ))}
      {loading && <p>Loading more...</p>}
    </div>
  );
};
