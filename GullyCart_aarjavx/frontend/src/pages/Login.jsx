import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
  const [credentials, setCredentials] = useState({
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Added state for password toggle
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual backend URL
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setSession(data);
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : data.user.role === 'vendor' ? '/vendor/dashboard' : '/');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-brand-mark">G</span> GullyCart</div>
        <div>
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subtitle">Log in to find fresh local vendors and everyday essentials nearby.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={credentials.phone} 
              onChange={handleChange} 
              required
              className="auth-input"
              placeholder="+91 9876543210" 
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            {/* Added relative wrapper for positioning the eye icon */}
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} // Toggles between text and password
                name="password" 
                value={credentials.password} 
                onChange={handleChange} 
                required
                className="auth-input"
                placeholder="••••••••"
                style={{ paddingRight: '40px' }} // Ensures text doesn't type under the icon
              />
              
              {/* Added eye button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  padding: 0
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-submit"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/signup" className="auth-link">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
