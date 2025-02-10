class AudioManager {
  private static instance: AudioManager
  private audio: HTMLAudioElement | null = null
  private isReady = false

  private constructor() {
    this.initAudio()
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new AudioManager()
    }
    return this.instance
  }

  private initAudio() {
    this.audio = new Audio('/sounds/ringtone.mp3')
    this.audio.loop = true
    this.audio.preload = 'auto'
    
    this.audio.addEventListener('canplay', () => {
      this.isReady = true
      console.log('[AudioManager] Ringtone ready')
    })

    this.audio.load()
  }

  async playRingtone() {
    if (!this.audio || !this.isReady) return

    try {
      this.audio.currentTime = 0
      await this.audio.play()
      console.log('[AudioManager] Ringtone playing')
    } catch (error) {
      console.error('[AudioManager] Playback error:', error)
    }
  }

  stopRingtone() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }
}

export const audioManager = AudioManager.getInstance()
