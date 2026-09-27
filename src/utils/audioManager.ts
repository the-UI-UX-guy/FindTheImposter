import { useSettingsStore } from '../store/settingsStore';

class AudioManager {
  private audioCtx: AudioContext | null = null;

  private getContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!useSettingsStore.getState().soundEnabled) return;
    
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playTick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playFastTick() {
    this.playTone(1000, 'sine', 0.05, 0.05);
  }

  playDramaticTick() {
    this.playTone(600, 'square', 0.15, 0.08);
  }

  playTimeUp() {
    this.playTone(150, 'sawtooth', 0.8, 0.15);
  }

  playCardFlip() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playCardHide() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playVote() {
    this.playTone(500, 'triangle', 0.1, 0.05);
  }

  playVoteReveal() {
    this.playTone(400, 'sine', 0.3, 0.08);
  }

  playImposterReveal() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    
    // Play dissonant chord for imposter reveal
    const freqs = [200, 215, 230];
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    });
  }

  playSuccess() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    
    // Play major arpeggio
    const freqs = [400, 500, 600, 800];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      
      const time = ctx.currentTime + (i * 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.4);
    });
  }

  playSelect() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playStartGame() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    
    // Energetic sweep up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
}

export const audioManager = new AudioManager();
