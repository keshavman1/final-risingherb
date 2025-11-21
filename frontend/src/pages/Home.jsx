// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import HerbCard from '../ui/HerbCard';
import Carousel from '../ui/Carousel';
import CategorySection from '../ui/CategorySection';
import ChatModal from '../ui/ChatModal';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../App';

import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';

export default function Home() {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { search } = useSearch();

  const [heroImages] = useState([hero1, hero2, hero3]);

  useEffect(() => {
    api.get('/herbs')
      .then(r => setHerbs(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = herbs.filter(h => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (h.name && h.name.toLowerCase().includes(term)) ||
      (h.category && h.category.toLowerCase().includes(term))
    );
  });

  if (loading) return <div>Loading...</div>;

  const isSearching = search.trim().length > 0;

  function handleCategoryClick(cat) {
    navigate(`/category/${encodeURIComponent(cat)}`);
  }

  const latestHerbs = herbs.slice(0, 4); // Only 4 on homepage

  return (
    <>
      {/* ✅ Show carousel & sections only when not searching */}
      {!isSearching && (
        <>
          <Carousel images={heroImages} interval={3000} />

          <div className="my-4">
            <CategorySection onCategoryClick={handleCategoryClick} />
          </div>
        </>
      )}

      {/* ✅ Latest Herbs Section */}
      <section className="my-5 text-center">
        <h3 className="mb-4 text-success why-choose-us my-5">Latest Updated Herbs</h3>

        {filtered.length === 0 ? (
          <div className="alert alert-info">No herbs found.</div>
        ) : (
          <div className="row justify-content-center g-4">
            {(isSearching ? filtered : latestHerbs).map((h) => (
              <div className="col-md-3 col-sm-6" key={h._id || Math.random()}>
                <HerbCard herb={h} onChat={() => setSelected(h)} />
              </div>
            ))}
          </div>
        )}

        {!isSearching && (
          <button
            className="btn btn-outline-success mt-4 px-4 fw-semibold"
            onClick={() => navigate('/all-herbs')}
          >
            View All Herbs →
          </button>
        )}
      </section>

      {/* ✅ Why Choose Us only when not searching */}
      {!isSearching && (
        <section className="why-choose-us my-5">
          <div className="text-center mb-4">
            <h2>Why Choose Us</h2>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <img src="/assets/gmp.png" alt="GMP" width="80" />
              <h5 className="mt-2">GMP Certified</h5>
              <p>Good Manufacturing Process</p>
            </div>
            <div className="col-md-3">
              <img src="/assets/ready.png" alt="Ready" width="80" />
              <h5 className="mt-2">Ready To Use</h5>
              <p>Finely grinded Herbs & Spices</p>
            </div>
            <div className="col-md-3">
              <img src="/assets/secure.png" alt="Secure" width="80" />
              <h5 className="mt-2">Secure Payment</h5>
              <p>100% Secure Transaction</p>
            </div>
            <div className="col-md-3">
              <img src="/assets/fast.png" alt="Fast" width="80" />
              <h5 className="mt-2">Fast Shipping</h5>
              <p>Orders within 24 hours</p>
            </div>
          </div>
        </section>
      )}

      <ChatModal herb={selected} onClose={() => setSelected(null)} />
    </>
  );
}
