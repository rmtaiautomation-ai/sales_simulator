import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  Bot, 
  Volume2, 
  PhoneOff, 
  Activity, 
  BarChart2, 
  RotateCcw,
  Check,
  FileText,
  Download,
  Save,
  Award,
  HelpCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

class SoundEffects {
  static ctx: AudioContext | null = null;

  static getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  static playTing() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5 note (high clean chime)
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Ting sound error:", e);
    }
  }

  static playConfirm() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain2.gain.setValueAtTime(0.1, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn("Confirm sound error:", e);
    }
  }

  static playPickup() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Pickup sound error:", e);
    }
  }

  static startRingRing() {
    try {
      const ctx = this.getContext();
      if (!ctx) return () => {};
      if (ctx.state === 'suspended') ctx.resume();

      let activeOsc1: OscillatorNode | null = null;
      let activeOsc2: OscillatorNode | null = null;
      let activeGain: GainNode | null = null;
      let intervalId: any = null;

      const playSingleRing = () => {
        if (!ctx) return;
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // 440 Hz

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now); // 480 Hz

        gain.gain.setValueAtTime(0, now);
        // Ring 1 (0.05s to 0.45s)
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 0.45);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        // Ring 2 (0.7s to 1.1s)
        gain.gain.linearRampToValueAtTime(0.08, now + 0.7);
        gain.gain.setValueAtTime(0.08, now + 1.1);
        gain.gain.linearRampToValueAtTime(0, now + 1.15);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);

        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);

        activeOsc1 = osc1;
        activeOsc2 = osc2;
        activeGain = gain;
      };

      playSingleRing();

      intervalId = setInterval(() => {
        playSingleRing();
      }, 3000);

      return () => {
        clearInterval(intervalId);
        if (activeOsc1) { try { activeOsc1.stop(); } catch (err) {} }
        if (activeOsc2) { try { activeOsc2.stop(); } catch (err) {} }
        if (activeGain) { try { activeGain.disconnect(); } catch (err) {} }
      };
    } catch (e) {
      console.warn("RingRing sound error:", e);
      return () => {};
    }
  }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [dialingPersonaName, setDialingPersonaName] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [detectedPersonaId, setDetectedPersonaId] = useState<'pending' | 'solar' | 'video_standard' | 'video_social_pro'>('pending');
  const [persona, setPersona] = useState<string>('Awaiting Opening Phrase...');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isTranscriptSaved, setIsTranscriptSaved] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarChatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const speechTimeoutRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  const stopRingRef = useRef<(() => void) | null>(null);

  // Keep track of latest values for callbacks
  const latestInputValue = useRef('');
  useEffect(() => {
    latestInputValue.current = inputValue;
  }, [inputValue]);

  // Load voices early
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      isComponentMounted.current = false;
      if (stopRingRef.current) {
        stopRingRef.current();
      }
    };
  }, []);

  // Determine Persona and Difficulty Mock
  useEffect(() => {
    if (isCallActive || messages.length > 0) {
      if (detectedPersonaId === 'solar') {
        setPersona('Mike (Solar Engine)');
      } else if (detectedPersonaId === 'video_standard') {
        setPersona('Rick (Video Content)');
      } else if (detectedPersonaId === 'video_social_pro') {
        setPersona('Rick (Social Pro)');
      } else {
        setPersona('Awaiting Opening Phrase...');
      }
    } else {
      setPersona('Awaiting Opening Phrase...');
      setDifficulty(2);
    }

    // Pseudo-difficulty progression based on turn count
    if (messages.length > 5 && messages.length <= 10) setDifficulty(3);
    else if (messages.length > 10 && messages.length <= 15) setDifficulty(4);
    else if (messages.length > 15) setDifficulty(5);

  }, [messages, detectedPersonaId, isCallActive]);

  const speakText = (text: string, force: boolean = false) => {
    if (!('speechSynthesis' in window) || isEvaluating) return;
    
    window.speechSynthesis.cancel(); // Stop talking previous messages
    
    // Quick scrub to remove markdown so sounds better
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    
    // Robust cascading priority to select high-quality clear American (US) Male voices
    const selectUSMaleVoice = () => {
      // Priority 1: High quality explicit US English Male voices
      const usMale = voices.find(v => {
        const lang = v.lang.replace('_', '-').toLowerCase();
        if (lang !== 'en-us') return false;
        
        const nameL = v.name.toLowerCase();
        return (
          nameL.includes('male') || 
          nameL.includes('david') || 
          nameL.includes('daniel') || 
          nameL.includes('alex') || 
          nameL.includes('mark') || 
          nameL.includes('james') || 
          nameL.includes('guy') ||
          nameL.includes('natural')
        );
      });
      if (usMale) return usMale;

      // Priority 2: Generic US English voices but filtering out typical female names to keep the male tone
      const usGenericClean = voices.find(v => {
        const lang = v.lang.replace('_', '-').toLowerCase();
        if (lang !== 'en-us') return false;
        
        const nameL = v.name.toLowerCase();
        return (
          !nameL.includes('samantha') && 
          !nameL.includes('zira') && 
          !nameL.includes('hazel') && 
          !nameL.includes('susan') && 
          !nameL.includes('helena') && 
          !nameL.includes('veena')
        );
      });
      if (usGenericClean) return usGenericClean;

      // Priority 3: Any English language male voices
      const enMaleGeneric = voices.find(v => {
        if (!v.lang.toLowerCase().startsWith('en')) return false;
        
        const nameL = v.name.toLowerCase();
        return (
          nameL.includes('male') || 
          nameL.includes('david') || 
          nameL.includes('daniel') || 
          nameL.includes('alex') || 
          nameL.includes('mark') || 
          nameL.includes('james') || 
          nameL.includes('george')
        );
      });
      if (enMaleGeneric) return enMaleGeneric;

      // Priority 4: Any US English voice
      const anyUS = voices.find(v => v.lang.replace('_', '-').toLowerCase() === 'en-us');
      if (anyUS) return anyUS;

      // Priority 5: Any English voice
      return voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
    };

    const maleVoice = selectUSMaleVoice();
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    utterance.pitch = 0.95; // Slightly deeper, warmer vocal pitch for natural US businessman sounding
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const sendMessageRef = useRef<((m: string, r?: boolean) => Promise<void>) | null>(null);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      // We still use continuous = false but we also enforce our own silence timeout
      recognition.continuous = true; // Use continuous so we can manually stop it after silence
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + finalTranscript.trim();
          interimTranscriptRef.current = '';
          setInputValue(finalTranscriptRef.current);
        } else {
          interimTranscriptRef.current = interimTranscript;
          setInputValue(finalTranscriptRef.current + (finalTranscriptRef.current ? ' ' : '') + interimTranscript);
        }

        // Restart silence timer on each result
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        speechTimeoutRef.current = setTimeout(() => {
          recognition.stop();
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        setIsListening(false);
        // Automatically send the message when speech recognition stops
        const messageToSend = finalTranscriptRef.current.trim() || interimTranscriptRef.current.trim() || latestInputValue.current.trim();
        if (isComponentMounted.current && messageToSend.length > 0) {
          finalTranscriptRef.current = '';
          interimTranscriptRef.current = '';
          sendMessageRef.current?.(messageToSend);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        window.speechSynthesis?.cancel(); // stop AI speech
        setIsSpeaking(false);
        finalTranscriptRef.current = ''; // Reset on fresh listen
        interimTranscriptRef.current = '';
        setInputValue('');
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startCall = () => {
    setIsCallActive(true);
    setDetectedPersonaId('pending');
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setInputValue('');
    setIsRinging(false);
    setDialingPersonaName('');

    // Play "Ting!" sound representing the voice-trigger listening activation
    SoundEffects.playTing();
    
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Microphone auto-start notice:', e);
      }
    }, 150);
  };

  const selectAndCallPersona = (personaId: 'solar' | 'video_standard' | 'video_social_pro') => {
    // 1. Play "Ting!" sound representing direct manual selection / permission
    SoundEffects.playTing();
    
    // 2. Activate call and lock-in the selected persona
    setIsCallActive(true);
    setDetectedPersonaId(personaId);
    
    let name = '';
    if (personaId === 'solar') {
      name = 'Mike from Rocket Solar';
    } else if (personaId === 'video_standard') {
      name = 'Rick (Contractor)';
    } else {
      name = 'Rick (Social Pro Contractor)';
    }
    setDialingPersonaName(name);
    
    // 3. Initiate Ringing state
    setIsRinging(true);
    
    // Clean up any stale ring first
    if (stopRingRef.current) {
      stopRingRef.current();
    }
    
    // 4. Start the dual-frequency "Ring-Ring" phone sound
    const stopRing = SoundEffects.startRingRing();
    stopRingRef.current = stopRing;
    
    // Suppress active speech synthesis and mic listening during ringing
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    
    // 5. Trigger the API call in the background immediately!
    proceedToChatApi("Hi there", personaId, false, true);
  };

  const handleRestart = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    
    // Clean up any running telephone ring
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    setIsRinging(false);
    setDialingPersonaName('');
    
    setMessages([]);
    setSessionId(null);
    setInputValue('');
    setIsLoading(false);
    setIsCallActive(false);
    setIsEvaluating(false);
    setDetectedPersonaId('pending');
    setIsTranscriptSaved(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, inputValue, isLoading, isSpeaking]);

  useEffect(() => {
    if (sidebarChatContainerRef.current) {
      sidebarChatContainerRef.current.scrollTop = sidebarChatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveTranscript = () => {
    setIsTranscriptSaved(true);
  };

  const extractReportCard = (text: string) => {
    if (!text) return '';
    const marker = '[ROLEPLAY CONCLUDED';
    const index = text.indexOf(marker);
    if (index !== -1) {
      return text.substring(index);
    }
    const altMarker = '### 📊 SALES REP REPORT CARD';
    const altIndex = text.indexOf(altMarker);
    if (altIndex !== -1) {
      return text.substring(altIndex);
    }
    return text;
  };

  const isEvaluationMessage = (msg: any) => {
    if (msg.role !== 'model') return false;
    const content = msg.content || '';
    return content.includes('CONCLUDED') || 
           content.includes('REPORT CARD') || 
           content.includes('EVALUATING') || 
           content.includes('SCREENING VERDICT') || 
           content.includes('FINAL RATING') || 
           content.includes('PEAK DIFFICULTY ACHIEVED') ||
           content.includes('Grading Report') ||
           content.includes('Performance Assessment');
  };

  const downloadMarkdown = () => {
    const timeStr = new Date().toLocaleString();
    const personaTitle = 
      detectedPersonaId === 'solar' ? 'Mike (Solar Company Owner)' : 
      detectedPersonaId === 'video_standard' ? 'Rick (Video Standard Contractor)' : 
      detectedPersonaId === 'video_social_pro' ? 'Rick (Social Pro Contractor)' : 
      'Dynamic Buyer';
    
    const header = `# 📊 SALES SIMULATOR - ROLEPLAY SESSION DISSECTION REPORT\n` +
      `**Generated On:** ${timeStr}\n` +
      `**Evaluated Individual:** Sales Candidate (mike.robotshelper@gmail.com)\n` +
      `**Simulated Prospect:** ${personaTitle}\n` +
      `**Peak Difficulty Achieved:** Level ${difficulty}/5\n` +
      `**Roleplay Evaluation Status:** ${isEvaluating ? 'Fully Evaluated & Scored' : 'Active/Suspended Call State'}\n\n` +
      `---\n\n` +
      `## 🏆 PERFORMANCE EVALUATION REPORT & FEEDBACK\n\n`;

    // Extract report if generated
    const evaluationTexts = messages
      .filter(msg => msg.role === 'model' && (msg.content.includes('CONCLUDED') || msg.content.includes('EVALUATING') || msg.content.includes('REPORT CARD') || msg.content.includes('Performance Assessment') || msg.content.includes('SCREENING VERDICT')))
      .map(msg => msg.content)
      .join('\n\n');

    const rawReport = evaluationTexts || (messages.length > 0 ? messages.filter(msg => msg.role === 'model').slice(-1)[0]?.content : 'No evaluation concluded yet.');
    const finalReport = extractReportCard(rawReport);

    const transcriptHeader = `\n\n---\n\n## 💬 WORD-FOR-WORD CONVERSATION DIALOGUE SCRIPT\n\n`;
    
    // Filter out evaluation controls so the conversation script is kept pristine and clean!
    const filteredMessages = messages.filter(msg => {
      const isEvalTrigger = msg.role === 'user' && msg.content.includes('Please provide the graded candidate performance assessment now');
      const isEvalReport = msg.role === 'model' && (
        msg.content.includes('CONCLUDED') || 
        msg.content.includes('EVALUATING') || 
        msg.content.includes('REPORT CARD') || 
        msg.content.includes('Performance Assessment') || 
        msg.content.includes('SCREENING VERDICT')
      );
      return !isEvalTrigger && !isEvalReport;
    });

    const transcriptBody = filteredMessages
      .map(msg => {
        const isUser = msg.role === 'user';
        const speaker = isUser ? 'Sales Agent (You)' : personaTitle;
        return `### 👤 ${speaker}\n${msg.content}\n`;
      })
      .join('\n');

    const totalDoc = header + finalReport + transcriptHeader + transcriptBody;

    const blob = new Blob([totalDoc], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Roleplay_Report_${detectedPersonaId}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadHTMLPDF = () => {
    const timeStr = new Date().toLocaleString();
    const personaName = 
      detectedPersonaId === 'solar' ? 'Mike (Solar Company Owner)' : 
      detectedPersonaId === 'video_standard' ? 'Rick (Video Standard Contractor)' : 
      detectedPersonaId === 'video_social_pro' ? 'Rick (Social Pro Contractor)' : 
      'Dynamic Buyer';
    const clientOffer = 
      detectedPersonaId === 'solar' ? 'The Solar Engine Booking System ($497/mo + $100 per booked appt)' : 
      detectedPersonaId === 'video_standard' ? 'Pure Video Content Creation ($297/mo)' : 
      detectedPersonaId === 'video_social_pro' ? '"Social Pro" Video Creation & Full Posting ($497/mo)' : 
      'General Trade B2B Offer';

    // Compile evaluation content
    const rawEvaluation = messages
      .filter(msg => msg.role === 'model' && (msg.content.includes('CONCLUDED') || msg.content.includes('EVALUATING') || msg.content.includes('REPORT CARD') || msg.content.includes('Performance Assessment') || msg.content.includes('SCREENING VERDICT')))
      .map(msg => msg.content)
      .join('\n\n') || (messages.length > 0 ? messages.filter(msg => msg.role === 'model').slice(-1)[0]?.content : 'No formal evaluation compiled yet.');

    const evaluationTexts = extractReportCard(rawEvaluation);

    // Convert simple markdown headings & lists to simple html tags
    const formattedEvaluation = evaluationTexts
      .replace(/###\s+(.*)/g, '<h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin-top: 18px; margin-bottom: 8px;">$1</h3>')
      .replace(/##\s+(.*)/g, '<h2 style="font-size: 18px; font-weight: 850; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return `<li style="margin-bottom: 6px; font-size: 13.5px; color: #334155;">${trimmed.substring(1).trim()}</li>`;
        }
        if (trimmed.length > 0 && !trimmed.startsWith('<h') && !trimmed.startsWith('<l')) {
          return `<p style="margin-bottom: 10px; font-size: 13.5px; line-height: 1.6; color: #334155;">${trimmed}</p>`;
        }
        return line;
      })
      .join('\n');

    // Compile transcript dialog rows (excluding the evaluation control messages)
    const filteredMessages = messages.filter(msg => {
      const isEvalTrigger = msg.role === 'user' && msg.content.includes('Please provide the graded candidate performance assessment now');
      const isEvalReport = msg.role === 'model' && (
        msg.content.includes('CONCLUDED') || 
        msg.content.includes('EVALUATING') || 
        msg.content.includes('REPORT CARD') || 
        msg.content.includes('Performance Assessment') || 
        msg.content.includes('SCREENING VERDICT')
      );
      return !isEvalTrigger && !isEvalReport;
    });

    const transcriptRows = filteredMessages.map(msg => {
      const isUser = msg.role === 'user';
      const speakerLabel = isUser ? 'Sales Agent (Candidate)' : personaName;
      const bgColor = isUser ? '#f8fafc' : '#eff6ff';
      const textColor = isUser ? '#334155' : '#1e3a8a';
      const themeColor = isUser ? '#64748b' : '#3b82f6';
      
      return `
        <div style="margin-bottom: 12px; padding: 14px; border-radius: 10px; background-color: ${bgColor}; border: 1px solid ${isUser ? '#f1f5f9' : '#dbeafe'};">
          <div style="font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${themeColor}; margin-bottom: 4px;">
            ${speakerLabel}
          </div>
          <div style="font-size: 13.5px; line-height: 1.5; color: ${textColor}; white-space: pre-wrap;">
            ${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        </div>
      `;
    }).join('');

    const htmlLayout = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Call Assessment - Report Card</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .card-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .roleplay-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0;
            color: #0f172a;
          }
          .grid-info {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 12px;
            font-size: 12.5px;
            color: #475569;
            margin-top: 16px;
            background-color: #f8fafc;
            padding: 14px;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
          }
          .sub-heading {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 30px;
            margin-bottom: 12px;
            color: #475569;
            border-left: 3px solid #0f172a;
            padding-left: 8px;
          }
          .action-btn {
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .action-btn:hover {
            opacity: 0.9;
          }
          @media print {
            body { padding: 0px; }
            .action-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right;">
          <button class="action-btn" onclick="window.print()">🖨️ Save as PDF / Print Report</button>
        </div>
        
        <div class="card-header">
          <h1 class="roleplay-title">Sales Roleplay Assessment</h1>
          <div style="font-size: 11px; font-weight: 700; tracking-wider; text-transform: uppercase; color: #64748b; margin-top: 3px;">
            Certified Feedback & Transcript Log
          </div>
          
          <div class="grid-info">
            <div>
              <div><strong>Evaluation Date:</strong> ${timeStr}</div>
              <div><strong>Candidate Email:</strong> mike.robotshelper@gmail.com</div>
              <div><strong>Product Pitched:</strong> ${clientOffer}</div>
            </div>
            <div>
              <div><strong>Target Client:</strong> ${personaName}</div>
              <div><strong>Objection Progression Peak:</strong> Level ${difficulty}/5</div>
              <div><strong>Session Key:</strong> ACTIVE_SEC_SUCCESS</div>
            </div>
          </div>
        </div>

        <div class="sub-heading">🏆 Graded Performance Assessment & Report Card</div>
        <div style="background-color: #fafafa; border: 1px solid #f1f5f9; border-radius: 8px; padding: 18px 22px; margin-bottom: 24px;">
          ${formattedEvaluation}
        </div>

        <div class="sub-heading">💬 Conversation Script</div>
        <div style="margin-top: 14px;">
          ${transcriptRows}
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
          Antigravity Sales Performance Engine • Secure Local Print Archive
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlLayout], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Evaluation_PDFReport_${detectedPersonaId}_${Date.now()}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const sendMessage = async (message: string, reset: boolean = false) => {
    if ((!message.trim() && !reset) || isLoading) return;

    let nextPersonaId: 'pending' | 'solar' | 'video_standard' | 'video_social_pro' = detectedPersonaId;
    let justDetected = false;

    if (!reset) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: message }
      ]);
      
      // Dynamic state trigger checking with expanded configuration routes
      const textLower = message.toLowerCase();
      if (detectedPersonaId === 'pending') {
        // Social Pro checks first since they are longer keywords
        if (
          textLower.includes('plumbing social pro') ||
          textLower.includes('hvac social pro') ||
          textLower.includes('roofing social pro') ||
          textLower.includes('remodeling social pro')
        ) {
          nextPersonaId = 'video_social_pro';
          setDetectedPersonaId('video_social_pro');
          justDetected = true;
        } else if (
          textLower.includes('plumbing videos') ||
          textLower.includes('hvac videos') ||
          textLower.includes('roofing videos') ||
          textLower.includes('remodeling videos')
        ) {
          nextPersonaId = 'video_standard';
          setDetectedPersonaId('video_standard');
          justDetected = true;
        } else if (textLower.includes('solar')) {
          nextPersonaId = 'solar';
          setDetectedPersonaId('solar');
          justDetected = true;
        } else if (textLower.includes('social pro')) {
          nextPersonaId = 'video_social_pro';
          setDetectedPersonaId('video_social_pro');
          justDetected = true;
        } else if (textLower.includes('video') || textLower.includes('videos') || textLower.includes('social media')) {
          nextPersonaId = 'video_standard';
          setDetectedPersonaId('video_standard');
          justDetected = true;
        }
      }
    } else {
      setMessages([]);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    
    setInputValue('');

    if (justDetected) {
      // Temporarily halt speech recognition
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);

      // Play positive confirmation chime
      SoundEffects.playConfirm();

      // Initiate telephone ringing sequence
      setIsRinging(true);
      let name = 'the business owner';
      if (nextPersonaId === 'solar') {
        name = 'Mike from Rocket Solar';
      } else if (nextPersonaId === 'video_standard') {
        name = 'Rick (Contractor)';
      } else if (nextPersonaId === 'video_social_pro') {
        name = 'Rick (Social Pro Contractor)';
      }
      setDialingPersonaName(name);

      // Start Dual-frequency telephone ringing
      if (stopRingRef.current) {
        stopRingRef.current();
      }
      const stopRing = SoundEffects.startRingRing();
      stopRingRef.current = stopRing;

      // Start fetching immediately, and let proceedToChatApi handle the pickup timing!
      proceedToChatApi(message, nextPersonaId, reset, true);
      return;
    }

    await proceedToChatApi(message, nextPersonaId, reset);
  };

  const proceedToChatApi = async (message: string, nextPersonaId: any, reset: boolean, isInitialTrigger: boolean = false) => {
    setIsLoading(true);
    const activeSessionId = reset ? null : sessionId;
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          sessionId: activeSessionId, 
          reset,
          selectedPersona: nextPersonaId
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelMessageId = (Date.now() + 1).toString();
      let isFirstChunk = true;
      let fullResponseText = '';

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('event: session')) continue;
          if (line.startsWith('event: done')) break;
          
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.sessionId) setSessionId(data.sessionId);
              if (data.text) {
                const isNew = isFirstChunk;
                isFirstChunk = false;
                fullResponseText += data.text;
                setMessages((prev) => {
                  if (isNew) {
                    return [...prev, { id: modelMessageId, role: 'model', content: data.text }];
                  } else {
                    return prev.map(msg => 
                      msg.id === modelMessageId ? { ...msg, content: msg.content + data.text } : msg
                    );
                  }
                });
              }
            } catch (err) {
              console.error("JSON parse error:", err, "for string:", dataStr);
            }
          }
        }
      }

      // If it's an initial trigger (connecting the call), we wait until the minimum ring duration (1200ms) has elapsed.
      if (isInitialTrigger) {
        const elapsed = Date.now() - startTime;
        const remainingRingTime = 1200 - elapsed;
        if (remainingRingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingRingTime));
        }
        
        // Stop ringing sound and play pickup
        if (stopRingRef.current) {
          stopRingRef.current();
          stopRingRef.current = null;
        }
        setIsRinging(false);
        SoundEffects.playPickup();
      }
      
      // Check if response concludes roleplay dynamically
      const containsConcluded = fullResponseText.includes('CONCLUDED') || 
                                fullResponseText.includes('EVALUATING') || 
                                fullResponseText.includes('Report Card') || 
                                fullResponseText.includes('REPORT CARD') ||
                                fullResponseText.includes('Performance Assessment') ||
                                fullResponseText.includes('SCREENING VERDICT');
                                
      if (containsConcluded) {
        setIsEvaluating(true);
        recognitionRef.current?.stop();
        setIsListening(false);
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      } else {
        // Auto-speak on AI Response
        if (fullResponseText.trim().length > 0 && !isEvaluating) {
          speakText(fullResponseText);
        }
      }
      
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Make sure we stop ringing on error too!
      if (isInitialTrigger) {
        if (stopRingRef.current) {
          stopRingRef.current();
          stopRingRef.current = null;
        }
        setIsRinging(false);
      }
      
      let errorMsg = "An error occurred. Please try again.";
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
         errorMsg = "AI Rate limit exceeded (Too many requests). Please wait for a few moments and try again.";
      } else if (error?.message) {
         errorMsg = error.message;
      }
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', content: errorMsg }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // UI State calculations
  let indicatorColor = 'bg-slate-50 text-slate-400 border-slate-200';
  let pulseClass = '';
  let Icon = Mic;
  let statusText = 'Ready to Call';

  if (isListening) {
    indicatorColor = 'bg-green-100 text-green-600 border-green-200';
    pulseClass = 'shadow-[0_0_60px_rgba(34,197,94,0.3)] animate-pulse';
    statusText = 'Listening...';
  } else if (isRinging) {
    indicatorColor = 'bg-amber-100 text-amber-700 border-amber-200';
    pulseClass = 'animate-pulse';
    Icon = Volume2;
    statusText = 'Ringing...';
  } else if (isLoading && !isSpeaking) {
    indicatorColor = 'bg-slate-100 text-slate-500 border-slate-200';
    pulseClass = 'animate-pulse';
    Icon = Loader2;
    statusText = 'Processing...';
  } else if (isSpeaking) {
    indicatorColor = 'bg-blue-100 text-blue-600 border-blue-200';
    pulseClass = 'shadow-[0_0_60px_rgba(59,130,246,0.3)] animate-pulse';
    Icon = Mic;
    statusText = 'AI Speaking...';
  }

  return (
    <div className="bg-white w-full h-screen flex overflow-hidden font-sans text-slate-900">
      {/* Left Sidebar: Call Status & Difficulty */}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col hidden lg:flex shrink-0 h-screen overflow-hidden">
        {/* Header Block / Fixed stats */}
        <div className="p-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900">Agent Dissection Deck</h1>
          </div>
          
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 label-spacing">Simulated Persona</p>
            {!isCallActive ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 font-medium leading-relaxed">
                <span className="text-slate-700 font-bold block mb-0.5">State-Switching Tracker</span>
                Waiting for the opening key-phrase.
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  {detectedPersonaId === 'pending' ? (
                    <p className="font-bold text-xs text-amber-600 animate-pulse leading-tight">Listening for phrase...</p>
                  ) : (
                    <p className="font-bold text-xs text-slate-950 leading-tight truncate">
                      {detectedPersonaId === 'solar' 
                        ? 'Mike (Solar Owner)' 
                        : detectedPersonaId === 'video_standard' 
                        ? 'Rick (Video Creation)' 
                        : 'Rick (Social Pro)'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold label-spacing">Objection Difficulty</p>
              <span className="text-[10px] font-extrabold text-slate-700">Lvl {difficulty}/5</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level} 
                  className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                    level <= difficulty 
                      ? (level > 3 ? 'bg-rose-500 animate-pulse' : 'bg-slate-900') 
                      : 'bg-slate-200'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Active Objection Guide Area */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100/30 shrink-0 text-left">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 flex items-center gap-1 label-spacing">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Active Obstable Focus
          </p>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            {detectedPersonaId === 'pending' ? (
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Start Call and speak "SOLAR" (Mike), "plumbing videos" (Rick Standard), or "plumbing social pro" (Rick Social Pro) to launch specific objection flow.
              </p>
            ) : detectedPersonaId === 'solar' ? (
              <div>
                <span className="text-[10px] font-extrabold text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md border border-rose-100 uppercase tracking-wide">
                  {difficulty <= 2 ? 'Baseline Skepticism' : difficulty === 3 ? 'Lead Quality Doubt' : difficulty === 4 ? 'Technical/NEM 3.0' : 'Authority Check'}
                </span>
                <p className="text-[11.5px] text-slate-700 font-bold leading-normal mt-1.5 break-words">
                  {difficulty <= 2 
                    ? '"Why am I paying $497 upfront if the bot books zero people? What am I paying for?"' 
                    : difficulty === 3 
                    ? '"I bought Facebook leads last year; they were all broke renters."' 
                    : difficulty === 4 
                    ? '"If a homeowner calls asking technical questions about the local utility\'s export rates under NEM 3.0, how does a basic voice bot answer that?"' 
                    : '"You guys have zero footprint online. Give me the names of two solar operators using this right now."'}
                </p>
              </div>
            ) : detectedPersonaId === 'video_standard' ? (
              <div>
                <span className="text-[10px] font-extrabold text-teal-600 px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100 uppercase tracking-wide">
                  {difficulty <= 2 ? 'Video Footages' : difficulty === 3 ? 'Cheap $20 AI App' : difficulty === 4 ? '$30k Project ROI' : 'Deliverables Risk'}
                </span>
                <p className="text-[11.5px] text-slate-700 font-bold leading-normal mt-1.5 break-words">
                  {difficulty <= 2 
                    ? '"My guys are pouring concrete, we aren\'t influencers. Where do you get the footage?"' 
                    : difficulty === 3 
                    ? '"I saw an AI app online that makes videos for $20 a month. Why give you $297?"' 
                    : difficulty === 4 
                    ? '"I do $30,000 kitchen remodels for 55-year-olds who read Yelp. How does an Instagram Reel turn into a signed contract?"' 
                    : '"If I get zero calls in 30 days and hit cancel, prove to me I\'m not just out three hundred bucks for some raw files."'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-extrabold text-sky-600 px-2 py-0.5 bg-sky-50 rounded-md border border-sky-100 uppercase tracking-wide">
                  {difficulty <= 2 ? 'Footage Obstacle' : difficulty === 3 ? 'AI App Competitor' : difficulty === 4 ? 'High-Ticket ROI' : 'Refund Dependency'}
                </span>
                <p className="text-[11.5px] text-slate-700 font-bold leading-normal mt-1.5 break-words">
                  {difficulty <= 2 
                    ? '"My guys are pouring concrete, we aren\'t influencers. Where do you get the footage?"' 
                    : difficulty === 3 
                    ? '"I saw an AI app online that makes videos for $20 a month. Why give you $497?"' 
                    : difficulty === 4 
                    ? '"I do $30,000 kitchen remodels for 55-year-olds who read Yelp. How does an Instagram Reel turn into a signed contract?"' 
                    : '"You say \'cancel anytime\', but it takes 45 days just to get a batch of videos approved. If I cancel, prove to me I\'m not out $500."'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Conversation Chat Transcript Widget */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col min-h-0 bg-slate-50">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5 label-spacing">
              <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'bg-green-500 animate-ping' : 'bg-slate-400'}`}></span>
              Live Transcript Widget
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{messages.length} Turns</span>
          </div>

          <div 
            ref={sidebarChatContainerRef}
            className="flex-1 bg-slate-105 border border-slate-220 rounded-xl p-3 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar text-xs"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            {messages.length === 0 ? (
              <div className="m-auto text-center text-slate-400 py-6 px-4">
                <p className="font-semibold mb-1 text-slate-500">Awaiting Dialogue</p>
                <p className="text-[10.5px] leading-normal text-slate-450">
                  The raw script lines between the sales agent and target persona stream here in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                const speakerLabel = isUser 
                  ? 'You (Agent)' 
                  : (detectedPersonaId === 'solar' ? 'Mike (Solar)' : 'Rick (Contractor)');
                
                const isAssessmentMsg = msg.content.includes('Grading Report') || msg.content.includes('EVALUATING') || msg.content.includes('CONCLUDED') || msg.content.includes('REPORT CARD') || msg.content.includes('Performance Assessment') || msg.content.includes('SCREENING VERDICT');
                const cleanContent = isAssessmentMsg ? "📊 [Generating Final Call Evaluation Report Card...]" : msg.content;

                return (
                  <div key={msg.id} className="text-left flex flex-col">
                    <span className={`font-extrabold text-[9px] uppercase tracking-wider mb-0.5 ${isUser ? 'text-slate-500' : 'text-blue-600'}`}>
                      {speakerLabel}
                    </span>
                    <div className={`p-2 rounded-lg border leading-relaxed break-words whitespace-pre-wrap ${
                      isUser 
                        ? 'bg-white border-slate-200 text-slate-800' 
                        : 'bg-blue-50/70 border-blue-100 text-blue-900 font-medium'
                    }`}>
                      {cleanContent}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Main Content: Voice Dashboard */}
      <main className="flex-1 flex flex-col relative bg-white h-full overflow-hidden">
        
        {/* Sticky/Floating Restart Button directly on the page (No separate header bar) */}
        {(isCallActive || isEvaluating) && (
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 flex items-center gap-2.5">
            {/* Small status indicator for mobile */}
            <div className="flex lg:hidden items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs font-bold text-slate-800">{persona}</span>
            </div>
            
            <button
              onClick={handleRestart}
              className="bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-extrabold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Restart
            </button>
          </div>
        )}

        {/* Dashboard Center */}
        <section className={`flex-1 flex flex-col p-6 sm:p-8 relative overflow-y-auto custom-scrollbar ${!isCallActive ? 'justify-start lg:justify-center items-center' : 'justify-center items-center'}`}>
           {!isCallActive ? (
             <div className="max-w-4xl w-full flex flex-col items-center">
               <div className="text-center mb-8">
                 <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 animate-pulse">
                   <Bot className="w-4 h-4 text-emerald-600" /> State-Switching Engine Active
                 </div>
                 <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                   Dynamic Sales Agent Simulator
                 </h2>
                 <p className="mt-2.5 max-w-2xl text-sm text-slate-500 mx-auto leading-relaxed">
                   Once the call begins, introduce your service naturally. The simulator parses your opening line to automatically adopt the persona:
                 </p>
               </div>

               {/* Triple Grid Config Display */}
                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-8">
                                 {/* Solar Owner Config Cards */}
                                 <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col">
                                   <div>
                                     <div className="flex justify-between items-start mb-4">
                                       <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full tracking-wider inline-block">
                                         Trigger: "solar"
                                       </span>
                                     </div>
                                     <h3 className="text-xl font-bold text-slate-900">Persona 1: Mike</h3>
                                     <p className="text-xs text-slate-500 font-semibold mb-3">Solar Company Owner / Operator</p>
                                     
                                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                                       <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                                       <p className="text-slate-900 font-bold">"Solar Engine" Booking Bot</p>
                                       <p className="text-slate-600 font-medium">$497/mo fee + $100 per booked qualified appt</p>
                                     </div>
                                     
                                     <p className="text-sm text-slate-600 leading-relaxed font-sans">
                                       Highly skeptical business owner who despises agency buzzwords. Tired of junk leads (renters, FICO under 650). Concerned about reputation and how the AI voice agent handles technical local guidelines like NEM 3.0 net metering.
                                     </p>
                                   </div>
                                 </div>
               
                                 {/* Standard Video Config */}
                                 <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col">
                                   <div>
                                     <div className="flex flex-col gap-2 mb-4">
                                       <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-100 rounded-full tracking-wider inline-block self-start">
                                         Triggers: "plumbing videos", "hvac videos", "roofing videos", "remodeling videos"
                                       </span>
                                     </div>
                                     <h3 className="text-xl font-bold text-slate-900">Persona 2: Rick (Standard)</h3>
                                     <p className="text-xs text-slate-500 font-semibold mb-3">General Trade Contractor</p>
                                     
                                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                                       <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                                       <p className="text-slate-900 font-bold">Pure Video Content Creation</p>
                                       <p className="text-slate-600 font-medium">$297/mo fee (raw edited shorts)</p>
                                     </div>
                                     
                                     <p className="text-sm text-slate-600 leading-relaxed font-sans">
                                       Extremely busy concrete contractor. Rick hates the thought of dancing on camera or acting like an influencer, or paying hundreds for generic corporate stock footage that local high-ticket buyers laugh at.
                                     </p>
                                   </div>
                                 </div>
               
                                 {/* Social Pro Video Config */}
                                 <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col">
                                   <div>
                                     <div className="flex flex-col gap-2 mb-4">
                                       <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-full tracking-wider inline-block self-start">
                                         Triggers: "plumbing social pro", "hvac social pro", "roofing social pro", "remodeling social pro"
                                       </span>
                                     </div>
                                     <h3 className="text-xl font-bold text-slate-900">Persona 3: Rick (Social Pro)</h3>
                                     <p className="text-xs text-slate-500 font-semibold mb-3">General Trade Contractor</p>
                                     
                                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                                       <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                                       <p className="text-slate-900 font-bold">"Social Pro" Video + Full Posting</p>
                                       <p className="text-slate-600 font-medium">$497/mo fee (cancel anytime)</p>
                                     </div>
                                     
                                     <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                       4 long videos + 4 short clips posted 2x/week across IG, FB, and X with local hashtags. Rick fears zero trackable financial ROI, contracts, or losing his authentic voice.
                                     </p>
                                   </div>
                                 </div>
                               </div>
               {/* Center Call to Action */}
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-auto shadow-sm">
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                     <Volume2 className="w-5 h-5 text-white" />
                   </div>
                   <div className="text-left">
                     <h4 className="font-extrabold text-sm text-slate-900">Dynamic State-Switching Simulator</h4>
                     <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-0.5 font-sans font-medium">
                       Click <strong className="text-slate-800">Call Now</strong> to start. Your opening spoken words determines if you talk to Mike (Solar) or Rick (Video).
                     </p>
                   </div>
                 </div>
                 <button
                   onClick={startCall}
                   className="px-8 py-3 bg-slate-900 border border-transparent text-white hover:bg-slate-800 rounded-xl text-sm font-extrabold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer block text-center shrink-0"
                 >
                   Call Now
                 </button>
               </div>
             </div>
           ) : isEvaluating ? (
             /* Beautiful complete Scorecard evaluation display when state isEvaluating is true */
             <div className="max-w-3xl w-full mx-auto p-2 sm:p-4 flex flex-col h-full justify-start pointer-events-auto">
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                 <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-200/60">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                     <BarChart2 className="w-6 h-6 text-slate-100" />
                   </div>
                   <div>
                     <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">Grading Assessment</span>
                     <h3 className="text-xl font-extrabold text-slate-900 leading-tight">Sales Call Evaluation Report</h3>
                   </div>
                 </div>

                 {isLoading && messages.filter(isEvaluationMessage).length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                     <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-sm font-bold text-slate-700 animate-pulse">Analyzing call transcript and grading performance...</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {/* Filter messages to display only the report/concluded messages */}
                     {messages.filter(isEvaluationMessage).map((msg) => (
                       <div key={msg.id} className="text-left text-slate-800">
                         <div className="text-base font-medium leading-relaxed text-slate-800 [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>li]:mb-1.5 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>h4]:font-bold [&>strong]:text-slate-900">
                           <ReactMarkdown>{extractReportCard(msg.content)}</ReactMarkdown>
                         </div>
                       </div>
                     ))}

                     {/* Fallback if the specific CONCLUDED marker is missing but we have model replies during evaluation */}
                     {messages.filter(isEvaluationMessage).length === 0 && (
                       <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                         {[{ id: 'awaiting-report', role: 'model', content: '### 📊 Compiling Performance Scorecard...\n\nAnalyzing conversation logs and grading metrics. If the scorecard does not load shortly, please click Reset Simulation above.' }].map((msg) => (
                           <div key={msg.id} className="text-left text-slate-800 bg-white p-5 rounded-xl border border-slate-100 shadow-sm leading-relaxed text-slate-850 [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>li]:mb-1.5 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>h4]:font-bold [&>strong]:text-slate-900 font-sans">
                             <ReactMarkdown>{extractReportCard(msg.content)}</ReactMarkdown>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}

                 <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col gap-4">
                  {/* Integrated Save & Export Controls inside the Evaluation Card */}
                  {messages.length > 0 && (
                    <div className="mt-6 mb-2 p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Export Call Credentials
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 pb-1 font-medium leading-relaxed font-sans">
                          Archiving conversation turns and raw feedback metrics as formatted documents (Markdown / PDF).
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
                        <button
                          onClick={handleSaveTranscript}
                          className={`text-xs font-extrabold py-2 px-4 border rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                            isTranscriptSaved 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
                          }`}
                        >
                          {isTranscriptSaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save Session</>}
                        </button>
                        
                        {isTranscriptSaved && (
                          <div className="flex items-center gap-1.5 animate-slide-in">
                            <button
                              onClick={downloadMarkdown}
                              className="text-xs font-bold py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              title="Download Markdown Report"
                            >
                              <FileText className="w-3.5 h-3.5" /> MD
                            </button>
                            <button
                              onClick={downloadHTMLPDF}
                              className="text-xs font-bold py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              title="Download Printable PDF Report"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                   <div className="text-xs text-slate-500 font-medium">To test again or pitch a different client, reset your simulation.</div>
                   <button
                     onClick={handleRestart}
                     className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
                   >
                     <RotateCcw className="w-4 h-4" /> Reset Simulation
                   </button>
                 </div>
               </div>
             </div>
           ) : isRinging ? (
              /* Beautiful telephone ringing interface */
              <div className="flex flex-col items-center justify-center -mt-10 mb-8 text-center animate-pulse">
                <div className="relative mb-6">
                  {/* Outer pulsing circle rings to simulate radar soundwaves */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 scale-150 animate-ping opacity-40"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-50 scale-[2] animate-ping opacity-25"></div>
                  
                  <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                    {/* Pulsing Phone icon */}
                    <svg className="w-12 h-12 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Ringing...</h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mt-1.5">{dialingPersonaName}</p>
                <p className="text-xs text-slate-450 mt-4 max-w-sm leading-relaxed">
                  Connecting your line. The business owner will pick up the call shortly...
                </p>
                <div className="hidden" aria-hidden="true">
                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              /* Core Live Subtitles display (Ring + Messages) */
             <>
               {/* Center Visual Indicator */}
               <div className="flex flex-col items-center justify-center -mt-10 mb-8">
                  <div className="relative mb-6">
                     {/* Decorative rings */}
                     <div className={`absolute inset-0 rounded-full border-2 border-slate-100 scale-150 opacity-50`}></div>
                     <div className={`absolute inset-0 rounded-full border border-slate-100 scale-[2] opacity-30`}></div>
                     
                     <div className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${indicatorColor} ${pulseClass}`}>
                        <Icon className={`w-10 h-10 ${isLoading && !isListening && !isSpeaking ? 'animate-spin' : ''}`} />
                     </div>
                  </div>
                  <h2 className={`text-lg font-bold tracking-tight transition-colors ${isListening ? 'text-green-600' : isSpeaking ? 'text-blue-600' : 'text-slate-400'}`}>
                     {statusText}
                  </h2>
               </div>

               {/* Subtitles Area completely cleaned per user instruction */}
               <div className="hidden" aria-hidden="true">
                 <div ref={messagesEndRef} />
               </div>
             </>
           )}
        </section>

        {/* Action Controls */}
        {isCallActive && !isEvaluating && (
          <footer className="p-8 pb-10 bg-white border-t border-slate-100 flex flex-row items-center justify-center gap-4 shrink-0 w-full">
              <button
                 onClick={toggleListen}
                 disabled={isLoading && !isSpeaking}
                 className={`h-16 px-10 rounded-full flex items-center justify-center gap-4 text-base font-extrabold shadow-lg transition-all border shrink-0 cursor-pointer ${
                   isListening
                     ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600' 
                     : 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500 hover:scale-105'
                 } disabled:opacity-50 disabled:hover:scale-100`}
              >
                 {isListening ? (
                   <>
                     <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                     Stop Talk
                   </>
                 ) : (
                   <>
                     <Mic className="w-6 h-6" />
                     Talk
                   </>
                 )}
              </button>
               {/* Evaluate Call Button (Red, placed beside the Talk button) */}
               <button
                 onClick={() => {
                   setIsEvaluating(true);
                   recognitionRef.current?.stop();
                   setIsListening(false);
                   window.speechSynthesis?.cancel();
                   setIsSpeaking(false);
                   sendMessage("The call has ended. Please provide the graded candidate performance assessment now.", false);
                 }}
                 className="h-16 px-10 rounded-full bg-red-600 border border-transparent text-white hover:bg-red-500 hover:scale-105 active:scale-95 text-base font-extrabold shadow-lg transition-all flex items-center justify-center gap-4 shrink-0 cursor-pointer"
               >
                 <PhoneOff className="w-5 h-5" />
                 Evaluate Call
               </button>
          </footer>
        )}
      </main>
    </div>
  );
}

