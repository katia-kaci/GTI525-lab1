var listeStations = csvToArray(stations,",",true);
// var listeStations = csvToArray(stations,",",true);
// console.log(listeStations)

let valeursProvince = csvToArray(StationInventoryEN,'","',false);

let listeProvince = getProvinces();

let listeStationsProvince= [];
let donnee = [];
let donneeUtiliser = listeStations;

const listeMois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

afficherProvince()



function test() {

    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];"
    document.getElementById("annee1").innerHTML = donneeUtiliser[0]['"Year"'].replace('"', "").replace('"',"");
    //document.getElementById("max").innerHTML = tabStJohn[0]['"Extr Min Temp (°C)"'];
    document.getElementById("annee2").innerHTML = donneeUtiliser[1]['"Year"'].replace('"', "").replace('"',"");
}

function getProvinces(){
  let tabFinal= ["Toutes les stations"]
  let tab=[];

  for(v in valeursProvince){
    if(valeursProvince[v]['Province']){
      let prov = valeursProvince[v]['Province'].replace('"',"").replace('"',"").trim();
      if(!tab.includes(prov))
        tab.push(prov);
    }
  }
  tab.sort();
  return tabFinal.concat(tab);
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
  if(value ==0){
    donneeUtiliser = listeStations;
  }
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
  
  document.getElementById("province"+value).innerHTML = baliseAfficher;

}

  function recupererStations(value){
    donneeUtiliser = donnee.filter((e)=> e['"Station Name"'].replace('"',"").replace('"',"") === value);
    document.getElementById("nom").innerHTML = value;

  }


  function afficherStatistique(){
    let tempExtreme = {titre:'Température extrême' ,valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
    let tempMoyenne= {titre:'Température moyenne mensuelle', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
    let quantPluie= {titre:'Quantité de pluie', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
    let quantNeige= {titre:'Quantité de neige', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
    let vitesseVent= {titre:'Vitesse du vent', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};


    
    donneeUtiliser.map((e)=>{
      if(e['"Total Rain (mm)"'].replace('"',"").replace('"',"")>quantPluie.valmax && e['"Total Rain (mm)"'].replace('"',"").replace('"',"").length>0){
        quantPluie.valmax= e['"Total Rain (mm)"'].replace('"',"").replace('"',"")+"(mm)";
        quantPluie.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        quantPluie.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");

      }
      if(e['"Total Rain (mm)"'].replace('"',"").replace('"',"")<quantPluie.valmin && e['"Total Rain (mm)"'].replace('"',"").replace('"',"").length>0){
        quantPluie.valmin= e['"Total Rain (mm)"'].replace('"',"").replace('"',"")+"(mm)";
        quantPluie.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        quantPluie.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
      }
      //donnee de neige
      if(e['"Total Snow (cm)"'].replace('"',"").replace('"',"")>quantNeige.valmax && e['"Total Snow (cm)"'].replace('"',"").replace('"',"").length>0){
        quantNeige.valmax= e['"Total Snow (cm)"'].replace('"',"").replace('"',"")+"(cm)";
        quantNeige.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        quantNeige.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");

      }
      if(e['"Total Snow (cm)"'].replace('"',"").replace('"',"")<quantNeige.valmin && e['"Total Snow (cm)"'].replace('"',"").replace('"',"").length>0){
        quantNeige.valmin = e['"Total Snow (cm)"'].replace('"',"").replace('"',"")+"(cm)";
        quantNeige.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        quantNeige.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
      }
      //donnee de vent
      if(e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")>vitesseVent.valmax && e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"").length>0){
        vitesseVent.valmax= e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")+"(km/h)";
        vitesseVent.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        vitesseVent.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");

      }
      if(e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")<vitesseVent.valmin && e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"").length>0){
        vitesseVent.valmin = e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")+"(km/h)";
        vitesseVent.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        vitesseVent.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
      }
      //donnee de température extreme
      if(e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"")>tempExtreme.valmax && e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"").length>0){
        tempExtreme.valmax= e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
        tempExtreme.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        tempExtreme.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");

      }
      if(e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"")<tempExtreme.valmin && e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"").length>0){
        tempExtreme.valmin = e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
        tempExtreme.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        tempExtreme.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
      }
      //donnee de température moyenne
      if(e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"")>tempMoyenne.valmax && e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"").length>0){
        tempMoyenne.valmax= e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
        tempMoyenne.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        tempMoyenne.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");

      }
      if(e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"")<tempMoyenne.valmin && e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"").length>0){
        tempMoyenne.valmin = e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
        tempMoyenne.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
        tempMoyenne.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
      }
    })

    //tableau des données en général
    let titreTableDefeaut = '<table><tr><th>Donnée</th><th>Valeur maximale</th><th>Année</th><th>Mois</th><th>Valeur minimale</th><th>Année</th><th>Mois</th></tr>'
    
    let valeurTable= '<tr><td>'+tempMoyenne.titre+'</td><td>'+tempMoyenne.valmax+'</td><td>'+tempMoyenne.anneeMax+'</td><td>'+tempMoyenne.moisMax+'</td><td>'+tempMoyenne.valmin+'</td><td>'+tempMoyenne.anneeMin+'</td><td>'+tempMoyenne.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+tempExtreme.titre+'</td><td>'+tempExtreme.valmax+'</td><td>'+tempExtreme.anneeMax+'</td><td>'+tempExtreme.moisMax+'</td><td>'+tempExtreme.valmin+'</td><td>'+tempExtreme.anneeMin+'</td><td>'+tempExtreme.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+quantPluie.titre+'</td><td>'+quantPluie.valmax+'</td><td>'+quantPluie.anneeMax+'</td><td>'+quantPluie.moisMax+'</td><td>'+quantPluie.valmin+'</td><td>'+quantPluie.anneeMin+'</td><td>'+quantPluie.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+quantNeige.titre+'</td><td>'+quantNeige.valmax+'</td><td>'+quantNeige.anneeMax+'</td><td>'+quantNeige.moisMax+'</td><td>'+quantNeige.valmin+'</td><td>'+quantNeige.anneeMin+'</td><td>'+quantNeige.moisMin+'</td></tr>';
    // valeurTable= valeurTable+ '<tr><td>'+vitesseVent.titre+'</td><td>'+vitesseVent.valmax+'</td><td>'+vitesseVent.anneeMax+'</td><td>'+vitesseVent.moisMax+'</td><td>'+vitesseVent.valmin+'</td><td>'+vitesseVent.anneeMin+'</td><td>'+vitesseVent.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+vitesseVent.titre+'</td><td>'+vitesseVent.valmax+'</td><td>'+vitesseVent.anneeMax+'</td><td>'+vitesseVent.moisMax+'</td><td>'+vitesseVent.valmin+'</td><td>'+vitesseVent.anneeMin+'</td><td>'+vitesseVent.moisMin+'</td></tr></table>';
    
    // document.getElementById("tableStats").innerHTML = titreTableDefeaut+valeurTable;

    let baliseFinale = titreTableDefeaut+valeurTable;

    console.log('La date: '+listeMois[new Date().getMonth()]);

    //tableau des mois
    for(var i=0;i<12;i++){
      let tempExtreme = {titre:'Température extrême' ,valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
      let tempMoyenne= {titre:'Température moyenne mensuelle', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
      let quantPluie= {titre:'Quantité de pluie', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
      let quantNeige= {titre:'Quantité de neige', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
      let vitesseVent= {titre:'Vitesse du vent', valmax : '-10000', anneeMax: undefined, moisMax: undefined, valmin: '10000', anneeMin: undefined, moisMin: undefined};
      
      
      let listeFiltrer = donneeUtiliser.filter((e)=>e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"") == '0'+i+1 
      || e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"") == i+1);
      

      baliseFinale= baliseFinale+'<h1>'+listeMois[i]+'</h1>'

      listeFiltrer.map((e)=>{
        if(e['"Total Rain (mm)"'].replace('"',"").replace('"',"")>quantPluie.valmax && e['"Total Rain (mm)"'].replace('"',"").replace('"',"").length>0){
          quantPluie.valmax= e['"Total Rain (mm)"'].replace('"',"").replace('"',"")+"(mm)";
          quantPluie.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          quantPluie.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
  
        }
        if(e['"Total Rain (mm)"'].replace('"',"").replace('"',"")<quantPluie.valmin && e['"Total Rain (mm)"'].replace('"',"").replace('"',"").length>0){
          quantPluie.valmin= e['"Total Rain (mm)"'].replace('"',"").replace('"',"")+"(mm)";
          quantPluie.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          quantPluie.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
        }
        //donnee de neige
        if(e['"Total Snow (cm)"'].replace('"',"").replace('"',"")>quantNeige.valmax && e['"Total Snow (cm)"'].replace('"',"").replace('"',"").length>0){
          quantNeige.valmax= e['"Total Snow (cm)"'].replace('"',"").replace('"',"")+"(cm)";
          quantNeige.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          quantNeige.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
  
        }
        if(e['"Total Snow (cm)"'].replace('"',"").replace('"',"")<quantNeige.valmin && e['"Total Snow (cm)"'].replace('"',"").replace('"',"").length>0){
          quantNeige.valmin = e['"Total Snow (cm)"'].replace('"',"").replace('"',"")+"(cm)";
          quantNeige.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          quantNeige.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
        }
        //donnee de vent
        if(e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")>vitesseVent.valmax && e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"").length>0){
          vitesseVent.valmax= e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")+"(km/h)";
          vitesseVent.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          vitesseVent.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
  
        }
        if(e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")<vitesseVent.valmin && e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"").length>0){
          vitesseVent.valmin = e['"Spd of Max Gust (km/h)"'].replace('"',"").replace('"',"")+"(km/h)";
          vitesseVent.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          vitesseVent.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
        }
        //donnee de température extreme
        if(e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"")>tempExtreme.valmax && e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"").length>0){
          tempExtreme.valmax= e['"Extr Max Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
          tempExtreme.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          tempExtreme.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
  
        }
        if(e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"")<tempExtreme.valmin && e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"").length>0){
          tempExtreme.valmin = e['"Extr Min Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
          tempExtreme.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          tempExtreme.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
        }
        //donnee de température moyenne
        if(e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"")>tempMoyenne.valmax && e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"").length>0){
          tempMoyenne.valmax= e['"Mean Max Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
          tempMoyenne.anneeMax= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          tempMoyenne.moisMax= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
  
        }
        if(e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"")<tempMoyenne.valmin && e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"").length>0){
          tempMoyenne.valmin = e['"Mean Min Temp (°C)"'].replace('"',"").replace('"',"")+"(°C)";
          tempMoyenne.anneeMin= e['"Date/Time"'].split("-")[0].replace('"',"").replace('"',"");
          tempMoyenne.moisMin= e['"Date/Time"'].split("-")[1].replace('"',"").replace('"',"");
        }
      })
    titreTableDefeaut = '<table><tr><th>Donnée</th><th>Valeur maximale</th><th>Année</th><th>Mois</th><th>Valeur minimale</th><th>Année</th><th>Mois</th></tr>'
    
    valeurTable= '<tr><td>'+tempMoyenne.titre+'</td><td>'+tempMoyenne.valmax+'</td><td>'+tempMoyenne.anneeMax+'</td><td>'+tempMoyenne.moisMax+'</td><td>'+tempMoyenne.valmin+'</td><td>'+tempMoyenne.anneeMin+'</td><td>'+tempMoyenne.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+tempExtreme.titre+'</td><td>'+tempExtreme.valmax+'</td><td>'+tempExtreme.anneeMax+'</td><td>'+tempExtreme.moisMax+'</td><td>'+tempExtreme.valmin+'</td><td>'+tempExtreme.anneeMin+'</td><td>'+tempExtreme.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+quantPluie.titre+'</td><td>'+quantPluie.valmax+'</td><td>'+quantPluie.anneeMax+'</td><td>'+quantPluie.moisMax+'</td><td>'+quantPluie.valmin+'</td><td>'+quantPluie.anneeMin+'</td><td>'+quantPluie.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+quantNeige.titre+'</td><td>'+quantNeige.valmax+'</td><td>'+quantNeige.anneeMax+'</td><td>'+quantNeige.moisMax+'</td><td>'+quantNeige.valmin+'</td><td>'+quantNeige.anneeMin+'</td><td>'+quantNeige.moisMin+'</td></tr>';
    valeurTable= valeurTable+ '<tr><td>'+vitesseVent.titre+'</td><td>'+vitesseVent.valmax+'</td><td>'+vitesseVent.anneeMax+'</td><td>'+vitesseVent.moisMax+'</td><td>'+vitesseVent.valmin+'</td><td>'+vitesseVent.anneeMin+'</td><td>'+vitesseVent.moisMin+'</td></tr></table>';
    baliseFinale =baliseFinale+ titreTableDefeaut+valeurTable;
  }
  document.getElementById("tableau").innerHTML = baliseFinale;
  }