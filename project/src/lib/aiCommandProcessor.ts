import { GameState } from '../types/game';

export interface AIAnalysis {
  intent: string;
  confidence: number;
  commandType: string;
  targetLocation?: { x: number; y: number };
  economicImpact: {
    treasury: number;
    manpower: number;
    stability: number;
  };
  militaryImpact: {
    tactical_points: number;
    combat_effectiveness: number;
  };
  strategicValue: string;
  warnings: string[];
}

export async function analyzeCommandWithAI(
  command: string,
  gameState: GameState
): Promise<AIAnalysis> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-command-analyzer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          command,
          gameState,
          language: 'ar',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackAnalysis(command, gameState);
  }
}

function getFallbackAnalysis(command: string, gameState: GameState): AIAnalysis {
  const cmdLower = command.toLowerCase();

  let commandType = 'unknown';
  let economicImpact = { treasury: 0, manpower: 0, stability: 0 };
  let militaryImpact = { tactical_points: 0, combat_effectiveness: 0 };

  if (cmdLower.includes('ميزانية') && cmdLower.includes('جيش')) {
    commandType = 'military_budget';
    economicImpact = { treasury: -20, manpower: 50000, stability: 5 };
    militaryImpact = { tactical_points: 10, combat_effectiveness: 15 };
  } else if (cmdLower.includes('تأميم') && cmdLower.includes('نفط')) {
    commandType = 'nationalize';
    economicImpact = { treasury: 50, manpower: 0, stability: -10 };
  } else if (cmdLower.includes('تجنيد') || cmdLower.includes('تعبئة')) {
    commandType = 'recruitment';
    economicImpact = { treasury: -5, manpower: 100000, stability: -3 };
  } else if (cmdLower.includes('مخابرات') || cmdLower.includes('استخبارات')) {
    commandType = 'intelligence';
    economicImpact = { treasury: -30, manpower: 0, stability: 0 };
    militaryImpact = { tactical_points: 20, combat_effectiveness: 10 };
  } else if (cmdLower.includes('نووي') || cmdLower.includes('ذري')) {
    commandType = 'nuclear';
    economicImpact = { treasury: -80, manpower: 0, stability: -5 };
    militaryImpact = { tactical_points: 50, combat_effectiveness: 30 };
  } else if (cmdLower.includes('حرب') || cmdLower.includes('غزو') || cmdLower.includes('هجوم')) {
    commandType = 'warfare';
    economicImpact = { treasury: 0, manpower: 0, stability: -15 };
    militaryImpact = { tactical_points: -50, combat_effectiveness: 40 };
  } else if (cmdLower.includes('سلام') || cmdLower.includes('هدنة')) {
    commandType = 'peace';
    economicImpact = { treasury: 0, manpower: 0, stability: 10 };
  } else if (cmdLower.includes('إصلاح') || cmdLower.includes('تطوير')) {
    commandType = 'reform';
    economicImpact = { treasury: -15, manpower: 0, stability: 20 };
  } else if (cmdLower.includes('دبابة') || cmdLower.includes('دبابات')) {
    commandType = 'tanks';
    economicImpact = { treasury: -10, manpower: 0, stability: 0 };
    militaryImpact = { tactical_points: 5, combat_effectiveness: 12 };
  } else if (cmdLower.includes('طائرة') || cmdLower.includes('طائرات') || cmdLower.includes('مقاتلة')) {
    commandType = 'aircraft';
    economicImpact = { treasury: -25, manpower: 0, stability: 0 };
    militaryImpact = { tactical_points: 8, combat_effectiveness: 20 };
  }

  return {
    intent: extractIntent(command),
    confidence: 0.85,
    commandType,
    targetLocation: generateTargetLocation(),
    economicImpact,
    militaryImpact,
    strategicValue: calculateStrategicValue(commandType),
    warnings: generateWarnings(commandType, gameState),
  };
}

function extractIntent(command: string): string {
  if (command.includes('حرب') || command.includes('غزو')) return 'offensive';
  if (command.includes('سلام') || command.includes('هدنة')) return 'defensive';
  if (command.includes('تطوير') || command.includes('إصلاح')) return 'development';
  if (command.includes('نووي')) return 'nuclear_development';
  return 'general_operations';
}

function generateTargetLocation(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  };
}

function calculateStrategicValue(commandType: string): string {
  const values: Record<string, string> = {
    warfare: 'عالي جداً - تحقيق أهداف عسكرية استراتيجية',
    nuclear: 'حرج - تغيير في توازن القوى',
    intelligence: 'عالي - الحصول على معلومات استخباراتية',
    military_budget: 'متوسط - تحسين الجاهزية القتالية',
    recruitment: 'متوسط - زيادة القوى البشرية',
    nationalize: 'متوسط - تحسين الموارد الاقتصادية',
    reform: 'متوسط - استقرار داخلي',
  };
  return values[commandType] || 'منخفض - عمليات روتينية';
}

function generateWarnings(commandType: string, gameState: GameState): string[] {
  const warnings: string[] = [];

  if (commandType === 'warfare' && gameState.stability < 30) {
    warnings.push('⚠️ الاستقرار الداخلي منخفض جداً - العملية الحربية قد تؤدي لانهيار داخلي');
  }

  if (commandType === 'nuclear' && gameState.treasury < 80) {
    warnings.push('⚠️ الموارد غير كافية للبرنامج النووي');
  }

  if (commandType === 'military_budget' && gameState.stability < 20) {
    warnings.push('⚠️ زيادة الإنفاق العسكري قد تؤثر على الاستقرار');
  }

  if (commandType === 'warfare' && !gameState.at_war) {
    warnings.push('⚠️ ستدخل الدولة في حالة حرب - الاستعداد عالي المستوى');
  }

  if (gameState.at_war && commandType === 'reform') {
    warnings.push('⚠️ الإصلاحات أثناء الحرب قد تؤثر على تركيز القوات');
  }

  return warnings;
}
