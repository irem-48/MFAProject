using Microsoft.AspNetCore.Mvc;
using MFAProject.Services;

namespace MFAProject.Controllers
{
    public class MFAController : Controller
    {
        private readonly EmailService _emailService;

        private static string? generatedCode;
        private static DateTime codeExpireTime;

        public MFAController(EmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendCode()
        {
            generatedCode = new Random().Next(100000, 999999).ToString();
            codeExpireTime = DateTime.Now.AddSeconds(10);

            string targetEmail = "iremnisasozen@gmail.com";

            await _emailService.SendMfaCodeAsync(targetEmail, generatedCode);

            return Json(new
            {
                success = true,
                message = "MFA kodu kayıtlı e-posta adresinize gönderildi. Kod 10 saniye geçerlidir."
            });
        }

        [HttpPost]
        public IActionResult VerifyCode([FromBody] MfaVerifyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return Json(new
                {
                    success = false,
                    message = "MFA kodu boş bırakılamaz."
                });
            }

            if (string.IsNullOrWhiteSpace(generatedCode))
            {
                return Json(new
                {
                    success = false,
                    message = "Önce MFA kodu gönderilmelidir."
                });
            }

            if (DateTime.Now > codeExpireTime)
            {
                generatedCode = null;

                return Json(new
                {
                    success = false,
                    message = "MFA kodunun süresi doldu. Lütfen yeni kod gönderin."
                });
            }

            if (request.Code == generatedCode)
            {
                generatedCode = null;

                return Json(new
                {
                    success = true,
                    message = "MFA doğrulaması başarılı."
                });
            }

            return Json(new
            {
                success = false,
                message = "MFA kodu hatalı. Erişim engellendi."
            });
        }
    }

    public class MfaVerifyRequest
    {
        public string Code { get; set; } = "";
    }
}