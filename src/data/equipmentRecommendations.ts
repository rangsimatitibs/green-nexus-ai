export interface EquipmentRecommendation {
  scale: string;
  batchSize: string;
  bioreactor: {
    type: string;
    volume: string;
    material: string;
    cost: string;
  };
  mixingSystem: {
    type: string;
    power: string;
    speed: string;
  };
  monitoring: string[];
  auxiliaryEquipment: string[];
  estimatedCapex: string;
  estimatedOpex: string;
  throughput: string;
}

export const equipmentRecommendations: Record<string, EquipmentRecommendation> = {
  lab: {
    scale: "Laboratory Scale",
    batchSize: "1-10 L",
    bioreactor: {
      type: "Benchtop Bioreactor",
      volume: "5-10 L",
      material: "Glass/Single-use",
      cost: "$15,000 - $50,000"
    },
    mixingSystem: {
      type: "Magnetic stirrer / Rushton impeller",
      power: "50-200 W",
      speed: "100-500 rpm"
    },
    monitoring: [
      "pH probe",
      "DO probe",
      "Temperature sensor",
      "Basic analytics"
    ],
    auxiliaryEquipment: [
      "Peristaltic pumps",
      "Gas flow controllers",
      "Data acquisition system"
    ],
    estimatedCapex: "$50,000 - $150,000",
    estimatedOpex: "$10,000 - $30,000/year",
    throughput: "50-200 L/year"
  },
  pilot: {
    scale: "Pilot Scale",
    batchSize: "100-1,000 L",
    bioreactor: {
      type: "Pilot Bioreactor",
      volume: "300-1,000 L",
      material: "Stainless steel 316L",
      cost: "$100,000 - $300,000"
    },
    mixingSystem: {
      type: "Multi-impeller system",
      power: "2-5 kW",
      speed: "50-300 rpm"
    },
    monitoring: [
      "Advanced pH control",
      "DO control with cascade",
      "Temperature control",
      "Foam sensor",
      "Level sensor",
      "Pressure sensor"
    ],
    auxiliaryEquipment: [
      "CIP/SIP system",
      "Feed/harvest systems",
      "Centrifuge/filter",
      "Cold storage"
    ],
    estimatedCapex: "$500,000 - $1,500,000",
    estimatedOpex: "$100,000 - $300,000/year",
    throughput: "5,000-50,000 L/year"
  },
  industrial: {
    scale: "Industrial Scale",
    batchSize: "5,000-20,000 L",
    bioreactor: {
      type: "Production Bioreactor",
      volume: "10,000-20,000 L",
      material: "Stainless steel 316L (electropolished)",
      cost: "$500,000 - $2,000,000"
    },
    mixingSystem: {
      type: "Multi-stage impeller system with baffles",
      power: "20-75 kW",
      speed: "30-150 rpm"
    },
    monitoring: [
      "Redundant pH/DO sensors",
      "Advanced process control (PAT)",
      "In-line spectroscopy",
      "Mass flow controllers",
      "Automated sampling",
      "SCADA system"
    ],
    auxiliaryEquipment: [
      "Automated CIP/SIP",
      "Automated media prep",
      "Continuous centrifuge",
      "Ultrafiltration system",
      "Chromatography system",
      "Cold chain storage"
    ],
    estimatedCapex: "$5,000,000 - $20,000,000",
    estimatedOpex: "$1,000,000 - $5,000,000/year",
    throughput: "200,000-1,000,000+ L/year"
  }
};

export interface ScalingFactor {
  scale: string;
  volumeRange: string;
  yieldEfficiency: number;
  energyFactor: number;
  timeFactor: number;
  materialCostFactor: number;
}

export const scalingFactors: Record<string, ScalingFactor> = {
  lab: {
    scale: "Lab",
    volumeRange: "1-10 L",
    yieldEfficiency: 1.0,
    energyFactor: 1.0,
    timeFactor: 1.0,
    materialCostFactor: 1.0
  },
  pilot: {
    scale: "Pilot",
    volumeRange: "100-1,000 L",
    yieldEfficiency: 0.92,
    energyFactor: 0.85,
    timeFactor: 1.1,
    materialCostFactor: 0.7
  },
  industrial: {
    scale: "Industrial",
    volumeRange: "5,000-20,000 L",
    yieldEfficiency: 0.88,
    energyFactor: 0.75,
    timeFactor: 1.15,
    materialCostFactor: 0.5
  }
};
