// kiểm tra đăng nhập
const user = localStorage.getItem("checkLogin")
const menuList = document.getElementById("menuList")
const logoutBtn = document.getElementById("logout")

if (user != null) {
    console.log("đã đăng nhập")
    menuList.innerHTML += `
        <li class="nav-item">
            <a class="nav-link" aria-current="page" href="./static/page/profile.html">Profile</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" aria-current="page" href="./static/page/manage-film.html">Quản lý phim</a>
        </li>
    `
    if (logoutBtn) {
        logoutBtn.classList.remove("d-none")
        logoutBtn.addEventListener("click", logout)
    }
} else {
    if (menuList) {
        menuList.innerHTML += `
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="./static/page/login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="./static/page/register.html">Register</a>
            </li>
        `
    }
    if (logoutBtn) {
        logoutBtn.classList.add("d-none")
    }
}

// hàm logout
function logout() {
    localStorage.removeItem("checkLogin")
    window.location.href = "./"
}