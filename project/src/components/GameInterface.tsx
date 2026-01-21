import { useState, useEffect } from 'react';
import { Shield, Calendar, AlertTriangle } from 'lucide-react';
import { GameState, CommandLog, Difficulty } from '../types/game';
import { supabase } from '../lib/supabase';
import { parseCommand } from '../lib/commandParser';
import { AIAnalysis } from '../lib/aiCommandProcessor';
import ResourcePanel from './ResourcePanel';
import CommandCenter from './CommandCenter';
import TacticalMap from './TacticalMap';

interface GameInterfaceProps {
  initialCountry: string;
  difficulty: Difficulty;
  year: number;
  onExit: () => void;
}

export default function GameInterface({ initialCountry, difficulty, year, onExit }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAIAnalysis, setLastAIAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      generateTacticalPoints();
    }, 60000);

    return () => clearInterval(interval);
  }, [gameState]);

  const initializeGame = async () => {
    try {
      const { data: country } = await supabase
        .from('countries')
        .select('*')
        .eq('code', initialCountry)
        .maybeSingle();

      if (!country) {
        console.error('Country not found');
        return;
      }

      const baseTreasury = year < 1990
        ? country.base_treasury_1980
        : year < 2010
        ? country.base_treasury_2000
        : country.base_treasury_2020;

      const difficultyModifiers = {
        'STABLE': { treasury: 1.0, manpower: 1.0, stability: 1.0 },
        'UNSTABLE': { treasury: 0.7, manpower: 0.8, stability: 0.6 },
        'CIVIL WAR': { treasury: 0.4, manpower: 0.5, stability: 0.3 },
        'WORLD AT WAR': { treasury: 0.5, manpower: 1.5, stability: 0.4 }
      };

      const mods = difficultyModifiers[difficulty];

      const { data: newGame, error } = await supabase
        .from('game_states')
        .insert({
          country_code: country.code,
          country_name: country.name_ar,
          difficulty,
          year,
          treasury: baseTreasury * mods.treasury,
          manpower: country.base_manpower * mods.manpower,
          stability: country.base_stability * mods.stability,
          tactical_points: 100,
          intelligence_level: 1,
          nuclear_program_stage: 0,
          nuclear_warheads: 0,
          at_war: difficulty === 'WORLD AT WAR'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game:', error);
        return;
      }

      setGameState(newGame);

      await supabase.from('command_logs').insert({
        game_id: newGame.id,
        command_text: 'بدء المهمة',
        command_type: 'SYSTEM',
        ai_response: `🎖️ مرحباً بك يا سيادة القائد\n\nتم تفعيل النظام العسكري المتقدم للنواة السيادية\n\n📋 معلومات الدولة:\n- الدولة: ${country.name_ar}\n- الصعوبة: ${difficulty}\n- السنة: ${year}\n- الخزينة: ${(baseTreasury * mods.treasury).toFixed(1)}B دولار\n- القوى العاملة: ${Math.floor(country.base_manpower * mods.manpower).toLocaleString()} جندي\n- الاستقرار: ${Math.floor(country.base_stability * mods.stability)}%\n\n⚡ النظام جاهز لتلقي الأوامر\n🎯 في انتظار تعليماتك العسكرية`,
        effects: {}
      });

      loadCommandLogs(newGame.id);
    } catch (error) {
      console.error('Game initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommandLogs = async (gameId: string) => {
    const { data } = await supabase
      .from('command_logs')
      .select('*')
      .eq('game_id', gameId)
      .order('timestamp', { ascending: true });

    if (data) {
      setCommandLogs(data);
    }
  };

  const generateTacticalPoints = async () => {
    if (!gameState) return;

    const tpGain = 5 * gameState.intelligence_level;
    const newTP = gameState.tactical_points + tpGain;

    const { data: updated } = await supabase
      .from('game_states')
      .update({
        tactical_points: newTP,
        last_tp_generation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', gameState.id)
      .select()
      .single();

    if (updated) {
      setGameState(updated);
    }
  };

  const handleCommand = async (command: string) => {
    if (!gameState) return;

    const result = parseCommand(command, gameState);

    const updates: Partial<GameState> = {
      updated_at: new Date().toISOString()
    };

    if (result.effects.treasury !== undefined) {
      updates.treasury = Math.max(0, gameState.treasury + result.effects.treasury);
    }
    if (result.effects.manpower !== undefined) {
      updates.manpower = Math.max(0, gameState.manpower + result.effects.manpower);
    }
    if (result.effects.stability !== undefined) {
      updates.stability = Math.max(0, Math.min(100, gameState.stability + result.effects.stability));
    }
    if (result.effects.tactical_points !== undefined) {
      updates.tactical_points = Math.max(0, gameState.tactical_points + result.effects.tactical_points);
    }
    if (result.effects.intelligence_level !== undefined) {
      updates.intelligence_level = gameState.intelligence_level + result.effects.intelligence_level;
    }
    if (result.effects.nuclear_program_stage !== undefined) {
      updates.nuclear_program_stage = Math.min(5, gameState.nuclear_program_stage + result.effects.nuclear_program_stage);
    }
    if (result.effects.nuclear_warheads !== undefined) {
      updates.nuclear_warheads = gameState.nuclear_warheads + result.effects.nuclear_warheads;
    }
    if (result.effects.at_war !== undefined) {
      updates.at_war = result.effects.at_war;
    }
    if (result.effects.war_target !== undefined) {
      updates.war_target = result.effects.war_target;
    }

    const { data: updated } = await supabase
      .from('game_states')
      .update(updates)
      .eq('id', gameState.id)
      .select()
      .single();

    if (updated) {
      setGameState(updated);
    }

    await supabase.from('command_logs').insert({
      game_id: gameState.id,
      command_text: command,
      command_type: result.success ? 'EXECUTED' : 'FAILED',
      ai_response: result.message,
      effects: result.effects
    });

    loadCommandLogs(gameState.id);
  };

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">تهيئة النظام العسكري...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/10 via-black to-black"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
      }}></div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 border-b-2 border-cyan-500/40 px-8 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
                  النواة السيادية
                </h1>
                <div className="text-sm text-gray-400">{gameState.country_name}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded border border-cyan-500/30">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span className="text-xl font-bold text-cyan-400">{gameState.year}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded border ${
                gameState.difficulty === 'STABLE' ? 'bg-green-900/30 border-green-500/50' :
                gameState.difficulty === 'UNSTABLE' ? 'bg-yellow-900/30 border-yellow-500/50' :
                gameState.difficulty === 'CIVIL WAR' ? 'bg-orange-900/30 border-orange-500/50' :
                'bg-red-900/30 border-red-500/50'
              }`}>
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">{gameState.difficulty}</span>
              </div>
              <button
                onClick={onExit}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-500/50 rounded transition-all"
              >
                خروج
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-8 py-6 space-y-6">
          <ResourcePanel gameState={gameState} />

          <div className="grid lg:grid-cols-2 gap-6">
            <TacticalMap gameState={gameState} aiAnalysis={lastAIAnalysis} />
            <CommandCenter
              gameState={gameState}
              onCommand={handleCommand}
              commandLogs={commandLogs}
              onAIAnalysis={setLastAIAnalysis}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
