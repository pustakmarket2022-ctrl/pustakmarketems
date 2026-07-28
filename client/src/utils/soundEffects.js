/**
 * Web Audio API Notification Chime & Voice Alert Helper
 * Generates crisp audio chime sound without needing external MP3 network assets.
 */
export const playNotificationChime = (titleText = '') => {
  const isMuted = localStorage.getItem('ems_notif_sound') === 'false';
  if (isMuted) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();

    // High Note 1 (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain1.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.25);

    // High Note 2 (A5) - 0.1s delay for pleasant double-tone chime
    setTimeout(() => {
      try {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }, 100);
  } catch (e) {
    console.error('[Audio Chime Error]:', e);
  }
};
