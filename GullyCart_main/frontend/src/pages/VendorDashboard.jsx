import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import 'leaflet/dist/leaflet.css'
import '../styles/VendorDashboard.css'

const demoInventory = [
  { _id: 'tomatoes', itemName: 'Tomatoes', quantity: '12', unit: 'kg', price: 40, procurementTime: new Date().toISOString(), status: 'active' },
  { _id: 'potatoes', itemName: 'Potatoes', quantity: '20', unit: 'kg', price: 35, procurementTime: new Date().toISOString(), status: 'active' },
  { _id: 'coriander', itemName: 'Coriander', quantity: '18', unit: 'bundle', price: 10, procurementTime: new Date().toISOString(), status: 'sold_out' },
]

const demoOrders = [
  { _id: 'GC-1042', customerName: 'Aarav', items: '2 kg potatoes', totalAmount: 80, status: 'pending', distance: '0.4 km' },
  { _id: 'GC-1039', customerName: 'Meera', items: '1 kg tomatoes, 1 bundle coriander', totalAmount: 105, status: 'accepted', distance: '0.8 km' },
  { _id: 'GC-1034', customerName: 'Kabir', items: '5 kg potatoes', totalAmount: 190, status: 'ready', distance: '1.2 km' },
]

const demoNearbyOrders = [
  { id: 'near-1', position: [28.6139, 77.209], label: '2 reservations', detail: 'Rajiv Chowk · 0.4 km' },
  { id: 'near-2', position: [28.617, 77.215], label: '1 reservation', detail: 'Khan Market · 0.9 km' },
  { id: 'near-3', position: [28.608, 77.205], label: '3 reservations', detail: 'Jantar Mantar · 1.3 km' },
]

function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => { map.setView(position, 14) }, [map, position])
  return null
}

function parseVoiceInventory(text) {
  const numberWords = 'ek|one|do|doe|two|teen|three|char|chaar|four|paanch|panch|five|chhe|che|six|saat|seven|aath|eight|nau|nine|das|ten'
  const unitWords = 'kg|kilo|kilos|kilogram|kilograms|किलो|g|gram|grams|ग्राम|dozen|pieces?|pcs|piece|bundles?|guchhe|guccha|gucch|गुच्छे|गुच्छा|गड्डी'
  const parts = text.split(/,|\band\b|\baur\b|\n/i).map((part) => part.trim()).filter(Boolean)

  return parts.map((part, index) => {
    const match = part.match(new RegExp(`^(${numberWords}|\\d+(?:\\.\\d+)?)\\s*(${unitWords})?\\s*(?:of|ka|ki|के)?\\s*(.+?)(?:\\s+(?:at|for|@|rate|daam|keemat|रुपये|रुपए)\\s*₹?\\s*(\\d+(?:\\.\\d+)?))?$`, 'iu'))
    if (!match) return null
    const rawQuantity = match[1].toLowerCase()
    const quantity = rawQuantity === 'ek' || rawQuantity === 'one' ? 1 : rawQuantity === 'do' || rawQuantity === 'doe' || rawQuantity === 'two' ? 2 : rawQuantity === 'teen' || rawQuantity === 'three' ? 3 : rawQuantity === 'char' || rawQuantity === 'chaar' || rawQuantity === 'four' ? 4 : rawQuantity === 'paanch' || rawQuantity === 'panch' || rawQuantity === 'five' ? 5 : rawQuantity === 'chhe' || rawQuantity === 'che' || rawQuantity === 'six' ? 6 : rawQuantity === 'saat' || rawQuantity === 'seven' ? 7 : rawQuantity === 'aath' || rawQuantity === 'eight' ? 8 : rawQuantity === 'nau' || rawQuantity === 'nine' ? 9 : rawQuantity === 'das' || rawQuantity === 'ten' ? 10 : rawQuantity
    const rawUnit = (match[2] || '').toLowerCase()
    const unit = rawUnit.includes('kg') || rawUnit.includes('kilo') || rawUnit.includes('किलो') || rawUnit.includes('gram') || rawUnit.includes('ग्राम') ? 'kg' : rawUnit.includes('dozen') ? 'dozen' : rawUnit.includes('bundle') || rawUnit.includes('guch') || rawUnit.includes('गुच्छ') || rawUnit.includes('गड्डी') ? 'bundle' : 'piece'
    return { _id: `voice-${index}-${Date.now()}`, itemName: match[3].trim(), quantity: String(quantity), unit, price: Number(match[4] || 0), status: 'active', procurementTime: new Date().toISOString() }
  }).filter(Boolean)
}

