import React from 'react';

const categories = [
  { id: 'Herbs', label: 'Herbs', img: '/assets/cat-herbs.jpg' },
  { id: 'Herbs Powder', label: 'Herbs Powder', img: '/assets/cat-herbspowder.jpg' },
  { id: 'seeds', label: 'Seeds', img: '/assets/cat-seeds.jpg' },
  { id: 'vermicompost', label: 'Vermicompost', img: '/assets/cat-vermicompost.jpg' }
];

export default function CategorySection({ onCategoryClick }) {
  return (
    <div className="category-section text-center">
      <h3 className="mb-3 text-success why-choose-us my-5">Shop By Category </h3>
      <div className="row g-3">
        {categories.map(cat => (
          <div className="col-md-3" key={cat.id}>
            <div
              className="category-card"
              onClick={() => onCategoryClick(cat.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-image" style={{
                backgroundImage: `url(${cat.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: 160,
                borderRadius: 12
              }} />
              <div className="category-label">{cat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
