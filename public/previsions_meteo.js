var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;

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

    if (previousButton !== null) previousButton.classList.remove('special');
    document.getElementById(value).classList.add('special');
    previousButton = document.getElementById(value);

    showPrevisions();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function showPrevisions() {


}