// Daha canlı ve zengin Candy Crush tarzı müzik
class BackgroundMusic {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private intervalId: number | null = null;
  private bassIntervalId: number | null = null;

  // Ana melodi - daha hızlı ve neşeli (C major pentatonic)
  private melody = [
    { freq: 523.25, duration: 0.2 }, // C5
    { freq: 587.33, duration: 0.2 }, // D5
    { freq: 659.25, duration: 0.2 }, // E5
    { freq: 783.99, duration: 0.4 }, // G5
    { freq: 659.25, duration: 0.2 }, // E5
    { freq: 783.99, duration: 0.2 }, // G5
    { freq: 880.00, duration: 0.4 }, // A5
    { freq: 783.99, duration: 0.2 }, // G5
    { freq: 659.25, duration: 0.2 }, // E5
    { freq: 587.33, duration: 0.2 }, // D5
    { freq: 523.25, duration: 0.4 }, // C5
    { freq: 0, duration: 0.2 },      // Rest
  ];

  // Bas hattı
  private bassLine = [
    { freq: 130.81, duration: 0.4 }, // C3
    { freq: 146.83, duration: 0.4 }, // D3
    { freq: 164.81, duration: 0.4 }, // E3
    { freq: 196.00, duration: 0.4 }, // G3
  ];

  private currentNoteIndex = 0;
  private currentBassIndex = 0;

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.15; // Biraz daha yüksek ses
    }
  }

  private playNote(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.audioContext || !this.gainNode || frequency === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // ADSR envelope
    noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    noteGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.7, this.audioContext.currentTime + 0.05);
    noteGain.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime + duration - 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);

    this.oscillators.push(oscillator);

    setTimeout(() => {
      const index = this.oscillators.indexOf(oscillator);
      if (index > -1) {
        this.oscillators.splice(index, 1);
      }
    }, duration * 1000 + 100);
  }

  start() {
    if (this.isPlaying) return;

    this.init();
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.currentBassIndex = 0;

    // Ana melodi
    const playNextNote = () => {
      if (!this.isPlaying) return;

      const note = this.melody[this.currentNoteIndex];
      this.playNote(note.freq, note.duration, 'triangle', 0.25);

      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
      this.intervalId = window.setTimeout(playNextNote, note.duration * 1000);
    };

    // Bas hattı
    const playNextBass = () => {
      if (!this.isPlaying) return;

      const bass = this.bassLine[this.currentBassIndex];
      this.playNote(bass.freq, bass.duration, 'square', 0.15);

      this.currentBassIndex = (this.currentBassIndex + 1) % this.bassLine.length;
      this.bassIntervalId = window.setTimeout(playNextBass, bass.duration * 1000);
    };

    playNextNote();
    playNextBass();
  }

  stop() {
    this.isPlaying = false;

    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    if (this.bassIntervalId !== null) {
      clearTimeout(this.bassIntervalId);
      this.bassIntervalId = null;
    }

    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];
  }

  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const backgroundMusic = new BackgroundMusic();
