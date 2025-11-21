import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ fetchUsers(); }, []);

  async function fetchUsers(){
    try{
      const res = await api.get('/admin/users');
      setUsers(res.data);
    }catch(e){
      console.error(e);
      alert('Failed to load users');
    }finally{ setLoading(false); }
  }

  if(loading) return <div>Loading users...</div>;

  return (
    <div>
      <h3>Registered Users</h3>
      <div className="list-group">
        {users.map(u => (
          <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div><strong>{u.name || '—'}</strong></div>
              <div className="small text-muted">{u.email} • {u.phone}</div>
            </div>
            <div className="small text-muted">Joined: {new Date(u.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
