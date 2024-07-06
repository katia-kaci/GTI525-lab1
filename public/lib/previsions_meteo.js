var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;
let codeAeroportSelectionne = "";
const parser = new DOMParser();

showProvinces()
let provinceId = 'province-0';
document.getElementById(provinceId).classList.add('special');

showPrevisions();

function getProvinces() {
    var provinces = Array.from(new Set(stationInventory.map(station => station['Province'])));
    provinces.sort().pop();
    return ["Toutes les stations"].concat(provinces);
}

function csvToArray(data, separator, skipLigne1) {
    if (skipLigne1) {
        let listSta = [];
        for (i in data) {
            let valeurs = data[i]
                .slice(data[i].indexOf('\n') + 1)
                .split('\n')
                .map(v => v.split(separator))

            let rows = data[i].slice(data[i].indexOf('\n') + 1).split('\n');
            let titles = valeurs[0];
            rows.splice(0, 1);

            let temp = rows.map(row => {
                const values = row.split(separator)
                return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
            });
            listSta = listSta.concat(temp);
        }
        return listSta.filter((e) => e['"Climate ID"'] !== undefined);
    }
    else {
        let valeurs = data
            .slice(data.indexOf('\n') + 1)
            .split('\n')
            .map(v => v.split(separator))

        let rows = data.slice(data.indexOf('\n') + 0).split('\n');
        let titles = valeurs[3];
        rows.splice(0, 5);
        return rows.map(row => {
            const values = row.split(separator);
            return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
        });
    }
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
    listeprovince.innerHTML = '';

    for (let i in provinces) {
        let button = document.createElement('button');
        button.id = 'province-' + i;
        button.value = i;
        button.className = 'province-btn';
        button.textContent = provinces[i];

        let ulContainer = document.createElement('ul');
        ulContainer.appendChild(button);

        let stationList = document.createElement('ul');
        stationList.id = 'province' + i;
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
            document.getElementById("nom").textContent = provinces[button.value];
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
    ancienBtn.classList.remove('special');
    ancienBtn.textContent = provinces[provinceId.split('-')[1]];
    document.getElementById('province' + provinceId.split('-')[1]).innerHTML = '';
    provinceId = 'province-' + value;
    document.getElementById(provinceId).classList.add('special');

    provinceSelectionnee.forEach((e) => {
        if (!listeStationsAfficher.includes(e['"Station Name"'])) {
            listeStationsAfficher.push(e['"Station Name"']);
        }
    });

    listeStationsAfficher.sort();

    let provinceContainer = document.getElementById('province' + value);
    provinceContainer.innerHTML = '';

    listeStationsAfficher.forEach((stationName) => {
        let stationButton = document.createElement('button');
        stationButton.id = stationName.replace(/"/g, '');
        stationButton.value = stationName.replace(/"/g, '');
        stationButton.onclick = function () { getStations(this.value); };
        stationButton.className = 'station-btn';
        stationButton.textContent = `${stationName.replace(/"/g, '')} (${getCodeAeroport(stationName)})`;

        let listItem = document.createElement('ul');
        listItem.appendChild(stationButton);
        provinceContainer.appendChild(listItem);
    });
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
    // avec codeAeroportSelectionne (ex YUL) recuperer les station_ids dans station_mapping.json
    let code = "ab-50" // mettre le bon code selon stationSelectionnee et rss_url dans station_mapping.json

    const response = await fetch(`/api-previsions?code=${code}`);
    if (!response.ok) {
        console.error(`Error fetching weather forecast : ${response.statusText}`);
        return;
    }
    const donneesMeteo = await response.text();

    const xmlDoc = parser.parseFromString(donneesMeteo, "application/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Error parsing XML");
        return;
    }

    document.getElementById("station-name").textContent = "station name"; // changer
    document.getElementById("station-name").href = xmlDoc.getElementsByTagName("link")[0].getAttribute("href");
    document.getElementById("updated").textContent = xmlDoc.getElementsByTagName("updated")[0].innerHTML;

    const entries = xmlDoc.getElementsByTagName("entry");
    for (let entry of entries) {
        const category = entry.getElementsByTagName("category")[0].getAttribute("term");
        switch (category) {
            case "Veilles et avertissements":
                document.getElementById("veilles-et-avertissements").innerHTML = entry.getElementsByTagName("summary")[0].innerHTML;
                break;
            case "Conditions actuelles":
                document.getElementById("conditions-actuelles").innerHTML = entry.getElementsByTagName("summary")[0].innerHTML.replace(']]>', '').replace('<![CDATA[', '');
                break;
            case "Prévisions météo":
                var previsionSommaire = document.createElement("li");
                previsionSommaire.textContent = entry.getElementsByTagName("title")[0].innerHTML;
                document.getElementById("previsions-sommaires").appendChild(previsionSommaire);

                var previsionDetaillee = document.createElement("li");
                previsionDetaillee.textContent = entry.getElementsByTagName("summary")[0].innerHTML;
                document.getElementById("previsions-detaillees").appendChild(previsionDetaillee);
                break;
        }
    }
}