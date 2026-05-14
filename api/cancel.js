module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, requestRefund } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const SUPABASE_URL = 'https://vawfgruwwfnpnrnxuvnw.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // Buscar subscription_id do Supabase
    const profileRes = await fetch(
      SUPABASE_URL + '/rest/v1/profiles?id=eq.' + userId + '&select=stripe_subscription_id,stripe_customer_id',
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      }
    );
    const profiles = await profileRes.json();
    const subId = profiles[0]?.stripe_subscription_id;

    if (!subId) {
      return res.status(400).json({ error: 'Sem subscrição ativa' });
    }

    // Se pediu reembolso — processar 50% antes de cancelar
    if (requestRefund) {
      // Buscar a última invoice paga para saber o payment_intent
      const invoicesRes = await fetch(
        'https://api.stripe.com/v1/invoices?subscription=' + subId + '&status=paid&limit=1',
        {
          headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY }
        }
      );
      const invoicesData = await invoicesRes.json();
      const invoice = invoicesData.data?.[0];
      const paymentIntentId = invoice?.payment_intent;

      if (paymentIntentId) {
        // Calcular 50% do valor pago
        const amountPaid = invoice.amount_paid; // em centavos
        const refundAmount = Math.floor(amountPaid * 0.5);

        // Criar reembolso parcial no Stripe
        const refundParams = new URLSearchParams();
        refundParams.append('payment_intent', paymentIntentId);
        refundParams.append('amount', refundAmount.toString());

        const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: refundParams.toString()
        });
        const refundData = await refundRes.json();
        if (!refundRes.ok) {
          console.error('Refund error:', JSON.stringify(refundData));
          return res.status(400).json({ error: 'Erro ao processar reembolso: ' + (refundData.error?.message || 'Contacta suporte@claro-app.ch') });
        }
      }
    }

    // Cancelar subscrição no fim do período (não imediatamente)
    const cancelParams = new URLSearchParams();
    cancelParams.append('cancel_at_period_end', 'true');

    const cancelRes = await fetch('https://api.stripe.com/v1/subscriptions/' + subId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: cancelParams.toString()
    });
    const cancelData = await cancelRes.json();

    if (cancelData.cancel_at_period_end === true || cancelData.status === 'canceled') {
      // Atualizar plano no Supabase
      await fetch(
        SUPABASE_URL + '/rest/v1/profiles?id=eq.' + userId,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
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
