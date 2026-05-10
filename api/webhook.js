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
    const email = event.data.object.customer_details?.email;
    if (email) {
      await fetch('https://vawfgruwwfnpnrnxuvnw.supabase.co/rest/v1/profiles?email=eq.' + encodeURIComponent(email), {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plano: 'pro' })
      });
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
