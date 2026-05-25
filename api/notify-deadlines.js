const { GoogleAuth } = require('google-auth-library');

module.exports = async (req, res) => {
  // Segurança: só aceita chamadas com o token correto
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const PROJECT_ID = 'claro-app-afd0e';

    // 1. Buscar documentos com prazo em 1, 2 ou 3 dias
    const docsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documentos?prazo_dias=lte.3&prazo_dias=gte.1&select=id,titulo,prazo,prazo_dias,user_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        }
      }
    );
    const docs = await docsRes.json();

    if (!docs || docs.length === 0) {
      return res.status(200).json({ message: 'Nenhum prazo próximo', sent: 0 });
    }

    // 2. Para cada documento, buscar o fcm_token do utilizador
    let sent = 0;
    const errors = [];

    // Obter token de acesso do Firebase via service account
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const accessToken = await auth.getAccessToken();

    for (const doc of docs) {
      try {
        // Buscar fcm_token do utilizador
        const profileRes = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${doc.user_id}&select=fcm_token`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
            }
          }
        );
        const profiles = await profileRes.json();
        const fcmToken = profiles?.[0]?.fcm_token;

        if (!fcmToken) continue;

        // Construir mensagem
        const diasText = doc.prazo_dias === 1 ? 'amanhã' : `em ${doc.prazo_dias} dias`;
        const message = {
          message: {
            token: fcmToken,
            notification: {
              title: '⏰ Prazo a aproximar-se',
              body: `"${doc.titulo}" expira ${diasText}. Abre o Claro-app para ver o que fazer.`,
            },
            android: {
              priority: 'high',
            }
          }
        };

        // Enviar via Firebase FCM API v1
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
          sent++;
        } else {
          const err = await fcmRes.json();
          errors.push({ doc: doc.id, error: err });
        }
      } catch (e) {
        errors.push({ doc: doc.id, error: e.message });
      }
    }

    return res.status(200).json({
      message: `Notificações enviadas: ${sent}`,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
