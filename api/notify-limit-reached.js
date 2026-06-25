// SQL para criar as colunas (executar uma vez no Supabase):
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_limite_enviada boolean DEFAULT false;
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_limite_mes integer DEFAULT 0;

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
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Buscar todos os documentos criados no mês atual
    const docsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documentos?created_at=gte.${startOfMonth}&select=user_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const docs = await docsRes.json();

    // Contar documentos por utilizador e identificar quem atingiu 3 ou mais
    const docCounts = {};
    (docs || []).forEach(d => {
      if (d.user_id) {
        docCounts[d.user_id] = (docCounts[d.user_id] || 0) + 1;
      }
    });
    const usersAtLimit = Object.entries(docCounts)
      .filter(([, count]) => count >= 3)
      .map(([userId]) => userId);

    if (usersAtLimit.length === 0) {
      return res.status(200).json({ message: 'Nenhum utilizador no limite este mês', sent: 0 });
    }

    // Buscar utilizadores gratuitos com fcm_token, incluindo o mês do último envio
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?plano=eq.gratuito&fcm_token=not.is.null&select=id,fcm_token,notif_limite_mes`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const allProfiles = await profilesRes.json();

    // Filtrar: atingiram o limite este mês E ainda não foram notificados este mês
    const profiles = (allProfiles || []).filter(p =>
      usersAtLimit.includes(p.id) && p.notif_limite_mes !== currentMonth
    );

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
              title: 'Chegaste ao limite este mês.',
              body: 'Com o Claro+ tens análises ilimitadas — e muito mais. Esta semana com desconto: usa o código CLARO20.',
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
              body: JSON.stringify({ notif_limite_enviada: true, notif_limite_mes: currentMonth }),
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
      message: `Notificações de limite atingido enviadas: ${sent}`,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
