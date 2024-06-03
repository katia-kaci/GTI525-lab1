var listeStations = csvToArray(stations,",",true);
// var listeStations = csvToArray(stations,",",true);
// co  nsole.log(listeStations)


let valeursProvince = csvToArray(StationInventoryEN,'","',false);

let listeProvince = getProvinces();

let listeStationsProvince= [];
let donnee = [];
let donneeUtiliser = [];
afficherProvince()



function test() {

    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];"
    document.getElementById("annee1").innerHTML = donneeUtiliser[0]['"Year"'].replace('"', "").replace('"',"");
    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];
    document.getElementById("annee2").innerHTML = donneeUtiliser[1]['"Year"'].replace('"', "").replace('"',"");
}

function getProvinces(){
  let tab=[];

  for(v in valeursProvince){
    if(valeursProvince[v]['Province']){
      let prov = valeursProvince[v]['Province'].replace('"',"").replace('"',"").trim();
      if(!tab.includes(prov))
        tab.push(prov);
    }
  }
  tab.sort();
  return tab;
}

function csvToArray(donnee,separateur,skipLigne1){
  if(skipLigne1){
    let listSta=[];
    for(i in donnee){
      let valeurs = donnee[i]
    .slice(donnee[i].indexOf('\n') + 1 )
    .split('\n')
    .map(v => v.split(separateur))

    let rows = donnee[i].slice(donnee[i].indexOf('\n') + 1).split('\n');
    let titles = valeurs[0];

    rows.splice(0,1);

    let temp =  rows.map(row => {
      const values = row.split(separateur);
      return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
      });
    
    listSta = listSta.concat(temp);
    }
    return listSta.filter((e)=> e['"Climate ID"'] !== undefined);
    // let valeurs = donnee
    // .slice(donnee.indexOf('\n') + 1 )
    // .split('\n')
    // .map(v => v.split(separateur))

    // let rows = donnee.slice(donnee.indexOf('\n') + 1).split('\n');
    // let titles = valeurs[0];

    // rows.splice(0,1);

    // return rows.map(row => {
    // const values = row.split(separateur);
    // return titles.reduce((obj, actuel, i) => (obj[actuel] = values[i], obj), {})
    // });
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
    listeAfficher = listeAfficher+'<ul> <button value="'+i+'" onclick="afficherNomsStations(this.value)">'+listeProvince[i]+'</button><ul id="province'+i +'" ></ul></ul>';
  }
  document.getElementById("listeprovince").innerHTML = listeAfficher;
  
}

function afficherNomsStations(value) {
  let listeStationsAfficher=[];
  let val = valeursProvince.filter(e => e["Province"] === listeProvince[value])

  val.forEach((element) => {
    let test = listeStations.filter((e)=>e['"Climate ID"'].replace('"',"").replace('"',"") == element["Climate ID"]) //element["Climate ID"].replace('"',"").replace('"',""))//=== element["Climate ID"].replace('"',"").replace('"',"").trim())
    listeStationsAfficher = listeStationsAfficher.concat(test);
  });

  donnee = listeStationsAfficher;


  listeStationsAfficher =[];
  let baliseAfficher = "";
  afficherProvince();
  donnee.map((e)=> {
    if(!listeStationsAfficher.includes(e['"Station Name"'])){
      listeStationsAfficher.push(e['"Station Name"']);
      baliseAfficher = baliseAfficher+ '<ul> <button value="'+e['"Station Name"'].replace('"',"").replace('"',"")+'" onclick="recupererStations(this.value)" >'+e['"Station Name"'].replace('"',"").replace('"',"")+'</button></ul>'
    }
  })
  // onclick="afficherNomsStations(this.value)"
  
  document.getElementById("province"+value).innerHTML = baliseAfficher;


  }

  function recupererStations(value){
    donneeUtiliser = donnee.filter((e)=> e['"Station Name"'].replace('"',"").replace('"',"") === value)
  }


  // obtenirIntervalleAnnee(){
  // }