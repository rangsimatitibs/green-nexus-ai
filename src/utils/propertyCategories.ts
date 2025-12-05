import { FileText, Beaker, Wrench, Thermometer, Shield, Leaf } from "lucide-react";

export type PropertyCategory = 
  | 'description'
  | 'physical'
  | 'mechanical'
  | 'thermal'
  | 'safety'
  | 'environmental';

export interface CategoryConfig {
  id: PropertyCategory;
  label: string;
  icon: React.ElementType;
  priority: number;
  color: string;
}

export const PROPERTY_CATEGORIES: Record<PropertyCategory, CategoryConfig> = {
  description: {
    id: 'description',
    label: 'Description',
    icon: FileText,
    priority: 1,
    color: 'text-blue-500'
  },
  physical: {
    id: 'physical',
    label: 'Physical Properties',
    icon: Beaker,
    priority: 2,
    color: 'text-purple-500'
  },
  mechanical: {
    id: 'mechanical',
    label: 'Mechanical Properties',
    icon: Wrench,
    priority: 3,
    color: 'text-orange-500'
  },
  thermal: {
    id: 'thermal',
    label: 'Thermal Properties',
    icon: Thermometer,
    priority: 4,
    color: 'text-red-500'
  },
  safety: {
    id: 'safety',
    label: 'Safety & Hazards',
    icon: Shield,
    priority: 5,
    color: 'text-amber-500'
  },
  environmental: {
    id: 'environmental',
    label: 'Environmental',
    icon: Leaf,
    priority: 6,
    color: 'text-green-500'
  }
};

// Mapping rules for auto-categorizing properties
const CATEGORY_MAPPINGS: Record<PropertyCategory, string[]> = {
  description: [
    'iupac', 'name', 'cas', 'formula', 'description', 'molecular weight', 
    'synonym', 'chemical structure', 'complexity', 'exact mass', 'monoisotopic'
  ],
  physical: [
    'density', 'solubility', 'melting', 'boiling', 'crystal', 'space group',
    'xlogp', 'lipophilicity', 'polar surface', 'h-bond', 'hydrogen bond',
    'unit cell', 'band gap', 'formation energy', 'energy above hull',
    'refractive', 'viscosity', 'color', 'appearance', 'odor', 'ph'
  ],
  mechanical: [
    'tensile', 'strength', 'elongation', 'modulus', 'hardness', 'young',
    'shear', 'flexural', 'compressive', 'impact', 'fatigue', 'creep',
    'wear', 'friction', 'elasticity', 'stiffness', 'ductility', 'brittleness'
  ],
  thermal: [
    'thermal', 'conductivity', 'expansion', 'glass transition', 'heat',
    'specific heat', 'flammability', 'ignition', 'decomposition', 'hdt',
    'deflection temperature', 'vicat', 'service temperature'
  ],
  safety: [
    'hazard', 'health', 'ppe', 'protective', 'safety', 'toxic', 
    'ghs', 'classification', 'warning', 'caution', 'msds', 'sds',
    'exposure', 'limit', 'lethal', 'ld50', 'carcinogenic', 'mutagenic'
  ],
  environmental: [
    'biodegradable', 'biodegradability', 'compostable', 'renewable',
    'recyclable', 'carbon footprint', 'sustainability', 'eco', 
    'environmental', 'bio-based', 'lifecycle', 'lca'
  ]
};

export function categorizeProperty(propertyName: string): PropertyCategory {
  const lowerName = propertyName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as PropertyCategory;
      }
    }
  }
  
  // Default to physical for uncategorized properties
  return 'physical';
}

export function getCategoryConfig(category: PropertyCategory): CategoryConfig {
  return PROPERTY_CATEGORIES[category];
}

export function sortedCategories(): CategoryConfig[] {
  return Object.values(PROPERTY_CATEGORIES).sort((a, b) => a.priority - b.priority);
}

// Common properties that users might want to explore
export const COMMON_PROPERTY_SUGGESTIONS = [
  'Tensile Strength',
  'Density',
  'Melting Point',
  'Glass Transition Temperature',
  'Thermal Conductivity',
  'Young\'s Modulus',
  'Elongation at Break',
  'Water Absorption',
  'Oxygen Permeability',
  'UV Resistance',
  'Chemical Resistance',
  'Biodegradation Rate',
  'Compostability',
  'Shore Hardness',
  'Flexural Modulus'
];
