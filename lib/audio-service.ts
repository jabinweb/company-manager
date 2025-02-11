class AudioService {
  private audioContext: AudioContext | null = null;
  private ringBuffer: AudioBuffer | null = null;
  private dialBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private hasInteracted = false;
  private pendingSound: 'ring' | 'dial' | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupInteractionHandlers();
    }
  }

  private setupInteractionHandlers() {
    const handleInteraction = () => {
      this.hasInteracted = true;
      if (this.pendingSound) {
        this.playSound(this.pendingSound).catch(console.error);
      }
    };

    ['mousedown', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }

  private async initializeAudioContext() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.audioContext.resume();

      const [ringResponse, dialResponse] = await Promise.all([
        fetch('/sounds/ring.mp3'),
        fetch('/sounds/dial.mp3')
      ]);

      const [ringBuffer, dialBuffer] = await Promise.all([
        ringResponse.arrayBuffer().then(buffer => this.audioContext!.decodeAudioData(buffer)),
        dialResponse.arrayBuffer().then(buffer => this.audioContext!.decodeAudioData(buffer))
      ]);

      this.ringBuffer = ringBuffer;
      this.dialBuffer = dialBuffer;
    } catch (error) {
      console.error('[Audio] Initialization error:', error);
    }
  }

  async playSound(type: 'ring' | 'dial') {
    if (!this.hasInteracted) {
      console.log('[Audio] Queuing sound for after interaction:', type);
      this.pendingSound = type;
      return;
    }

    try {
      await this.initializeAudioContext();
      if (!this.audioContext) return;

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.stopAll();

      const buffer = type === 'ring' ? this.ringBuffer : this.dialBuffer;
      if (!buffer) return;

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.loop = true;
      this.currentSource.connect(this.audioContext.destination);
      this.currentSource.start();
    } catch (error) {
      console.error('[Audio] Playback error:', error);
    }
  }

  async stopAll() {
    try {
      this.pendingSound = null;
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
      if (this.audioContext?.state === 'running') {
        await this.audioContext.suspend();
      }
    } catch (error) {
      console.error('[Audio] Stop error:', error);
    }
  }

  playRingTone() {
    return this.playSound('ring');
  }

  playDialTone() {
    return this.playSound('dial');
  }
}

export const audioService = new AudioService();

