var stations = csvToArray(stations, ",", true);
let stationInventory = csvToArray(StationInventoryEN, '","', false);

let provinces = getProvinces();
let provinceSelectionnee = [];
let stationSelectionee = stations;

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let years = Array.from(new Set(stations.map((s) => s['"Year"'].replace(/"/g, '')))).sort();
let fromYear = 0, fromMonth = 0, toYear = 3000, toMonth = 11;

afficherProvinces()

let provinceId = 'province-0';
document.getElementById(provinceId).classList.add('special');

afficherStatistique()
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
  fromYearSelector.querySelector('option[value="'+Math.min(...years)+'"]').selected = "selected";
  toYearSelector.querySelector('option[value="'+Math.max(...years)+'"]').selected = "selected";

  fromMonthSelector.addEventListener('change', handleChange);
  toMonthSelector.addEventListener('change', handleChange);
  fromYearSelector.addEventListener('change', handleChange);
  toYearSelector.addEventListener('change', handleChange);
}

function handleChange() {
  if (this === fromMonthSelector) fromMonth = fromMonthSelector.value;
  else if (this === toMonthSelector) toMonth = toMonthSelector.value;
  if (this === fromYearSelector) fromYear = fromYearSelector.value;
  else if (this === toYearSelector) toYear = toYearSelector.value;
  afficherStatistique();
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

function getCodeAeroport(station) {
  for (s in stationInventory) {
    if (s['Station'] == station) {

    }
  }

  // TC ID
}

function afficherProvinces() {
  let htmlButtons = ""
  for (i in provinces) {
    htmlButtons += '<ul> <button id="province-'+i+'" value="' + i + '"  class="province-btn">' + provinces[i] + '</button><ul id="province' + i + '" ></ul></ul>';
    // htmlButtons += '<ul> <button value="' + i + '" onclick="afficherNomsStations(this.value)" class="province-btn">' + provinces[i] + '</button><ul id="province' + i + '" ></ul></ul>';
  }
  document.getElementById("listeprovince").innerHTML = htmlButtons;

  let buttons = document.querySelectorAll('.province-btn');
  let previousButton = null;
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      if (previousButton !== null) {
        previousButton.classList.remove('special');
        previousButton.disabled = false;
      }
      this.classList.add('special');
      this.disabled = true;
      previousButton = this;
      afficherNomsStations(this.value);
    })
  });
}

