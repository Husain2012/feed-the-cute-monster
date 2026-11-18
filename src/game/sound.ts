/**
 * Procedural Web Audio API sound synthesizer for cheerful, kid-friendly feedback.
 * Requires zero external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(mute: boolean): void {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.14,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playEatGood(): void {
    this.playTone(523.25, 659.25, 0.11, 'triangle', 0.16, 0);
    this.playTone(659.25, 880, 0.15, 'sine', 0.14, 0.06);
  }

  public playEatWrong(): void {
    this.playTone(280, 175, 0.18, 'triangle', 0.15, 0);
    this.playTone(190, 125, 0.22, 'sine', 0.13, 0.09);
  }

  public playTargetChange(): void {
    this.playTone(440, 587.33, 0.1, 'sine', 0.11, 0);
    this.playTone(587.33, 783.99, 0.14, 'triangle', 0.11, 0.08);
  }

  public playStart(): void {
    this.playTone(392, 523.25, 0.1, 'triangle', 0.13, 0);
    this.playTone(523.25, 659.25, 0.1, 'triangle', 0.13, 0.08);
    this.playTone(659.25, 783.99, 0.16, 'sine', 0.13, 0.16);
  }

  public playGameOver(): void {
    this.playTone(440, 349.23, 0.16, 'triangle', 0.13, 0);
    this.playTone(349.23, 293.66, 0.18, 'triangle', 0.13, 0.14);
    this.playTone(293.66, 220, 0.3, 'sine', 0.12, 0.28);
  }
}

export const soundEngine = new SoundEngine();
