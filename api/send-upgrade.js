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
        subject: 'O teu Claro+ está ativo! 🎉',
        htmlContent: `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0F6E56;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F6E56;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.15);">
<tr><td style="background:#1A1A18;padding:40px;text-align:center;">
<div style="color:#1D9E75;font-size:24px;font-weight:600;">claro-app.ch</div>
<div style="display:inline-block;background:rgba(29,158,117,0.15);color:#1D9E75;font-size:12px;padding:4px 16px;border-radius:20px;margin-top:10px;">CLARO+ ATIVO</div>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 12px;">Bem-vindo ao Claro+, ${primeiroNome}! 🎉</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">A tua subscrição está ativa. Tens agora acesso completo a tudo o que o Claro-app tem para oferecer.</p>
<div style="background:#F5F3EC;border-radius:12px;padding:24px;margin-bottom:24px;">
<p style="font-size:12px;font-weight:600;color:#1A1A18;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.5px;">O que tens agora:</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Documentos ilimitados</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Manual do Emigrante (PDF)</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Budget Mensal Suíça (Excel)</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>1 consulta por mês com um profissional</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Gestão do agregado familiar</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#3A3A38;"><span style="color:#1D9E75;font-weight:700;margin-right:8px;">✓</span>Suporte direto por email</td></tr>
</table>
</div>
<p style="font-size:14px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Estes são os melhores anos da tua vida como emigrante. Tens agora tudo o que precisas para navegar a Suíça com confiança.</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://app.claro-app.ch" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Abrir o Claro+ →</a>
</div>
<div style="border-top:1px solid #E8E6DF;padding-top:20px;">
<p style="font-size:13px;color:#A8A69F;margin:0;">Para cancelar vai ao teu perfil na app ou contacta <a href="mailto:suporte@claro-app.ch" style="color:#1D9E75;">suporte@claro-app.ch</a></p>
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
    const data = await r.json();
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
