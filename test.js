const fs = require("fs");
const csv = require('csvtojson');
const { Parser } = require('json2csv');

(async () => {
    try {
        const data = await csv().fromFile("scripts/Station Inventory EN.csv");
        // console.log(data);

        const dataInCsv = new Parser({ fields: ["Name", "Province", "Climate ID", "Station ID", "WMO ID", "TC ID", "Latitude (Decimal Degrees)", "Longitude (Decimal Degrees)", "Latitude", "Longitude", "Elevation (m)", "First Year", "Last Year", "HLY First Year", "HLY Last Year", "DLY First Year", "DLY Last Year", "MLY First Year", "MLY Last Year"] }).parse(data);
        fs.writeFileSync("scripts/Station Inventory EN.csv", dataInCsv);
        console.log(data);

    } catch (err) {
        console.error("An error occurred:", err);
    }
})();

//rouler node test.js dans le terminal pr lire le csv

