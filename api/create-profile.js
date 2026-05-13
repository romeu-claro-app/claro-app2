export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, nome, email, telefone, data_nascimento, cidade, morada, codigo_postal } = req.body;

  if (!id || !nome || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
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
  if (!r.ok) return res.status(400).json({ error: data });
  return res.status(200).json({ success: true });
}
