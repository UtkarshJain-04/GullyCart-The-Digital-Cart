export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakText(text, { lang = 'en-IN', rate = 0.95, pitch = 1 } = {}) {
  if (!isSpeechSynthesisSupported() || !text?.trim()) {
    return false
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  utterance.pitch = pitch
  window.speechSynthesis.speak(utterance)

  return true
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}