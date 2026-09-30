import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'user', // Defaults to 'user' as per your schema
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual backend URL
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || `Signup failed (${response.status})`);
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
          <h2 className="auth-heading">Join GullyCart</h2>
          <p className="auth-subtitle">Build a nearby marketplace around the food and people you trust.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-role-group">
            <label className={`auth-role ${formData.role === 'user' ? 'selected' : ''}`}>
              <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} className="hidden" />
              Shopper
            </label>
            <label className={`auth-role vendor ${formData.role === 'vendor' ? 'selected' : ''}`}>
              <input type="radio" name="role" value="vendor" checked={formData.role === 'vendor'} onChange={handleChange} className="hidden" />
              Vendor
            </label>
          </div>

          <div className="auth-field">
            <label className="auth-label">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className="auth-input" placeholder="John Doe" />
          </div>

          <div className="auth-field">
            <label className="auth-label">Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
              className="auth-input" placeholder="+91 9876543210" />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email (Optional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="auth-input" placeholder="john@example.com" />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className={`auth-submit ${formData.role === 'vendor' ? 'vendor' : ''}`}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <a href="/login" className="auth-link">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;