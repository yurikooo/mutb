'use strict';
var express = require('express');
const { Pool, Client } = require('pg');
var bodyParser = require('body-parser');
var app = express();
var portNum = (process.env.PORT || 5050);
var server = app.listen(portNum, function(){
    console.log("Node app is running : " + server.address().port);
});
const dbString = process.env.DATABASE_URL || 'postgres://qhtfamlfqbwrot:07fb459dcea98c5c61668138497710a59185b90d97a23385e2550cb46124fefd@ec2-54-235-132-202.compute-1.amazonaws.com:5432/d66n03kivmoncc';
//var dbString = process.env.DATABASE_URL;

//DB接続を生成
const client = new Client({
  user: 'qhtfamlfqbwrot',
  password: '07fb459dcea98c5c61668138497710a59185b90d97a23385e2550cb46124fefd',
  host: 'ec2-54-235-132-202.compute-1.amazonaws.com',
  database: 'd66n03kivmoncc',
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



/*
 * Jobs Landing Page
 */
client.query('SELECT * FROM salesforce.Notice__c order by salesforce.Notice__c.id desc limit 2', (err,res)=>{
    console.log("_________________ ")
    console.log(res.rows[0])
    console.log(res.rows[1])
    console.log("_________________ ")
});

//表示用最新２つの情報
app.get('/',function (req, res){
    var query = 'SELECT * FROM salesforce.Notice__c order by salesforce.Notice__c.id desc limit 2';
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