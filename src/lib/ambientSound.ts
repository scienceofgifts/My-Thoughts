// Web Audio API pure browser pink/brown noise generator (Zero external files needed)
let audioCtx: AudioContext | null = null;
let noiseNode: AudioNode | null = null;
let gainNode: GainNode | null = null;

export function toggleAmbientNoise(enable: boolean, volume = 0.04): boolean {
  try {
    if (!enable) {
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
        noiseNode = null;
        gainNode = null;
      }
      return false;
    }

    if (audioCtx) return true;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise algorithm (gentle, warm, rainfall-like low frequency spectrum)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost volume of gentle rumble
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    // Low pass filter to create a warm quiet atmosphere
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(0);
    noiseNode = whiteNoise;
    return true;
  } catch (err) {
    console.warn('Ambient sound could not start', err);
    return false;
  }
}
