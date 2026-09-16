-- Migration: Create messages table
-- Created for E.L Barbero Imobiliária

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(50) CHECK (tipo IN ('comprar', 'vender', 'alugar', 'investimento', 'outros')),
    mensagem TEXT NOT NULL,
    lido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_lido ON messages(lido);

-- Policy for public insert (anyone can send message)
CREATE POLICY "Public can insert messages"
ON messages FOR INSERT
WITH CHECK (true);

-- Policy for authenticated users (full access)
CREATE POLICY "Authenticated users can manage messages"
ON messages FOR ALL
USING (auth.role() = 'authenticated');

-- Policy for service role (full access)
CREATE POLICY "Service role can manage messages"
ON messages FOR ALL
USING (auth.role() = 'service_role');