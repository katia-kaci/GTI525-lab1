const parser = new DOMParser();
var map;
let previsionsSelectionnees = false;
let markers = [], conditionsActuelles = [], previsions = [];

async function showTemperature() {
    for (let province in stationJsonMap) {
        try {
            const station_ids = stationJsonMap[province].station_ids;
            for (let id of station_ids) {
                if (stations[id]) {
                    let longitude = stations[id].split('\n')[3].split(',')[0].replace(/"/g, '');
                    let latitude = stations[id].split('\n')[3].split(',')[1].replace(/"/g, '');
                    var marker = L.marker([latitude, longitude]).addTo(map);
                    markers.push(marker);

                    const rss_feed = stationJsonMap[province].rss_feed;
                    const response = await fetch(`/api/previsions?rss_feed=${rss_feed}`);
                    if (!response.ok) throw new Error(`Error fetching weather forecast: ${response.statusText}`);
                    const donneesMeteo = await response.text();
                    const xmlDoc = parser.parseFromString(donneesMeteo, "application/xml");
                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("Error parsing XML");

                    const entries = xmlDoc.getElementsByTagName("entry");
                    let provinceName = xmlDoc.getElementsByTagName("title")[0].textContent.split('-')[0].trim()

                    let previsionTxt = "";
                    for (let entry of entries) {
                        const category = entry.getElementsByTagName("category")[0].getAttribute("term");
                        const summary = entry.getElementsByTagName("summary")[0].textContent;

                        switch (category) {
                            case "Conditions actuelles":
                                conditionsActuelles.push(`<b><u>Conditions actuelles pour ${provinceName} (${province})</u></b><br>${summary.replace(']]>', '').replace('<![CDATA[', '')}`);
                                break;
                            case "Prévisions météo":
                                let sommaire = entry.getElementsByTagName("title")[0].textContent;
                                previsionTxt += '<li><b>' + sommaire.split(':')[0] + '</b>' + ': ' + summary + '</li>';
                                break;
                        }
                    }
                    previsions.push(`<b><u>Prévisions pour ${provinceName} (${province})</u></b><br>${previsionTxt}`);
                }
            }
        }
        catch (error) {
            alert("Une erreur est survenue (province: " + province + ").");
            console.error(error.message);
        }
    }
    updatePopup();
}

function updatePopup() {
    console.log("update")
    for (let i = 0; i < markers.length; i++) {
        if (previsionsSelectionnees) markers[i].bindPopup(`<div class="scrollable-popup">${previsions[i]}</div>`);
        else markers[i].bindPopup(conditionsActuelles[i]);
    }
}

let stationJsonMap = {};
map = L.map('map').setView([55, -90], 4);
document.addEventListener('DOMContentLoaded', async function () {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const radios = document.querySelectorAll('input[type="radio"][name="options"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                previsionsSelectionnees = radio.value == "option previsions" ? true : false;
            }
            updatePopup();
        });
    });

    try {
        const response = await fetch('/station_mapping');
        if (!response.ok) throw new Error(`Error fetching station mapping: ${response.statusText}`);
        stationJsonMap = await response.json();
        showTemperature();
    } catch (error) {
        alert("Une erreur est survenue.");
        console.error(error.message);
    }
});