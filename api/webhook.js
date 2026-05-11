const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = verifyStripeWebhook(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const nome = session.customer_details?.name || email;

    if (email) {
      // Atualizar plano no Supabase
      await fetch('https://vawfgruwwfnpnrnxuvnw.supabase.co/rest/v1/profiles?email=eq.' + encodeURIComponent(email), {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plano: 'pro' })
      });

      console.log('A enviar email para:', email);

      // Enviar email via Brevo
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Romeu | Claro-app', email: 'suporte@claro-app.ch' },
          to: [{ email: email, name: nome }],
          subject: 'O teu Claro-app+ está ativo! 🎉',
          htmlContent: '<p>Bem-vindo ao Claro-app+! A tua subscricao esta ativa.</p><a href="https://claro-app2.vercel.app">Abrir app</a>'
        })
      });

      console.log('Brevo status:', brevoRes.status);
    }
  }

  res.status(200).json({ received: true });
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { resolve(data); });
    req.on('error', reject);
  });
}

function verifyStripeWebhook(payload, sig, secret) {
  const parts = sig.split(',');
  const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.split('=')[1]);
  const expectedSig = crypto.createHmac('sha256', secret).update(timestamp + '.' + payload).digest('hex');
  if (!signatures.includes(expectedSig)) throw new Error('Invalid signature');
  return JSON.parse(payload);
}
