import { Client, Account } from 'node-appwrite';

export default async ({ req, res, log }) => {
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)

  const { userId, secret, action } = req.query; // Parámetros de la URL

   // Manejo de reenvío de email
    if (action === 'resend') {
        try {
            const account = new Account(client);
            await account.createVerification(process.env.DEEP_LINK_BASE);
            return res.send(`
                <html><body>
                    <h1>¡Email reenviado!</h1>
                    <p>Revisa tu bandeja de entrada.</p>
                </body></html>
            `, 200, { 'Content-Type': 'text/html' });
        } catch (error) {
            return res.redirect(process.env.ERROR_REDIRECT_URL);
        }
    }

  try {
    const account = new Account(client);
    await account.updateVerification(userId, secret);
    
    // Redirige a una página de éxito
    return res.redirect(process.env.VERIFICATION_SUCCESS_URL);
  } catch (e) {
    const errorPage = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error de Verificación</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #fff1f1 0%, #ffd3d3 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }
        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 500px;
        }
        h1 {
            color: #f44336;
            margin-bottom: 20px;
        }
        p {
            color: #555;
            font-size: 1.1em;
        }
        .icon {
            font-size: 60px;
            color: #f44336;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #f44336;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #d32f2f;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✗</div>
        <h1>Error de Verificación</h1>
        <p>${error.message}</p>
        <p>El enlace ha expirado o es inválido. Por favor, solicita un nuevo enlace de verificación.</p>
        <a href="${process.env.RESEND_VERIFICATION_ACTION}?userId=${userId}" class="btn">Reenviar Email</a>
    </div>
</body>
</html>
`;
    log(e.message);
    return res.send(errorPage, 400, { 'Content-Type': 'text/html' });
  }
};