const crypto = require('crypto');

// Mapa price_id (Stripe) → valor da coluna `plano` no Supabase
const PRICE_TO_PLANO = {
  'price_1Tl7UeI7lWm5a7C9BxlQ36ca': 'claro_plus',   // Claro+ mensal (9 CHF)
  'price_1Tl7TdI7lWm5a7C9xdx7OABd': 'claro_plus',   // Claro+ anual (90 CHF)
  'price_1Tl7VtI7lWm5a7C9qNjZZD5H': 'claro_total',  // Claro Total mensal (19 CHF)
  'price_1Tl7W8I7lWm5a7C9fIxT8eW4': 'claro_total'   // Claro Total anual (190 CHF)
};

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
      // Descobrir o price_id da subscrição comprada (não vem no objeto session).
      // Expandir os line items da sessão e ler o price.id do primeiro item.
      let priceId = null;
      try {
        const liRes = await fetch(
          'https://api.stripe.com/v1/checkout/sessions/' + session.id + '/line_items?limit=1',
          { headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY } }
        );
        const liData = await liRes.json();
        priceId = liData.data?.[0]?.price?.id || null;
      } catch (err) {
        console.error('Erro ao obter line items da sessão:', err.message);
      }

      const plano = priceId ? PRICE_TO_PLANO[priceId] : null;

      if (!plano) {
        // price_id desconhecido ou não obtido — não alterar o plano para evitar valor errado
        console.warn('price_id sem mapeamento de plano, plano não alterado. price_id:', priceId, 'email:', email);
        return res.status(200).json({ received: true });
      }

      // Atualizar plano no Supabase
      await fetch('https://vawfgruwwfnpnrnxuvnw.supabase.co/rest/v1/profiles?email=eq.' + encodeURIComponent(email), {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plano: plano,
          stripe_subscription_id: session.subscription || null,
          stripe_customer_id: session.customer || null
        })
      });

      // Enviar email de upgrade via Brevo
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Romeu | Claro-app', email: 'suporte@claro-app.ch' },
          to: [{ email: email, name: nome }],
          subject: 'O teu Claro-app+ está ativo! 🎉',
          htmlContent: `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0F6E56;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F6E56;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#1A1A18;padding:40px;text-align:center;">
<div style="color:#1D9E75;font-size:24px;font-weight:600;">claro-app.ch</div>
<div style="display:inline-block;background:rgba(29,158,117,0.15);color:#1D9E75;font-size:12px;padding:4px 16px;border-radius:20px;margin-top:10px;">CLARO-APP+ ATIVO</div>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 12px;">Bem-vindo ao Claro-app+! 🎉</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">A tua subscrição está ativa. Tens agora acesso completo a tudo o que o Claro-app tem para oferecer.</p>
<div style="background:#F5F3EC;border-radius:12px;padding:24px;margin-bottom:24px;">
<p style="font-size:12px;font-weight:600;color:#1A1A18;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.5px;">O que tens agora:</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Documentos ilimitados</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Manual do Emigrante (PDF — 43 páginas)</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Budget Mensal Suíça (Excel)</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Marcações de consulta ilimitadas</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Gestão do agregado familiar</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Suporte direto por email</td></tr>
</table>
</div>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Abrir o Claro-app+ →</a>
</div>
<div style="border-top:1px solid #E8E6DF;padding-top:20px;">
<p style="font-size:13px;color:#A8A69F;margin:0;">Para cancelar vai ao perfil na app ou contacta <a href="mailto:suporte@claro-app.ch" style="color:#1D9E75;">suporte@claro-app.ch</a></p>
</div>
</td></tr>
<tr><td style="background:#F5F3EC;padding:20px 40px;text-align:center;">
<p style="font-size:12px;color:#A8A69F;margin:0;">© 2025 Claro-app.ch · Montreux, Suíça</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
        })
      });

      console.log('Plano', plano, 'e email enviado para:', email);
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

