document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim().toLowerCase();
        const password = document.getElementById("register-password").value;

        if (password.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }

        const accounts = JSON.parse(localStorage.getItem("account") || "[]");
        if (accounts.some(function (account) {
            return account.username === email;
        })) {
            alert("An account with this email already exists.");
            return;
        }

        accounts.push({ username: email, password: password, name: name });
        localStorage.setItem("account", JSON.stringify(accounts));
        window.location.href = "./login.html";
    });
});
