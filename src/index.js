const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const URL_STANDING = "https://api.guildwars2.com/v2/pvp/standings"
const URL_STATS = "https://api.guildwars2.com/v2/pvp/stats"
const URL_SEASON = "https://api.guildwars2.com/v2/pvp/seasons"
const URL_ACCOUNT = "https://api.guildwars2.com/v2/account"
const URL_PROFESSION = "https://api.guildwars2.com/v2/professions"
const URL_MATCH = "https://api.guildwars2.com/v2/pvp/games"
const TOKEN = urlParams.get("api_key")
const ELO_IMG_ELM = document.getElementById("eloImg")
const ELO_POINT_ELM = document.getElementById("eloPoint")
const PROF_ELM = document.getElementById("favoriteProfession")
const LAST_MATCH_ELM = document.getElementById("lastRantingChange")

var seasonID = null
var favoriteProfession = null
var lastIdMatch = null

console.group("INFO")
console.log("Taille de la fenêtre : 300x150")
console.log("Param : api_key")
console.groupEnd()
const ELO = {
    BRONZE: "https://wiki.guildwars2.com/images/1/1e/Bronze_Division_Background.png",
    SILVER: "https://wiki.guildwars2.com/images/c/c3/Silver_Division_Background.png",
    GOLD: "https://wiki.guildwars2.com/images/1/1e/Gold_Division_Background.png",
    PLATINUM: "https://wiki.guildwars2.com/images/e/ed/Platinum_Division_Background.png",
    LEGENDARY: "https://wiki.guildwars2.com/images/6/62/Legendary_Division_Background.png"
}

function getElo(points) {
    if (points <= 900) {
        return ELO.BRONZE
    } else if (points <= 1200) {
        return ELO.SILVER
    } else if (points <= 1500) {
        return ELO.GOLD
    } else if (points <= 1800) {
        return ELO.PLATINUM
    }
    return ELO.LEGENDARY
}

async function getRankedPoint() {
    await fetch(URL_STANDING + "?access_token=" + TOKEN)
        .then(res => res.json())
        .then(res => {
            let points = res.find(el => el.season_id === seasonID).current.rating
            ELO_IMG_ELM.src = getElo(points)
            ELO_POINT_ELM.innerHTML = points
        })
}

async function loadSeasonId() {
    await fetch(URL_SEASON).then(res => res.json())
        .then(res => {
            seasonID = res[res.length - 1]
        })
}

async function loadFavoriteProfessions() {
    await fetch(URL_STATS + "?access_token=" + TOKEN)
        .then(res => res.json())
        .then(res => {
            const professions = res.professions
            const favoriteProfessions = []
            var max = {
                name: "",
                value: 0
            }
            for (const [key, value] of Object.entries(professions)) {
                var sum = 0
                for (const [keyChild, valueChild] of Object.entries(professions[key])) {
                    sum += valueChild
                }
                favoriteProfessions.push({
                    name: key,
                    value: sum
                })
                if (sum > max.value) {
                    max.name = key
                    max.value = sum
                }
            }
            favoriteProfession = max.name
        })
}

async function displayProfession() {
    await fetch(URL_PROFESSION + "/" + favoriteProfession.charAt(0).toUpperCase() + favoriteProfession.slice(1))
        .then(res => res.json())
        .then(res => {
            PROF_ELM.src = res.icon_big
        })
}

async function lastGamePlayed() {
    await fetch(URL_MATCH + "?access_token=" + TOKEN)
        .then(res => res.json())
        .then(res => {
            lastIdMatch = res[0]
        })
}

async function lastGamePlayedInfo() {
    await fetch(URL_MATCH + "?access_token=" + TOKEN + "&ids=" + lastIdMatch)
        .then(res => res.json())
        .then(res => {
            const match = res[0]

            LAST_MATCH_ELM.classList.remove('red')
            LAST_MATCH_ELM.classList.remove('green')

            if (match.rating_type !== "Ranked") {
                LAST_MATCH_ELM.innerHTML = ""
            } else {
                if (match.result === "Victory") {
                    LAST_MATCH_ELM.classList.add('green')
                    LAST_MATCH_ELM.innerHTML = '+'
                } else {
                    LAST_MATCH_ELM.classList.add('red')
                }
                LAST_MATCH_ELM.innerHTML += match.rating_change
            }

        })
}

async function init() {
    if (TOKEN == null) {
        ELO_IMG_ELM.src = "https://wiki.guildwars2.com/images/2/2f/2604564.png"
    } else {
        await loadSeasonId()
        if (seasonID === null) {
            ELO_IMG_ELM.src = "https://wiki.guildwars2.com/images/2/2f/2604564.png"
        } else {
            getRankedPoint()
            await loadFavoriteProfessions()
            displayProfession()
            await lastGamePlayed()
            lastGamePlayedInfo()
            setInterval(async () => {
                getRankedPoint()
                await lastGamePlayed()
                lastGamePlayedInfo()
            }, 180000)
        }
    }
}
init()
setInterval(init,1000*10)
