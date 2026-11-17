document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const accounts = JSON.parse(localStorage.getItem("account") || "[]");
    const account = accounts.find(function (item) {
        return item.username === email && (item.password || item.pwd) === password;
    });

    if (!account) {
        alert("Email or password is incorrect.");
        return;
    }

    localStorage.setItem("checkLogin", email);
    window.location.href = "./index.html";
});
