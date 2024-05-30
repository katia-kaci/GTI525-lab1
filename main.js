//var stations = {};

// Papa.parse('stations.csv', {
//     complete: function(results) {
//       console.log('Parsed rows:', results.data);
//     }
//   });

var tabStJohn = csvToArray(stations[6720],",",true);
var valeursProvince = csvToArray(StationInventoryEN,'","',false);
var listeProvince = getProvinces();

afficherProvince()


function test() {

    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];"
    document.getElementById("annee1").innerHTML = tabStJohn[0]['"Year"'].replace('"', "").replace('"',"");
    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];
    document.getElementById("annee2").innerHTML = '1990';
}

function getProvinces(){
  let tab=[];

  for(v in valeursProvince){
    if(valeursProvince[v]['Province']){
      let prov = valeursProvince[v]['Province'].replace('"',"").replace('"',"").trim();//.replace(" ","")
      if(!tab.includes(prov))
        tab.push(prov);
    }
  }
  tab.sort();
  return tab;
}

function csvToArray(donnee,separateur,skipLigne1){
  if(skipLigne1){
    let valeurs = donnee
    .slice(donnee.indexOf('\n') + 1 )
    .split('\n')
    .map(v => v.split(separateur))

    let rows = donnee.slice(donnee.indexOf('\n') + 1).split('\n');
    let titles = valeurs[0];

    rows.splice(0,1);

    return rows.map(row => {
    const values = row.split(separateur);
    return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
    });
  }

  let valeurs = donnee
    .slice(donnee.indexOf('\n') + 1)
    .split('\n')
    .map(v => v.split(separateur))

    let rows = donnee.slice(donnee.indexOf('\n') + 0).split('\n');
    let titles = valeurs[3];

    rows.splice(0,5);

    return rows.map(row => {
    const values = row.split(separateur);
    return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
    });
}

function afficherProvince() {

  let listeAfficher = ""
  for(i in listeProvince){

    listeAfficher = listeAfficher+"<ul> <button>"+listeProvince[i]+"</button></ul>";
  }
  document.getElementById("listepro").innerHTML = listeAfficher;
  
}