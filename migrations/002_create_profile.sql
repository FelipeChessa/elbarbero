-- Migration: Create profile table
-- Created for E.L Barbero Imobiliária

CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    nome_empresa VARCHAR(255),
    creci VARCHAR(20) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_empresa VARCHAR(255),
    regiao VARCHAR(255) DEFAULT 'Zona Norte - São Paulo',
    instagram VARCHAR(100),
    facebook VARCHAR(255),
    sobre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Public can view profile"
ON profile FOR SELECT
USING (true);

-- Policy for authenticated users (full access)
CREATE POLICY "Authenticated users can manage profile"
ON profile FOR ALL
USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profile_updated_at
    BEFORE UPDATE ON profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default profile data
INSERT INTO profile (nome, nome_empresa, creci, cnpj, telefone, email, regiao)
VALUES 
    ('Edison Luis Barbero', 'E.L Barbero Gestão e Administração de Imóveis', '161611', '57.367.564/0001-84', '(11) 98805-1435', 'elbarberoimoveis@gmail.com', 'Zona Norte - São Paulo')
ON CONFLICT DO NOTHING;