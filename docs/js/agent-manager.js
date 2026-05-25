/**
 * Agent Manager - Handles Microsoft Agent Integration
 * Bridges the Clippy agents with the game UI
 */

class AgentManager {
  constructor() {
    this.currentAgent = null;
    this.agentName = localStorage.getItem('agentName') || 'Merlin';
    this.agentReady = false;
    this.userInteracted = false;
    
    // Wait for user interaction to enable sounds/animations
    document.addEventListener('click', () => {
      this.userInteracted = true;
    });
    document.addEventListener('keydown', () => {
      this.userInteracted = true;
    });
    document.addEventListener('touchstart', () => {
      this.userInteracted = true;
    });
    
    this.waitForClippyAndInitialize();
  }

  waitForClippyAndInitialize() {
    // Wait for Clippy to be available (it loads asynchronously)
    if (typeof clippy === 'undefined') {
      console.log('Waiting for Clippy to load...');
      setTimeout(() => this.waitForClippyAndInitialize(), 500);
      return;
    }

    console.log('Clippy loaded, initializing agent:', this.agentName);
    this.initializeAgent(this.agentName);
  }

  initializeAgent(agentName) {
    this.agentName = agentName;

    if (typeof clippy === 'undefined') {
      console.error('Clippy not available - agents will not display');
      this.agentReady = false;
      return;
    }

    if (typeof clippy.load !== 'function') {
      console.error('Clippy.load is not a function');
      this.agentReady = false;
      return;
    }

    console.log('Loading agent:', agentName);

    // Hide previous agent if exists
    if (this.currentAgent) {
      try {
        this.currentAgent.hide();
      } catch (e) {
        console.warn('Could not hide previous agent:', e);
      }
    }

    clippy.load(agentName, (agent) => {
      console.log('Agent loaded successfully:', agentName);
      this.currentAgent = agent;
      this.agentReady = true;
      try {
        console.log('Showing agent...');
        agent.show();
        
        // Position agent immediately after show
        try {
          const x = Math.max(100, window.innerWidth / 2 - 150);
          const y = 50;
          console.log('Initial positioning to:', x, y);
          agent.moveTo(x, y);
        } catch (e) {
          console.warn('Initial positioning failed:', e);
        }
        
        // Debug: Check for Clippy elements in DOM
        setTimeout(() => {
          const clippyWindows = document.querySelectorAll('[class*="clippy"], .clippy-window, #clippy');
          console.log('Clippy elements in DOM:', clippyWindows.length, clippyWindows);
          clippyWindows.forEach((el, i) => {
            const style = window.getComputedStyle(el);
            console.log(`Clippy element ${i}:`, {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              zIndex: style.zIndex,
              position: style.position,
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              offsetLeft: el.offsetLeft,
              offsetTop: el.offsetTop
            });
          });
        }, 1000);
        
        // Wait for user interaction before playing sounds/animations
        const checkUserInteraction = setInterval(() => {
          if (this.userInteracted) {
            clearInterval(checkUserInteraction);
            console.log('User interacted, enabling audio...');
            this.speakAgent(`Hello! I'm ${agentName}. Ready to play Tic Tac Math?`);
          }
        }, 100);
        
        // Timeout after 3 seconds anyway
        setTimeout(() => {
          clearInterval(checkUserInteraction);
        }, 3000);
        
      } catch (e) {
        console.error('Could not show/speak agent:', e);
      }
    });
  }

  speakAgent(text) {
    // Only try to play agent speech if user has interacted
    if (this.userInteracted && this.currentAgent && this.currentAgent.speak) {
      try {
        this.currentAgent.speak(text);
      } catch (e) {
        console.warn('Could not speak with agent:', e);
      }
    }

    // Also use Web Speech API (works without user interaction in many browsers)
    this.speakTTS(text);
  }

