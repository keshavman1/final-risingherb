// frontend/src/pages/AllHerbs.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import HerbCard from '../ui/HerbCard';
import ChatModal from '../ui/ChatModal';

export default function AllHerbs() {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sortType, setSortType] = useState('default');

  useEffect(() => {
    api.get('/herbs')
      .then((r) => setHerbs(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedHerbs = [...herbs].sort((a, b) => {
    switch (sortType) {
      case 'priceLowHigh':
        return (a.minPrice || 0) - (b.minPrice || 0);
      case 'priceHighLow':
        return (b.minPrice || 0) - (a.minPrice || 0);
      case 'nameAZ':
        return (a.name || '').localeCompare(b.name || '');
      case 'nameZA':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="row">
      {/* --- Sidebar Filters --- */}
      <div className="col-md-3 mb-4">
        <div className="card p-3 shadow-sm sticky-top" style={{ top: '80px' }}>
          <h5 className="mb-3 text-success">Sort By</h5>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="sort" id="sortDefault"
              checked={sortType === 'default'} onChange={() => setSortType('default')} />
            <label className="form-check-label" htmlFor="sortDefault">By Default</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="sort" id="sortLowHigh"
              checked={sortType === 'priceLowHigh'} onChange={() => setSortType('priceLowHigh')} />
            <label className="form-check-label" htmlFor="sortLowHigh">Price (Low → High)</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="sort" id="sortHighLow"
              checked={sortType === 'priceHighLow'} onChange={() => setSortType('priceHighLow')} />
            <label className="form-check-label" htmlFor="sortHighLow">Price (High → Low)</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="sort" id="sortAZ"
              checked={sortType === 'nameAZ'} onChange={() => setSortType('nameAZ')} />
            <label className="form-check-label" htmlFor="sortAZ">Name (A → Z)</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="sort" id="sortZA"
              checked={sortType === 'nameZA'} onChange={() => setSortType('nameZA')} />
            <label className="form-check-label" htmlFor="sortZA">Name (Z → A)</label>
          </div>
        </div>
      </div>

      {/* --- Herb Cards --- */}
      <div className="col-md-9">
        <h3 className="mb-4 text-center text-success">All Herbs</h3>
        {sortedHerbs.length === 0 ? (
          <div className="alert alert-info">No herbs found.</div>
        ) : (
          <div className="row g-3">
            {sortedHerbs.map((h) => (
              <div className="col-md-4" key={h._id || Math.random()}>
                <HerbCard herb={h} onChat={() => setSelected(h)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ChatModal herb={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
