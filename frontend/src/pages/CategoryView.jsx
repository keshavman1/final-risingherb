import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import HerbCard from '../ui/HerbCard';
import ChatModal from '../ui/ChatModal';

export default function CategoryView() {
  const { name } = useParams();
  const [herbs, setHerbs] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/herbs')
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : [];
        setHerbs(all.filter(h => (h.category || '').toLowerCase() === name.toLowerCase()));
      })
      .catch(console.error);
  }, [name]);

  return (
    <div>
      <h2 className="mb-4 text-center">{name}</h2>
      <div className="row g-3">
        {herbs.length === 0 ? (
          <div className="alert alert-info">No herbs found in this category.</div>
        ) : herbs.map(h => (
          <div className="col-md-4" key={h._id || Math.random()}>
            <HerbCard herb={h} onChat={() => setSelected(h)} />
          </div>
        ))}
      </div>
      <ChatModal herb={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
