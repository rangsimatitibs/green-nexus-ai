// Regulation descriptions for tooltips
export const regulationDescriptions: Record<string, string> = {
  // FDA Food Contact
  "FDA 21 CFR (Food Contact Approved)": "US FDA regulation ensuring materials are safe for direct food contact",
  "FDA 21 CFR": "US Food and Drug Administration Code of Federal Regulations for food safety",
  "FDA Food Contact Notification (FCN)": "US FDA pre-market notification for food contact substances",
  "FDA 21 CFR 175.105 (Indirect Food Contact)": "US FDA regulation for adhesives used in indirect food contact",
  "FDA 21 CFR 177.1010 (Food Contact)": "US FDA regulation for semi-rigid and rigid plastics in food contact",
  
  // EU Regulations
  "EU 10/2011 (Food Contact Materials)": "EU regulation on plastic materials intended to come into contact with food",
  "EU 10/2011": "European Union regulation for plastic food contact materials",
  "EN 13432 (EU Packaging Compostability)": "EU standard for packaging recoverable through composting and biodegradation",
  "EN 13432": "European standard defining requirements for compostable packaging",
  
  // Compostability Standards
  "ASTM D6400 (Industrial Compostability)": "US standard for labeling plastics designed for aerobic composting in municipal/industrial facilities",
  "ASTM D6400": "American standard for compostable plastics specification",
  "OK Compost (TUV Austria)": "Certification guaranteeing complete biodegradation in industrial composting facilities",
  "OK Compost": "TÜV Austria certification for industrial compostability",
  
  // Biodegradability
  "ISO 14855 (Biodegradability)": "International standard for determining aerobic biodegradability of plastic materials",
  "ISO 14855": "Test method for aerobic biodegradability under controlled composting conditions",
  "ASTM D5338": "Standard test for determining aerobic biodegradation of plastic materials",
  
  // Biocompatibility & Medical
  "ISO 10993 (Biocompatibility)": "International standard for evaluating biocompatibility of medical devices",
  "ISO 10993": "Biological evaluation of medical devices standard",
  "USP Class VI": "US Pharmacopeia test for plastics used in medical devices and pharmaceutical packaging",
  
  // Environmental
  "REACH Registered": "EU regulation for Registration, Evaluation, Authorization of Chemicals",
  "REACH": "European chemical safety regulation ensuring safe use of chemicals",
  "RoHS": "EU Restriction of Hazardous Substances directive for electronics",
  "California Prop 65": "California law requiring warnings about chemicals known to cause cancer or reproductive harm",
  
  // Bio-based Certifications
  "USDA BioPreferred": "US federal program promoting biobased products",
  "OK Biobased": "TÜV Austria certification confirming bio-based content percentage",
  "TUV Austria": "Independent certification body for environmental standards",
  
  // Fire Safety
  "ASTM E84": "Standard test for surface burning characteristics of building materials",
  
  // GRAS
  "GRAS": "Generally Recognized As Safe - FDA designation for food additives",
};

// Function to get description for a regulation
export function getRegulationDescription(regulation: string): string | null {
  // First try exact match
  if (regulationDescriptions[regulation]) {
    return regulationDescriptions[regulation];
  }
  
  // Try partial match
  const lowerReg = regulation.toLowerCase();
  for (const [key, description] of Object.entries(regulationDescriptions)) {
    if (lowerReg.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerReg)) {
      return description;
    }
  }
  
  // Try matching common patterns
  if (lowerReg.includes('fda')) return "US Food and Drug Administration regulatory standard";
  if (lowerReg.includes('eu ') || lowerReg.includes('en ')) return "European Union regulatory standard";
  if (lowerReg.includes('astm')) return "American Society for Testing and Materials standard";
  if (lowerReg.includes('iso')) return "International Organization for Standardization standard";
  if (lowerReg.includes('reach')) return "EU chemical safety regulation";
  if (lowerReg.includes('compost')) return "Compostability certification standard";
  
  return null;
}
