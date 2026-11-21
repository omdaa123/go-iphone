-- Store a customer-facing description of each used inventory unit separately
-- from technical specifications and internal inventory notes.
ALTER TABLE inventory_units
  ADD COLUMN IF NOT EXISTS condition_description text;
