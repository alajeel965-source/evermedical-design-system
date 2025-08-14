-- Update medical_events table to use specialty_slug instead of primary_specialty_id
ALTER TABLE medical_events 
DROP COLUMN IF EXISTS primary_specialty_id,
ADD COLUMN specialty_slug TEXT,
ADD COLUMN subspecialty TEXT;

-- Update profiles table to use specialty_slug
ALTER TABLE profiles
ADD COLUMN primary_specialty_slug TEXT,
ADD COLUMN subspecialties TEXT[];

-- Create specialty validation function
CREATE OR REPLACE FUNCTION validate_specialty_slug(slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function should validate against config/specialties.json
  -- For now, we'll allow any non-empty slug and validate in application
  RETURN slug IS NOT NULL AND slug != '';
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_events_specialty_slug ON medical_events(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_specialty_slug ON profiles(primary_specialty_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_subspecialties ON profiles USING GIN(subspecialties);

-- Backfill existing events with a default specialty (to be updated manually)
UPDATE medical_events 
SET specialty_slug = 'internal-medicine'
WHERE specialty_slug IS NULL;

-- Update event_specialties table to be compatible with new structure
ALTER TABLE event_specialties
ADD COLUMN code TEXT,
ADD COLUMN synonyms TEXT[];

-- Backfill event_specialties with codes based on existing data
UPDATE event_specialties 
SET code = CASE 
  WHEN slug = 'allergy-immunology' THEN 'AI'
  WHEN slug = 'anesthesiology' THEN 'ANE'
  WHEN slug = 'dermatology' THEN 'DERM'
  WHEN slug = 'emergency-medicine' THEN 'EM'
  WHEN slug = 'family-medicine' THEN 'FM'
  WHEN slug = 'internal-medicine' THEN 'IM'
  WHEN slug = 'medical-genetics' THEN 'MGG'
  WHEN slug = 'neurological-surgery' THEN 'NS'
  WHEN slug = 'nuclear-medicine' THEN 'NM'
  WHEN slug = 'obstetrics-gynecology' THEN 'OBGYN'
  WHEN slug = 'ophthalmology' THEN 'OPH'
  WHEN slug = 'orthopedic-surgery' THEN 'ORTHO'
  WHEN slug = 'otolaryngology' THEN 'ENT'
  WHEN slug = 'pathology' THEN 'PATH'
  WHEN slug = 'pediatrics' THEN 'PEDS'
  WHEN slug = 'physical-medicine-rehabilitation' THEN 'PMR'
  WHEN slug = 'plastic-surgery' THEN 'PLAST'
  WHEN slug = 'preventive-medicine' THEN 'PREV'
  WHEN slug = 'psychiatry' THEN 'PSY'
  WHEN slug = 'radiation-oncology' THEN 'RO'
  WHEN slug = 'radiology' THEN 'RAD'
  WHEN slug = 'surgery' THEN 'SURG'
  WHEN slug = 'thoracic-surgery' THEN 'THOR'
  WHEN slug = 'urology' THEN 'URO'
  WHEN slug = 'dentistry' THEN 'DENT'
  ELSE 'MISC'
END;