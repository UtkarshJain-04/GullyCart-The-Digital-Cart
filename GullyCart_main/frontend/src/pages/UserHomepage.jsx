import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useLocationStore } from '../stores/locationStore'
import { LiveMap } from '../components/LiveMap'
import '../styles/UserHomepage.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] })

const fallbackLocation = [28.6139, 77.209]

function UserHomepage() {
  const token = useAuthStore((state) => state.token)
  const userFromStore = useAuthStore((state) => state.user)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [location, setLocation] = useState(fallbackLocation)
  const [user, setUser] = useState(userFromStore)
  const [vendors, setVendors] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [products, setProducts] = useState([])
  const setVendorLocation = useLocationStore((state) => state.setVendorLocation)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path) => {
    const response = await fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'Unable to load marketplace data.')
    return data
  }, [apiUrl, token])

  const loadMarketplace = useCallback(async (coordinates) => {
    setLoading(true)
    setError('')
    try {
      const [latitude, longitude] = coordinates
      const [profileResponse, vendorResponse, orderResponse] = await Promise.all([
        request('/api/users/me/profile'),
        request(`/api/vendors/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=2000`),
        request('/api/orders/customer'),
      ])
      setUser(profileResponse.user)
      setVendors(vendorResponse.vendors || [])
      setOrders(orderResponse.orders || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (!navigator.geolocation) {
      const fallbackTimer = window.setTimeout(() => loadMarketplace(fallbackLocation), 0)
      return () => window.clearTimeout(fallbackTimer)
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = [coords.latitude, coords.longitude]
        setLocation(nextLocation)
        loadMarketplace(nextLocation)
      },
      () => loadMarketplace(fallbackLocation),
      { enableHighAccuracy: true, timeout: 8000 },
    )
    return undefined
  }, [loadMarketplace])

  async function openVendor(vendor) {
    setSelectedVendor(vendor)
    setProductsLoading(true)
    try {
      const data = await request(`/api/products/vendor/${vendor._id}?active=true`)
      setProducts(data.products || [])
    } catch (requestError) {
      setError(requestError.message)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedVendor) return;

    // initialize vendor location in store with latest known
    if (selectedVendor.location?.coordinates) {
       setVendorLocation({
         longitude: selectedVendor.location.coordinates[0],
         latitude: selectedVendor.location.coordinates[1]
       });
    }

    const socket = io(apiUrl, { auth: { token } })
    const eventName = `vendor_location_${selectedVendor._id}`
    socket.on(eventName, (data) => {
      if (data && data.location) {
        setVendorLocation(data.location)
      }
    })
    
    return () => {
      socket.off(eventName)
      socket.disconnect()
    }
  }, [selectedVendor, apiUrl, token, setVendorLocation])

  const filteredVendors = useMemo(() => vendors.filter((vendor) => {
    const text = `${vendor.businessName} ${(vendor.categories || []).join(' ')}`.toLowerCase()
    return text.includes(query.toLowerCase())
  }), [query, vendors])

  const vendorPosition = (vendor) => vendor.location?.coordinates
    ? [vendor.location.coordinates[1], vendor.location.coordinates[0]]
    : null

  return (
    <div className="user-home">
      <header className="user-home-nav"><div className="text-2xl flex"><strong>Hi, {user?.name || 'neighbor'}</strong></div><a className="text-lg" href="#orders">My reservations <b>{orders.length}</b></a></header>
      <main className="user-home-content">
        <section className="user-hero"><div><p className="user-eyebrow">Local food, moving closer</p><h1>Fresh from the street to your kitchen.</h1><p>Discover active vendors nearby, check what is available, and reserve before the cart moves on.</p></div><div className="user-location-pill">● <span>Within 2 km of New Delhi</span></div></section>
        {error && <div className="user-alert">{error}<button onClick={() => loadMarketplace(location)}>Retry</button></div>}
        <section className="user-map-section"><div className="user-section-heading"><div><p className="user-eyebrow">Live nearby</p><h2>Vendors on the move</h2></div><span>{loading ? 'Finding carts...' : `${vendors.length} active vendors`}</span></div><div className="user-map"><MapContainer center={location} zoom={14} scrollWheelZoom={false}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={location}><Popup>You are here</Popup></Marker>{vendors.map((vendor) => vendorPosition(vendor) && <Marker key={vendor._id} position={vendorPosition(vendor)}><Popup><strong>{vendor.businessName}</strong><br />{vendor.categories?.join(', ')}</Popup></Marker>)}</MapContainer></div></section>
        <section className="vendor-discovery"><div className="user-section-heading"><div><p className="user-eyebrow">Browse storefronts</p><h2>What&apos;s fresh nearby</h2></div><input className="vendor-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendors or produce" /></div><div className="vendor-card-grid">{loading ? <div className="user-empty">Loading nearby vendors...</div> : filteredVendors.length === 0 ? <div className="user-empty">No active vendors match that search.</div> : filteredVendors.map((vendor) => <article className="vendor-card" key={vendor._id}><div className="vendor-card-top"><div className="vendor-avatar">{vendor.businessName?.charAt(0) || 'V'}</div><span className="vendor-live">LIVE</span></div><h3>{vendor.businessName}</h3><p className="vendor-meta">{vendor.categories?.join(' · ') || 'Local produce'} · {vendor.rating ? `★ ${vendor.rating}` : 'New vendor'}</p><div className="vendor-freshness"><small>Freshness reported</small><strong>{vendor.procurementTime ? new Date(vendor.procurementTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Today'}</strong></div><button className="vendor-view-button" onClick={() => openVendor(vendor)}>View storefront</button></article>)}</div></section>
        {selectedVendor && <section className="storefront-panel"><div className="user-section-heading"><div><p className="user-eyebrow">Selected storefront</p><h2>{selectedVendor.businessName}</h2></div><button className="close-storefront" onClick={() => setSelectedVendor(null)}>Close</button></div><div style={{ marginBottom: '20px' }}><LiveMap vendorId={selectedVendor._id} /></div>{productsLoading ? <p className="user-empty">Loading inventory...</p> : products.length === 0 ? <p className="user-empty">This vendor has no active products right now.</p> : <div className="product-grid">{products.map((product) => <article className="product-card" key={product._id}>{product.imageUrl ? <img src={product.imageUrl} alt={product.itemName} /> : <div className="product-placeholder">{product.itemName?.charAt(0)}</div>}<div><h3>{product.itemName}</h3><p>{product.description || 'Freshly listed by the vendor'}</p><strong>₹{product.price} <small>/ {product.unit}</small></strong></div></article>)}</div>}</section>}
        <section className="reservations-panel" id="orders"><div className="user-section-heading"><div><p className="user-eyebrow">Your activity</p><h2>Recent reservations</h2></div><span>{orders.length} total</span></div>{orders.length === 0 ? <p className="user-empty">Your reservations will appear here.</p> : <div className="reservation-list">{orders.slice(0, 4).map((order) => <div className="reservation-row" key={order._id}><div><strong>Reservation #{String(order._id).slice(-6)}</strong><small>{order.items?.length || 0} item(s) · ₹{order.totalAmount}</small></div><span className={`reservation-status ${order.status}`}>{order.status}</span></div>)}</div>}</section>
      </main>
    </div>
  )
}

export default UserHomepage