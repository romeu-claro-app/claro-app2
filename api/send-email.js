module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const email = req.body.email;
  const nome = req.body.nome || req.body.FIRSTNAME || 'amigo';
  const num = parseInt(req.body.num || req.query.num || '2');
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const primeiroNome = nome.split(' ')[0];

  const emails = {
    2: { subject: 'Há algo que a maioria dos emigrantes não sabe...', html: `<!DOCTYPE html>
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
</body></html>` },
    3: { subject: 'Os melhores anos da minha vida como emigrante', html: `<!DOCTYPE html>
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
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Escrito com base em anos de experiência real na Suíça. Em português simples, com exemplos reais e dicas práticas. É o guia que eu próprio gostaria de ter tido no primeiro dia.</p>
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
</body></html>` },
    4: { subject: 'A Suíça é cara. Mas não tem de te surpreender.', html: `<!DOCTYPE html>
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
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 16px;">Olá, ${primeiroNome}! 📊</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">A Suíça é um dos países mais caros do mundo. Mas também é um dos que melhor recompensa quem sabe gerir o dinheiro.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">O problema? A maioria dos emigrantes descobre os custos reais só depois de chegar — e fica apanhada desprevenida.</p>
<div style="background:#F0FAF5;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1D9E75;">
<p style="font-size:14px;font-weight:600;color:#0F6E56;margin:0 0 10px;">Budget Mensal Suíça — incluído no Claro-app+</p>
<p style="font-size:13px;color:#064E3B;margin:0;line-height:1.8;">🏠 Habitação (renda + encargos)<br>🏥 Seguro de saúde<br>🚆 Transportes (GA / abono)<br>🛒 Alimentação e supermercado<br>💰 Impostos, poupança e muito mais</p>
</div>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Criado especificamente para a realidade suíça — em francos suíços, com cálculos automáticos, pronto a usar no primeiro dia.</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Quero o Budget Mensal →</a>
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
</body></html>` },
    5: { subject: 'Estava a pagar CHF 120 a mais por mês. Sem saber.', html: `<!DOCTYPE html>
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
<p style="font-size:22px;font-weight:600;color:#1A1A18;margin:0 0 16px;">Olá, ${primeiroNome}! 💡</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Deixa-me contar-te uma história real.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Uma cliente estava a pagar o seguro de saúde errado há 2 anos. Nunca ninguém lhe tinha explicado que havia alternativas melhores para o seu perfil. Em 20 minutos de consulta, mudou de plano e passou a poupar <strong style="color:#1D9E75;">CHF 120 por mês</strong>.</p>
<div style="background:#F0FAF5;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1D9E75;">
<p style="font-size:14px;font-weight:600;color:#0F6E56;margin:0 0 10px;">Outros exemplos reais:</p>
<p style="font-size:13px;color:#064E3B;margin:0;line-height:1.8;">📋 Assinou um contrato de trabalho sem perceber uma cláusula — evitou uma situação complicada ao sair da empresa<br><br>🏠 Recebeu uma carta da régie a ameaçar despejo — descobriu que tinha direitos que o senhorio estava a ignorar</p>
</div>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">Estas situações acontecem todos os dias. E com o Claro-app+ tens marcações ilimitadas comigo — incluídas na anuidade, sem custos extra.</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Quero o Claro-app+ →</a>
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
</body></html>` },
    6: { subject: 'CHF 150 a CHF 500 por sessão. Ou CHF 12 por mês.', html: `<!DOCTYPE html>
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
</body></html>` },
    7: { subject: 'Já usaste as tuas 3 análises gratuitas este mês?', html: `<!DOCTYPE html>
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
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Um mês depois de te juntares ao Claro-app, quero perguntar-te diretamente:</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 24px;">Já analisaste algum documento? Já percebeste o valor da app?</p>
<div style="background:#F0FAF5;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1D9E75;">
<p style="font-size:14px;color:#064E3B;margin:0;line-height:1.7;">Se já experimentaste — imagina ter isso sem limites. Mais o Manual do Emigrante. Mais o Budget Mensal em Excel. Mais acesso direto a mim, ilimitado.</p>
</div>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 16px;">Se ainda não experimentaste — começa hoje. Fotografa qualquer carta que tenhas em casa e vê o que a app te diz.</p>
<p style="font-size:15px;color:#5A5955;line-height:1.7;margin:0 0 28px;">E se quiseres dar o próximo passo — tudo isto por CHF 12/mês:</p>
<div style="text-align:center;margin-bottom:28px;">
<a href="https://claro-app2.vercel.app" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">Upgrade para Claro-app+ →</a>
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
</body></html>` },
  };

  const emailData = emails[num];
  if (!emailData) return res.status(400).json({ error: 'Invalid email number' });

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
        subject: emailData.subject,
        htmlContent: emailData.html
      })
    });
    const data = await r.json();
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};