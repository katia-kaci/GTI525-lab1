var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let years = Array.from(new Set(stations.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
let fromYear = Math.min(...years), toYear = Math.max(...years), fromMonth = 0, toMonth = 11;
let statistiqueChoisis = true;

showProvinces()
let provinceId = 'province-0';
document.getElementById(provinceId).classList.add('special');

showStatistics()
selectDateRange();

function selectDateRange() {
  const fromMonthSelector = document.getElementById('fromMonth');
  const toMonthSelector = document.getElementById('toMonth');
  const fromYearSelector = document.getElementById('fromYear');
  const toYearSelector = document.getElementById('toYear');

  for (var i = 0; i < months.length; i++) {
    var optionTo = document.createElement("option");
    optionTo.value = i;
    optionTo.text = months[i];
    toMonthSelector.appendChild(optionTo);

    var optionFrom = document.createElement("option");
    optionFrom.value = i;
    optionFrom.text = months[i];
    fromMonthSelector.appendChild(optionFrom);
  }

  for (let year of years) {
    var optionTo = document.createElement("option");
    optionTo.value = year;
    optionTo.text = year;
    toYearSelector.appendChild(optionTo);

    var optionFrom = document.createElement("option");
    optionFrom.value = year;
    optionFrom.text = year;
    fromYearSelector.appendChild(optionFrom);
  }

  // Default values
  fromMonthSelector.querySelector('option[value="0"]').selected = "selected";
  toMonthSelector.querySelector('option[value="11"]').selected = "selected";
  fromYearSelector.querySelector('option[value="' + Math.min(...years) + '"]').selected = "selected";
  toYearSelector.querySelector('option[value="' + Math.max(...years) + '"]').selected = "selected";

  fromMonthSelector.addEventListener('change', function () {
    fromMonth = document.getElementById('fromMonth').value
    if (document.getElementById('showData').disabled) showData();
    else if (document.getElementById('showStatistics').disabled) showStatistics();
  });
  toMonthSelector.addEventListener('change', function () {
    toMonth = document.getElementById('toMonth').value
    if (document.getElementById('showData').disabled) showData();
    else if (document.getElementById('showStatistics').disabled) showStatistics();
  });
  fromYearSelector.addEventListener('change', function () {
    fromYear = document.getElementById('fromYear').value
    if (document.getElementById('showData').disabled) showData();
    else if (document.getElementById('showStatistics').disabled) showStatistics();
  });
  toYearSelector.addEventListener('change', function () {
    toYear = document.getElementById('toYear').value
    if (document.getElementById('showData').disabled) showData();
    else if (document.getElementById('showStatistics').disabled) showStatistics();
  });
}

/**
 * Update les filtres quand on clique sur une autre station
 */
function updateDateFilter() {
  years = Array.from(new Set(stationSelectionee.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
  fromMonth = 0;
  toMonth = 11;
  fromYear = Math.min(...years);
  toYear = Math.max(...years);

  document.getElementById('fromYear').querySelector('option[value="' + Math.min(...years) + '"]').selected = "selected";
  document.getElementById('toYear').querySelector('option[value="' + Math.max(...years) + '"]').selected = "selected";
}

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
  let htmlButtons = ""
  for (i in provinces) {
    htmlButtons += '<ul> <button id="province-' + i + '" value="' + i + '"  class="province-btn">' + provinces[i] + '</button><ul id="province' + i + '" ></ul></ul>';
  }
  document.getElementById("listeprovince").innerHTML = htmlButtons;

  let previousSelectedButton = null;
  document.querySelectorAll('.province-btn').forEach(button => {
    button.addEventListener('click', function () {
      // stationSelectionee = provinceSelectionnee.filter((e) => e['"Station Name"'].replace(/"/g, '') === value);
      // update stationSelectionee pour pouvoir faire :
      // updateDateFilter();
      if (previousSelectedButton !== null) {
        previousSelectedButton.classList.remove('special');
        previousSelectedButton.disabled = false;
      }
      this.classList.add('special');
      this.disabled = true;
      previousSelectedButton = this;
      afficherNomsStations(this.value);
    })
  });
}

function afficherNomsStations(value) {
  if (value == 0) stationSelectionee = stations;

  let listeStationsAfficher = [];
  let val = stationInventory.filter(e => e["Province"] === provinces[value])

  val.forEach((element) => {
    let test = stations.filter((e) => e['"Climate ID"'].replace(/"/g, '') == element["Climate ID"])
    listeStationsAfficher = listeStationsAfficher.concat(test);
  });

  provinceSelectionnee = listeStationsAfficher;

  listeStationsAfficher = [];
  let baliseAfficher = "";
  let ancienBtn = document.getElementById(provinceId)
  ancienBtn.classList.remove('special');
  ancienBtn.innerHTML = provinces[provinceId.split('-')[1]];
  document.getElementById('province' + provinceId.split('-')[1]).innerHTML = '';
  provinceId = 'province-' + value;
  document.getElementById(provinceId).classList.add('special');

  provinceSelectionnee.map((e) => {
    if (!listeStationsAfficher.includes(e['"Station Name"'])) {
      listeStationsAfficher.push(e['"Station Name"']);
    }
  })

  listeStationsAfficher.sort().map((e) => {
    baliseAfficher += '<ul> <button id="' + e.replace(/"/g, '') + '" value="' + e.replace(/"/g, '') + '" onclick="getStations(this.value)">' + e.replace(/"/g, '') + " (" + getCodeAeroport(e) + ") " + '</button></ul>';
  })

  document.getElementById("province" + value).innerHTML = baliseAfficher;
}

let previousButton = null;
function getStations(value) {
  stationSelectionee = provinceSelectionnee.filter((e) => e['"Station Name"'].replace(/"/g, '') === value);
  updateDateFilter();

  document.getElementById("nom").innerHTML = value + " (" + getCodeAeroport(value) + ")";

  if (previousButton !== null) previousButton.classList.remove('special');
  document.getElementById(value).classList.add('special');
  previousButton = document.getElementById(value);

  if (statistiqueChoisis) showStatistics();
  else showData();
}

function apresDateDebut(date) {
  const d1 = new Date(date.replace(/"/g, '') + "-1");
  const d2 = new Date(fromYear, fromMonth, 1)
  if (d1.getTime() >= d2.getTime()) return true; // date est apres date debut filtre ou les deux dates sont identiques
  else return false; //  date est avant date debut filtre
}

function avantDateFin(date) {
  const d1 = new Date(date.replace(/"/g, '') + "-1");
  const d2 = new Date(toYear, toMonth, 1)
  if (d1.getTime() > d2.getTime()) return false; // date est apres date debut filtre ou les deux dates sont identiques
  else return true; //  date est avant date debut filtre
}

function showStatistics() {
  document.getElementById("showStatistics").disabled = true;
  document.getElementById("showData").disabled = false;

  // il faut enlever les valeurs par default pcq ca les affiche qd ya pas de donnees qd les filtres sont restreints
  let tempExtreme = { titre: 'Température extrême', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let tempMoyenne = { titre: 'Température moyenne mensuelle', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let qtePluie = { titre: 'Quantité de pluie', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let qteNeige = { titre: 'Quantité de neige', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let vitesseVent = { titre: 'Vitesse du vent', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };

  stationSelectionee
    .filter((s) => apresDateDebut(s['"Date/Time"']))
    .filter((s) => avantDateFin(s['"Date/Time"']))
    .map((e) => {
      if (parseInt(e['"Total Rain (mm)"'].replace(/"/g, '')) > parseInt(qtePluie.valmax) && e['"Total Rain (mm)"'].replace(/"/g, '').length > 0) {
        qtePluie.valmax = e['"Total Rain (mm)"'].replace(/"/g, '') + " mm";
        qtePluie.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        qtePluie.moisMax = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      else if (parseInt(e['"Total Rain (mm)"'].replace(/"/g, '')) < parseInt(qtePluie.valmin) && e['"Total Rain (mm)"'].replace(/"/g, '').length > 0) {
        qtePluie.valmin = e['"Total Rain (mm)"'].replace(/"/g, '') + " mm";
        qtePluie.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        qtePluie.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      //donnee de neige
      if (parseInt(e['"Total Snow (cm)"'].replace(/"/g, '')) > parseInt(qteNeige.valmax) && e['"Total Snow (cm)"'].replace(/"/g, '').length > 0) {
        qteNeige.valmax = e['"Total Snow (cm)"'].replace(/"/g, '') + " cm";
        qteNeige.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        qteNeige.moisMax = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      else if (parseInt(e['"Total Snow (cm)"'].replace(/"/g, '')) < parseInt(qteNeige.valmin) && e['"Total Snow (cm)"'].replace(/"/g, '').length > 0) {
        qteNeige.valmin = e['"Total Snow (cm)"'].replace(/"/g, '') + " cm";
        qteNeige.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        qteNeige.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      //donnee de vent
      if (parseInt(e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "")) > parseInt(vitesseVent.valmax) && e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').length > 0) {
        vitesseVent.valmax = e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "") + " km/h";
        vitesseVent.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        vitesseVent.moisMax = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      else if (parseInt(e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "")) < parseInt(vitesseVent.valmin) && e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').length > 0) {
        vitesseVent.valmin = e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "") + " km/h";
        vitesseVent.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        vitesseVent.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      //donnee de température extreme
      if (parseInt(e['"Extr Max Temp (°C)"'].replace(/"/g, '')) > parseInt(tempExtreme.valmax) && e['"Extr Max Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempExtreme.valmax = e['"Extr Max Temp (°C)"'].replace(/"/g, '') + " °C";
        tempExtreme.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        tempExtreme.moisMax = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      else if (parseInt(e['"Extr Min Temp (°C)"'].replace(/"/g, '')) < parseInt(tempExtreme.valmin) && e['"Extr Min Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempExtreme.valmin = e['"Extr Min Temp (°C)"'].replace(/"/g, '') + " °C";
        tempExtreme.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        tempExtreme.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      //donnee de température moyenne
      if (parseInt(e['"Mean Temp (°C)"'].replace(/"/g, '')) > parseInt(tempMoyenne.valmax) && e['"Mean Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempMoyenne.valmax = e['"Mean Temp (°C)"'].replace(/"/g, '') + " °C";
        tempMoyenne.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        tempMoyenne.moisMax = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
      else if (parseInt(e['"Mean Temp (°C)"'].replace(/"/g, '')) < parseInt(tempMoyenne.valmin) && e['"Mean Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempMoyenne.valmin = e['"Mean Temp (°C)"'].replace(/"/g, '') + " °C";
        tempMoyenne.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        tempMoyenne.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
    })

  //tableau des données en général
  let titreTableDefeaut = '<table><tr><th>Donnée</th><th>Valeur maximale</th><th>Année</th><th>Mois</th><th>Valeur minimale</th><th>Année</th><th>Mois</th></tr>'

  let valeurTable = '<tr><td>' + tempMoyenne.titre + '</td><td>' + tempMoyenne.valmax + '</td><td>' + tempMoyenne.anneeMax + '</td><td>' + tempMoyenne.moisMax + '</td><td>' + tempMoyenne.valmin + '</td><td>' + tempMoyenne.anneeMin + '</td><td>' + tempMoyenne.moisMin + '</td></tr>';
  valeurTable += '<tr><td>' + tempExtreme.titre + '</td><td>' + tempExtreme.valmax + '</td><td>' + tempExtreme.anneeMax + '</td><td>' + tempExtreme.moisMax + '</td><td>' + tempExtreme.valmin + '</td><td>' + tempExtreme.anneeMin + '</td><td>' + tempExtreme.moisMin + '</td></tr>';
  valeurTable += '<tr><td>' + qtePluie.titre + '</td><td>' + qtePluie.valmax + '</td><td>' + qtePluie.anneeMax + '</td><td>' + qtePluie.moisMax + '</td><td>' + qtePluie.valmin + '</td><td>' + qtePluie.anneeMin + '</td><td>' + qtePluie.moisMin + '</td></tr>';
  valeurTable += '<tr><td>' + qteNeige.titre + '</td><td>' + qteNeige.valmax + '</td><td>' + qteNeige.anneeMax + '</td><td>' + qteNeige.moisMax + '</td><td>' + qteNeige.valmin + '</td><td>' + qteNeige.anneeMin + '</td><td>' + qteNeige.moisMin + '</td></tr>';
  valeurTable += '<tr><td>' + vitesseVent.titre + '</td><td>' + vitesseVent.valmax + '</td><td>' + vitesseVent.anneeMax + '</td><td>' + vitesseVent.moisMax + '</td><td>' + vitesseVent.valmin + '</td><td>' + vitesseVent.anneeMin + '</td><td>' + vitesseVent.moisMin + '</td></tr></table>';

  let baliseFinale = titreTableDefeaut + valeurTable;

  //tableau des mois
  // TODO AJOUTER CAS OU CEST LA MM ANNEE ON AFFICHE PAS TT LES MOIS
  for (var i = 0; i <= 11; i++) {
    let tempExtreme = { titre: 'Température extrême', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
    let tempMoyenne = { titre: 'Température moyenne mensuelle', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
    let qtePluie = { titre: 'Quantité de pluie', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
    let qteNeige = { titre: 'Quantité de neige', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
    let vitesseVent = { titre: 'Vitesse du vent', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };

    let listeFiltrer = stationSelectionee.filter((e) => e['"Date/Time"'].split("-")[1].replace(/"/g, '') == '0' + i + 1
      || e['"Date/Time"'].split("-")[1].replace(/"/g, '') == i + 1);

    baliseFinale += '<h1>' + months[i] + '</h1>'

    listeFiltrer.map((e) => {
      if (parseInt(e['"Total Rain (mm)"'].replace(/"/g, '')) > parseInt(qtePluie.valmax) && e['"Total Rain (mm)"'].replace(/"/g, '').length > 0) {
        qtePluie.valmax = e['"Total Rain (mm)"'].replace(/"/g, '') + " mm";
        qtePluie.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      else if (parseInt(e['"Total Rain (mm)"'].replace(/"/g, '')) < parseInt(qtePluie.valmin) && e['"Total Rain (mm)"'].replace(/"/g, '').length > 0) {
        qtePluie.valmin = e['"Total Rain (mm)"'].replace(/"/g, '') + " mm";
        qtePluie.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      //donnee de neige
      if (parseInt(e['"Total Snow (cm)"'].replace(/"/g, '')) > parseInt(qteNeige.valmax) && e['"Total Snow (cm)"'].replace(/"/g, '').length > 0) {
        qteNeige.valmax = e['"Total Snow (cm)"'].replace(/"/g, '') + " cm";
        qteNeige.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      if (parseInt(e['"Total Snow (cm)"'].replace(/"/g, '')) < parseInt(qteNeige.valmin) && e['"Total Snow (cm)"'].replace(/"/g, '').length > 0) {
        qteNeige.valmin = e['"Total Snow (cm)"'].replace(/"/g, '') + " cm";
        qteNeige.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      //donnee de vent
      if (parseInt(e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "")) > parseInt(vitesseVent.valmax) && e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').length > 0) {
        vitesseVent.valmax = e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "") + " km/h";
        vitesseVent.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      if (parseInt(e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "")) < parseInt(vitesseVent.valmin) && e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').length > 0) {
        vitesseVent.valmin = e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "") + " km/h";
        vitesseVent.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      //donnee de température extreme
      if (parseInt(e['"Extr Max Temp (°C)"'].replace(/"/g, '')) > parseInt(tempExtreme.valmax) && e['"Extr Max Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempExtreme.valmax = e['"Extr Max Temp (°C)"'].replace(/"/g, '') + " °C";
        tempExtreme.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      if (parseInt(e['"Extr Min Temp (°C)"'].replace(/"/g, '')) < parseInt(tempExtreme.valmin) && e['"Extr Min Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempExtreme.valmin = e['"Extr Min Temp (°C)"'].replace(/"/g, '') + " °C";
        tempExtreme.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      //donnee de température moyenne
      if (parseInt(e['"Mean Temp (°C)"'].replace(/"/g, '')) > parseInt(tempMoyenne.valmax) && e['"Mean Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempMoyenne.valmax = e['"Mean Temp (°C)"'].replace(/"/g, '') + " °C";
        tempMoyenne.anneeMax = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
      if (parseInt(e['"Mean Temp (°C)"'].replace(/"/g, '')) < parseInt(tempMoyenne.valmin) && e['"Mean Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempMoyenne.valmin = e['"Mean Temp (°C)"'].replace(/"/g, '') + " °C";
        tempMoyenne.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
      }
    })
    titreTableDefeaut = '<table><tr><th>Donnée</th><th>Valeur maximale</th><th>Année</th><th>Valeur minimale</th><th>Année</th></tr>'

    valeurTable = '<tr><td>' + tempMoyenne.titre + '</td><td>' + tempMoyenne.valmax + '</td><td>' + tempMoyenne.anneeMax + '</td><td>' + tempMoyenne.valmin + '</td><td>' + tempMoyenne.anneeMin + '</td></tr>';
    valeurTable += '<tr><td>' + tempExtreme.titre + '</td><td>' + tempExtreme.valmax + '</td><td>' + tempExtreme.anneeMax + '</td><td>' + tempExtreme.valmin + '</td><td>' + tempExtreme.anneeMin + '</td></tr>';
    valeurTable += '<tr><td>' + qtePluie.titre + '</td><td>' + qtePluie.valmax + '</td><td>' + qtePluie.anneeMax + '</td><td>' + qtePluie.valmin + '</td><td>' + qtePluie.anneeMin + '</td></tr>';
    valeurTable += '<tr><td>' + qteNeige.titre + '</td><td>' + qteNeige.valmax + '</td><td>' + qteNeige.anneeMax + '</td><td>' + qteNeige.valmin + '</td><td>' + qteNeige.anneeMin + '</td></tr>';
    valeurTable += '<tr><td>' + vitesseVent.titre + '</td><td>' + vitesseVent.valmax + '</td><td>' + vitesseVent.anneeMax + '</td><td>' + vitesseVent.valmin + '</td><td>' + vitesseVent.anneeMin + '</td></tr></table>';
    baliseFinale += titreTableDefeaut + valeurTable;
  }

  statistiqueChoisis = true;
  document.getElementById("tableau").innerHTML = baliseFinale;
}

function showData() {
  document.getElementById("showStatistics").disabled = false;
  document.getElementById("showData").disabled = true;

  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let headerRow = document.createElement('tr');

  const headers = [
    'Année', 'Mois', 'Temp max moyenne (°C)', 'Temp min moyenne (°C)', 'Temp moyenne (°C)',
    'Temp max enregistrée (°C)', 'Temp min enregistrée (°C)', 'Pluie totale (mm)',
    'Neige totale (cm)', 'Vitesse du vent max (km/h)'
  ];

  headers.forEach(headerText => {
    let th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  let tbody = document.createElement('tbody');

  const columns = [
    '"Year"', '"Month"', '"Mean Max Temp (°C)"', '"Mean Min Temp (°C)"', '"Mean Temp (°C)"',
    '"Extr Max Temp (°C)"', '"Extr Min Temp (°C)"', '"Total Rain (mm)"', '"Total Snow (cm)"',
    '"Spd of Max Gust (km/h)"'
  ];

  stationSelectionee
    .filter((s) => apresDateDebut(s['"Date/Time"']))
    .filter((s) => avantDateFin(s['"Date/Time"']))
    .filter(e => columns.every(col => e[col] !== undefined))
    .forEach(s => {
      let row = document.createElement('tr');
      columns.forEach(col => {
        let cell = document.createElement('td');
        cell.textContent = s[col].replace(/"/g, '');
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });

  table.appendChild(tbody);

  let tableau = document.getElementById("tableau");
  tableau.innerHTML = '';  // Vider le contenu existant
  tableau.appendChild(table);  // Ajouter la nouvelle table

  statistiqueChoisis = false;
}
