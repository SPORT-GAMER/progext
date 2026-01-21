import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  command: string;
  gameState: any;
  language: string;
}

interface AIAnalysis {
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

function analyzeArabicCommand(command: string, gameState: any): AIAnalysis {
  const cmdLower = command.toLowerCase();
  let commandType = "unknown";
  let economicImpact = { treasury: 0, manpower: 0, stability: 0 };
  let militaryImpact = { tactical_points: 0, combat_effectiveness: 0 };

  const keywordMap: Record<string, { type: string; economy: any; military: any }> = {
    "ميزانية_جيش": {
      type: "military_budget",
      economy: { treasury: -20, manpower: 50000, stability: 5 },
      military: { tactical_points: 10, combat_effectiveness: 15 },
    },
    "تأميم_نفط": {
      type: "nationalize",
      economy: { treasury: 50, manpower: 0, stability: -10 },
      military: { tactical_points: 0, combat_effectiveness: 0 },
    },
    "تجنيد": {
      type: "recruitment",
      economy: { treasury: -5, manpower: 100000, stability: -3 },
      military: { tactical_points: 5, combat_effectiveness: 8 },
    },
    "مخابرات": {
      type: "intelligence",
      economy: { treasury: -30, manpower: 0, stability: 0 },
      military: { tactical_points: 20, combat_effectiveness: 10 },
    },
    "نووي": {
      type: "nuclear",
      economy: { treasury: -80, manpower: 0, stability: -5 },
      military: { tactical_points: 50, combat_effectiveness: 30 },
    },
    "حرب": {
      type: "warfare",
      economy: { treasury: 0, manpower: 0, stability: -15 },
      military: { tactical_points: -50, combat_effectiveness: 40 },
    },
    "سلام": {
      type: "peace",
      economy: { treasury: 0, manpower: 0, stability: 10 },
      military: { tactical_points: 0, combat_effectiveness: -20 },
    },
    "إصلاح": {
      type: "reform",
      economy: { treasury: -15, manpower: 0, stability: 20 },
      military: { tactical_points: 0, combat_effectiveness: 0 },
    },
    "دبابة": {
      type: "tanks",
      economy: { treasury: -10, manpower: 0, stability: 0 },
      military: { tactical_points: 5, combat_effectiveness: 12 },
    },
    "طائرة": {
      type: "aircraft",
      economy: { treasury: -25, manpower: 0, stability: 0 },
      military: { tactical_points: 8, combat_effectiveness: 20 },
    },
  };

  for (const [keyword, config] of Object.entries(keywordMap)) {
    const keywords = keyword.split("_");
    const hasKeyword = keywords.every((k) =>
      cmdLower.includes(k.toLowerCase())
    );
    if (hasKeyword) {
      commandType = config.type;
      economicImpact = config.economy;
      militaryImpact = config.military;
      break;
    }
  }

  const warnings: string[] = [];
  if (commandType === "warfare" && gameState.stability < 30) {
    warnings.push("⚠️ الاستقرار الداخلي منخفض جداً");
  }
  if (commandType === "nuclear" && gameState.treasury < 80) {
    warnings.push("⚠️ الموارد غير كافية");
  }

  return {
    intent: extractIntent(command),
    confidence: 0.85,
    commandType,
    targetLocation: {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    },
    economicImpact,
    militaryImpact,
    strategicValue: getStrategicValue(commandType),
    warnings,
  };
}

function extractIntent(command: string): string {
  const lower = command.toLowerCase();
  if (lower.includes("حرب") || lower.includes("غزو")) return "offensive";
  if (lower.includes("سلام") || lower.includes("هدنة")) return "defensive";
  if (lower.includes("تطوير") || lower.includes("إصلاح")) return "development";
  if (lower.includes("نووي")) return "nuclear_development";
  return "general_operations";
}

function getStrategicValue(commandType: string): string {
  const values: Record<string, string> = {
    warfare: "عالي جداً",
    nuclear: "حرج",
    intelligence: "عالي",
    military_budget: "متوسط",
    recruitment: "متوسط",
    nationalize: "متوسط",
    reform: "متوسط",
  };
  return values[commandType] || "منخفض";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { command, gameState, language }: AnalysisRequest = await req.json();

    const analysis =
      language === "ar"
        ? analyzeArabicCommand(command, gameState)
        : ({
            intent: "unknown",
            confidence: 0.5,
            commandType: "unknown",
            economicImpact: { treasury: 0, manpower: 0, stability: 0 },
            militaryImpact: { tactical_points: 0, combat_effectiveness: 0 },
            strategicValue: "منخفض",
            warnings: [],
          } as AIAnalysis);

    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Analysis failed" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
