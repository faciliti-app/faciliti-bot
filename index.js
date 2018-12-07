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
    console.log('ads');
    var workbook = XLSX.readFile(filename);
    /* DO SOMETHING WITH workbook HERE */

    var first_sheet_name = workbook.SheetNames[0];
    /* Get worksheet */

    var worksheet = workbook.Sheets[first_sheet_name];
    var jsonXls =XLSX.utils.sheet_to_json(worksheet,{raw:true});
    // console.log(jsonXls);
    var adjust = 0;
    var vagasEmprego = [];
    for(var i=0;i != jsonXls.length; ++i){
        if((i-adjust)%24==0 && i!=0){//Pula 'AGÊNCIA DE EMPREGOS':'AGÊNCIA DE EMPREGOS'
            i++;
            adjust++;
        }
        var line = jsonXls[i];
        // console.log(line);
        if(jsonXls[i].__EMPTY_5 ==''){
            console.log('fim')
            break;
        }
        var mod = (i-adjust)%6;
        agencia = Object.keys(line)[0];
        switch(mod) {
            case 0://Nome da vaga
                var primeiro = Object();
                var segundo = Object();
                var terceiro = Object();
                primeiro.nome = line[agencia];
                segundo.nome=line.__EMPTY_4;
                terceiro.nome=line.__EMPTY_8;
                break;
            case 1: //Salario
                primeiro.salario = line[agencia];
                segundo.salario =line.__EMPTY_4;
                terceiro.salario =line.__EMPTY_8;
                break;
            case 2://Local
                primeiro.local = line[agencia];
                segundo.local =line.__EMPTY_4;
                terceiro.local =line.__EMPTY_8;
                break;
            case 3: //Escolaridade
                primeiro.escolaridade = line.__EMPTY_1;
                segundo.escolaridade =line.__EMPTY_5;
                terceiro.escolaridade =line.__EMPTY_9;
                break;
            case 4://Experiencia
                primeiro.experiencia = line.__EMPTY_1;
                segundo.experiencia =line.__EMPTY_5;
                terceiro.experiencia =line.__EMPTY_9;
                break;
            case 5://vagas
                primeiro.vagas = line.__EMPTY_1;
                primeiro.pcd = !(line.__EMPTY_2==" ");
                segundo.vagas = line.__EMPTY_5;
                segundo.pcd = !(line.__EMPTY_6==" ");
                terceiro.vagas = line.__EMPTY_9;
                terceiro.pcd = !(line.__EMPTY_10==" ");
                if(primeiro.nome != ''){
                    vagasEmprego.push(primeiro);
                }
                if(segundo.nome != ''){
                    vagasEmprego.push(segundo);
                }
                if(terceiro.nome != ''){
                    vagasEmprego.push(terceiro);
                }
                break;
            default:
                console.log('Erro');
                break;
        };
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
    let now = new Date();
    var hoje = date.format(now, 'DD-MM-YYYY');
    var fileName = "emprego"+hoje+".xlsx";
    console.log('ads');
    request('http://www2.recife.pe.gov.br/taxonomy/term/8430/', function(err, resp, html) {
        if (!err){
            const $ = cheerio.load(html);
            var strong = $('strong');
            var site = strong[0].parent.attribs.href
            http.get(site, function(response) {
                var file = fs.createWriteStream(fileName);
                response.pipe(file).on('finish', function () {
                    sendJobs(fileName);
                });
            });
        }else{
        }
    });
}, loopTime * 1000);