document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim().toLowerCase();
        const password = document.getElementById("register-password").value;
        const status = document.querySelector(".auth-form-status");

        if (password.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }

        let accounts;
        try {
            accounts = JSON.parse(localStorage.getItem("account") || "[]");
        } catch (error) {
            status.hidden = false;
            return;
        }

        if (accounts.some(function (account) {
            return account.username === email;
        })) {
            alert("An account with this email already exists.");
            return;
        }

        accounts.push({ username: email, password: password, name: name });

        // Save the new account before leaving the registration page.
        try {
            localStorage.setItem("account", JSON.stringify(accounts));
        } catch (error) {
            status.hidden = false;
            return;
        }

        status.hidden = false;
        window.location.href = "./login.html";
    });
});
