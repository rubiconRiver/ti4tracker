'use client';

import { useEffect, useRef, useState } from 'react';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
}

export default function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<Array<{ text: string; timestamp: Date }>>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart if still open
      if (isOpen && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim transcript
      setTranscript(interimTranscript);

      // Handle final transcript
      if (finalTranscript) {
        const finalText = finalTranscript.trim();

        // Check for wake word "tracker"
        if (finalText.toLowerCase().includes('tracker')) {
          const commandText = finalText.toLowerCase().replace('tracker', '').trim();

          // Add to history
          setHistory(prev => [{
            text: finalText,
            timestamp: new Date()
          }, ...prev].slice(0, 20)); // Keep last 20 commands

          // Clear transcript
          setTranscript('');

          // Trigger command callback
          if (commandText && onCommand) {
            onCommand(commandText);
          }
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen, onCommand]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setError('Failed to start listening');
      }
    }
  };

  const toggleOpen = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (!newIsOpen && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Voice recognition not supported in this browser
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        title="Voice Assistant (Cmd/Ctrl + K)"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      {/* Voice assistant panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">Voice Assistant</h3>
            <button
              onClick={toggleOpen}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={toggleListening}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
            </button>

            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <div className="mt-3 text-sm text-gray-600">
              Say <span className="font-bold text-black">&quot;tracker&quot;</span> followed by your command
            </div>
          </div>

          {/* Current transcript */}
          {transcript && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">LISTENING...</div>
              <div className="text-sm text-gray-800 italic">{transcript}</div>
            </div>
          )}

          {/* History */}
          <div className="flex-1 overflow-y-auto p-4" ref={transcriptRef}>
            <div className="text-xs text-gray-500 font-medium mb-2">COMMAND HISTORY</div>
            {history.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                No commands yet. Start listening and say &quot;tracker&quot; to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded px-3 py-2">
                    <div className="text-sm text-gray-800">{item.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
