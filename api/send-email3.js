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
        subject: 'Os melhores anos da minha vida como emigrante',
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
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 16px;">Olá, ${primeiroNome}! 📖</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Quando cheguei à Suíça não havia nenhum guia em português que explicasse como este país realmente funciona.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">Por isso escrevi-o eu.</p>
<div style="background:#F0FAF5;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1D9E75;">
<p style="font-size:14px;font-weight:600;color:#0F6E56;margin:0 0 10px;">"Os Melhores Anos da Minha Vida como Emigrante"</p>
<p style="font-size:13px;color:#064E3B;margin:0;line-height:1.8;">📋 Preparação para a chegada<br>🏥 Seguros e saúde<br>💼 Trabalho e direitos<br>🏠 Habitação e contratos<br>💰 Impostos e finanças<br>🏦 Reforma e poupança</p>
</div>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">43 páginas escritas com base em anos de experiência real na Suíça. Em português simples, com exemplos reais e dicas práticas. É o guia que eu próprio gostaria de ter tido no primeiro dia.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Está incluído no Claro-app+.</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Quero acesso ao Manual →</a>
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
