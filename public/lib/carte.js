var map = L.map('map').setView([52, -90], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function showTemperature() {
    for (let province in stationJsonMap) {
        try {
            const station_ids = stationJsonMap[province].station_ids;
            for (let id of station_ids) {
                if (stations[id]) {
                    let longitude = stations[id].split('\n')[3].split(',')[0].replace(/"/g, '');
                    let latitude = stations[id].split('\n')[3].split(',')[1].replace(/"/g, '');
                    // var circle = L.circle([latitude, longitude], {
                    //     color: 'red',
                    //     fillColor: '#f03',
                    //     fillOpacity: 0.5,
                    //     radius: 500
                    // }).addTo(map);
                    var marker = L.marker([latitude, longitude]).addTo(map);
                    marker.bindPopup(`<b>${province}</b><br>mettre temp ici`).openPopup();

                    const rss_feed = stationJsonMap[province].rss_feed;

                    // const response = await fetch(`/api/previsions?rss_feed=${rss_feed}`);
                    // if (!response.ok) throw new Error(`Error fetching weather forecast: ${response.statusText}`);

                    // const donneesMeteo = await response.text();
                    // const xmlDoc = parser.parseFromString(donneesMeteo, "application/xml");
                    // if (xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("Error parsing XML");

                    // const entries = xmlDoc.getElementsByTagName("entry");
                    // for (let entry of entries) {
                    //     const category = entry.getElementsByTagName("category")[0].getAttribute("term");
                    //     const summary = entry.getElementsByTagName("summary")[0].textContent;

                    //     switch (category) {
                    //         case "Conditions actuelles":
                    //             // document.getElementById("conditions-actuelles").innerHTML = summary.replace(']]>', '').replace('<![CDATA[', '');
                    //             break;

                    //     }
                    // }
                }
            }
        }
        catch (error) {
            alert("Une erreur est survenue (province: " + province + ").");
            console.error(error.message);
        }
    }
}

let stationJsonMap = {};
document.addEventListener('DOMContentLoaded', async function () {
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