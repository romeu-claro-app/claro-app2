// SQL para criar a coluna (executar uma vez no Supabase):
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_inativo_enviada boolean DEFAULT false;

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

    // Utilizadores com actividade recente (últimos 7 dias) — excluir estes
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    const recentDocsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documentos?created_at=gte.${cutoff}&select=user_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const recentDocs = await recentDocsRes.json();
    const activeUserIds = [...new Set((recentDocs || []).map(d => d.user_id))];

    // Utilizadores gratuitos, com fcm_token, que ainda não receberam esta notificação
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?plano=eq.gratuito&fcm_token=not.is.null&notif_inativo_enviada=eq.false&select=id,fcm_token`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const allProfiles = await profilesRes.json();

    const profiles = (allProfiles || []).filter(p => !activeUserIds.includes(p.id));

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
              title: 'Tens ido à caixa de correio?',
              body: 'De certeza que deixaste alguma carta \'pra ver depois\'... olha que a Suíça não brinca. Abre o Claro-app e resolve isso antes que a Suíça resolva por ti.',
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
              body: JSON.stringify({ notif_inativo_enviada: true }),
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
      message: `Notificações de inatividade enviadas: ${sent}`,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
