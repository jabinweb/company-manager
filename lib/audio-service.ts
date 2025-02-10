class AudioService {
  private audioMap: Map<string, HTMLAudioElement> = new Map();
  private currentSound: string | null = null;

  constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.audioMap.set('ring', new window.Audio('/sounds/ring.mp3'));
      this.audioMap.set('dial', new window.Audio('/sounds/dial.mp3'));
      
      // Configure all audio elements
      this.audioMap.forEach(audio => {
        audio.loop = true;
        audio.volume = 0.5;
      });
    }
  }

  async playSound(name: 'ring' | 'dial') {
    if (typeof window === 'undefined') return;

    try {
      const audio = this.audioMap.get(name);
      if (!audio) return;

      // Stop current sound first and wait a bit
      await this.stopAll();
      await new Promise(resolve => setTimeout(resolve, 100));

      this.currentSound = name;
      await audio.play().catch(error => {
        console.error('[AudioService] Play error:', error);
        this.currentSound = null;
      });
    } catch (error) {
      console.error('[AudioService] Error playing sound:', error);
      this.currentSound = null;
    }
  }

  async stopAll() {
    if (typeof window === 'undefined') return;
    
    try {
      const stopPromises = Array.from(this.audioMap.values()).map(audio => {
        audio.pause();
        audio.currentTime = 0;
        return new Promise(resolve => setTimeout(resolve, 50));
      });
      await Promise.all(stopPromises);
      this.currentSound = null;
    } catch (error) {
      console.error('[AudioService] Error stopping sounds:', error);
    }
  }

  // Expose methods that check for browser environment
  playRingTone = () => {
    if (typeof window !== 'undefined') {
      this.playSound('ring');
    }
  };

  playDialTone = () => {
    if (typeof window !== 'undefined') {
      this.playSound('dial');
    }
  };
}

export const audioService = new AudioService();