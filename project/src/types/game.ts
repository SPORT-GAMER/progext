export interface Country {
  code: string;
  name_ar: string;
  name_en: string;
  region: string;
  base_treasury_1980: number;
  base_treasury_2000: number;
  base_treasury_2020: number;
  base_manpower: number;
  base_stability: number;
  tech_era: string;
}

export type Difficulty = 'STABLE' | 'UNSTABLE' | 'CIVIL WAR' | 'WORLD AT WAR';

export interface GameState {
  id: string;
  user_id: string;
  country_code: string;
  country_name: string;
  difficulty: Difficulty;
  year: number;
  treasury: number;
  manpower: number;
  stability: number;
  tactical_points: number;
  last_tp_generation: string;
  intelligence_level: number;
  nuclear_program_stage: number;
  nuclear_warheads: number;
  at_war: boolean;
  war_target: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilitaryUnit {
  id: string;
  game_id: string;
  unit_type: 'Army' | 'Air' | 'Navy';
  unit_class: string;
  quantity: number;
  status: 'Active' | 'Deployed' | 'Combat' | 'Destroyed';
  location: string;
  combat_readiness: number;
  deployment_timestamp?: string;
  created_at: string;
}

export interface IndustrialProject {
  id: string;
  game_id: string;
  project_type: 'Factory' | 'Research' | 'Nuclear';
  name: string;
  production_type?: string;
  output_rate: number;
  investment: number;
  status: 'Planning' | 'Construction' | 'Operational';
  started_at: string;
  completed_at?: string;
}

export interface CommandLog {
  id: string;
  game_id: string;
  timestamp: string;
  command_text: string;
  command_type?: string;
  ai_response: string;
  effects: Record<string, any>;
}
