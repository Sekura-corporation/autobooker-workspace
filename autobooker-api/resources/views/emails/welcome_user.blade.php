<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Autobooker</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f5;
            color: #18181b;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background-color: #820000;
            color: #ffffff;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 32px 24px;
        }
        .content p {
            margin: 0 0 16px;
            color: #3f3f46;
        }
        .credentials {
            background-color: #fafafa;
            border: 1px solid #e4e4e7;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
        }
        .credentials p {
            margin: 0 0 8px;
            font-size: 14px;
        }
        .credentials p:last-child {
            margin: 0;
        }
        .credentials strong {
            color: #18181b;
            font-weight: 600;
            display: inline-block;
            width: 70px;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background-color: #820000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            background-color: #fafafa;
            border-top: 1px solid #e4e4e7;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao Autobooker!</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>{{ $user->name }}</strong>!</p>
            <p>Sua conta administrativa foi criada com sucesso na plataforma Autobooker.</p>
            <p>Abaixo estão suas credenciais de acesso temporárias. Por questões de segurança, recomendamos que você altere sua senha logo após o primeiro login no painel.</p>
            
            <div class="credentials">
                <p><strong>E-mail:</strong> {{ $user->email }}</p>
                <p><strong>Senha:</strong> {{ $password }}</p>
            </div>

            <div class="button-container">
                <a href="{{ env('APP_URL', 'http://localhost:5173') }}/login" class="button">Acessar Painel</a>
            </div>

            <p>Se você tiver alguma dúvida, entre em contato com o administrador que criou sua conta.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Autobooker. Todos os direitos reservados.
        </div>
    </div>
</body>
</html>
