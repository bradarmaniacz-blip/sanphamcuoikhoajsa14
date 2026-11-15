const form = document.getElementById("search-form");
const input = document.getElementById("pokemonSearch");
const result = document.getElementById("pokemon-result");
const historyList = document.getElementById("pokemon-history");
let searchHistoryItems = JSON.parse(localStorage.getItem("pokemonSearchHistory") || "[]");

// hiển thị lịch sử tìm kiếm
function renderSearchHistory() {
    historyList.replaceChildren();
    searchHistoryItems.forEach(function (name) {
        const option = document.createElement("option");
        option.value = name;
        historyList.appendChild(option);
    });
}

renderSearchHistory();

const statLabels = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Special Attack",
    "special-defense": "Special Defense",
    speed: "Speed"
};

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Làm sạch dữ liệu tìm kiếm và không gửi yêu cầu nếu ô tìm kiếm trống.
    const name = input.value.trim().toLowerCase();
    if (!name) {
        result.textContent = "Please enter a Pokémon name or number.";
        return;
    }

    result.textContent = "Loading...";

    try {
        // Lấy thông tin Pokémon, mô tả loài và dữ liệu quan hệ của các hệ từ PokéAPI.
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) throw new Error("Pokémon not found.");
        const pokemon = await response.json();

        searchHistoryItems = [
            pokemon.name,
            ...searchHistoryItems.filter(function (name) {
                return name !== pokemon.name;
            })
        ];
        localStorage.setItem("pokemonSearchHistory", JSON.stringify(searchHistoryItems));
        renderSearchHistory();

        const speciesResponse = await fetch(pokemon.species.url);
        const species = await speciesResponse.json();
        const typeResponses = await Promise.all(pokemon.types.map(function (item) {
            return fetch(item.type.url);
        }));
        const types = await Promise.all(typeResponses.map(function (response) {
            return response.json();
        }));

        const description = species.flavor_text_entries.find(function (entry) {
            return entry.language.name === "en";
        });

        // Gộp các hệ trùng nhau để danh sách điểm yếu và điểm mạnh dễ đọc hơn.
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

        // Hiển thị thông tin Pokémon sau khi các yêu cầu API hoàn tất.
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
        result.textContent = error.message;
    }
});
