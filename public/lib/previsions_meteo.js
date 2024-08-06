var stations = [];
let stationInventory = [];


let provinces = [];
let provinceSelectionnee = [];
let stationSelectionee = [];
let codeAeroportSelectionne = "";
const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

let provinceId = 'province-0';

getAllStationsInventories();

async function getAllStations() {
    let res = await fetch('/stations');
    stations = await res.json();
}

async function getAllStationsInventories() {
    let res = await fetch('/stationsInventories');
    stationInventory = await res.json();
    await getAllStations()
    stationSelectionee = stations;
    provinces = getProvinces();
    showProvinces()
}

function getProvinces() {
    var provinces = Array.from(new Set(stationInventory.map(station => station['Province'])));
    provinces = provinces.filter(province => province !== 'NUNAVUT' && province !== "NORTHWEST TERRITORIES" && province !== "YUKON TERRITORY" && province !== "PRINCE EDWARD ISLAND");
    provinces.sort().pop();
    return provinces;
}

function getCodeAeroport(stationName) {
    let s;
    for (let i = 0; i < stations.length; i++) {
        if (stations[i]['"Station Name"'] == stationName || stations[i]['"Station Name"'].replace(/"/g, '') == stationName) {
            s = stations[i];
            break;
        }
    }
    const climateId = s['"Climate ID"'].replace(/"/g, '');

    for (let i = 0; i < stationInventory.length; i++) {
        if (stationInventory[i]["Climate ID"] == climateId) {
            return stationInventory[i]["TC ID"];
        }
    }
    return "";
}

function showProvinces() {
    let listeprovince = document.getElementById("listeprovince");

    while (listeprovince.firstChild) {
        listeprovince.removeChild(listeprovince.firstChild);
    }

    for (let i in provinces) {
        let button = document.createElement('button');
        button.id = 'province-' + i;
        button.value = i;
        button.className = 'province-btn';
        button.textContent = provinces[i];

        let ulContainer = document.createElement('ul');
        ulContainer.className = 'no-bullets';

        let liButton = document.createElement('li');
        liButton.appendChild(button);
        ulContainer.appendChild(liButton);

        let stationList = document.createElement('ul');
        stationList.id = 'province' + i;
        stationList.className = 'no-bullets';
        ulContainer.appendChild(stationList);

        listeprovince.appendChild(ulContainer);
    }

    let previousSelectedButton = null;
    document.querySelectorAll('.province-btn').forEach(button => {
        button.addEventListener('click', function () {
            if (previousSelectedButton !== null) {
                previousSelectedButton.classList.remove('special');
                previousSelectedButton.disabled = false;
            }
            this.classList.add('special');
            this.disabled = true;
            previousSelectedButton = this;
            afficherNomsStations(this.value);
            document.getElementById("nom").textContent = provinces[this.value];
            codeAeroportSelectionne = "null";
            document.getElementById("aucune-station-selectionnee").style.display = "block";
            showPrevisions();
        });
    });
}

function afficherNomsStations(value) {
    if (value == 0) stationSelectionee = stations;

    let listeStationsAfficher = [];
    let val = stationInventory.filter(e => e["Province"] === provinces[value]);

    val.forEach((element) => {
        let test = stations.filter((e) => e['"Climate ID"'].replace(/"/g, '') == element["Climate ID"]);
        listeStationsAfficher = listeStationsAfficher.concat(test);
    });

    provinceSelectionnee = listeStationsAfficher;

    listeStationsAfficher = [];
    let ancienBtn = document.getElementById(provinceId);
    if (ancienBtn) {
        ancienBtn.classList.remove('special');
        ancienBtn.textContent = provinces[provinceId.split('-')[1]];
    }
    let ancienProvinceContainer = document.getElementById('province' + provinceId.split('-')[1]);
    if (ancienProvinceContainer) {
        while (ancienProvinceContainer.firstChild) {
            ancienProvinceContainer.removeChild(ancienProvinceContainer.firstChild);
        }
    }
    provinceId = 'province-' + value;
    let nouveauProvinceContainer = document.getElementById(provinceId);
    if (nouveauProvinceContainer) {
        nouveauProvinceContainer.classList.add('special');
    }

    provinceSelectionnee.forEach((e) => {
        if (!listeStationsAfficher.includes(e['"Station Name"'])) {
            listeStationsAfficher.push(e['"Station Name"']);
        }
    });

    listeStationsAfficher.sort();

    let provinceContainer = document.getElementById('province' + value);
    if (provinceContainer) {
        while (provinceContainer.firstChild) {
            provinceContainer.removeChild(provinceContainer.firstChild);
        }

        listeStationsAfficher.forEach((stationName) => {
            let stationButton = document.createElement('button');
            stationButton.id = stationName.replace(/"/g, '');
            stationButton.value = stationName.replace(/"/g, '');
            stationButton.onclick = function () { getStations(this.value); };
            stationButton.className = 'station-btn';
            stationButton.textContent = `${stationName.replace(/"/g, '')} (${getCodeAeroport(stationName)})`;

            let listItem = document.createElement('li');
            listItem.appendChild(stationButton);
            provinceContainer.appendChild(listItem);
        });
    }
}

let previousButton = null;
function getStations(value) {
    stationSelectionee = provinceSelectionnee.filter((e) => e['"Station Name"'].replace(/"/g, '') === value);

    document.getElementById("nom").textContent = `${value} (${getCodeAeroport(value)})`;
    codeAeroportSelectionne = getCodeAeroport(value);

    if (previousButton !== null) previousButton.classList.remove('special');
    document.getElementById(value).classList.add('special');
    previousButton = document.getElementById(value);

    showPrevisions();
}



/* ----------------------- NOUVELLES FONCTIONS --------------------------------------------------*/

async function showPrevisions() {
    document.getElementById("infos-previsions").style.visibility = "hidden";
    if (codeAeroportSelectionne === "null") return;

    try {
        let rss_feed = stationJsonMap[codeAeroportSelectionne]?.rss_feed;
        if (!rss_feed) throw new Error('RSS feed not found for the selected airport.');
        rss_feed = rss_feed.substring(rss_feed.indexOf("city/")).replace('city/', '').replace('_f.xml', '');

        const response = await fetch(`/previsions/${rss_feed}`, { cache: "default" });
        if (!response.ok) throw new Error(`Error fetching weather forecast: ${response.statusText}`);
        const donneesMeteo = await response.json();

        document.getElementById("station-name").textContent = donneesMeteo.title;
        document.getElementById("station-name").href = donneesMeteo.link;
        document.getElementById("updated").textContent = getDate(donneesMeteo.updated);

        let veillesEtAvertissements = document.getElementById("veilles-et-avertissements");
        let conditionsActuelles = document.getElementById("conditions-actuelles");
        let previsionsSommaires = document.getElementById("previsions-sommaires");
        let previsionsDetaillees = document.getElementById("previsions-detaillees");

        veillesEtAvertissements.textContent = '';
        conditionsActuelles.textContent = '';
        clearList(previsionsSommaires);
        clearList(previsionsDetaillees);

        for (let entry of donneesMeteo.entries) {
            const category = entry.category;
            const summary = entry.summary;

            switch (category) {
                case "Veilles et avertissements":
                    veillesEtAvertissements.textContent = summary;
                    break;
                case "Conditions actuelles":
                    let conditionsText = summary.replace(']]>', '').replace('<![CDATA[', '');
                    conditionsActuelles.innerHTML = conditionsText;
                    break;
                case "Prévisions météo":
                    let sommaire = entry.title;

                    let previsionSommaire = document.createElement("li");
                    previsionSommaire.textContent = sommaire;
                    previsionsSommaires.appendChild(previsionSommaire);

                    let previsionDetaillee = document.createElement("li");
                    previsionDetaillee.textContent = sommaire.split(':')[0] + ': ' + summary;
                    previsionsDetaillees.appendChild(previsionDetaillee);
                    break;
            }
        }
        document.getElementById("aucune-station-selectionnee").style.display = "none";
        document.getElementById("infos-previsions").style.visibility = "visible";
    }
    catch (error) {
        alert("Une erreur est survenue.");
        console.error(error.message);
    }
}

function clearList(listElement) {
    while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
    }
}

let stationJsonMap = {};
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/station_mapping');
        if (!response.ok) throw new Error(`Error fetching station mapping: ${response.statusText}`);
        stationJsonMap = await response.json();
    } catch (error) {
        alert("Une erreur est survenue.");
        console.error(error.message);
    }
});

function getDate(dateString) {
    let date = new Date(dateString);
    let day = date.getUTCDate();
    let month = monthNames[date.getUTCMonth()]
    let year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    day = day < 10 ? '0' + day : day;
    return `${day} ${month} ${year} à ${hours}:${minutes}:${seconds} (${dateString})`;
}

async function getAllStations() {
    let res = await fetch('/stations')
    stations = await res.json();
}