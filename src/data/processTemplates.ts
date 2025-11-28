export interface ProcessTemplate {
  id: string;
  name: string;
  type: 'fermentation' | 'enzymatic' | 'synthesis' | 'custom';
  description: string;
  parameters: {
    temperature: number;
    ph: number;
    agitation: number;
    substrate_concentration?: number;
    oxygen_level?: number;
    retention_time?: number;
  };
  constraints: {
    temp_min: number;
    temp_max: number;
    ph_min: number;
    ph_max: number;
  };
  typical_yield: string;
  typical_time: string;
}

export const processTemplates: ProcessTemplate[] = [
  {
    id: 'pla-fermentation',
    name: 'PLA Fermentation',
    type: 'fermentation',
    description: 'Lactic acid fermentation for polylactic acid (PLA) production',
    parameters: {
      temperature: 37,
      ph: 5.5,
      agitation: 200,
      substrate_concentration: 100,
      oxygen_level: 20,
      retention_time: 48
    },
    constraints: {
      temp_min: 30,
      temp_max: 42,
      ph_min: 4.5,
      ph_max: 6.5
    },
    typical_yield: '85-92%',
    typical_time: '48-72 hours'
  },
  {
    id: 'enzyme-conversion',
    name: 'Enzymatic Conversion',
    type: 'enzymatic',
    description: 'Enzyme-catalyzed conversion for biopolymer synthesis',
    parameters: {
      temperature: 50,
      ph: 7.0,
      agitation: 150,
      substrate_concentration: 80,
      retention_time: 24
    },
    constraints: {
      temp_min: 45,
      temp_max: 60,
      ph_min: 6.0,
      ph_max: 8.0
    },
    typical_yield: '75-85%',
    typical_time: '24-36 hours'
  },
  {
    id: 'mycelium-growth',
    name: 'Mycelium Growth',
    type: 'fermentation',
    description: 'Fungal mycelium cultivation for biomaterial production',
    parameters: {
      temperature: 28,
      ph: 6.0,
      agitation: 100,
      substrate_concentration: 120,
      oxygen_level: 30,
      retention_time: 120
    },
    constraints: {
      temp_min: 22,
      temp_max: 32,
      ph_min: 5.0,
      ph_max: 7.0
    },
    typical_yield: '80-88%',
    typical_time: '5-7 days'
  },
  {
    id: 'chemical-synthesis',
    name: 'Bio-based Chemical Synthesis',
    type: 'synthesis',
    description: 'Catalytic synthesis of bio-based chemicals',
    parameters: {
      temperature: 65,
      ph: 8.0,
      agitation: 300,
      substrate_concentration: 150,
      retention_time: 12
    },
    constraints: {
      temp_min: 55,
      temp_max: 75,
      ph_min: 7.0,
      ph_max: 9.0
    },
    typical_yield: '70-80%',
    typical_time: '12-18 hours'
  },
  {
    id: 'nanocellulose-production',
    name: 'Nanocellulose Production',
    type: 'synthesis',
    description: 'Mechanical/chemical extraction of cellulose nanofibers',
    parameters: {
      temperature: 25,
      ph: 4.5,
      agitation: 400,
      substrate_concentration: 60,
      retention_time: 8
    },
    constraints: {
      temp_min: 20,
      temp_max: 30,
      ph_min: 3.5,
      ph_max: 5.5
    },
    typical_yield: '60-75%',
    typical_time: '6-10 hours'
  }
];
