-- Seed regulations for existing bioplastics in the database
-- First get material IDs and add regulations

-- PLA (Polylactic Acid)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'FDA 21 CFR (Food Contact Approved)' FROM materials WHERE name ILIKE '%PLA%' OR name ILIKE '%polylactic%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ASTM D6400 (Industrial Compostability)' FROM materials WHERE name ILIKE '%PLA%' OR name ILIKE '%polylactic%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'EN 13432 (EU Packaging Compostability)' FROM materials WHERE name ILIKE '%PLA%' OR name ILIKE '%polylactic%'
ON CONFLICT DO NOTHING;

-- PHA (Polyhydroxyalkanoates)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'FDA Food Contact Notification (FCN)' FROM materials WHERE name ILIKE '%PHA%' OR name ILIKE '%polyhydroxyalkanoate%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ASTM D6400 (Industrial Compostability)' FROM materials WHERE name ILIKE '%PHA%' OR name ILIKE '%polyhydroxyalkanoate%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ISO 14855 (Biodegradability)' FROM materials WHERE name ILIKE '%PHA%' OR name ILIKE '%polyhydroxyalkanoate%'
ON CONFLICT DO NOTHING;

-- PBS (Polybutylene Succinate)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'EU 10/2011 (Food Contact Materials)' FROM materials WHERE name ILIKE '%PBS%' OR name ILIKE '%polybutylene succinate%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ASTM D6400 (Industrial Compostability)' FROM materials WHERE name ILIKE '%PBS%' OR name ILIKE '%polybutylene succinate%'
ON CONFLICT DO NOTHING;

-- PBAT
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'EN 13432 (EU Packaging Compostability)' FROM materials WHERE name ILIKE '%PBAT%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ASTM D6400 (Industrial Compostability)' FROM materials WHERE name ILIKE '%PBAT%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'OK Compost (TUV Austria)' FROM materials WHERE name ILIKE '%PBAT%'
ON CONFLICT DO NOTHING;

-- PCL (Polycaprolactone)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'ISO 10993 (Biocompatibility)' FROM materials WHERE name ILIKE '%PCL%' OR name ILIKE '%polycaprolactone%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'USP Class VI' FROM materials WHERE name ILIKE '%PCL%' OR name ILIKE '%polycaprolactone%'
ON CONFLICT DO NOTHING;

-- Cellulose Acetate
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'FDA 21 CFR 177.1010 (Food Contact)' FROM materials WHERE name ILIKE '%cellulose acetate%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'REACH Registered' FROM materials WHERE name ILIKE '%cellulose acetate%'
ON CONFLICT DO NOTHING;

-- TPS (Thermoplastic Starch)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'EN 13432 (EU Packaging Compostability)' FROM materials WHERE name ILIKE '%TPS%' OR name ILIKE '%thermoplastic starch%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'USDA BioPreferred' FROM materials WHERE name ILIKE '%TPS%' OR name ILIKE '%thermoplastic starch%'
ON CONFLICT DO NOTHING;

-- PVA (Polyvinyl Alcohol)
INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'FDA 21 CFR 175.105 (Indirect Food Contact)' FROM materials WHERE name ILIKE '%PVA%' OR name ILIKE '%polyvinyl alcohol%'
ON CONFLICT DO NOTHING;

INSERT INTO material_regulations (material_id, regulation)
SELECT id, 'EU 10/2011 (Food Contact Materials)' FROM materials WHERE name ILIKE '%PVA%' OR name ILIKE '%polyvinyl alcohol%'
ON CONFLICT DO NOTHING;