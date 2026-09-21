// Web Audio API Synthesizer for Romantic Wedding Background Music and Audio Track Recording
import { MusicTheme } from '../types';

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.6;
  private masterGain: GainNode | null = null;
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private loopTimer: number | null = null;
  private currentTheme: MusicTheme = 'romantic-waltz';

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;

    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Create stream destination for MediaRecorder export
    try {
      this.mediaDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaDest);
    } catch (e) {
      console.warn('MediaStreamDestination not supported', e);
    }
  }

  public getAudioStream(): MediaStreamTrack | null {
    this.init();
    if (this.mediaDest && this.mediaDest.stream.getAudioTracks().length > 0) {
      return this.mediaDest.stream.getAudioTracks()[0];
    }
    return null;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setTheme(theme: MusicTheme) {
    this.currentTheme = theme;
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNotes();
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play a single soft piano/harp note with rich harmonics
  private playPianoNote(freq: number, startTime: number, duration: number, vel: number = 0.25) {
    if (!this.ctx || !this.masterGain) return;

    // Fundamental oscillator (triangle for warm body)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Harmonic oscillator (sine for roundness)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Chime sparkle (subtle upper overtone)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime);

    // Envelope
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(vel, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(vel * 0.4, startTime + 0.3);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Lowpass filter for warm velvety tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    osc3.connect(noteGain);
    noteGain.connect(filter);
    filter.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
    osc3.stop(startTime + duration + 0.1);
  }

  // Play a sparkling celesta / magical proposal chime
  public playSparkleChime() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 to G6 arpeggio
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  }

  // Schedule romantic loop
  private scheduleNotes() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Beautiful romantic chords: E-flat major waltz progression
    // Eb - Gm - Ab - Bb (4 bars, ~16 beats, 12 seconds per loop cycle)
    const chordProgressions: Record<MusicTheme, { bass: number[]; chord: number[][]; arpeggio: number[] }[]> = {
      'romantic-waltz': [
        // Eb Major: Eb3, G3, Bb3, Eb4
        { bass: [155.56], chord: [[311.13, 392.0, 466.16]], arpeggio: [622.25, 783.99, 932.33, 1244.5] },
        // Cm / Gm: C3, Eb3, G3, C4
        { bass: [130.81], chord: [[261.63, 311.13, 392.0]], arpeggio: [523.25, 622.25, 783.99, 1046.5] },
        // Ab Major: Ab2, C3, Eb3, Ab3
        { bass: [103.83], chord: [[207.65, 261.63, 311.13]], arpeggio: [415.3, 523.25, 622.25, 830.61] },
        // Bb Major: Bb2, D3, F3, Bb3
        { bass: [116.54], chord: [[233.08, 293.66, 349.23]], arpeggio: [466.16, 587.33, 698.46, 932.33] },
      ],
      'fairytale-ballad': [
        // F Major
        { bass: [174.61], chord: [[349.23, 440.0, 523.25]], arpeggio: [698.46, 880.0, 1046.5] },
        // D Minor
        { bass: [146.83], chord: [[293.66, 349.23, 440.0]], arpeggio: [587.33, 698.46, 880.0] },
        // Bb Major
        { bass: [116.54], chord: [[233.08, 293.66, 349.23]], arpeggio: [466.16, 587.33, 698.46] },
        // C Major
        { bass: [130.81], chord: [[261.63, 329.63, 392.0]], arpeggio: [523.25, 659.25, 783.99] },
      ],
      'celestial-piano': [
        // Db Major
        { bass: [138.59], chord: [[277.18, 349.23, 415.3]], arpeggio: [554.37, 698.46, 830.61] },
        // Bbm
        { bass: [116.54], chord: [[233.08, 277.18, 349.23]], arpeggio: [466.16, 554.37, 698.46] },
        // Gb Major
        { bass: [92.5], chord: [[185.0, 233.08, 277.18]], arpeggio: [369.99, 466.16, 554.37] },
        // Ab Major
        { bass: [103.83], chord: [[207.65, 261.63, 311.13]], arpeggio: [415.3, 523.25, 622.25] },
      ],
      'festive-sangeet': [
        // D Major with celebratory sparkle
        { bass: [146.83], chord: [[293.66, 369.99, 440.0]], arpeggio: [587.33, 739.99, 880.0] },
        // G Major
        { bass: [98.0], chord: [[196.0, 246.94, 293.66]], arpeggio: [392.0, 493.88, 587.33] },
        // Bm
        { bass: [123.47], chord: [[246.94, 293.66, 369.99]], arpeggio: [493.88, 587.33, 739.99] },
        // A Major
        { bass: [110.0], chord: [[220.0, 277.18, 329.63]], arpeggio: [440.0, 554.37, 659.25] },
      ],
    };

    const currentBarProgression = chordProgressions[this.currentTheme] || chordProgressions['romantic-waltz'];
    const barDuration = 2.8; // 2.8 seconds per chord bar

    currentBarProgression.forEach((bar, barIdx) => {
      const barStart = now + barIdx * barDuration;

      // Deep resonant root bass note on beat 1
      this.playPianoNote(bar.bass[0], barStart, barDuration * 1.2, 0.28);

      // Waltz accompaniment: beats 2 and 3
      const beat2 = barStart + barDuration * 0.33;
      const beat3 = barStart + barDuration * 0.66;
      bar.chord[0].forEach((freq) => {
        this.playPianoNote(freq, beat2, 1.2, 0.12);
        this.playPianoNote(freq, beat3, 1.2, 0.1);
      });

      // Flowing lyrical melody / arpeggio over top
      bar.arpeggio.forEach((noteFreq, noteIdx) => {
        const noteTime = barStart + (noteIdx * barDuration) / bar.arpeggio.length;
        this.playPianoNote(noteFreq, noteTime, 1.5, 0.16);
      });
    });

    const totalLoopTime = currentBarProgression.length * barDuration;
    this.loopTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleNotes();
      }
    }, (totalLoopTime - 0.2) * 1000);
  }
}

export const romanticAudio = new RomanticAudioEngine();
