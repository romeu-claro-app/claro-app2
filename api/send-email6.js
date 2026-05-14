module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, nome } = req.body;
  if (!email || !nome) return res.status(400).json({ error: 'Missing fields' });

  const primeiroNome = nome.split(' ')[0];

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Romeu | Claro-app', email: 'suporte@claro-app.ch' },
        to: [{ email, name: nome }],
        subject: 'CHF 150 a CHF 500 por sessão. Ou CHF 12 por mês.',
        htmlContent: `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EC;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EC;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#1D9E75;padding:40px;text-align:center;">
<div style="color:white;font-size:24px;font-weight:600;">claro-app.ch</div>
<div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:6px;">Documentos suíços em português</div>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 16px;">Olá, ${primeiroNome}! 🤔</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Um consultor tradicional na Suíça cobra entre CHF 150 e CHF 500 por sessão.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">E se a sessão for gratuita, vai com certeza forçar uma venda de um seguro ou produto financeiro para justificar a visita.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;margin-bottom:24px;">
<tr>
<td style="background:#F5F3EC;padding:14px 16px;font-size:13px;font-weight:600;color:#5A5955;border-bottom:1px solid #E8E6DF;width:40%;"></td>
<td style="background:#F5F3EC;padding:14px 16px;font-size:13px;font-weight:600;color:#5A5955;border-bottom:1px solid #E8E6DF;text-align:center;">Consultor tradicional</td>
<td style="background:#1D9E75;padding:14px 16px;font-size:13px;font-weight:600;color:white;border-bottom:1px solid rgba(255,255,255,0.2);text-align:center;">Claro-app+</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;border-bottom:1px solid #E8E6DF;">Custo</td>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;border-bottom:1px solid #E8E6DF;text-align:center;">CHF 150–500/sessão</td>
<td style="padding:12px 16px;font-size:13px;color:#1A1A18;font-weight:600;border-bottom:1px solid #E8E6DF;text-align:center;background:#F0FAF5;">CHF 12/mês</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;border-bottom:1px solid #E8E6DF;">Consultas</td>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;border-bottom:1px solid #E8E6DF;text-align:center;">Pagas cada uma</td>
<td style="padding:12px 16px;font-size:13px;color:#1A1A18;font-weight:600;border-bottom:1px solid #E8E6DF;text-align:center;background:#F0FAF5;">Ilimitadas</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;">Língua</td>
<td style="padding:12px 16px;font-size:13px;color:#5A5955;text-align:center;">Francês ou alemão</td>
<td style="padding:12px 16px;font-size:13px;color:#1A1A18;font-weight:600;text-align:center;background:#F0FAF5;">Sempre português</td>
</tr>
</table>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Uma consulta tradicional já paga o teu ano inteiro no Claro-app+.</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Começar com Claro-app+ →</a>
</div>
<div style="border-top:1px solid #E8E6DF;padding-top:20px;">
<p style="font-size:13px;color:#A8A69F;margin:0;">Dúvidas? Contacta-nos em <a href="mailto:suporte@claro-app.ch" style="color:#1D9E75;">suporte@claro-app.ch</a></p>
</div>
</td></tr>
<tr><td style="background:#F5F3EC;padding:20px 40px;text-align:center;">
<p style="font-size:12px;color:#A8A69F;margin:0;">© 2025 Claro-app.ch · Montreux, Suíça</p>
<p style="font-size:12px;color:#A8A69F;margin:6px 0 0;"><a href="https://claro-app2.vercel.app/api/unsubscribe?email=${email}" style="color:#A8A69F;">Cancelar subscrição de emails</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
      })
    });
    const data = await r.json();
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