  speakTTS(text) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Select voice based on agent personality
      this.selectVoiceForAgent(utterance);

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('TTS error:', e);
      }
    }
  }

  selectVoiceForAgent(utterance) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    const agentVoiceMap = {
      'Merlin': { gender: 'male', pitch: 0.8, rate: 0.95, keywords: ['david', 'google us english', 'microsoft david'] },
      'Clippy': { gender: 'female', pitch: 1.1, rate: 1.0, keywords: ['zira', 'google us female', 'samantha'] },
      'Bonzi': { gender: 'male', pitch: 1.3, rate: 1.1, keywords: ['Daniel', 'google us english'] },
      'Genie': { gender: 'male', pitch: 0.9, rate: 0.9, keywords: ['david', 'mark', 'google us english male'] },
      'Peedy': { gender: 'female', pitch: 1.2, rate: 1.05, keywords: ['Zira', 'Victoria', 'moira'] },
      'Rover': { gender: 'male', pitch: 1.0, rate: 0.95, keywords: ['Google UK English Male', 'Google US English', 'daniel'] },
      'Rocky': { gender: 'male', pitch: 0.7, rate: 0.9, keywords: ['david', 'adam', 'deep'] },
      'Genius': { gender: 'female', pitch: 1.05, rate: 1.0, keywords: ['zira', 'victoria', 'google us english female'] },
      'F1': { gender: 'male', pitch: 0.95, rate: 1.2, keywords: ['google us english', 'daniel', 'david'] },
      'Links': { gender: 'male', pitch: 1.0, rate: 1.0, keywords: ['google us english', 'daniel'] }
    };

    const config = agentVoiceMap[this.agentName] || { gender: 'male', pitch: 1.0, rate: 1.0, keywords: [] };

    // Try to find a voice matching the agent's keywords
    let selectedVoice = null;
    for (const keyword of config.keywords) {
      selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(keyword.toLowerCase()) ||
        v.voiceURI.toLowerCase().includes(keyword.toLowerCase())
      );
      if (selectedVoice) break;
    }

    // Fallback: select by language and gender if available
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Apply pitch and rate adjustments
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;
  }

  hideAgent() {
    if (this.currentAgent) {
      this.currentAgent.hide();
    }
  }

  showAgent() {
    if (this.currentAgent) {
      this.currentAgent.show();
    }
  }

  playAnimation(animationName) {
    // Only play animations after user interaction
    if (!this.userInteracted) {
      return;
    }
    
    if (this.currentAgent && this.currentAgent.play) {
      const animations = this.currentAgent.animations();
      if (animations && animations.includes(animationName)) {
        try {
          this.currentAgent.play(animationName);
        } catch (e) {
          console.warn('Could not play animation:', e);
        }
      }
    }
  }

  moveAgentToElement(element) {
    if (this.currentAgent && element) {
      try {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        this.currentAgent.moveTo(x, y);
        
        // Play a gesture animation after landing
        setTimeout(() => {
          const animations = this.currentAgent.animations();
          if (animations && animations.includes('Wave')) {
            this.playAnimation('Wave');
          } else if (animations && animations.includes('Acknowledge')) {
            this.playAnimation('Acknowledge');
          }
        }, 500);
      } catch (e) {
        console.warn('Could not move agent:', e);
      }
    }
  }

  celebrateWin() {
    if (this.currentAgent) {
      const animations = this.currentAgent.animations();
      if (animations && animations.includes('Congratulate')) {
        this.playAnimation('Congratulate');
      }
      this.speakAgent('Congratulations! You won!');
    }
  }

  celebrateAgentWin() {
    if (this.currentAgent) {
      const animations = this.currentAgent.animations();
      if (animations && animations.includes('Wave')) {
        this.playAnimation('Wave');
      }
      if (animations && animations.includes('Congratulate')) {
        this.playAnimation('Congratulate');
      }
      this.speakAgent('I won this round!');
    }
  }

  showThinkingAnimation() {
    if (this.currentAgent) {
      const animations = this.currentAgent.animations();
      if (animations && animations.includes('Think')) {
        this.playAnimation('Think');
      }
    }
  }

  stopAnimation() {
    if (this.currentAgent && this.currentAgent.stop) {
      try {
        this.currentAgent.stop();
      } catch (e) {
        console.warn('Could not stop animation:', e);
      }
    }
  }
}

// Global instance
let agentManager = null;

// Initialize on DOM ready, before game.js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    agentManager = new AgentManager();
  });
} else {
  // DOM already loaded
  agentManager = new AgentManager();
}