function VendorDashboard() {
  const navigate = useNavigate() // Added navigation hook
  const token = useAuthStore((state) => state.token)
  
  // Added Zustand logout action (ensure your authStore has a clear auth / logout method)
  // If your method is named differently (like 'clearToken'), change 'logout' to match your store
  const logout = useAuthStore((state) => state.logout || state.clearAuth) 

  const [inventory, setInventory] = useState(demoInventory)
  const [orders, setOrders] = useState(demoOrders)
  const [nearbyOrders, setNearbyOrders] = useState(demoNearbyOrders)
  const [voiceText, setVoiceText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechLanguage, setSpeechLanguage] = useState(navigator.language || 'en-IN')
  const [isLive, setIsLive] = useState(false)
  const [location, setLocation] = useState([28.6139, 77.209])
  const recognitionRef = useRef(null)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const activeCount = inventory.filter((item) => item.status === 'active').length
  const pendingCount = orders.filter((order) => order.status === 'pending').length
  const parsedVoiceItems = useMemo(() => parseVoiceInventory(voiceText), [voiceText])

  const [socketInstance, setSocketInstance] = useState(null)

  useEffect(() => {
    const socket = io(apiUrl, { auth: { token } })
    setSocketInstance(socket)
    socket.on('vendor:location-updated', (vendor) => {
      setNearbyOrders((current) => current.map((order) => order.id === vendor.vendorId ? { ...order, position: [vendor.location.latitude, vendor.location.longitude] } : order))
    })
    return () => socket.disconnect()
  }, [apiUrl, token])

  useEffect(() => {
    if (!navigator.geolocation) return undefined
    const watchId = navigator.geolocation.watchPosition(({ coords }) => {
      setLocation([coords.latitude, coords.longitude])
      if (socketInstance && isLive) {
        socketInstance.emit('update_vendor_location', { coordinates: [coords.longitude, coords.latitude] })
      }
    })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [socketInstance, isLive])



  function toggleListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const recognition = new SpeechRecognition()
    recognition.lang = speechLanguage
    recognition.onresult = (event) => setVoiceText((current) => `${current} ${event.results[0][0].transcript}`.trim())
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function addVoiceItems() {
    if (!parsedVoiceItems.length) return
    setInventory((current) => [...parsedVoiceItems, ...current])
    setVoiceText('')
  }

  function updateInventory(id, field, value) {
    setInventory((current) => current.map((item) => item._id === id ? { ...item, [field]: value } : item))
  }

  function selectProductImage(id, file) {
    if (!file) return
    setInventory((current) => current.map((item) => item._id === id
      ? { ...item, imageFile: file, imagePreview: URL.createObjectURL(file) }
      : item))
  }

  function advanceOrder(id) {
    const nextStatus = { pending: 'accepted', accepted: 'ready', ready: 'collected' }
    setOrders((current) => current.map((order) => order._id === id ? { ...order, status: nextStatus[order.status] || order.status } : order))
  }

  function toggleLive() {
    setIsLive((current) => !current)
  }

  // Handle Logout Execution
  function handleLogout() {
    if (logout) {
      logout() // Clears the Zustand auth state
    } else {
      // Fallback if your store doesn't have a logout method
      localStorage.removeItem('token')
    }
    navigate('/login') // Redirects back to the login page
  }

  return (
    <div className="vendor-shell">
      <header className="vendor-topbar">
        <span className="text-lg"><strong>Vendor Studio</strong></span>
        <div className="vendor-top-actions">
          <span className={`live-dot ${isLive ? 'on' : ''}`}></span>
          {isLive ? 'Live session' : 'Session paused'}
          <button className="outline-button" onClick={toggleLive}>
            {isLive ? 'Stop selling' : 'Start selling'}
          </button>
        </div>
      </header>

      <main className="vendor-content">
        <section className="vendor-intro"><div><p className="eyebrow">Tuesday · local storefront</p><h1>Good morning, vendor.</h1><p className="intro-copy">Keep your cart visible, your stock fresh, and nearby orders moving.</p></div><div className="today-total"><span>Today&apos;s reservations</span><strong>{orders.length}</strong><small>{pendingCount} waiting for action</small></div></section>

        <section className="vendor-stats"><div><span>Active items</span><strong>{activeCount}</strong><small>of {inventory.length} listed</small></div><div><span>People nearby</span><strong>18</strong><small>within 2 km</small></div><div><span>Expected sales</span><strong>₹275</strong><small>from current orders</small></div><div><span>Freshness</span><strong>94%</strong><small>reported today</small></div></section>

        <div className="vendor-grid">
          <section className="panel inventory-panel">
            <div className="panel-heading"><div><p className="eyebrow">Voice inventory</p><h2>What&apos;s on your cart?</h2></div><span className="panel-count">{activeCount} active</span></div>
            <div className="voice-box"><div className={`mic-icon ${isListening ? 'listening' : ''}`}>◉</div><div><strong>{isListening ? 'Listening...' : 'Say item, quantity and price'}</strong><span>Try “10 kg tomatoes at 40 rupees”</span></div><label className="language-control">Language <input className="language-select" list="browser-languages" value={speechLanguage} onChange={(event) => setSpeechLanguage(event.target.value)} placeholder="en-IN" /><datalist id="browser-languages">{(navigator.languages || [navigator.language]).map((language) => <option key={language} value={language} />)}</datalist></label><button className="mic-button" onClick={toggleListening}>{isListening ? 'Stop' : 'Speak'}</button></div>
            <textarea className="voice-input" value={voiceText} onChange={(event) => setVoiceText(event.target.value)} placeholder="Your inventory words appear here..." />
            {parsedVoiceItems.length > 0 && <button className="add-voice-button" onClick={addVoiceItems}>Add {parsedVoiceItems.length} items to inventory</button>}
            <div className="inventory-list">{inventory.map((item) => <div className="inventory-row" key={item._id}><span className={`stock-status ${item.status}`}></span><label className="image-picker">{item.imagePreview || item.imageUrl ? <img src={item.imagePreview || item.imageUrl} alt={item.itemName} /> : <span>+</span>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectProductImage(item._id, event.target.files[0])} /></label><input value={item.itemName} onChange={(event) => updateInventory(item._id, 'itemName', event.target.value)} /><input className="quantity-input" value={item.quantity} onChange={(event) => updateInventory(item._id, 'quantity', event.target.value)} /><select className="unit-input" value={item.unit || 'kg'} onChange={(event) => updateInventory(item._id, 'unit', event.target.value)}><option value="kg">kg</option><option value="piece">piece</option><option value="bundle">bundle</option><option value="dozen">dozen</option></select><label className="price-input"><span>₹</span><input type="number" min="0" value={item.price ?? ''} onChange={(event) => updateInventory(item._id, 'price', event.target.value === '' ? '' : Number(event.target.value))} /></label><select value={item.status} onChange={(event) => updateInventory(item._id, 'status', event.target.value)}><option value="active">Active</option><option value="sold_out">Sold out</option></select></div>)}</div>
            <button className="save-button">Save inventory changes</button>
          </section>

          <section className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">Demand radar</p><h2>Orders near you</h2></div><span className="map-radius">2 km radius</span></div><div className="map-frame"><MapContainer center={location} zoom={14} scrollWheelZoom={false}><RecenterMap position={location} /><TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={location}><Popup>Your cart</Popup></Marker>{nearbyOrders.map((order) => <Marker key={order.id} position={order.position}><Popup><strong>{order.label}</strong><br />{order.detail}</Popup></Marker>)}</MapContainer></div><div className="map-legend"><span><i className="legend-cart"></i>Your cart</span><span><i className="legend-order"></i>Nearby reservations</span></div></section>
        </div>

        <section className="panel orders-panel"><div className="panel-heading"><div><p className="eyebrow">Reservation queue</p><h2>Orders to prepare</h2></div><button className="text-button">View all orders →</button></div><div className="orders-table"><div className="order-header"><span>Order</span><span>Customer</span><span>Items</span><span>Distance</span><span>Status</span><span></span></div>{orders.map((order) => <div className="order-row" key={order._id}><strong>{order._id}</strong><span>{order.customerName}</span><span>{order.items}</span><span>{order.distance}</span><span className={`order-status ${order.status}`}>{order.status}</span><button className="row-action" disabled={order.status === 'collected'} onClick={() => advanceOrder(order._id)}>{order.status === 'pending' ? 'Accept' : order.status === 'accepted' ? 'Mark ready' : order.status === 'ready' ? 'Collected' : 'Done'}</button></div>)}</div></section>
      </main>
    </div>
  )
}

export default VendorDashboard