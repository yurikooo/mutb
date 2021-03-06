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
    var result = [];

    console.log("________param_________ ")
    console.log(param);
    console.log("________________")

    //企業IDがない場合のエラーハンドリング
    if(typeof param.accountid === "undefined" || param.accountid == null){
      query = 'SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2';
      client.query(query, function(err, result){
        res.render('index', {connectResults: result.rows}); 
      });

    }else{
      query = 'SELECT * FROM salesforce.SNS__c where salesforce.SNS__c.accountid__c = \'' + param.accountid + 'QAN\' order by salesforce.SNS__c.id desc';
      
      //間違った企業IDの場合のエラーハンドリング
      if(!query){
          query = 'SELECT * FROM salesforce.SNS__c order by salesforce.SNS__c.id desc limit 2';
          client.query(query, function(err, result){
            res.render('index', {connectResults: result.rows}); 
          });

        }else{
          console.log("________query_________ ")
          console.log(query);
          console.log("________________")

          client.query(query, function(err, result){
            console.log("_________result________ ")
            console.log(result.rows[0])
            console.log(result.rows[1])
            console.log("_________________ ")

            console.log("Result:" + result.rows.length);

            for(var i=0; i < result.rows.length; i++){
              console.log("tw_id=" + result.rows[i].twitterid__c +" tw_account=" + result.rows[i].twitteraccount__c+" tw_message=" + result.rows[i].message__c);


             }
            res.render('index', {connectResults: result.rows});
          });
        }
      }    
//    var query = 'SELECT * FROM salesforce.SNS__c where salesforce.SNS__c.accountid__c = \'' + param.accountid + '\' order by salesforce.SNS__c.id desc limit 2';
});

// ツイートを取得する
// GET: /tweet?offset=0&limit=1&accountid=0016F00002P7OWbQAN
// パラメータは以下の通り。すべてのパラメータが必須。
// - accountid: Salesoforce の取引先レコード ID。15桁/18桁
// - offset: 取得するレコードの開始行番号
// - limit: 取得するレコード数
app.get('/tweet', function(req, res) {
　// 必要な URL クエリパラメータが全て揃っていることを確認する。
  const param = req.query;
  if (param.accountid && param.offset && param.limit) {

    // 動的に Postgres クエリを作成/発行する。
    let query = 'SELECT * ';
    query += 'FROM salesforce.SNS__c ';
    query += 'WHERE';
    query += ' salesforce.SNS__c.accountid__c LIKE \'' + param.accountid + '%\'';
    query += ' ORDER BY salesforce.SNS__c.id ASC';
    query += ' LIMIT ' + param.limit;
    query += ' OFFSET ' + param.offset;
    client.query(query, function(err, result) {

      // レスポンスはリストの json 形式で返す。
      res.header('Content-Type', 'application/json; charset=utf-8');
      if (err) res.send(err);
      res.send(result.rows);
    });
  }


});
