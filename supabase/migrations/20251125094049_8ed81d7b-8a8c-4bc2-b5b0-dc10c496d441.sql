-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  chemical_formula TEXT,
  chemical_structure TEXT,
  uniqueness TEXT,
  scale TEXT,
  innovation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create material_properties table
CREATE TABLE public.material_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL,
  property_category TEXT
);

-- Create material_applications table
CREATE TABLE public.material_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  application TEXT NOT NULL
);

-- Create material_regulations table
CREATE TABLE public.material_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  regulation TEXT NOT NULL
);

-- Create material_sustainability table
CREATE TABLE public.material_sustainability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL UNIQUE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  renewable_score INTEGER NOT NULL CHECK (renewable_score >= 0 AND renewable_score <= 100),
  carbon_footprint_score INTEGER NOT NULL CHECK (carbon_footprint_score >= 0 AND carbon_footprint_score <= 100),
  biodegradability_score INTEGER NOT NULL CHECK (biodegradability_score >= 0 AND biodegradability_score <= 100),
  toxicity_score INTEGER NOT NULL CHECK (toxicity_score >= 0 AND toxicity_score <= 100),
  calculation_method TEXT
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  product_image_url TEXT,
  uniqueness TEXT,
  pricing TEXT,
  min_order TEXT,
  lead_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create supplier_properties table
CREATE TABLE public.supplier_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL
);

-- Create supplier_detailed_properties table
CREATE TABLE public.supplier_detailed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL
);

-- Create supplier_certifications table
CREATE TABLE public.supplier_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  certification TEXT NOT NULL
);

-- Create research_materials table
CREATE TABLE public.research_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  funding_stage TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create research_material_properties table
CREATE TABLE public.research_material_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_material_id UUID REFERENCES public.research_materials(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL
);

-- Create research_material_applications table
CREATE TABLE public.research_material_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_material_id UUID REFERENCES public.research_materials(id) ON DELETE CASCADE NOT NULL,
  application TEXT NOT NULL
);

-- Create lab_recipes table
CREATE TABLE public.lab_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  authors TEXT,
  doi TEXT,
  key_findings TEXT,
  highlighted_section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lab_recipe_materials table
CREATE TABLE public.lab_recipe_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_recipe_id UUID REFERENCES public.lab_recipes(id) ON DELETE CASCADE NOT NULL,
  material TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Create lab_recipe_steps table
CREATE TABLE public.lab_recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_recipe_id UUID REFERENCES public.lab_recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL
);

-- Create material_properties_database table
CREATE TABLE public.material_properties_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  chemical_structure TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create material_property_values table
CREATE TABLE public.material_property_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_properties_database_id UUID REFERENCES public.material_properties_database(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL
);

-- Create material_property_sources table
CREATE TABLE public.material_property_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_properties_database_id UUID REFERENCES public.material_properties_database(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL
);

-- Create application_matches table
CREATE TABLE public.application_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  cost_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create application_match_strengths table
CREATE TABLE public.application_match_strengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_match_id UUID REFERENCES public.application_matches(id) ON DELETE CASCADE NOT NULL,
  strength TEXT NOT NULL
);

-- Create application_match_considerations table
CREATE TABLE public.application_match_considerations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_match_id UUID REFERENCES public.application_matches(id) ON DELETE CASCADE NOT NULL,
  consideration TEXT NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_sustainability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_detailed_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_material_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_material_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_recipe_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_properties_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_property_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_property_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_match_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_match_considerations ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for public read access
CREATE POLICY "Public can view materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Public can view material_properties" ON public.material_properties FOR SELECT USING (true);
CREATE POLICY "Public can view material_applications" ON public.material_applications FOR SELECT USING (true);
CREATE POLICY "Public can view material_regulations" ON public.material_regulations FOR SELECT USING (true);
CREATE POLICY "Public can view material_sustainability" ON public.material_sustainability FOR SELECT USING (true);
CREATE POLICY "Public can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Public can view supplier_properties" ON public.supplier_properties FOR SELECT USING (true);
CREATE POLICY "Public can view supplier_detailed_properties" ON public.supplier_detailed_properties FOR SELECT USING (true);
CREATE POLICY "Public can view supplier_certifications" ON public.supplier_certifications FOR SELECT USING (true);
CREATE POLICY "Public can view research_materials" ON public.research_materials FOR SELECT USING (true);
CREATE POLICY "Public can view research_material_properties" ON public.research_material_properties FOR SELECT USING (true);
CREATE POLICY "Public can view research_material_applications" ON public.research_material_applications FOR SELECT USING (true);
CREATE POLICY "Public can view lab_recipes" ON public.lab_recipes FOR SELECT USING (true);
CREATE POLICY "Public can view lab_recipe_materials" ON public.lab_recipe_materials FOR SELECT USING (true);
CREATE POLICY "Public can view lab_recipe_steps" ON public.lab_recipe_steps FOR SELECT USING (true);
CREATE POLICY "Public can view material_properties_database" ON public.material_properties_database FOR SELECT USING (true);
CREATE POLICY "Public can view material_property_values" ON public.material_property_values FOR SELECT USING (true);
CREATE POLICY "Public can view material_property_sources" ON public.material_property_sources FOR SELECT USING (true);
CREATE POLICY "Public can view application_matches" ON public.application_matches FOR SELECT USING (true);
CREATE POLICY "Public can view application_match_strengths" ON public.application_match_strengths FOR SELECT USING (true);
CREATE POLICY "Public can view application_match_considerations" ON public.application_match_considerations FOR SELECT USING (true);

-- Create RLS policies for admin write access
CREATE POLICY "Admins can insert materials" ON public.materials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update materials" ON public.materials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete materials" ON public.materials FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage material_properties" ON public.material_properties FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_applications" ON public.material_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_regulations" ON public.material_regulations FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_sustainability" ON public.material_sustainability FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage supplier_properties" ON public.supplier_properties FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage supplier_detailed_properties" ON public.supplier_detailed_properties FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage supplier_certifications" ON public.supplier_certifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage research_materials" ON public.research_materials FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage research_material_properties" ON public.research_material_properties FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage research_material_applications" ON public.research_material_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage lab_recipes" ON public.lab_recipes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage lab_recipe_materials" ON public.lab_recipe_materials FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage lab_recipe_steps" ON public.lab_recipe_steps FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_properties_database" ON public.material_properties_database FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_property_values" ON public.material_property_values FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage material_property_sources" ON public.material_property_sources FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage application_matches" ON public.application_matches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage application_match_strengths" ON public.application_match_strengths FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage application_match_considerations" ON public.application_match_considerations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_materials_name ON public.materials(name);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_material_properties_material_id ON public.material_properties(material_id);
CREATE INDEX idx_suppliers_material_id ON public.suppliers(material_id);
CREATE INDEX idx_suppliers_company_name ON public.suppliers(company_name);
CREATE INDEX idx_research_materials_status ON public.research_materials(status);
CREATE INDEX idx_lab_recipes_title ON public.lab_recipes(title);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for materials table
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();