/**
 * Voice Welcome Greeting Helper using Web Speech Synthesis API
 */
export const speakWelcomeGreeting = (user, forceReplay = false) => {
  if (!user || !user.fullName) return;

  // Check if sound is muted by user setting
  const isMuted = localStorage.getItem('ems_voice_muted') === 'true';
  if (isMuted && !forceReplay) return;

  // Check if welcome already played in this session unless forced
  const alreadyPlayed = sessionStorage.getItem('ems_welcome_played');
  if (alreadyPlayed && !forceReplay) return;

  if ('speechSynthesis' in window) {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
      const text = `${timeOfDay}, ${user.fullName}! Welcome to Pustak Market Enterprise System. Wish you a productive day ahead.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly natural pace
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
      sessionStorage.setItem('ems_welcome_played', 'true');
    } catch (e) {
      console.error('[Voice Greeting Error]:', e);
    }
  }
};
