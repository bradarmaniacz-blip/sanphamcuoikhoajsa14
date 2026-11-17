const form = document.getElementById("search-form");
const input = document.getElementById("pokemonSearch");
const result = document.getElementById("pokemon-result");
const top10Pokemon = document.getElementById("popular-pokemon");
const authNav = document.getElementById("auth-nav");

// Hiển thị nút đăng nhập hoặc đăng xuất theo trạng thái
function renderAuthButton() {
    authNav.replaceChildren();

    if (localStorage.getItem("checkLogin")) {
        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "auth-nav-cta";
        logoutButton.textContent = "Logout";
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("checkLogin");
            renderAuthButton();
        });
        authNav.appendChild(logoutButton);
        return;
    }

    const loginLink = document.createElement("a");
    loginLink.href = "./login.html";
    loginLink.className = "auth-nav-cta";
    loginLink.textContent = "Login";
    authNav.appendChild(loginLink);
}

// Cập nhật thanh điều hướng trước khi đọc các dữ liệu Top 10.
renderAuthButton();

// Chỉ lưu số lượt tìm theo Pokémon; xóa dữ liệu lịch sử từ phiên bản trước nếu có.
localStorage.removeItem("pokemonSearchHistory");
let pokemonSearchCounts = JSON.parse(localStorage.getItem("pokemonSearchCounts") || "{}");

// Hiển thị Top 10 Pokémon
function renderPopularPokemon() {
    top10Pokemon.replaceChildren();

    // Sắp xếp theo lượt tìm giảm dần, rồi lấy tối đa 10 Pokémon đầu tiên.
    Object.entries(pokemonSearchCounts)
        .sort(function (first, second) {
            return second[1] - first[1] || first[0].localeCompare(second[0]);
        })
        .slice(0, 10)
        .forEach(function (entry) {
            const item = document.createElement("li");
            item.textContent = `${entry[0]} - ${entry[1]} lượt tìm kiếm`;
            top10Pokemon.appendChild(item);
        });
}

// Hiển thị Top 10 đã lưu ngay khi mở trang.
renderPopularPokemon();

// Tên dễ đọc cho các chỉ số
const statLabels = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Special Attack",
    "special-defense": "Special Defense",
    speed: "Speed"
};

// Xử lý tìm kiếm Pokémon
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Chuẩn hóa nội dung và dừng nếu ô tìm kiếm đang trống.
    const name = input.value.trim().toLowerCase();
    if (!name) {
        result.textContent = "Please enter a Pokémon name or number.";
        return;
    }

    result.textContent = "Loading...";

    try {
        // Tải dữ liệu Pokémon; truy vấn không hợp lệ sẽ chuyển sang phần báo lỗi.
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) throw new Error("Pokémon not found.");
        const pokemon = await response.json();

        // Ghi nhận lượt tìm thành công vào localStorage rồi cập nhật Top 10.
        pokemonSearchCounts[pokemon.name] = (pokemonSearchCounts[pokemon.name] || 0) + 1;
        localStorage.setItem("pokemonSearchCounts", JSON.stringify(pokemonSearchCounts));
        renderPopularPokemon();

        // Tải mô tả loài và thông tin tương quan của các hệ Pokémon.
        const speciesResponse = await fetch(pokemon.species.url);
        const species = await speciesResponse.json();
        const typeResponses = await Promise.all(pokemon.types.map(function (item) {
            return fetch(item.type.url);
        }));
        const types = await Promise.all(typeResponses.map(function (typeResponse) {
            return typeResponse.json();
        }));

        const description = species.flavor_text_entries.find(function (entry) {
            return entry.language.name === "en";
        });

        // Gộp hệ trùng nhau để danh sách điểm yếu và điểm mạnh không bị lặp.
        const weaknesses = [...new Set(types.flatMap(function (type) {
            return type.damage_relations.double_damage_from.map(function (item) {
                return item.name;
            });
        }))];
        const strengths = [...new Set(types.flatMap(function (type) {
            return type.damage_relations.double_damage_to.map(function (item) {
                return item.name;
            });
        }))];

        // Hiển thị thông tin sau khi các dữ liệu liên quan đã được tải xong.
        result.innerHTML = `
            <div class="card pokemon-card">
                <div class="row align-items-start">
                    <div class="col">
                        <img class="pokemon-image" src="${pokemon.sprites.front_default || ""}" alt="${pokemon.name}">
                    </div>
                    <div class="col">
                        <div class="card-body">
                            <h2 class="card-title">${pokemon.name} (#${pokemon.id})</h2>
                            <p><b>Description:</b> ${description ? description.flavor_text.replace(/[\n\f]/g, " ") : "Unknown"}</p>
                            <p><b>Type:</b> ${pokemon.types.map(function (item) { return item.type.name; }).join(", ")}</p>
                            <p><b>Weak to:</b> ${weaknesses.join(", ") || "None"}</p>
                            <p><b>Strong against:</b> ${strengths.join(", ") || "None"}</p>
                            <p><b>Height: </b>${pokemon.height / 10} m</p>
                            <p><b>Weight:</b> ${pokemon.weight / 10} kg</p>
                            <p><b>Abilities:</b> ${pokemon.abilities.map(function (item) { return item.ability.name; }).join(", ")}</p>
                            <p class="pokemon-stats">${pokemon.stats.map(function (item) {
                                return `<b>${statLabels[item.stat.name] || item.stat.name}</b>: ${item.base_stat}`;
                            }).join(" | ")}</p>
                        </div>
                    </div>
                </div>
            </div>`;
    } catch (error) {
        // Hiển thị lỗi tìm kiếm hoặc lỗi tải dữ liệu liên quan.
        result.textContent = error.message;
    }
});
