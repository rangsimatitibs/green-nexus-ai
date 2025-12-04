// Research-important properties that should be prioritized in Property Finder cards
// These are the most valuable properties for researchers working with materials

export const RESEARCH_PRIORITY_PROPERTIES = [
  'Molecular Weight',
  'Density',
  'Glass Transition Temperature',
  'Glass Transition',
  'Melting Point',
  'Tensile Strength',
  'Elastic Modulus',
  'Young\'s Modulus',
  'Thermal Conductivity',
  'CAS Number',
  'Boiling Point',
  'Specific Heat Capacity',
  'Viscosity',
  'Refractive Index',
  'Water Absorption',
  'Biodegradability',
  'Crystallinity',
  'Heat Deflection Temperature',
];

// Properties to exclude from card view (too long or not suitable for quick display)
export const EXCLUDED_PROPERTY_KEYWORDS = [
  'description',
  'health effects',
  'iupac',
  'summary',
  'overview',
  'about',
  'notes',
  'comments',
  'hazard',
  'safety',
  'ppe',
  'handling',
];

// Maximum value length for card display (longer values go to table view)
export const MAX_CARD_VALUE_LENGTH = 60;

/**
 * Filter and prioritize properties for research card display
 * Returns only 4 most research-relevant properties with short values
 */
export function filterResearchProperties(
  properties: Record<string, string> | Array<{ name: string; value: string }>
): Array<{ name: string; value: string }> {
  // Normalize to array format
  const propsArray = Array.isArray(properties)
    ? properties
    : Object.entries(properties).map(([name, value]) => ({ name, value: String(value) }));

  // Filter out excluded properties and long values
  const filtered = propsArray.filter((prop) => {
    const nameLower = prop.name.toLowerCase();
    const valueLower = String(prop.value).toLowerCase();
    
    // Exclude if name contains excluded keywords
    if (EXCLUDED_PROPERTY_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
      return false;
    }
    
    // Exclude if value is too long
    if (String(prop.value).length > MAX_CARD_VALUE_LENGTH) {
      return false;
    }
    
    // Exclude if value looks like a paragraph (contains multiple sentences)
    if (String(prop.value).split(/[.!?]/).filter(s => s.trim()).length > 1) {
      return false;
    }
    
    return true;
  });

  // Sort by priority (research-important properties first)
  const sorted = filtered.sort((a, b) => {
    const aIndex = RESEARCH_PRIORITY_PROPERTIES.findIndex(
      p => a.name.toLowerCase().includes(p.toLowerCase())
    );
    const bIndex = RESEARCH_PRIORITY_PROPERTIES.findIndex(
      p => b.name.toLowerCase().includes(p.toLowerCase())
    );
    
    // Priority properties come first (-1 means not found)
    if (aIndex !== -1 && bIndex === -1) return -1;
    if (aIndex === -1 && bIndex !== -1) return 1;
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    
    return 0;
  });

  // Return top 4 properties
  return sorted.slice(0, 4);
}
