export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, nome, email, telefone, data_nascimento, cidade, morada, codigo_postal, aceita_marketing } = req.body;

  console.log('create-profile body:', JSON.stringify({ id, nome, email, cidade, codigo_postal, aceita_marketing }));

  if (!id || !nome || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
  }

  const SUPABASE_URL = 'https://vawfgruwwfnpnrnxuvnw.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_KEY não definida');
    return res.status(500).json({ error: 'Configuração em falta no servidor.' });
  }

  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id,
      nome,
      email,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null,
      cidade: cidade || null,
      morada: morada || null,
      codigo_postal: codigo_postal || null,
      plano: 'gratuito'
    })
  });

  const data = await r.json();
  if (!r.ok) {
    console.error('Supabase insert error:', JSON.stringify(data));
    return res.status(400).json({ error: data });
  }
  return res.status(200).json({ success: true });
}
