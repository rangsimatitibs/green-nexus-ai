-- Create table for excluded search terms
CREATE TABLE public.excluded_search_terms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term text NOT NULL UNIQUE,
  category text DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.excluded_search_terms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage excluded_search_terms"
ON public.excluded_search_terms
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view excluded_search_terms"
ON public.excluded_search_terms
FOR SELECT
USING (true);

-- Insert initial terms (no duplicates)
INSERT INTO public.excluded_search_terms (term, category) VALUES
('metals', 'metal'), ('metal alloys', 'metal'), ('ferrous metals', 'metal'), ('non-ferrous metals', 'metal'),
('precious metals', 'metal'), ('refractory metals', 'metal'), ('heavy metals', 'metal'), ('light metals', 'metal'),
('transition metals', 'metal'), ('noble metals', 'metal'), ('base metals', 'metal'), ('rare earth metals', 'metal'),
('polymers', 'polymer'), ('plastics', 'polymer'), ('thermoplastics', 'polymer'), ('thermosets', 'polymer'),
('elastomers', 'polymer'), ('rubbers', 'polymer'), ('resins', 'polymer'), ('bioplastics', 'polymer'),
('synthetic polymers', 'polymer'), ('natural polymers', 'polymer'), ('engineering plastics', 'polymer'),
('commodity plastics', 'polymer'), ('high-performance polymers', 'polymer'),
('ceramics', 'ceramic'), ('glasses', 'ceramic'), ('technical ceramics', 'ceramic'), ('advanced ceramics', 'ceramic'),
('structural ceramics', 'ceramic'), ('oxide ceramics', 'ceramic'), ('non-oxide ceramics', 'ceramic'),
('composites', 'composite'), ('fiber composites', 'composite'), ('carbon composites', 'composite'),
('glass fiber composites', 'composite'), ('metal matrix composites', 'composite'),
('polymer matrix composites', 'composite'), ('ceramic matrix composites', 'composite'),
('natural materials', 'natural'), ('bio-based materials', 'natural'), ('organic materials', 'natural'),
('plant-based materials', 'natural'), ('animal-based materials', 'natural'), ('mineral-based materials', 'natural'),
('wood products', 'natural'), ('paper products', 'natural'), ('textile fibers', 'natural'),
('natural fibers', 'natural'), ('synthetic fibers', 'natural'),
('electrical wires', 'use-case'), ('building materials', 'use-case'), ('construction materials', 'use-case'),
('automotive materials', 'use-case'), ('aerospace materials', 'use-case'), ('marine materials', 'use-case'),
('medical materials', 'use-case'), ('medical', 'use-case'), ('dental materials', 'use-case'),
('food contact materials', 'use-case'), ('food packaging', 'use-case'),
('electronic materials', 'use-case'), ('semiconductor materials', 'use-case'), ('optical materials', 'use-case'),
('battery materials', 'use-case'), ('energy materials', 'use-case'),
('insulation materials', 'use-case'), ('thermal materials', 'use-case'), ('acoustic materials', 'use-case'),
('structural materials', 'use-case'), ('functional materials', 'use-case'),
('packaging', 'consumer'), ('packaging materials', 'consumer'), ('consumer goods', 'consumer'),
('household products', 'consumer'), ('sports equipment', 'consumer'), ('toys', 'consumer'),
('furniture materials', 'consumer'), ('textile materials', 'consumer'), ('fashion materials', 'consumer'),
('cosmetic materials', 'consumer'), ('personal care', 'consumer'),
('industrial materials', 'industrial'), ('manufacturing materials', 'industrial'),
('raw materials', 'industrial'), ('feedstock', 'industrial'), ('intermediates', 'industrial'),
('specialty chemicals', 'industrial'), ('commodity chemicals', 'industrial'),
('lubricants', 'industrial'), ('adhesives', 'industrial'), ('coatings', 'industrial'),
('sealants', 'industrial'), ('paints', 'industrial'), ('inks', 'industrial'),
('conductive materials', 'property'), ('insulating materials', 'property'), ('magnetic materials', 'property'),
('transparent materials', 'property'), ('opaque materials', 'property'), ('reflective materials', 'property'),
('absorbent materials', 'property'), ('porous materials', 'property'), ('dense materials', 'property'),
('lightweight materials', 'property'), ('high-strength materials', 'property'), ('flexible materials', 'property'),
('rigid materials', 'property'), ('soft materials', 'property'), ('hard materials', 'property'),
('brittle materials', 'property'), ('ductile materials', 'property'), ('malleable materials', 'property'),
('corrosion resistant', 'property'), ('heat resistant', 'property'), ('wear resistant', 'property'),
('impact resistant', 'property'), ('fire resistant', 'property'), ('flame retardant', 'property'),
('uv resistant', 'property'), ('chemical resistant', 'property'), ('waterproof', 'property'),
('biodegradable', 'property'), ('compostable', 'property'), ('recyclable', 'property'),
('sustainable', 'property'), ('renewable', 'property'), ('eco-friendly', 'property'),
('powders', 'form'), ('granules', 'form'), ('pellets', 'form'), ('fibers', 'form'),
('films', 'form'), ('sheets', 'form'), ('plates', 'form'), ('tubes', 'form'),
('rods', 'form'), ('bars', 'form'), ('wires', 'form'), ('foils', 'form'),
('foams', 'form'), ('gels', 'form'), ('solutions', 'form'), ('dispersions', 'form'),
('emulsions', 'form'), ('suspensions', 'form'),
('material', 'generic'), ('materials', 'generic'), ('substance', 'generic'), ('substances', 'generic'),
('compound', 'generic'), ('compounds', 'generic'), ('element', 'generic'), ('elements', 'generic'),
('chemical', 'generic'), ('chemicals', 'generic'), ('product', 'generic'), ('products', 'generic'),
('component', 'generic'), ('components', 'generic'), ('part', 'generic'), ('parts', 'generic'),
('item', 'generic'), ('items', 'generic'), ('thing', 'generic'), ('things', 'generic'),
('stuff', 'generic'), ('type', 'generic'), ('types', 'generic'), ('kind', 'generic'),
('kinds', 'generic'), ('category', 'generic'), ('categories', 'generic'), ('class', 'generic'),
('classes', 'generic'), ('group', 'generic'), ('groups', 'generic'), ('family', 'generic'),
('families', 'generic'), ('series', 'generic'), ('grade', 'generic'), ('grades', 'generic'),
('nanomaterials', 'specialized'), ('smart materials', 'specialized'), ('metamaterials', 'specialized'),
('biomaterials', 'specialized'), ('biocompatible materials', 'specialized'), ('shape memory materials', 'specialized'),
('self-healing materials', 'specialized'), ('piezoelectric materials', 'specialized'),
('superconductors', 'specialized'), ('semiconductors', 'specialized'), ('conductors', 'specialized'),
('insulators', 'specialized'), ('dielectrics', 'specialized'), ('ferroelectrics', 'specialized'),
('photovoltaic materials', 'specialized'), ('thermoelectric materials', 'specialized'),
('catalysts', 'specialized'), ('adsorbents', 'specialized'), ('absorbents', 'specialized'),
('membranes', 'specialized'), ('filters', 'specialized'), ('separators', 'specialized');