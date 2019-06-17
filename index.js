var XLSX = require('xlsx');
const fetch = require('node-fetch');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const http = require('http');
const date = require('date-and-time');

const Bluebird = require('bluebird');
fetch.Promise = Bluebird;

const args = require('yargs').argv;

let loopTime = 2;

if(args.time != undefined){
    loopTime = args.time;
}

const firebase = require('firebase');
const firebaseApp = firebase.initializeApp(require('./firebase.json'));
const db = firebaseApp.firestore();
db.settings({timestampsInSnapshots: true});




function sendJobs(filename){
    var workbook = XLSX.readFile(filename);
    /* DO SOMETHING WITH workbook HERE */

    var first_sheet_name = workbook.SheetNames[1];
    
    /* Get worksheet */

    var worksheet = workbook.Sheets[first_sheet_name];
    var jsonXls =XLSX.utils.sheet_to_json(worksheet,{raw:true});
    var adjust = 0;
    var vagasEmprego = [];
    for(var i=0;i != jsonXls.length; ++i){
        var line = jsonXls[i];
        if(line.__EMPTY_12 == 'SIM'){
            var vaga = {
                nome: line.__EMPTY,
                pcd: line.__EMPTY_1 == 'SIM'? true : false,
                local: line.__EMPTY_2+ '/ '+line.__EMPTY_3,
                salario: line.__EMPTY_7,
                escolaridade: line.__EMPTY_8,
                vagas: line.__EMPTY_10,
                experiencia: line.__EMPTY_11,
            }
            vagasEmprego.push(vaga);
        }
    };
    console.log(vagasEmprego);
    let now = new Date();
    var hoje = date.format(now, 'YYYY-MM-DD');
    db.collection('jobs').doc(hoje).set({vagasEmprego});
    fetch('https://webhook.site/b67dd84b-bdc8-496b-a964-54fee51d98a9',{
        method: 'POST',
        headers:{'content-type': 'application/json'},
        body: JSON.stringify(vagasEmprego)
    }).then(res => console.log('.'))
};


setInterval(function(){
    console.log('init');
    let now = new Date();
    var hoje = date.format(now, 'DD-MM-YYYY');
    var fileName = "emprego"+hoje+".xlsx";
    request('http://www2.recife.pe.gov.br/taxonomy/term/8430/', function(err, resp, html) {
        if (!err){
            const $ = cheerio.load(html);
            var strong = $('strong');
            var site = strong[0].children[0].attribs.href;
            http.get(site, function(response) {
                var file = fs.createWriteStream(fileName);
                response.pipe(file).on('finish', function () {
                    sendJobs(fileName);
                });
            });
        }else{
            console.log('erro');
        }
    });
}, loopTime * 3600000);