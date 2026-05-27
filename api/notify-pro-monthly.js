// SQL para criar as colunas (executar uma vez no Supabase):
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_pro_mensal_enviada boolean DEFAULT false;
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_pro_mensal_mes integer DEFAULT 0;

const { GoogleAuth } = require('google-auth-library');

module.exports = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const PROJECT_ID = 'claro-app-afd0e';

    // Mês atual (1-12) — usado para reset automático mensal
    const currentMonth = new Date().getMonth() + 1;

    // Buscar utilizadores pro com fcm_token, incluindo o mês do último envio
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?plano=eq.pro&fcm_token=not.is.null&select=id,fcm_token,notif_pro_mensal_mes`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const allProfiles = await profilesRes.json();

    // Apenas enviar a quem ainda não recebeu este mês (reset automático por mês)
    const profiles = (allProfiles || []).filter(p => p.notif_pro_mensal_mes !== currentMonth);

    if (profiles.length === 0) {
      return res.status(200).json({ message: 'Nenhum utilizador elegível', sent: 0 });
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const accessToken = await auth.getAccessToken();

    let sent = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        const message = {
          message: {
            token: profile.fcm_token,
            notification: {
              title: 'Tens dúvidas? Tens direito a isso.',
              body: 'De certeza que tens burocracias para tratar. Não fiques à espera — marca já com um profissional. Está incluído no teu plano.',
            },
            android: {
              priority: 'high',
            }
          }
        };

        const fcmRes = await fetch(
          `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + accessToken,
            },
            body: JSON.stringify(message),
          }
        );

        if (fcmRes.ok) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ notif_pro_mensal_enviada: true, notif_pro_mensal_mes: currentMonth }),
            }
          );
          sent++;
        } else {
          const err = await fcmRes.json();
          errors.push({ profile: profile.id, error: err });
        }
      } catch (e) {
        errors.push({ profile: profile.id, error: e.message });
      }
    }

    return res.status(200).json({
      message: `Notificações pro mensais enviadas: ${sent}`,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
