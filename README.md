# Kit Sai do Aperto — como publicar

Suas chaves do Supabase já estão configuradas no arquivo `.env.local`. Faltam 3 passos:

## 1. Criar a tabela no Supabase
1. Entre no seu projeto em supabase.com
2. Menu lateral → **SQL Editor** → **New query**
3. Abra o arquivo `supabase-schema.sql` desta pasta, copie todo o conteúdo, cole no editor e clique em **Run**

## 2. (Opcional, mas recomendado para testar rápido) Desligar confirmação de e-mail
Por padrão, o Supabase exige que a pessoa confirme o e-mail antes de logar. Para testar mais rápido agora:
1. Menu lateral → **Authentication** → **Providers** → **Email**
2. Desmarque **Confirm email**
3. Salve

(Antes de vender de verdade, você pode deixar essa confirmação ligada de novo — é mais seguro.)

## 3. Publicar na Vercel
Você vai precisar colocar este código num repositório do GitHub primeiro:
1. Crie um repositório novo em github.com (ex: `kit-sai-do-aperto`)
2. Suba esta pasta inteira para esse repositório (dá pra fazer isso arrastando os arquivos na própria interface do GitHub, em "Add file" → "Upload files")
3. Entre em vercel.com → **Add New** → **Project** → escolha o repositório que você acabou de criar
4. Antes de clicar em Deploy, vá em **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → cole a URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → cole a chave pública
5. Clique em **Deploy**

Em 1-2 minutos você recebe um link tipo `kit-sai-do-aperto.vercel.app` — já é um site real, no ar, com cada pessoa que se cadastrar vendo só os próprios dados.

## Próximo passo: cobrança
Esse código ainda não cobra nada — qualquer pessoa que se cadastra usa de graça. Para cobrar assinatura mensal, o caminho mais simples é criar um link de assinatura recorrente no Mercado Pago e liberar o acesso ao dashboard só para quem tiver pagamento confirmado (isso exige mais uma etapa de código, que posso te ajudar a montar quando você chegar nessa parte).
