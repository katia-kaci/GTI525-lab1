const csv = require('csvtojson');
var stations = new Map();
var stationInventory = [];
let provinces = getProvinces();

(async () => {
    try {
        stationInventory = await csv({
            headers: ["Name", "Province", "Climate_ID", "Station_ID", "WMO_ID", "TC_ID", "Latitude (Decimal Degrees)", "Longitude (Decimal Degrees)", "Latitude", "Longitude", "Elevation (m)", "First_Year", "Last_Year", "HLY_First_Year", "HLY_Last_Year", "DLY_First_Year", "DLY_Last_Year", "MLY_First_Year", "MLY_Last_Year"]
        }).fromFile("scripts/Station Inventory EN.csv");

        const ids = ["118", "1865", "2205", "3002", "3328", "3698", "4337", "4789", "4932", "5097", "5251", "5415", "6207", "6358", "6633", "6720"];
        for (var id of ids) {
            stations.set(id, await csv().fromFile("scripts/" + id + ".csv"));
        }
    } catch (err) {
        console.error("An error occurred when parsing the scripts: ", err);
    }
})();

function getProvinces() {
    var provinces = Array.from(new Set(stationInventory.map(station => station.Province)));
    provinces.shift();
    provinces.shift();
    return provinces;
}

function getStationById(idStation, stationInventory) {
    return stationInventory.filter(station => station.Station_ID === idStation);
}

function afficherProvince() {
    let output = ""
    for (i in provinces) {
        output += '<ul> <button value="' + i + '" onclick="afficherNomsStations(this.value)">' + provinces[i] + '</button><ul id="province' + i + '" ></ul></ul>';
    }
    document.getElementById("listeprovince").innerHTML = output;
}

// rouler node test.js dans le terminal pr lire les console.log
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var listeStations = csvToArray(stations, ",", true);
// let valeursProvince = csvToArray(StationInventoryEN, '","', false);

let donnee = [];
let donneeUtiliser = [];

function test2() {
    document.getElementById("annee1").innerHTML = donneeUtiliser[0]['"Year"'].replace('"', "").replace('"', "");
    document.getElementById("annee2").innerHTML = donneeUtiliser[1]['"Year"'].replace('"', "").replace('"', "");
}

function recupererStations(value) {
    donneeUtiliser = donnee.filter((e) => e['"Station Name"'].replace('"', "").replace('"', "") === value)
}

function afficherNomsStations(value) {
    let listeStationsAfficher = [];
    let val = valeursProvince.filter(e => e["Province"] === provinces[value])

    val.forEach((element) => {
        let test = listeStations.filter((e) => e['"Climate ID"'].replace('"', "").replace('"', "") == element["Climate ID"]) //element["Climate ID"].replace('"',"").replace('"',""))//=== element["Climate ID"].replace('"',"").replace('"',"").trim())
        listeStationsAfficher = listeStationsAfficher.concat(test);
    });

    donnee = listeStationsAfficher;


    listeStationsAfficher = [];
    let baliseAfficher = "";
    // showProvinces();
    donnee.map((e) => {
        if (!listeStationsAfficher.includes(e['"Station Name"'])) {
            listeStationsAfficher.push(e['"Station Name"']);
            baliseAfficher = baliseAfficher + '<ul> <button value="' + e['"Station Name"'].replace('"', "").replace('"', "") + '" onclick="recupererStations(this.value)" >' + e['"Station Name"'].replace('"', "").replace('"', "") + '</button></ul>'
        }
    })
    // onclick="afficherNomsStations(this.value)"

    document.getElementById("province" + value).innerHTML = baliseAfficher;
}