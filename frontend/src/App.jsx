// frontend/src/App.jsx
import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import CategoryView from './pages/CategoryView';
import { useAuth } from './auth/AuthContext';
import AdminRoute from './auth/AdminRoute';
import ErrorBoundary from './ui/ErrorBoundary';
import AllHerbs from './pages/AllHerbs';


// --- Search context to share real-time query ---
export const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <ErrorBoundary>
      <SearchContext.Provider value={{ search, setSearch }}>
        <>
          <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-2">
            <div className="container d-flex align-items-center justify-content-between">

              {/* --- Logo section --- */}
              <Link className="navbar-brand d-flex align-items-center" to="/" style={{ textDecoration: 'none' }}>
                <img
                  src="/assets/logo.png"
                  alt="Rising-Herb Logo"
                  height="50"
                  width={"100"}
                  className="me-2"
                  style={{ objectFit: 'contain' }}
                />
                <span style={{
                  fontWeight: '600',
                  fontSize: '1.25rem',
                  color: '#198754',
                  letterSpacing: '0.5px'
                }}>
               
                </span>
              </Link>

              {/* --- Collapsible navigation --- */}
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto">
                  {/* <li className="nav-item">
                    <Link className="nav-link fw-semibold" to="/">Home</Link>
                  </li> */}
                </ul>

                {/* --- Real-time search bar --- */}
                <div className="d-flex me-3" style={{ maxWidth: 420, width: '100%' }}>
                  <input
                    className="form-control rounded-pill"
                    type="search"
                    placeholder="Search herbs or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      border: '1px solid #ced4da'
                    }}
                  />
                </div>

                {/* --- Right side buttons --- */}
                <ul className="navbar-nav ms-auto align-items-center">
                  {user && user.role === 'admin' && (
                    <>
                      <li className="nav-item">
                        <button
                          className="btn btn-outline-primary me-2"
                          onClick={() => navigate('/admin')}
                        >
                          Post Herb
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className="btn btn-outline-secondary me-2"
                          onClick={() => navigate('/admin/users')}
                        >
                          New Users
                        </button>
                      </li>
                    </>
                  )}

                  {!user && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link fw-semibold" to="/signup">Signup</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link fw-semibold" to="/login">Login</Link>
                      </li>
                    </>
                  )}

                  {user && (
                    <li className="nav-item">
                      <button className="btn btn-link nav-link fw-semibold text-danger" onClick={logout}>
                        Logout
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </nav>

          {/* --- Main container --- */}
          <div className="container my-4">
            <Routes>
              <Route path="/all-herbs" element={<AllHerbs />} />

              <Route path="/" element={<Home />} />
              <Route path="/category/:name" element={<CategoryView />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            </Routes>
          </div>
        </>
      </SearchContext.Provider>
    </ErrorBoundary>
  );
}
