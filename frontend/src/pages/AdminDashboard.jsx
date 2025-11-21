import React, { useEffect, useState } from 'react';
import api from '../services/api';

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
  // If the backend returns just a raw path, we won't assume /uploads anymore.
  // Return as-is and let the browser/or dev adjust if needed.
  return imageUrl;
}

export default function AdminDashboard(){
  const [herbs, setHerbs] = useState([]);
  const [form, setForm] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    unit: '100 gm',
    description: '',
    category: '',
    imageUrl: ''
  });
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=> { fetchHerbs(); }, []);
  async function fetchHerbs(){
    try{
      const res = await api.get('/herbs');
      const data = Array.isArray(res.data) ? res.data.map(h => ({ ...h, imageUrl: normalizeImageUrl(h.imageUrl) })) : [];
      setHerbs(data);
    } catch(e){ console.error(e); }
  }

  function handleChange(e){
    const { name, value } = e.target;
    setForm(prev => ({...prev, [name]: value}));
  }

  async function submit(e){
    e.preventDefault();
    setErr(''); setLoading(true);
    try{
      if(!form.name) throw new Error('Name is required');
      if(form.minPrice === '' || form.maxPrice === '') throw new Error('Min and Max price are required');
      if(!form.category) throw new Error('Category is required');

      const payload = {
        name: form.name,
        description: form.description || '',
        category: form.category || '',
        minPrice: Number(form.minPrice),
        maxPrice: Number(form.maxPrice),
        unit: form.unit || '100 gm',
        imageUrl: form.imageUrl || ''
      };

      if(editingId){
        await api.put(`/herbs/${editingId}`, payload);
      } else {
        await api.post('/herbs', payload);
      }

      setForm({ name:'', minPrice:'', maxPrice:'', unit:'100 gm', description:'', category:'', imageUrl: '' });
      setEditingId(null);
      fetchHerbs();
    }catch(err){
      console.error(err);
      setErr(err.response?.data?.message || err.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(h){
    setEditingId(h._id);
    setForm({
      name: h.name || '',
      minPrice: h.minPrice !== undefined ? String(h.minPrice) : '',
      maxPrice: h.maxPrice !== undefined ? String(h.maxPrice) : '',
      unit: h.unit || '100 gm',
      description: h.description || '',
      category: h.category || '',
      imageUrl: h.imageUrl || ''
    });
    window.scrollTo({top:0, behavior:'smooth'});
  }

  async function handleDelete(id){
    if(!confirm('Delete this herb?')) return;
    try{ await api.delete(`/herbs/${id}`); fetchHerbs(); }catch(e){ console.error(e); alert('Delete failed'); }
  }

  return (
    <div>
      <h3 className="mb-4 text-center">{editingId ? 'Edit Herb' : 'Post New Herb'}</h3>

      <div className="form-centered mx-auto mb-5">
        <form onSubmit={submit}>
          {err && <div className="alert alert-danger">{err}</div>}

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-control form-control-lg" placeholder="Name" required/>
          </div>

          <div className="mb-3 row gx-2">
            <div className="col-6">
              <label className="form-label">Min Price</label>
              <input name="minPrice" value={form.minPrice} onChange={handleChange} type="number" className="form-control" placeholder="Min Price" required/>
            </div>
            <div className="col-6">
              <label className="form-label">Max Price</label>
              <input name="maxPrice" value={form.maxPrice} onChange={handleChange} type="number" className="form-control" placeholder="Max Price" required/>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Unit</label>
            <input name="unit" value={form.unit} onChange={handleChange} className="form-control" placeholder="Unit (e.g. 100 gm)"/>
          </div>

          <div className="mb-3">
            <label className="form-label">Image URL (optional)</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="form-control" placeholder="Image URL (http://... or https://...)" />
            <div className="form-text">Provide an external image URL. We do not store files on the server.</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Description" rows={4}/>
          </div>

          <div className="mb-4">
            <label className="form-label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-control" required>
              <option value="">— Select category —</option>
              <option value="Herbs">Herbs</option>
              <option value="Herbs Powder">Herbs Powder</option>
              <option value="seeds">seeds</option>
              <option value="vermicompost">vermicompost</option>
            </select>
            <div className="form-text">Choose a category to enable filtering in the frontend.</div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update Herb' : 'Create Herb')}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={()=>{ setEditingId(null); setForm({ name:'', minPrice:'', maxPrice:'', unit:'100 gm', description:'', category:'', imageUrl: '' }); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <h4 className="mb-3">Existing Herbs</h4>
      <div className="row g-3">
        {herbs.map(h => (
          <div className="col-md-4" key={h._id}>
            <div className="card p-3 h-100" style={{ borderRadius: 12 }}>
              <div className="d-flex justify-content-between">
                <div style={{ flex: 1 }}>
                  <b>{h.name}</b>
                  <div className="mt-1"><strong>Price range:</strong> ₹{h.minPrice} - ₹{h.maxPrice}</div>
                  <div className="small text-muted mt-1">{h.category || 'General'}</div>
                </div>
                <div style={{ width: 100 }}>
                  {h.imageUrl ? <img src={h.imageUrl} alt={h.name} style={{ width: '100%', height: 70, objectFit:'cover', borderRadius:6 }} /> : <div style={{ width: '100%', height:70, background:'#f5f5f5', borderRadius:6 }} />}
                </div>
              </div>

              <div className="mt-3 d-flex">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={()=> startEdit(h)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=> handleDelete(h._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
