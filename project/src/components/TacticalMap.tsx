import { useEffect, useRef } from 'react';
import { MapPin, Crosshair, AlertCircle } from 'lucide-react';
import { GameState } from '../types/game';
import { AIAnalysis } from '../lib/aiCommandProcessor';

interface TacticalMapProps {
  gameState: GameState;
  aiAnalysis?: AIAnalysis | null;
}

export default function TacticalMap({ gameState, aiAnalysis }: TacticalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 0.5;

    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.country_code, centerX, centerY + 50);

    ctx.shadowBlur = 0;

    if (gameState.at_war && gameState.war_target) {
      const targetX = centerX + 200;
      const targetY = centerY - 100;

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('HOSTILE', targetX, targetY + 40);
    }

    if (aiAnalysis?.targetLocation) {
      const aiX = (aiAnalysis.targetLocation.x / 100) * canvas.width;
      const aiY = (aiAnalysis.targetLocation.y / 100) * canvas.height;

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffff00';
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(aiX, aiY, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 9px Arial';
      ctx.fillText('AI TARGET', aiX, aiY + 35);
    }

    const pulseRadius = 40 + Math.sin(Date.now() / 500) * 5;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

  }, [gameState, aiAnalysis]);

  return (
    <div className="bg-gray-900/80 border-2 border-cyan-500/40 rounded-lg overflow-hidden backdrop-blur-sm" dir="rtl">
      <div className="bg-gradient-to-r from-cyan-900/50 to-gray-900/50 px-6 py-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-cyan-400">المسرح التكتيكي</h2>
          {gameState.at_war && (
            <div className="mr-auto flex items-center gap-2 bg-red-900/30 px-4 py-2 rounded border border-red-500/50">
              <Crosshair className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-bold">حالة حرب</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative" style={{ height: '500px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 50, 50, 0.2), #000000)',
          }}
        />

        <div className="absolute top-4 left-4 bg-black/70 border border-cyan-500/30 rounded p-3 text-xs">
          <div className="text-cyan-400 font-bold mb-2">وضع القوات</div>
          <div className="space-y-1 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <span>القاعدة الرئيسية</span>
            </div>
            {gameState.at_war && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                <span>هدف معادي</span>
              </div>
            )}
            {aiAnalysis && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                <span>هدف AI</span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/70 border border-cyan-500/30 rounded p-3 text-xs max-w-xs">
          <div className="text-cyan-400 font-bold mb-2">معلومات تكتيكية</div>
          <div className="space-y-1 text-gray-300">
            <div>الإحداثيات: 35.0°N 44.0°E</div>
            <div>التوقيت: {new Date().toLocaleTimeString('ar-SA')}</div>
            <div>الحالة: {gameState.at_war ? 'قتالية' : 'استعداد'}</div>
            {aiAnalysis && (
              <>
                <div className="border-t border-cyan-500/30 mt-2 pt-2">
                  <div className="text-yellow-400 font-bold text-xs mb-1">تحليل AI النشط</div>
                  <div className="text-xs text-yellow-100">
                    <div>النوع: {aiAnalysis.commandType}</div>
                    <div>القيمة: {aiAnalysis.strategicValue}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
