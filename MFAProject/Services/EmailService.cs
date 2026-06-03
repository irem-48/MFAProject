using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace MFAProject.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendMfaCodeAsync(string toEmail, string code)
        {
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var appPassword = _configuration["EmailSettings:AppPassword"];
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var portText = _configuration["EmailSettings:Port"];

            if (string.IsNullOrWhiteSpace(senderEmail) ||
                string.IsNullOrWhiteSpace(appPassword) ||
                string.IsNullOrWhiteSpace(smtpServer) ||
                string.IsNullOrWhiteSpace(portText))
            {
                throw new Exception("E-posta ayarları eksik. appsettings.json dosyasını kontrol edin.");
            }

            int port = int.Parse(portText);

            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(
                "MFA Güvenli Giriş Sistemi",
                senderEmail
            ));

            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "MFA Doğrulama Kodunuz";

            email.Body = new TextPart("plain")
            {
                Text = $"Güvenli giriş işleminiz için MFA doğrulama kodunuz: {code}"
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(senderEmail, appPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}