const correctUsername = "irem@mfa.com";
const correctPassword = "MaviKedi@2026";
const correctPassphrase = "Bugun siber guvenlik projemi tamamliyorum.";
const correctSecurityAnswer = "dali";

let timerInterval;
let remainingTime = 10;
let failedLoginAttempts = 0;
let accountLocked = false;

function showMessage(text, type = "error") {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.color = type === "success" ? "#86efac" : "#fecaca";
}

function clearMessage() {
    document.getElementById("message").textContent = "";
}

function handleFailedLogin(reason) {
    failedLoginAttempts++;

    if (failedLoginAttempts >= 3) {
        accountLocked = true;
        showMessage("3 başarısız giriş denemesi nedeniyle hesap kilitlendi.");
        return;
    }

    showMessage(`${reason} Kalan deneme hakkı: ${3 - failedLoginAttempts}`);
}

function startTimer() {
    clearInterval(timerInterval);

    remainingTime = 10;
    document.getElementById("timer").textContent = remainingTime;

    timerInterval = setInterval(function () {
        remainingTime--;
        document.getElementById("timer").textContent = remainingTime;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            showMessage("MFA kodunun süresi doldu. Lütfen yeni kod gönderin.");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateStep(stepNumber) {
    for (let i = 1; i <= 4; i++) {
        document.getElementById("step" + i).classList.remove("active");
    }

    document.getElementById("step" + stepNumber).classList.add("active");
}

function isWeakPassword(password) {
    const usePassphrase = document.getElementById("usePassphrase").checked;
    const weakPasswords = ["123456", "password", "admin", "abc123", "qwerty", "111111"];

    if (weakPasswords.includes(password.toLowerCase())) return true;

    if (usePassphrase) {
        const wordCount = password.trim().split(/\s+/).length;
        if (password.length < 20) return true;
        if (wordCount < 3) return true;
        return false;
    }

    if (password.length < 8) return true;
    return false;
}

function checkPasswordStrength(password) {
    const strengthBox = document.getElementById("passwordStrength");
    const usePassphrase = document.getElementById("usePassphrase").checked;

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (password.length === 0) {
        strengthBox.textContent = "";
        strengthBox.className = "info-box";
        return;
    }

    if (isWeakPassword(password)) {
        strengthBox.textContent = usePassphrase
            ? "Zayıf passphrase: En az 20 karakter ve 3 kelimeden oluşmalıdır."
            : "Zayıf parola: Daha güçlü bir parola veya passphrase kullanın.";

        strengthBox.className = "info-box weak";
        return;
    }

    if (usePassphrase) {
        strengthBox.textContent = "Güçlü passphrase: Uzun ve tahmin edilmesi zor.";
        strengthBox.className = "info-box strong";
        return;
    }

    if (password.length >= 12 && hasUpper && hasLower && hasNumber && hasSpecial) {
        strengthBox.textContent = "Güçlü parola: MFA adımına geçmek için uygundur.";
        strengthBox.className = "info-box strong";
    } else {
        strengthBox.textContent = "Orta seviye parola: Büyük/küçük harf, sayı ve özel karakter ekleyin.";
        strengthBox.className = "info-box medium";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const passphraseCheckbox = document.getElementById("usePassphrase");

    passwordInput.addEventListener("input", function () {
        checkPasswordStrength(passwordInput.value);
    });

    passphraseCheckbox.addEventListener("change", function () {
        checkPasswordStrength(passwordInput.value);
    });
});

function checkLogin() {
    clearMessage();

    if (accountLocked) {
        showMessage("Hesap güvenlik nedeniyle kilitlendi. Demo yeniden başlatılmalıdır.");
        return;
    }

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const usePassphrase = document.getElementById("usePassphrase").checked;

    if (username === "" || password === "") {
        showMessage("E-posta adresi ve parola/passphrase boş bırakılamaz.");
        return;
    }

    if (isWeakPassword(password)) {
        showMessage("Bu parola/passphrase zayıf olduğu için girişe izin verilmedi.");
        return;
    }

    if (username !== correctUsername) {
        handleFailedLogin("E-posta adresi hatalı.");
        return;
    }

    if (!usePassphrase && password !== correctPassword) {
        handleFailedLogin("Parola hatalı.");
        return;
    }

    if (usePassphrase && password !== correctPassphrase) {
        handleFailedLogin("Passphrase hatalı.");
        return;
    }

    failedLoginAttempts = 0;

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("securityBox").classList.remove("hidden");
    updateStep(2);
    showMessage("Parola/passphrase doğrulandı. Güvenlik sorusu adımına geçildi.", "success");
}

async function checkSecurityQuestion() {
    clearMessage();

    const answer = document.getElementById("securityAnswer").value.trim().toLowerCase();

    if (answer === "") {
        showMessage("Güvenlik sorusu cevabı boş bırakılamaz.");
        return;
    }

    if (answer !== correctSecurityAnswer) {
        showMessage("Güvenlik sorusu cevabı hatalı. Erişim devam ettirilemez.");
        return;
    }

    try {
        const response = await fetch("/MFA/SendCode", {
            method: "POST"
        });

        const result = await response.json();

        if (!result.success) {
            showMessage("MFA kodu gönderilemedi.");
            return;
        }

        document.getElementById("securityBox").classList.add("hidden");
        document.getElementById("mfaBox").classList.remove("hidden");
        updateStep(3);
        showMessage(result.message, "success");
        startTimer();

    } catch (error) {
        showMessage("Sunucuya bağlanırken hata oluştu.");
    }
}

async function checkMFA() {
    clearMessage();

    const code = document.getElementById("mfaCode").value.trim();

    if (code === "") {
        showMessage("MFA kodu boş bırakılamaz.");
        return;
    }

    try {
        const response = await fetch("/MFA/VerifyCode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code: code })
        });

        const result = await response.json();

        if (!result.success) {
            showMessage(result.message);
            return;
        }

        document.getElementById("mfaBox").classList.add("hidden");
        document.getElementById("successBox").classList.remove("hidden");
        updateStep(4);
        stopTimer();
        showMessage(result.message, "success");

    } catch (error) {
        showMessage("Sunucuya bağlanırken hata oluştu.");
    }
}

async function resendCode() {
    clearMessage();

    try {
        const response = await fetch("/MFA/SendCode", {
            method: "POST"
        });

        const result = await response.json();

        if (!result.success) {
            showMessage("Yeni MFA kodu gönderilemedi.");
            return;
        }

        document.getElementById("mfaCode").value = "";
        startTimer();
        showMessage("Yeni MFA kodu e-posta adresinize gönderildi. Kod 10 saniye geçerlidir.", "success");

    } catch (error) {
        showMessage("Sunucuya bağlanırken hata oluştu.");
    }
}

function openStudentPanel() {
    document.getElementById("successBox").classList.add("hidden");
    document.getElementById("studentPanel").classList.remove("hidden");
    clearMessage();
}

function restartDemo() {
    stopTimer();

    failedLoginAttempts = 0;
    accountLocked = false;

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("securityAnswer").value = "";
    document.getElementById("mfaCode").value = "";

    document.getElementById("passwordStrength").textContent = "";
    document.getElementById("passwordStrength").className = "info-box";

    document.getElementById("successBox").classList.add("hidden");
    document.getElementById("studentPanel").classList.add("hidden");
    document.getElementById("securityBox").classList.add("hidden");
    document.getElementById("mfaBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");

    updateStep(1);
    clearMessage();
}

function togglePassword(button) {
    const passwordInput = document.getElementById("password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        button.textContent = "Parolayı Gizle";
    } else {
        passwordInput.type = "password";
        button.textContent = "Parolayı Göster";
    }
}