module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Buscar subscription_id do Supabase
    const profileRes = await fetch(
      'https://vawfgruwwfnpnrnxuvnw.supabase.co/rest/v1/profiles?id=eq.' + userId + '&select=stripe_subscription_id',
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY
        }
      }
    );
    const profiles = await profileRes.json();
    const subId = profiles[0]?.stripe_subscription_id;

    if (!subId) {
      return res.status(400).json({ error: 'Sem subscrição ativa' });
    }

    // Cancelar no Stripe (no fim do período)
    const cancelRes = await fetch('https://api.stripe.com/v1/subscriptions/' + subId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY
      }
    });
    const cancelData = await cancelRes.json();

    if (cancelData.status === 'canceled') {
      // Atualizar plano no Supabase
      await fetch(
        'https://vawfgruwwfnpnrnxuvnw.supabase.co/rest/v1/profiles?id=eq.' + userId,
        {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ plano: 'gratuito', stripe_subscription_id: null })
        }
      );
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Erro ao cancelar no Stripe', details: cancelData });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
