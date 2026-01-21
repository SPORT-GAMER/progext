import { DollarSign, Users, TrendingUp, Target, Zap, Radio } from 'lucide-react';
import { GameState } from '../types/game';

interface ResourcePanelProps {
  gameState: GameState;
}

export default function ResourcePanel({ gameState }: ResourcePanelProps) {
  const resources = [
    {
      icon: DollarSign,
      label: 'الخزينة',
      value: `${gameState.treasury.toFixed(1)}B`,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    },
    {
      icon: Users,
      label: 'القوى العاملة',
      value: (gameState.manpower / 1000).toFixed(0) + 'K',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: TrendingUp,
      label: 'الاستقرار',
      value: `${gameState.stability}%`,
      color: gameState.stability > 70 ? 'text-green-400' : gameState.stability > 40 ? 'text-yellow-400' : 'text-red-400',
      bgColor: gameState.stability > 70 ? 'bg-green-900/20' : gameState.stability > 40 ? 'bg-yellow-900/20' : 'bg-red-900/20',
      borderColor: gameState.stability > 70 ? 'border-green-500/30' : gameState.stability > 40 ? 'border-yellow-500/30' : 'border-red-500/30'
    },
    {
      icon: Target,
      label: 'النقاط التكتيكية',
      value: gameState.tactical_points.toString(),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      icon: Zap,
      label: 'مستوى المخابرات',
      value: `L${gameState.intelligence_level}`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: Radio,
      label: 'البرنامج النووي',
      value: gameState.nuclear_warheads > 0 ? `${gameState.nuclear_warheads} رؤوس` : `المرحلة ${gameState.nuclear_program_stage}`,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" dir="rtl">
      {resources.map((resource, index) => {
        const Icon = resource.icon;
        return (
          <div
            key={index}
            className={`${resource.bgColor} ${resource.borderColor} border-2 rounded-lg p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${resource.color}`} />
            </div>
            <div className={`text-2xl font-bold ${resource.color} mb-1`}>
              {resource.value}
            </div>
            <div className="text-xs text-gray-400">
              {resource.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
