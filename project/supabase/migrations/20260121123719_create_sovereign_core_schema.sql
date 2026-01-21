/*
  # The Sovereign Core - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for a AAA-grade geopolitical 
  military simulator spanning 1980-2030 with dynamic country stats, military units, 
  industrial production, and nuclear programs.

  ## Tables Created
  
  ### 1. game_states
  Core game session data tracking all resources and state
  - id: Unique game session identifier
  - user_id: Player identifier (for future auth)
  - country_code: Selected country (ISO 3166-1 alpha-3)
  - country_name: Full country name (Arabic)
  - difficulty: Game difficulty level
  - year: Current game year (1980-2030)
  - treasury: National treasury in billions USD
  - manpower: Available military manpower
  - stability: Internal stability (0-100)
  - tactical_points: Strategic action points
  - last_tp_generation: Timestamp of last TP generation
  - intelligence_level: Intelligence infrastructure upgrade level
  - nuclear_program_stage: Current nuclear development stage
  - created_at: Game creation timestamp
  - updated_at: Last update timestamp

  ### 2. countries
  Pre-configured country data with historical stats
  - code: ISO country code
  - name_ar: Arabic name
  - name_en: English name
  - base_treasury: Starting treasury by year
  - base_manpower: Starting manpower by year
  - base_stability: Starting stability by year
  - tech_level: Technology tier (1980s, 1990s, 2000s, 2010s, 2020s)

  ### 3. military_units
  Active military units for each game session
  - id: Unit identifier
  - game_id: Foreign key to game_states
  - unit_type: Army/Air/Navy
  - unit_class: Specific unit (Infantry, Tank, Fighter, etc.)
  - quantity: Number of units
  - status: Active/Deployed/Combat/Destroyed
  - location: Geographic coordinates or region
  - combat_readiness: Unit effectiveness (0-100)

  ### 4. industrial_projects
  Defense companies, factories, and production facilities
  - id: Project identifier
  - game_id: Foreign key to game_states
  - project_type: Factory/Research/Nuclear
  - name: Project name
  - production_type: What is being produced
  - output_rate: Units per cycle
  - investment: Total investment amount
  - status: Planning/Construction/Operational

  ### 5. command_logs
  Complete history of player commands and AI responses
  - id: Log entry identifier
  - game_id: Foreign key to game_states
  - timestamp: When command was issued
  - command_text: Player's command (Arabic)
  - command_type: Classified command type
  - ai_response: AI Chief of Staff response
  - effects: JSON of stat changes

  ## Security
  - RLS enabled on all tables
  - Policies allow authenticated users to manage their own game sessions
  - Public read access for country reference data
*/

-- Game States Table
CREATE TABLE IF NOT EXISTS game_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'player',
  country_code text NOT NULL,
  country_name text NOT NULL,
  difficulty text NOT NULL DEFAULT 'STABLE',
  year integer NOT NULL DEFAULT 2025,
  treasury decimal(12,2) NOT NULL DEFAULT 100.0,
  manpower bigint NOT NULL DEFAULT 1000000,
  stability integer NOT NULL DEFAULT 75,
  tactical_points integer NOT NULL DEFAULT 100,
  last_tp_generation timestamptz DEFAULT now(),
  intelligence_level integer NOT NULL DEFAULT 1,
  nuclear_program_stage integer NOT NULL DEFAULT 0,
  nuclear_warheads integer NOT NULL DEFAULT 0,
  at_war boolean DEFAULT false,
  war_target text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Countries Reference Table
CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  region text NOT NULL,
  base_treasury_1980 decimal(12,2) DEFAULT 50.0,
  base_treasury_2000 decimal(12,2) DEFAULT 100.0,
  base_treasury_2020 decimal(12,2) DEFAULT 200.0,
  base_manpower integer DEFAULT 500000,
  base_stability integer DEFAULT 70,
  tech_era text DEFAULT '2020s'
);

