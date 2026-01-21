import { useState, useEffect, useRef } from 'react';
import { Send, Radio, Activity } from 'lucide-react';
import { GameState, CommandLog } from '../types/game';

interface CommandCenterProps {
  gameState: GameState;
  onCommand: (command: string) => Promise<void>;
  commandLogs: CommandLog[];
}

export default function CommandCenter({ gameState, onCommand, commandLogs }: CommandCenterProps) {
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandLogs]);

  const handleSend = async () => {
    if (!commandInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      await onCommand(commandInput.trim());
      setCommandInput('');
    } catch (error) {
      console.error('Command error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-900/80 border-2 border-cyan-500/40 rounded-lg overflow-hidden backdrop-blur-sm" dir="rtl">
      <div className="bg-gradient-to-r from-cyan-900/50 to-gray-900/50 px-6 py-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h2 className="text-xl font-bold text-cyan-400">مركز القيادة والسيطرة</h2>
          <Activity className="w-5 h-5 text-green-400 animate-pulse ml-auto" />
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-black/40" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
      }}>
        {commandLogs.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-sm">في انتظار الأوامر...</div>
            <div className="text-xs mt-2">جاهز لتلقي التعليمات العسكرية</div>
          </div>
        )}

        {commandLogs.map((log) => (
          <div key={log.id} className="space-y-2 animate-fade-in">
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
              <div className="text-xs text-cyan-400 mb-1">{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</div>
              <div className="text-white font-bold">{log.command_text}</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3 mr-6">
              <div className="text-xs text-green-400 mb-1">رد القيادة</div>
              <div className="text-green-100 text-sm leading-relaxed whitespace-pre-wrap">{log.ai_response}</div>
            </div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="p-4 bg-gray-900/60 border-t border-cyan-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            placeholder="أدخل الأمر العسكري..."
            className="flex-1 bg-black/50 border border-cyan-500/50 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={!commandInput.trim() || isProcessing}
            className="bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-600 px-8 rounded font-bold transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>معالجة...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>إرسال</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
