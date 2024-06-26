var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;

let codeAeroportSelectionne = "";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let years = Array.from(new Set(stations.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
let year = Math.min(...years), month = 1, day = 1;

showProvinces()
let provinceId = 'province-0';
document.getElementById(provinceId).classList.add('special');

document.addEventListener('DOMContentLoaded', function () {
  const yearSelector = document.getElementById('year');
  const monthSelector = document.getElementById('month');
  const daySelector = document.getElementById('day');

  for (var i = 1; i <= months.length; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = months[i - 1];
    monthSelector.appendChild(option);
  }

  for (var i = 1; i <= 31; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    daySelector.appendChild(option);
  }

  for (let year of years) {
    var option = document.createElement("option");
    option.value = year;
    option.text = year;
    yearSelector.appendChild(option);
  }

  yearSelector.addEventListener('change', function () {
    year = document.getElementById('year').value

    // update les jours si février est sélectionné (année bissextile)
    if (month == 2) {
      let daySelector = document.getElementById('day');
      daySelector.options.length = 0;
      for (var i = 1; i <= getNbJoursDansMois(); i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        daySelector.appendChild(option);
      }
    }

    showHistory();
  });

  monthSelector.addEventListener('change', function () {
    month = document.getElementById('month').value
    // update les jours selon le mois sélectionné
    let daySelector = document.getElementById('day');
    daySelector.options.length = 0;
    for (var i = 1; i <= getNbJoursDansMois(); i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = i;
      daySelector.appendChild(option);
    }
    showHistory();
  });

  daySelector.addEventListener('change', function () {
    day = document.getElementById('day').value
    showHistory();
  });

});

function getNbJoursDansMois() {
  if (month == 2 && year % 4 == 0) return 29;
  else if (month == 2) return 28;
  else if (month == 4 || month == 6 || month == 9 || month == 11) return 30;
  else return 31;
}

async function showHistory() {
  let stationId = '51157'; // avec codeAeroportSelectionne (ex YUL) recuperer les station_ids dans station_mapping.json

  const response = await fetch(`/api-history?stationId=${stationId}&year=${year}&month=${month}&day=${day}`);
  if (!response.ok) {
    console.error(`Error fetching weather history: ${response.statusText}`);
    return;
  }
  const donneesMeteo = await response.text();
  console.log("DONNEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEES");
  console.log(donneesMeteo);
  // il faut prendre juste les 24 premieres lignes de donneesMeteo jsp pk ca affiche plus que 24h je vais demander a la prof jeudi prochain
  // Exemple: https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=51157&Year=2020&Month=01&Day=07&timeframe=1&submit=%20Download+Data

  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let headerRow = document.createElement('tr');

  const headers = ['Heure', 'Température réelle', 'Température ressentie', 'Météo', 'Humidité', 'Direction du vent',
    'Vitesse du vent (km/h)', 'Pression atmosphérique'
  ];

  headers.forEach(headerText => {
    let th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  let tbody = document.createElement('tbody');

  for (let i = 0; i < 24; i++) {
    let row = document.createElement('tr');
    let cellHour = document.createElement('td');
    cellHour.textContent = i + ":00";
    row.appendChild(cellHour);

    for (let i = 0; i < 7; i++) {
      let cell = document.createElement('td');
      cell.textContent = "data"; // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  let tableau = document.getElementById("tableau");
  tableau.innerHTML = '';
  tableau.appendChild(table);
}

function updateDateFilter() {
  years = Array.from(new Set(stationSelectionee.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
  year = Math.min(...years);
  month = 1;
  day = 1;

  // réinitialiser les options du select
  let yearSelector = document.getElementById('year');
  yearSelector.options.length = 0;
  for (let year of years) {
    var option = document.createElement("option");
    option.value = year;
    option.text = year;
    yearSelector.appendChild(option);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  updateDateFilter();

  document.getElementById("nom").textContent = `${value} (${getCodeAeroport(value)})`;
  codeAeroportSelectionne = getCodeAeroport(value);

  if (previousButton !== null) previousButton.classList.remove('special');
  document.getElementById(value).classList.add('special');
  previousButton = document.getElementById(value);

  showHistory();
}
