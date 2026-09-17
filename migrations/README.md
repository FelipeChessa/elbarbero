# Database Migrations

Execute as migrations **em ordem** no SQL Editor do Supabase.

## Ordem de execução:

1. **000_setup_extensions.sql** - Configura extensões necessárias (uuid-ossp, pgcrypto) e função de trigger
2. **001_create_properties.sql** - Cria tabela de imóveis
3. **002_create_profile.sql** - Cria tabela de perfil
4. **003_create_messages.sql** - Cria tabela de mensagens
5. **004_fix_rls_policies.sql** - Corrige políticas de segurança (RLS)

## Como executar:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de cada arquivo na ordem listada acima
4. Execute cada um individualmente

## Problema corrigido na migration 004:

As políticas RLS originais usavam `auth.role()` que não funciona no Supabase. A migration 004 corrige isso usando `auth.uid() IS NOT NULL` para verificar se o usuário está autenticado.