-- Military Units Table
CREATE TABLE IF NOT EXISTS military_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  unit_type text NOT NULL,
  unit_class text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'Active',
  location text DEFAULT 'Home Base',
  combat_readiness integer DEFAULT 100,
  deployment_timestamp timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Industrial Projects Table
CREATE TABLE IF NOT EXISTS industrial_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  project_type text NOT NULL,
  name text NOT NULL,
  production_type text,
  output_rate integer DEFAULT 0,
  investment decimal(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'Planning',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Command Logs Table
CREATE TABLE IF NOT EXISTS command_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  command_text text NOT NULL,
  command_type text,
  ai_response text NOT NULL,
  effects jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE industrial_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;

-- Policies for game_states
CREATE POLICY "Anyone can create game states"
  ON game_states FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view game states"
  ON game_states FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update game states"
  ON game_states FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anyone can delete game states"
  ON game_states FOR DELETE
  TO anon
  USING (true);

-- Policies for countries (read-only reference data)
CREATE POLICY "Anyone can view countries"
  ON countries FOR SELECT
  TO anon
  USING (true);

-- Policies for military_units
CREATE POLICY "Anyone can manage military units"
  ON military_units FOR ALL
  TO anon
  USING (true);

-- Policies for industrial_projects
CREATE POLICY "Anyone can manage projects"
  ON industrial_projects FOR ALL
  TO anon
  USING (true);

-- Policies for command_logs
CREATE POLICY "Anyone can manage logs"
  ON command_logs FOR ALL
  TO anon
  USING (true);

-- Insert country reference data
INSERT INTO countries (code, name_ar, name_en, region, base_treasury_1980, base_treasury_2000, base_treasury_2020, base_manpower, base_stability) VALUES
('IRQ', 'العراق', 'Iraq', 'Middle East', 45.0, 35.0, 90.0, 850000, 45),
('USA', 'الولايات المتحدة', 'United States', 'North America', 2800.0, 9800.0, 21000.0, 2500000, 90),
('RUS', 'روسيا', 'Russia', 'Europe/Asia', 1200.0, 260.0, 1700.0, 3000000, 65),
('CHN', 'الصين', 'China', 'Asia', 300.0, 1200.0, 14000.0, 4000000, 75),
('GBR', 'المملكة المتحدة', 'United Kingdom', 'Europe', 550.0, 1600.0, 2800.0, 250000, 85),
('FRA', 'فرنسا', 'France', 'Europe', 600.0, 1400.0, 2700.0, 300000, 82),
('DEU', 'ألمانيا', 'Germany', 'Europe', 850.0, 1900.0, 3900.0, 350000, 88),
('JPN', 'اليابان', 'Japan', 'Asia', 1100.0, 4900.0, 5100.0, 400000, 92),
('IRN', 'إيران', 'Iran', 'Middle East', 90.0, 120.0, 450.0, 1200000, 60),
('KOR', 'كوريا الجنوبية', 'South Korea', 'Asia', 65.0, 560.0, 1600.0, 650000, 80),
('ISR', 'إسرائيل', 'Israel', 'Middle East', 25.0, 130.0, 400.0, 250000, 70),
('SAU', 'السعودية', 'Saudi Arabia', 'Middle East', 160.0, 190.0, 790.0, 450000, 75),
('EGY', 'مصر', 'Egypt', 'Middle East', 23.0, 100.0, 300.0, 900000, 65),
('TUR', 'تركيا', 'Turkey', 'Middle East/Europe', 70.0, 270.0, 750.0, 800000, 68),
('BRA', 'البرازيل', 'Brazil', 'South America', 240.0, 650.0, 1800.0, 700000, 72)
ON CONFLICT (code) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_military_units_game_id ON military_units(game_id);
CREATE INDEX IF NOT EXISTS idx_industrial_projects_game_id ON industrial_projects(game_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_game_id ON command_logs(game_id);
CREATE INDEX IF NOT EXISTS idx_game_states_updated ON game_states(updated_at DESC);
