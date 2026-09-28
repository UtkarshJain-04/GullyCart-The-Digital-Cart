import { isSpeechSynthesisSupported, speakText, stopSpeaking } from '../utils/speech.js'
import VoiceOnboarding from '../components/VoiceOnboarding.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function Home() {
  const welcomeMessage = 'Welcome to GullyCart. Find fresh local vendors near you.'
  
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <main>
      <h1>GullyCart</h1>
      <p>Your local shopping experience starts here.</p>
      <div>
        <button type="button" onClick={() => speakText(welcomeMessage)} disabled={!isSpeechSynthesisSupported()}>
          Read welcome message
        </button>
        <button type="button" onClick={stopSpeaking} disabled={!isSpeechSynthesisSupported()}>
          Stop
        </button>
      </div>
      <VoiceOnboarding />
      <Link to="/vendor/dashboard">Open Vendor Dashboard</Link>
      
      {/* Conditionally render Login/Signup vs Logout based on token */}
      {token ? (
        <button 
          onClick={handleLogout} 
          style={{ cursor: 'pointer', background: 'transparent', border: '1px solid currentColor', padding: '0.25rem 0.75rem', marginLeft: '0.5rem' }}
        >
          Log Out
        </button>
      ) : (
        <>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Log In</Link>
        </>
      )}
    </main>
  )
}

export default Home