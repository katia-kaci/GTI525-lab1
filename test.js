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
        for (var id of ids) stations.set(id, await csv().fromFile("scripts/" + id + ".csv"));
    } catch (err) {
        console.error("An error occurred when parsing the scripts: ", err);
    }
})();

function getProvinces() {
    var provinces = Array.from(new Set(stationInventory.map(station => station.Province)));
    return provinces.shift().shift();
}

function getStationById(idStation) {
    return stationInventory.filter(station => station.Station_ID === idStation);
}

// rouler node test.js dans le terminal pr lire les console.log