function afficherNomsStations(value) {
  if (value == 0) {
    stationSelectionee = stations;
  }
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
  document.getElementById('province'+provinceId.split('-')[1]).innerHTML='';
  provinceId = 'province-'+value;
  document.getElementById(provinceId).classList.add('special');
  //afficherProvinces();

  provinceSelectionnee.map((e) => {
    if (!listeStationsAfficher.includes(e['"Station Name"'])) {
      listeStationsAfficher.push(e['"Station Name"']);
      baliseAfficher += '<ul> <button id="' + e['"Station Name"'].replace(/"/g, '') + '" value="' + e['"Station Name"'].replace(/"/g, '') + '" onclick="recupererStations(this.value)">' + e['"Station Name"'].replace(/"/g, '') + '</button></ul>';
    }
  })

  document.getElementById("province" + value).innerHTML = baliseAfficher;
}

let previousButton = null;
function recupererStations(value) {
  stationSelectionee = provinceSelectionnee.filter((e) => e['"Station Name"'].replace(/"/g, '') === value);
  years = Array.from(new Set(stationSelectionee.map((s) => s['"Year"'])));

  // console.log(stationSelectionnee)
  // console.log(years)
  document.getElementById("nom").innerHTML = value;

  if (previousButton !== null) previousButton.classList.remove('special');
  
  document.getElementById(value).classList.add('special');
  previousButton = document.getElementById(value);
  
}

function afficherDonnee() {
  let titreTableDefeaut = '<table><tr><th>Annee-Mois</th><th>Annee</th><th>Mois</th><th>TMaxMoy</th><th>TMinMoy</th><th>TMoy</th><th>TMax</th><th>TMin</th><th>PluieTotal</th><th>NeigeTotale</th><th>VitVentMax</th></tr>';
  let valeurTable = "";

  // Loop through each row of the selected station data
  stationSelectionee.forEach((row) => {
    const anneeMois = row['"Date/Time"'].replace(/"/g, '');
    const annee = row['"Year"'].replace(/"/g, '');
    const mois = row['"Month"'].replace(/"/g, '');
    const tMaxMoy = row['"Mean Max Temp (°C)"'].replace(/"/g, '');
    const tMinMoy = row['"Mean Min Temp (°C)"'].replace(/"/g, '');
    const tMoy = row['"Mean Temp (°C)"'].replace(/"/g, '');
    const tMax = row['"Extr Max Temp (°C)"'].replace(/"/g, '');
    const tMin = row['"Extr Min Temp (°C)"'].replace(/"/g, '');
    const pluieTotal = row['"Total Rain (mm)"'].replace(/"/g, '');
    const neigeTotale = row['"Total Snow (cm)"'].replace(/"/g, '');
    const vitVentMax = row['"Spd of Max Gust (km/h)"'].replace(/"/g, '');

    valeurTable += `<tr>
      <td>${anneeMois}</td>
      <td>${annee}</td>
      <td>${mois}</td>
      <td>${tMaxMoy}</td>
      <td>${tMinMoy}</td>
      <td>${tMoy}</td>
      <td>${tMax}</td>
      <td>${tMin}</td>
      <td>${pluieTotal}</td>
      <td>${neigeTotale}</td>
      <td>${vitVentMax}</td>
    </tr>`;
  });
  let baliseFinale = titreTableDefeaut + valeurTable + '</table>';
  document.getElementById("tableau").innerHTML = baliseFinale;
}

function afficherStatistique() {//sil'y a aucune donne ne rien afficher
  let tempExtreme = { titre: 'Température extrême', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let tempMoyenne = { titre: 'Température moyenne mensuelle', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let qtePluie = { titre: 'Quantité de pluie', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let qteNeige = { titre: 'Quantité de neige', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };
  let vitesseVent = { titre: 'Vitesse du vent', valmax: '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined };

  stationSelectionee.map((e) => {
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
  for (var i = fromMonth; i <= toMonth; i++) {
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
      if (parseInt(e['"Total Snow (cm)"'].replace(/"/g, '')) < parseInt(qteNeige.valmin) && e['"Total Snow (cm)"'].replace(/"/g, '').length > 0) {
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
      if (parseInt(e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').replace('>', "").replace('<', "")) < parseInt(vitesseVent.valmin) && e['"Spd of Max Gust (km/h)"'].replace(/"/g, '').length > 0) {
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
      if (parseInt(e['"Extr Min Temp (°C)"'].replace(/"/g, '')) < parseInt(tempExtreme.valmin) && e['"Extr Min Temp (°C)"'].replace(/"/g, '').length > 0) {
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
      if (parseInt(e['"Mean Temp (°C)"'].replace(/"/g, '')) < parseInt(tempMoyenne.valmin) && e['"Mean Temp (°C)"'].replace(/"/g, '').length > 0) {
        tempMoyenne.valmin = e['"Mean Temp (°C)"'].replace(/"/g, '') + " °C";
        tempMoyenne.anneeMin = e['"Date/Time"'].split("-")[0].replace(/"/g, '');
        tempMoyenne.moisMin = e['"Date/Time"'].split("-")[1].replace(/"/g, '');
      }
    })
    titreTableDefeaut = '<table><tr><th>Donnée</th><th>Valeur maximale</th><th>Année</th><th>Mois</th><th>Valeur minimale</th><th>Année</th><th>Mois</th></tr>'

    valeurTable = '<tr><td>' + tempMoyenne.titre + '</td><td>' + tempMoyenne.valmax + '</td><td>' + tempMoyenne.anneeMax + '</td><td>' + tempMoyenne.moisMax + '</td><td>' + tempMoyenne.valmin + '</td><td>' + tempMoyenne.anneeMin + '</td><td>' + tempMoyenne.moisMin + '</td></tr>';
    valeurTable += '<tr><td>' + tempExtreme.titre + '</td><td>' + tempExtreme.valmax + '</td><td>' + tempExtreme.anneeMax + '</td><td>' + tempExtreme.moisMax + '</td><td>' + tempExtreme.valmin + '</td><td>' + tempExtreme.anneeMin + '</td><td>' + tempExtreme.moisMin + '</td></tr>';
    valeurTable += '<tr><td>' + qtePluie.titre + '</td><td>' + qtePluie.valmax + '</td><td>' + qtePluie.anneeMax + '</td><td>' + qtePluie.moisMax + '</td><td>' + qtePluie.valmin + '</td><td>' + qtePluie.anneeMin + '</td><td>' + qtePluie.moisMin + '</td></tr>';
    valeurTable += '<tr><td>' + qteNeige.titre + '</td><td>' + qteNeige.valmax + '</td><td>' + qteNeige.anneeMax + '</td><td>' + qteNeige.moisMax + '</td><td>' + qteNeige.valmin + '</td><td>' + qteNeige.anneeMin + '</td><td>' + qteNeige.moisMin + '</td></tr>';
    valeurTable += '<tr><td>' + vitesseVent.titre + '</td><td>' + vitesseVent.valmax + '</td><td>' + vitesseVent.anneeMax + '</td><td>' + vitesseVent.moisMax + '</td><td>' + vitesseVent.valmin + '</td><td>' + vitesseVent.anneeMin + '</td><td>' + vitesseVent.moisMin + '</td></tr></table>';
    baliseFinale += titreTableDefeaut + valeurTable;
  }

  document.getElementById("tableau").innerHTML = baliseFinale;
}

function afficherDonnees() {
  let baliseFinale = '<table><tr><th>Année</th><th>Mois</th><th>Température maximale moyenne</th><th>Température minimale moyenne</th><th>Température moyenne</th><th>Température maximale enregistrée</th><th>Température minimale enregistrée</th><th>Pluie totale</th><th>Neige totale</th><th>Vitesse du vent maximale</th></tr>'
  
  const columns = [
    '"Year"', '"Month"', '"Mean Max Temp (°C)"', '"Mean Min Temp (°C)"', '"Mean Temp (°C)"',
    '"Extr Max Temp (°C)"', '"Extr Min Temp (°C)"', '"Total Rain (mm)"', '"Total Snow (cm)"',
    '"Spd of Max Gust (km/h)"'
  ];
  stationSelectionee
    .filter(e => columns.every(col => e[col] !== undefined))
    .map(s => {
      baliseFinale += '<tr><td>' + s['"Year"'].replace(/"/g, '')
        + '</td>' + '<td>' + s['"Month"'].replace(/"/g, '')
        + '</td><td>' + s['"Mean Max Temp (°C)"'].replace(/"/g, '')
        + '</td><td>' + s['"Mean Min Temp (°C)"'].replace(/"/g, '')
        + '</td><td>' + s['"Mean Temp (°C)"'].replace(/"/g, '')
        + '</td><td>' + s['"Extr Max Temp (°C)"'].replace(/"/g, '')
        + '</td><td>' + s['"Extr Min Temp (°C)"'].replace(/"/g, '')
        + '</td><td>' + s['"Total Rain (mm)"'].replace(/"/g, '')
        + '</td><td>' + s['"Total Snow (cm)"'].replace(/"/g, '')
        + '</td><td>' + s['"Spd of Max Gust (km/h)"'].replace(/"/g, '') + '</td></tr>'
    })

  baliseFinale += '</table>';
  document.getElementById("tableau").innerHTML = baliseFinale;
}
