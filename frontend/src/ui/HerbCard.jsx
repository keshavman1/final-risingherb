// frontend/src/ui/HerbCard.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function getApiBaseForFiles() {
  const env = import.meta.env.VITE_API_URL || '';
  if (!env) return window.location.origin;
  return env.replace(/\/api\/?$/, '');
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const base = getApiBaseForFiles();
  if (imageUrl.startsWith('/')) return `${base}${imageUrl}`;
  if (imageUrl.startsWith('uploads/')) return `${base}/${imageUrl}`;
  return `${base}/uploads/${imageUrl}`;
}

export default function HerbCard({ herb = {}, onChat = () => {} }) {
  if (!herb || typeof herb !== 'object') return null;

  const imageUrl = normalizeImageUrl(herb.imageUrl);
  const adminNumber = herb.adminWhatsapp || '';
  const cleaned = String(adminNumber || '').replace(/\D/g, '');
  const waLink = cleaned ? `https://wa.me/${cleaned}?text=${encodeURIComponent("Hi! I'm interested in " + (herb.name || 'this herb'))}` : null;

  // WhatsApp brand green
  const waStyle = {
    backgroundColor: '#25D366',
    color: '#fff',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
  };

  return (
    <div className="card h-100 shadow-sm herb-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
      {imageUrl ? (
        <img src={imageUrl} className="card-img-top" alt={herb.name || 'herb'} style={{ height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 200, background: 'linear-gradient(135deg,#f8fafc,#eef2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <strong className="text-muted">No image</strong>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="mb-2 product-title">{herb.name || 'Unnamed Herb'}</h5>
        <p className="small text-muted mb-3 product-desc">{herb.description || 'No description provided.'}</p>

        <div style={{ marginTop: 'auto' }}>
          <div className="mb-1"><strong>Price range</strong></div>

          <div className="card-footer d-flex align-items-center justify-content-between p-2" style={{ background: 'transparent', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>₹{herb.minPrice ?? '—'} - ₹{herb.maxPrice ?? '—'}</div>

            {waLink ? (
              <a href={waLink} rel="noreferrer" target="_blank" title="Contact on WhatsApp" style={waStyle}>
                <FaWhatsapp />
              </a>
            ) : (
              <button className="btn" disabled title="WhatsApp number not available" style={{ ...waStyle, opacity: 0.6 }}>
                <FaWhatsapp />
              </button>
            )}
          </div>

          <div className="mt-2"><small className="text-muted">{herb.category || 'General'}</small></div>
        </div>
      </div>
    </div>
  );
}
