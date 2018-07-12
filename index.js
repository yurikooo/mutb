'use strict';
var express = require('express');
const { Pool, Client } = require('pg');
const axios = require('axios');
var bodyParser = require('body-parser');
var app = express();
var portNum = (process.env.PORT || 5050);
var server = app.listen(portNum, function(){
    console.log("Node app is running : " + server.address().port);
});
const dbString = process.env.DATABASE_URL || 'postgres://whuwxxefiudqyi:1543eebdcb64434443ab892a0981ff9abb04a73b89cc85cda83309061c63d75a@ec2-54-83-59-239.compute-1.amazonaws.com:5432/dbt7dkha5jtt9v';
//var dbString = process.env.DATABASE_URL;

//DB接続を生成
const client = new Client({
  user: 'whuwxxefiudqyi',
  password: '1543eebdcb64434443ab892a0981ff9abb04a73b89cc85cda83309061c63d75a',
  host: 'ec2-54-83-59-239.compute-1.amazonaws.com',
  database: 'dbt7dkha5jtt9v',
  port: 5432,
  ssl: true
});
client.connect();


// Make a request for a user with a given ID
axios.get('https://mutb.herokuapp.com/:accountid')
  .then(function (err,res) {
    // handle success
    console.log("________response.params_________ ")
    console.log(res.params);
    console.log("________err.status_________ ")
    console.log(err.status);
    console.log("_________________ ")
  });



/*
 * ExpressJS View Templates
 */
app.set('views', __dirname + '/app/views');
// templateNameで拡張子が省略された場合のデフォルト拡張子
app.set('view engine', 'ejs');
//静的
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



/*
 * Jobs Landing Page
 */
//client.query('SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2', (err,res)=>{
client.query('SELECT * FROM salesforce.SNS__c where salesforce.SNS__c.accountid__c = $1 order by salesforce.SNS__c.id desc limit 2',
  ['0016F00002P7OT8QAN'],(err,res)=>{
    console.log("_________________ ")
    console.log(res.rows[0])
    console.log(res.rows[1])
    console.log("_________________ ")
});

//表示用最新２つの情報
app.get('/',function (req, res){
    var query = 'SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2';
    var result = [];
    client.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows);

        // レンダリング実行
        res.render('index', {connectResults: result.rows});
    });
});

//更新用
app.post('/', function(req, res){
    console.log("〜〜〜〜〜〜〜〜〜〜")
    console.log(req.body)
    console.log("〜〜〜〜〜〜〜〜〜〜")

    var rb = req.body;
  
  client.query('UPDATE salesforce.Notice__c set status__c = $1, agentcomments__c = $2 WHERE name = $3',
        [rb['select_status'], rb['agentcomments'],rb['q_id']], (err, res) => {
            console.log(err, res)
        });
    res.redirect('/');

    console.log("_________________ ")
    console.log(res)
    console.log("_________________ ")

});
