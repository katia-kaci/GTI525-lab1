var stations = {};

// Papa.parse('stations.csv', {
//     complete: function(results) {
//       console.log('Parsed rows:', results.data);
//     }
//   });


//******************J'AI AJOUTER A REVOIR JE TRAVAIL DESSUS LIVE******************************************** */

// document.addEventListener('DOMContentLoaded', function() {
//     const menu = document.getElementById('menu');

//import {stations} from '.6720.csv.js'
// var stations = {};
// var tabStJohn;
// const CSVToArray = (data, separateur, skipPremiereLigne) =>{
//     let valeurs = data
//     .slice(skipPremiereLigne ? data.indexOf('\n') + 1 : 0)
//     .split('\n')
//     .map(v => v.split(separateur))

//     let rows = data.slice(data.indexOf('\n') + 1).split('\n');
//     let titles = valeurs[0];

//     rows.splice(0,1);

//     return rows.map(row => {
//     const values = row.split(separateur);
//     return titles.reduce((object, curr, i) => (object[curr] = values[i], object), {})
//     });
//   };
//   tabStJohn = CSVToArray(stations[6720], ",", true);
//   console.log(tabStJohn[0]);

function test() {
    //console.log('test affichage');
    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];
    document.getElementById("annee1").innerHTML = '1992';
    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];
    document.getElementById("annee2").innerHTML = '1990';
}