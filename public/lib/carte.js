const parser = new DOMParser();
var map = L.map('map').setView([54, -90], 4);
let previsionsSelectionnees = false, actuellesSelectionnees = true, journeeSelectionnee = false;
let markers = [], conditionsActuelles = [], previsions = [], journees = [];
let previsionSelectionnee = "";

async function showTemperature() {
    for (let province in stationJsonMap) {
        try {
            const station_ids = stationJsonMap[province].station_ids;
            for (let id of station_ids) {
                if (stations[id]) {
                    let longitude = stations[id].split('\n')[3].split(',')[0].replace(/"/g, '');
                    let latitude = stations[id].split('\n')[3].split(',')[1].replace(/"/g, '');
                    var marker = L.marker([latitude, longitude], { icon: createIcon("", "previsions-icon") }).addTo(map);
                    markers.push(marker);

                    let rss_feed = stationJsonMap[province].rss_feed;
                    if (!rss_feed) throw new Error('RSS feed not found for the selected airport.');
                    rss_feed = rss_feed.substring(rss_feed.indexOf("city/")).replace('city/', '').replace('_f.xml', '');

                    const response = await fetch(`/previsions/${rss_feed}`);
                    if (!response.ok) throw new Error(`Error fetching weather forecast: ${response.statusText}`);
                    const donneesMeteo = await response.json();

                    const entries = donneesMeteo.entries;
                    let provinceName = donneesMeteo.title.split('- Météo -')[0].trim();
                    let previsionTxt = "";
                    for (let entry of entries) {
                        const summary = entry.summary;
                        switch (entry.category) {
                            case "Conditions actuelles":
                                conditionsActuelles.push(`<b><u>Conditions actuelles pour ${provinceName} (${province})</u></b><br>${summary.replace(']]>', '').replace('<![CDATA[', '')}`);
                                break;
                            case "Prévisions météo":
                                let sommaire = entry.title;
                                let journee = sommaire.split(':')[0];
                                journees.push(journee);
                                previsionTxt += '<li><b>' + journee + '</b>' + ': ' + summary + '</li>';
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
    chargerBoutons();
    updatePopup();
}

function chargerBoutons() {
    const container = document.getElementById('radio-container')
    journees = Array.from(new Set(journees));
    for (let journee of journees) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = journee;
        radio.name = 'options';
        radio.value = journee;

        const label = document.createElement('label');
        label.htmlFor = journee;
        label.textContent = journee;

        container.appendChild(radio);
        container.appendChild(label);
        container.appendChild(document.createElement('br'))
    }

    const radios = document.querySelectorAll('input[type="radio"][name="options"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                previsionsSelectionnees = radio.value == "option previsions" ? true : false;
                actuellesSelectionnees = radio.value == "option actuelles" ? true : false;
                if (radio.value != "option previsions" && radio.value != "option actuelles") {
                    journeeSelectionnee = true;
                    previsionsSelectionnees = false;
                    actuellesSelectionnees = false;
                    previsionSelectionnee = radio.value;
                }
                else journeeSelectionnee = false;
            }
            updatePopup();
        });
    });
}

function updatePopup() {
    // console.log("update")
    for (let i = 0; i < markers.length; i++) {
        if (previsionsSelectionnees) {
            markers[i].setIcon(createIcon("", "previsions-icon"));
            markers[i].bindPopup(`<div class="scrollable-popup">${previsions[i]}</div>`);
        }
        else if (actuellesSelectionnees) {
            let conditionsString = conditionsActuelles[i];
            const start = conditionsString.indexOf('<b>Température:</b>');
            const end = conditionsString.indexOf('&deg');
            const temperature = conditionsString.substring(start, end).replace('<b>Température:</b>', '').trim() + "°C";
            let updatedIcon;
            if (conditionsString.includes('averses')) updatedIcon = createIcon(temperature, "pluie");
            else updatedIcon = conditionsString.includes('nuage') || conditionsString.includes('Nuage') || conditionsString.includes('brouillard') || conditionsString.includes('Brouillard') ? createIcon(temperature, "cloud") : createIcon(temperature, "sun");
            markers[i].setIcon(updatedIcon);
            markers[i].bindPopup(conditionsString);
        }
        else if (journeeSelectionnee) {
            let lignes = previsions[i].split("<li>");
            console.log(lignes)
            for (let ligne of lignes) {
                if (ligne.includes(previsionSelectionnee + "</b>")) {
                    const start = ligne.includes('Maximum') ? ligne.indexOf('Maximum') : ligne.indexOf('Minimum');
                    let temperature = "";
                    temperature = ligne.substring(start + "Maximum".length).trim().split(' ')[0].replace(".", "") + "°C";

                    let updatedIcon;
                    if (ligne.includes('nuit')) {
                        if (ligne.includes('averses')) updatedIcon = createIcon(temperature, "nuit-nuage-pluie");
                        else updatedIcon = ligne.includes('nuage') || ligne.includes('Nuage') ? createIcon(temperature, "nuit-nuage") : createIcon(temperature, "nuit-degage");
                    }
                    else {
                        if (ligne.includes('averses')) updatedIcon = createIcon(temperature, "pluie");
                        else updatedIcon = ligne.includes('nuage') || ligne.includes('Nuage') ? createIcon(temperature, "cloud") : createIcon(temperature, "sun");
                    }
                    markers[i].setIcon(updatedIcon);
                    markers[i].bindPopup(ligne.replace('</li>', ''));
                }
                if (!previsions[i].includes(previsionSelectionnee + "</b>")) {
                    markers[i].setIcon(createIcon("", "prevision-inconnue"));
                    markers[i].bindPopup("Pas encore de prévisions pour cette journée.");
                }
            }
        }
    }
}

function createIcon(temperature, imageNom) {
    return L.divIcon({
        className: 'custom-icon',
        html: `<img src="images/${imageNom}.png" style="width: 25px; height: 25px;"/> <div style="font-size: 10px; position: absolute; left: 0; bottom: 1; width: 100%; text-align: center;">${temperature}</div>`,
        iconSize: [30, 30]
    });
}

let stationJsonMap = {};
document.addEventListener('DOMContentLoaded', async function () {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

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