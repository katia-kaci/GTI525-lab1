var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;
let codeAeroportSelectionne = "";
let years = Array.from(new Set(stations.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
let year = years[0], month = "01", day = "01";

let idStationsMapper = []; // a voir si on le garde

showProvinces()
let provinceId = 'province-0';
document.getElementById(provinceId).classList.add('special');

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
  //**** */
  getStationsInJson(codeAeroportSelectionne);
  showHistory();
}



/* ----------------------- NOUVELLES FONCTIONS --------------------------------------------------*/

document.addEventListener('DOMContentLoaded', function () {
  let date = document.getElementById("dateChoice");
  date.min = years[0] + '-01-01'
  date.max = years[years.length - 1] + '-12-31'
  date.value = years[0] + '-01-01';

  date.addEventListener('change', function () {
    let tabVal = date.value.split('-');
    year = tabVal[0];
    month = tabVal[1];
    day = tabVal[2];
    console.log(`date: ${day}/${month}/${year}`);
    showHistory();
  })
});

async function showHistory() {
  // let stationId = '51157'; // avec codeAeroportSelectionne (ex YUL) recuperer les station_ids dans station_mapping.json
 
  // il faut prendre juste les 24 premieres lignes de donneesMeteo
  // Exemple: https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=51157&Year=2020&Month=01&Day=07&timeframe=1&submit=%20Download+Data

  // let stationId = idStationsMapper[0]; //pour l'instant mais je vais faire tt les stations après
  // const response = await fetch(`/api-history?stationId=${stationId}&year=${year}&month=${month}&day=${day}`);
  // if (!response.ok) {
  //   console.error(`Error fetching weather history: ${response.statusText}`);
  //   return;
  // }
  // const donneesMeteo = await response.text();
  // let valHistorique = historicalDataToArray(donneesMeteo, day);
  let valHistorique = [];

  for(let i=0; i<idStationsMapper.length;i++){
    let stationId = idStationsMapper[i]; //pour l'instant mais je vais faire tt les stations après
    const response = await fetch(`/api-history?stationId=${stationId}&year=${year}&month=${month}&day=${day}`);
    if (!response.ok) {
      console.error(`Error fetching weather history: ${response.statusText}`);
      return;
    }
    const donneesMeteo = await response.text();
    let temp = historicalDataToArray(donneesMeteo, day);
    if(temp.length == 24){
      valHistorique = temp;
      break;
    }
    else if(i==idStationsMapper.length-1){
      valHistorique = temp;
    }
  }

  if(valHistorique.length ==0){
    valHistorique = emptyValues();
  }
  else valHistorique.map(e=> cleaningData(e));
  
  console.log(valHistorique)
  


  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let headerRow = document.createElement('tr');

  const headers = ['Heure', 'Température réelle', 'Température ressentie', 'Météo', 'Humidité', 'Direction du vent',
    'Vitesse du vent (km/h)', 'Pression atmosphérique'
  ];

  if (valHistorique.length > 0) {
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
      // cellHour.textContent = i + ":00";
      // console.log(valHistorique[i]['"Time (LST)"'])
      cellHour.textContent = valHistorique[i]['"Time (LST)"'].replace(/"/g, '');
      row.appendChild(cellHour);

      // for (let i = 0; i < 7; i++) {
      //   let cell = document.createElement('td');
      //   cell.textContent = "data"; // mettre ici les trucs de donneesMeteo
      //   row.appendChild(cell);
      // }
      let cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Temp (°C)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Dew Point Temp (°C)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Weather"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Rel Hum (%)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Wind Dir (10s deg)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Wind Spd (km/h)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');
      cell.textContent = valHistorique[i]['"Stn Press (kPa)"'].replace(/"/g, ''); // mettre ici les trucs de donneesMeteo
      row.appendChild(cell);
      cell = document.createElement('td');

      tbody.appendChild(row);
    }

    // for (let i = 0; i < 24; i++) {
    //   let row = document.createElement('tr');
    //   let cellHour = document.createElement('td');
    //   cellHour.textContent = i + ":00";
    //   row.appendChild(cellHour);

    //   for (let i = 0; i < 7; i++) {
    //     let cell = document.createElement('td');
    //     cell.textContent = "data"; // mettre ici les trucs de donneesMeteo
    //     row.appendChild(cell);
    //   }

    //   tbody.appendChild(row);
    // }
    table.appendChild(tbody);
    let tableau = document.getElementById("tableau");
    tableau.innerHTML = '';
    tableau.appendChild(table);
  }
  // else {
  //   let tableau = document.getElementById("tableau");
  //   tableau.innerHTML = "<h2>Aucune données historiques disponibles.</h2>";
  // }
}

function updateDateFilter() {
  years = Array.from(new Set(stationSelectionee.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
  year = Math.min(...years);
  month = "01";
  day = "01";

  let date = document.getElementById("dateChoice");
  date.min = years[0] + '-01-01'
  date.max = Math.max(...years) + '-12-31'
  date.value = years[0] + '-01-01';
}

function historicalDataToArray(data, day) {
  let valeurs = data.split('\n').map(e => e.replace('\r', "").split(","));
  let headers = valeurs[0];

  valeurs.splice(0, 1);

  let rows = valeurs;
  let temp = rows.map(row => {
    if (row.length == headers.length)
      return headers.reduce((obj, actuel, i) => (obj[actuel] = row[i], obj), {})
    return headers.reduce((obj, actuel, i) => (obj[actuel] = row[i], obj), {})
  });
  temp = temp.filter(e => e != undefined)
  temp = temp.filter(e => e['"Day"'] != undefined);
  console.log(day)
  let histoData = temp.filter(e => parseInt(e['"Day"'].replace('"', "").replace('"', "")) == day)
  histoData = histoData.filter(e => validateData(e))
  return histoData;
}

function validateData(e) {
  if (e['"Temp (°C)"'] == undefined && (e['"Dew Point Temp (°C)"'] == undefined)
  && (e['"Weather"'] == undefined || e['"Weather"'].replace(/"/g, '') == "NA")
  &&  e['"Rel Hum (%)"'] == undefined && e['"Wind Dir (10s deg)"'] == undefined
  && e['"Wind Spd (km/h)"'] == undefined && e['"Stn Press (kPa)"'] == undefined)
  return false;

  return true;
}

async function getStationsInJson(code) {
  const response = await fetch('/station_mapping');
  let stationJsonMap = await response.json()

  idStationsMapper = stationJsonMap[code]['station_ids'];
}

function cleaningData(e) {
  if (e['"Temp (°C)"'] == undefined) e['"Temp (°C)"'] = "";
  if (e['"Dew Point Temp (°C)"'] == undefined) e['"Dew Point Temp (°C)"'] = "";
  if (e['"Weather"'] == undefined || e['"Weather"'].replace(/"/g, '') == "NA") e['"Weather"'] = "";
  if (e['"Rel Hum (%)"'] == undefined) e['"Rel Hum (%)"'] = "";
  if (e['"Wind Dir (10s deg)"'] == undefined) e['"Wind Dir (10s deg)"'] = "";
  if (e['"Wind Spd (km/h)"'] == undefined) e['"Wind Spd (km/h)"'] = "";
  if (e['"Stn Press (kPa)"'] == undefined) e['"Stn Press (kPa)"'] = "";
}

function emptyValues(){
  let table = [];
  let ajout;

  for(i=0;i<24;i++){
    if(i<10){
      ajout = {
        '"Time (LST)"':'0'+i+':00',
        '"Temp (°C)"': "",
        '"Dew Point Temp (°C)"': "",
        '"Weather"': "",
        '"Rel Hum (%)"': "",
        '"Wind Dir (10s deg)"': "",
        '"Wind Spd (km/h)"': "",
        '"Stn Press (kPa)"': "",
      } 
    }
    else{
      ajout = {
        '"Time (LST)"': i+'00',
        '"Temp (°C)"': "",
        '"Dew Point Temp (°C)"': "",
        '"Weather"': "",
        '"Rel Hum (%)"': "",
        '"Wind Dir (10s deg)"': "",
        '"Wind Spd (km/h)"': "",
        '"Stn Press (kPa)"': "",
      } 
    }
    
    console.log(ajout['"Stn Press (kPa)"']);
    table.push(ajout);
  }

  return table;
}