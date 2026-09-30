import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/AdminDashboard.css'
import { useAuthStore } from '../stores/authStore'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [vendors, setVendors] = useState([])
  const [complaints, setComplaints] = useState([])
  const [vendorStatus, setVendorStatus] = useState('pending')
  const [complaintStatus, setComplaintStatus] = useState('open')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [suspendingVendor, setSuspendingVendor] = useState(null)
  
  const token = useAuthStore((state) => state.token)
  // Assuming your Zustand store has a logout or clearAuth function
  const logout = useAuthStore((state) => state.logout) 
  const navigate = useNavigate()

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'Request failed.')
    return data
  }, [token])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [summary, vendorResponse, complaintResponse] = await Promise.all([
        request('/api/admin/dashboard'),
        request(`/api/admin/vendors/requests?status=${vendorStatus}`),
        request(`/api/admin/complaints?status=${complaintStatus}`),
      ])
      setDashboard(summary.dashboard)
      setVendors(vendorResponse.vendors || [])
      setComplaints(complaintResponse.complaints || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [complaintStatus, request, vendorStatus])

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => { loadData() }, 0)
    return () => window.clearTimeout(fetchTimer)
  }, [loadData])

  async function moderateVendor(vendorId, action, body = {}) {
    try {
      await request(`/api/admin/vendors/${vendorId}/${action}`, { method: 'PATCH', body: JSON.stringify(body) })
      setMessage(`Vendor ${action}d successfully.`)
      await loadData()
    } catch (error) { setMessage(error.message) }
  }

  async function reviewComplaint(complaintId, status) {
    try {
      await request(`/api/admin/complaints/${complaintId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(`Complaint marked ${status}.`)
      await loadData()
    } catch (error) { setMessage(error.message) }
  }

  const handleLogout = () => {
    logout()
    navigate('/login') // Adjust this route based on your routing setup
  }

  if (loading && !dashboard) return <main className="admin-loading">Loading admin workspace...</main>

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" to="/"><span>G</span> GullyCart <small>control room</small></Link>
        <div className="admin-identity">
          <span className="admin-avatar">A</span>
          <span>Administrator</span>
          <button 
            onClick={handleLogout} 
            className="admin-logout-btn"
            style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', cursor: 'pointer', background: 'transparent', border: '1px solid currentColor', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </header>
      <main className="admin-content">
        <section className="admin-intro"><div><p className="admin-eyebrow">Platform oversight</p><h1>Good morning, admin.</h1><p>Review vendor applications, keep the marketplace trustworthy, and resolve reports.</p></div><div className="admin-date">LIVE OPERATIONS<br /><strong>Today</strong></div></section>
        {message && <div className="admin-message">{message}<button onClick={() => setMessage('')}>Dismiss</button></div>}
        <section className="admin-metrics">{[['Pending vendors', dashboard?.pendingVendors, 'Needs review'], ['Approved vendors', dashboard?.approvedVendors, 'Active partners'], ['Suspended vendors', dashboard?.suspendedVendors, 'Currently restricted'], ['Open complaints', dashboard?.openComplaints, 'Awaiting action'], ['Total users', dashboard?.users, 'Registered accounts'], ['Orders', dashboard?.orders, 'All reservations']].map(([label, value, hint]) => <div className="admin-metric" key={label}><span>{label}</span><strong>{value ?? '—'}</strong><small>{hint}</small></div>)}</section>

        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Vendor verification</p><h2>Applications & partners</h2></div><select value={vendorStatus} onChange={(event) => setVendorStatus(event.target.value)}><option value="pending">Pending requests</option><option value="approved">Approved vendors</option><option value="suspended">Suspended vendors</option><option value="rejected">Rejected vendors</option></select></div><div className="admin-table admin-vendor-table"><div className="admin-table-head"><span>Business</span><span>Categories</span><span>Joined</span><span>Status</span><span>Actions</span></div>{vendors.length === 0 ? <div className="admin-empty">No vendors in this queue.</div> : vendors.map((vendor) => <div className="admin-table-row" key={vendor._id}><div><strong>{vendor.businessName}</strong><small>{vendor.userId?.name || 'Vendor account'}</small></div><span>{vendor.categories?.join(', ') || 'Not specified'}</span><span>{new Date(vendor.createdAt).toLocaleDateString()}</span><span className={`admin-status ${vendor.verificationStatus}`}>{vendor.verificationStatus}</span><div className="admin-actions">{vendor.verificationStatus === 'pending' && <><button className="approve" onClick={() => moderateVendor(vendor._id, 'approve')}>Approve</button><button className="reject" onClick={() => moderateVendor(vendor._id, 'reject', { reason: 'Application did not meet platform requirements.' })}>Reject</button></>}{vendor.verificationStatus === 'approved' && <button className="suspend" onClick={() => setSuspendingVendor(vendor)}>Suspend</button>}{vendor.verificationStatus === 'suspended' && <button className="approve" onClick={() => moderateVendor(vendor._id, 'restore')}>Restore</button>}</div></div>)}</div></section>

        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Trust & safety</p><h2>User complaints</h2></div><select value={complaintStatus} onChange={(event) => setComplaintStatus(event.target.value)}><option value="open">Open complaints</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></div><div className="complaint-list">{complaints.length === 0 ? <div className="admin-empty">No complaints in this queue.</div> : complaints.map((complaint) => <article className="complaint-card" key={complaint._id}><div className="complaint-mark">!</div><div className="complaint-copy"><strong>{complaint.reason}</strong><p>{complaint.description}</p><small>{complaint.vendorId?.businessName || 'Vendor'} · reported by {complaint.reporterId?.name || 'User'} · {new Date(complaint.createdAt).toLocaleDateString()}</small></div><div className="complaint-actions">{complaint.status === 'open' && <button onClick={() => reviewComplaint(complaint._id, 'reviewing')}>Start review</button>}{complaint.status === 'reviewing' && <><button className="approve" onClick={() => reviewComplaint(complaint._id, 'resolved')}>Resolve</button><button className="reject" onClick={() => reviewComplaint(complaint._id, 'dismissed')}>Dismiss</button></>}</div></article>)}</div></section>
      </main>
      {suspendingVendor && <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={(event) => { event.preventDefault(); moderateVendor(suspendingVendor._id, 'suspend', { reason: event.currentTarget.reason.value }); setSuspendingVendor(null) }}><button type="button" className="modal-close" onClick={() => setSuspendingVendor(null)}>×</button><p className="admin-eyebrow">Vendor moderation</p><h2>Suspend {suspendingVendor.businessName}?</h2><p>This immediately stops the vendor from selling and records the reason for the action.</p><label>Reason<textarea name="reason" required placeholder="Describe the complaint or policy violation..." /></label><button className="suspend modal-submit">Confirm suspension</button></form></div>}
    </div>
  )
}

export default AdminDashboard