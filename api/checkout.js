const PROMO_CODES = {
  'AMIGOS45': 'promo_1TWWvmI7lWm5a7C9CuBjmDZX'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { priceId, promoCode } = req.body;
  const promoId = promoCode ? PROMO_CODES[promoCode.toUpperCase()] : null;

  try {
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', 'https://claro-app2.vercel.app?success=true');
    params.append('cancel_url', 'https://claro-app2.vercel.app?cancelled=true');

    if (promoId) {
      params.append('discounts[0][promotion_code]', promoId);
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.url) {
      return res.status(200).json({ url: data.url });
    } else {
      return res.status(400).json({ error: data.error?.message || 'Código inválido ou erro Stripe' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
