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



//表示用最新２つの情報
app.get('/',function (req, res){
    const param = req.query;
    var query;
    console.log("________param_________ ")
    console.log(param);
    console.log("________________")

    if(param){
      query = 'SELECT * FROM salesforce.SNS__c where salesforce.SNS__c.accountid__c = \'' + param.accountid + '\' order by salesforce.SNS__c.id desc limit 2';

      if(query){

        console.log("________query_________ ")
        console.log(query);
        console.log("________________")

        var result = [];

        client.query(query, function(err, result){
          console.log("_________________ ")
          console.log(result.rows[0])
          console.log(result.rows[1])
          console.log("_________________ ")

           // レンダリング実行
          res.render('index', {connectResults: result.rows});
        });

      //間違った企業IDの場合のエラーハンドリング
      }else{
         query = 'SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2';
        if(query){
          var result = [];
          client.query(query, function(err, result){
            res.render('index', {connectResults: result.rows}); 
          });
        }       

        //res.redirect('/');
      }

    //企業IDがない場合のエラーハンドリング
    }else{
        query = 'SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2';
        if(query){
          var result = [];
          client.query(query, function(err, result){
            res.render('index', {connectResults: result.rows}); 
          });
        }
    }

//    var query = 'SELECT * FROM salesforce.SNS__c where salesforce.SNS__c.accountid__c = \'' + param.accountid + '\' order by salesforce.SNS__c.id desc limit 2';


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
