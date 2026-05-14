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
        subject: 'Há algo que a maioria dos emigrantes não sabe...',
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
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 16px;">Olá, ${primeiroNome}! 👋</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Há 3 dias criaste conta no Claro-app. Espero que já tenhas explorado a app!</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Mas quero apresentar-me pessoalmente. Sou o Romeu, vivo em Montreux desde 2016 e trabalho todos os dias com emigrantes portugueses na Suíça.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">Multas que não percebeste, contratos que assinaste sem ler, regras que ninguém te explicou, cartas que ficaram sem resposta... a Suíça tem mil detalhes que só quem vive cá conhece.</p>
<div style="background:#F0FAF5;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1D9E75;">
<p style="font-size:14px;color:#064E3B;margin:0;line-height:1.7;">Com o Claro-app+, tens acesso direto a mim — marcações ilimitadas, em português, sem agenda escondida. Não tenho nada para te vender. O meu único interesse é que a tua vida na Suíça seja mais fácil.</p>
</div>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Descobrir o Claro-app+ →</a>
</div>
<div style="border-top:1px solid #E8E6DF;padding-top:20px;">
<p style="font-size:13px;color:#A8A69F;margin:0;">Dúvidas? Responde a este email ou contacta-nos em <a href="mailto:suporte@claro-app.ch" style="color:#1D9E75;">suporte@claro-app.ch</a></p>
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
