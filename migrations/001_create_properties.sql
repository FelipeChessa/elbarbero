-- Migration: Create properties table
-- Created for E.L Barbero Imobiliária

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('apartamento', 'casa', 'comercial', 'terreno')),
    transaction VARCHAR(20) NOT NULL CHECK (transaction IN ('venda', 'aluguel')),
    price DECIMAL(15, 2) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'vendido')),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    garage INTEGER DEFAULT 0,
    area INTEGER,
    area_total INTEGER,
    year INTEGER,
    condition VARCHAR(20) DEFAULT 'novo' CHECK (condition IN ('novo', 'usado', 'reformado', 'obra')),
    description TEXT,
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_transaction ON properties(transaction);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- Policy for public read access (only active properties)
CREATE POLICY "Public can view active properties"
ON properties FOR SELECT
USING (status = 'ativo');

-- Policy for authenticated users (full access)
CREATE POLICY "Authenticated users can manage properties"
ON properties FOR ALL
USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO properties (title, type, transaction, price, location, status, bedrooms, bathrooms, area, description)
VALUES 
    ('Apartamento Moderno em Santana', 'apartamento', 'venda', 450000, 'Santana, São Paulo', 'ativo', 2, 1, 65, 'Lindíssimo apartamento com acabamento premium, localizado no coração de Santana.'),
    ('Casa Geminada no Jaraguá', 'casa', 'venda', 680000, 'Jaraguá, São Paulo', 'ativo', 3, 2, 180, 'Casa geminada em bairro tranquilo e residencial.'),
    ('Sala Comercial em Santana', 'comercial', 'aluguel', 2800, 'Santana, São Paulo', 'ativo', 0, 1, 45, 'Sala comercial em ponto privilegiado no centro de Santana.')
ON CONFLICT DO NOTHING;