module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const email = req.method === 'GET'
    ? req.query.email
    : req.body?.email;

  if (!email) return res.status(400).json({ error: 'Email em falta.' });

  const SUPABASE_URL = 'https://vawfgruwwfnpnrnxuvnw.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aceita_marketing: false })
      }
    );

    if (r.ok) {
      // Redirecionar para página de confirmação
      res.setHeader('Location', 'https://claro-app.ch/unsubscribe.html?success=true');
      return res.status(302).end();
    } else {
      res.setHeader('Location', 'https://claro-app.ch/unsubscribe.html?error=true');
      return res.status(302).end();
    }
  } catch (error) {
    res.setHeader('Location', 'https://claro-app.ch/unsubscribe.html?error=true');
    return res.status(302).end();
  }
};
