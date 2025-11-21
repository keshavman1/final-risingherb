import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../auth/AuthContext';

export default function ChatModal({ herb, onClose }){
  const { user } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', phone:'' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (herb) {
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    }
  }, [herb, user]);

  if (!herb) return null;

  async function handleSubmit(e){
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = { herbId: herb._id, name: form.name, email: form.email, phone: form.phone };
      const res = await api.post('/chat', payload);
      const link = res.data.waLink;
      onClose();
      window.open(link, '_blank');
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background:'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Contact for {herb.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {err && <div className="alert alert-danger">{err}</div>}
              <div className="mb-2">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Opening...' : 'Open WhatsApp'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
