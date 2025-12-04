-- Seed bioplastics data
-- Add PHA (Polyhydroxyalkanoates)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polyhydroxyalkanoates', 'Bioplastic', '(C4H6O2)n', 'Naturally produced by bacteria', 'Commercial', 'Fermentation-based production')
ON CONFLICT DO NOTHING;

-- Add PBS (Polybutylene Succinate)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polybutylene Succinate', 'Bioplastic', '(C8H12O4)n', 'Biodegradable aliphatic polyester', 'Commercial', 'Bio-based production routes')
ON CONFLICT DO NOTHING;

-- Add PBAT (Polybutylene Adipate Terephthalate)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polybutylene Adipate Terephthalate', 'Bioplastic', '(C24H26O8)n', 'Flexible biodegradable polyester', 'Commercial', 'Compostable packaging')
ON CONFLICT DO NOTHING;

-- Add PVA (Polyvinyl Alcohol)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polyvinyl Alcohol', 'Bioplastic', '(C2H4O)n', 'Water-soluble synthetic polymer', 'Commercial', 'Biodegradable in water')
ON CONFLICT DO NOTHING;

-- Add PCL (Polycaprolactone)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polycaprolactone', 'Bioplastic', '(C6H10O2)n', 'Biodegradable aliphatic polyester', 'Commercial', 'Medical applications')
ON CONFLICT DO NOTHING;

-- Add Thermoplastic Starch
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Thermoplastic Starch', 'Bioplastic', '(C6H10O5)n', 'Made from renewable starch sources', 'Commercial', 'Low cost bioplastic')
ON CONFLICT DO NOTHING;

-- Add Cellulose Acetate
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Cellulose Acetate', 'Bioplastic', 'C6H7O2(OH)3-x(OOCCH3)x', 'Derived from wood pulp', 'Commercial', 'Biodegradable textile fiber')
ON CONFLICT DO NOTHING;

-- Add PHB (Polyhydroxybutyrate)
INSERT INTO materials (name, category, chemical_formula, uniqueness, scale, innovation)
VALUES ('Polyhydroxybutyrate', 'Bioplastic', '(C4H6O2)n', 'Bacterial polyester', 'Pilot', 'Produced by microorganisms')
ON CONFLICT DO NOTHING;

-- Update existing PLA to ensure it has bioplastic category
UPDATE materials SET category = 'Bioplastic' WHERE name ILIKE '%polylactic acid%' OR name ILIKE '%PLA%';

-- Add synonyms for the new materials
INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PHA', 'abbreviation' FROM materials WHERE name = 'Polyhydroxyalkanoates'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PBS', 'abbreviation' FROM materials WHERE name = 'Polybutylene Succinate'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PBAT', 'abbreviation' FROM materials WHERE name = 'Polybutylene Adipate Terephthalate'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PVA', 'abbreviation' FROM materials WHERE name = 'Polyvinyl Alcohol'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PVOH', 'abbreviation' FROM materials WHERE name = 'Polyvinyl Alcohol'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PCL', 'abbreviation' FROM materials WHERE name = 'Polycaprolactone'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'TPS', 'abbreviation' FROM materials WHERE name = 'Thermoplastic Starch'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'CA', 'abbreviation' FROM materials WHERE name = 'Cellulose Acetate'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type) 
SELECT id, 'PHB', 'abbreviation' FROM materials WHERE name = 'Polyhydroxybutyrate'
ON CONFLICT DO NOTHING;

-- Add bioplastic synonym to all bioplastic materials
INSERT INTO material_synonyms (material_id, synonym, synonym_type)
SELECT id, 'bioplastic', 'category' FROM materials WHERE category = 'Bioplastic'
ON CONFLICT DO NOTHING;

INSERT INTO material_synonyms (material_id, synonym, synonym_type)
SELECT id, 'biodegradable plastic', 'category' FROM materials WHERE category = 'Bioplastic'
ON CONFLICT DO NOTHING;

-- Add properties for the new materials
INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Biodegradability', 'High - Industrial composting', 'Environmental' FROM materials WHERE name = 'Polyhydroxyalkanoates'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Tensile Strength', '20-40 MPa', 'Mechanical' FROM materials WHERE name = 'Polyhydroxyalkanoates'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Melting Point', '115-175°C', 'Thermal' FROM materials WHERE name = 'Polyhydroxyalkanoates'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Biodegradability', 'High - Home and industrial composting', 'Environmental' FROM materials WHERE name = 'Polybutylene Succinate'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Melting Point', '110-115°C', 'Thermal' FROM materials WHERE name = 'Polybutylene Succinate'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Biodegradability', 'High - Industrial composting', 'Environmental' FROM materials WHERE name = 'Polybutylene Adipate Terephthalate'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Elongation at Break', '500-800%', 'Mechanical' FROM materials WHERE name = 'Polybutylene Adipate Terephthalate'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Water Solubility', 'Soluble', 'Chemical' FROM materials WHERE name = 'Polyvinyl Alcohol'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Biodegradability', 'High - Biodegrades in water', 'Environmental' FROM materials WHERE name = 'Polyvinyl Alcohol'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Melting Point', '60°C', 'Thermal' FROM materials WHERE name = 'Polycaprolactone'
ON CONFLICT DO NOTHING;

INSERT INTO material_properties (material_id, property_name, property_value, property_category)
SELECT id, 'Biodegradability', 'High - Soil and marine environments', 'Environmental' FROM materials WHERE name = 'Polycaprolactone'
ON CONFLICT DO NOTHING;

-- Add applications for the new materials
INSERT INTO material_applications (material_id, application)
SELECT id, 'Packaging' FROM materials WHERE category = 'Bioplastic'
ON CONFLICT DO NOTHING;

INSERT INTO material_applications (material_id, application)
SELECT id, 'Single-use items' FROM materials WHERE name IN ('Polyhydroxyalkanoates', 'Polybutylene Succinate', 'Thermoplastic Starch')
ON CONFLICT DO NOTHING;

INSERT INTO material_applications (material_id, application)
SELECT id, 'Medical devices' FROM materials WHERE name IN ('Polyhydroxyalkanoates', 'Polycaprolactone', 'Polyvinyl Alcohol')
ON CONFLICT DO NOTHING;

INSERT INTO material_applications (material_id, application)
SELECT id, 'Agricultural films' FROM materials WHERE name IN ('Polybutylene Succinate', 'Polybutylene Adipate Terephthalate')
ON CONFLICT DO NOTHING;

INSERT INTO material_applications (material_id, application)
SELECT id, 'Textile fibers' FROM materials WHERE name = 'Cellulose Acetate'
ON CONFLICT DO NOTHING;

INSERT INTO material_applications (material_id, application)
SELECT id, 'Film and coating' FROM materials WHERE name = 'Polyvinyl Alcohol'
ON CONFLICT DO NOTHING;