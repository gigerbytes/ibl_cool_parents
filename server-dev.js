const fs = require('fs')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
var async = require('async');

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
var r = require('rethinkdb')
var rdb = require("./lib/rethink")
'use strict';

// view engine setup
// app.set('views', path.join(__dirname, 'views'))
app.use("/public", express.static(__dirname + "/public"));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
})

r.connect({db:"cannes"}).then(function(conn){
    r.table('records').changes().run(conn, function(err, cursor){
        cursor.each(function(err, item) {
          if (err) { res.send(500)} // throw here too
          io.emit('vote', item);
      })
    })
})

// 2 actions

// Accept form (form with data posted to express app)
app.post('/vote', function(req, res){
    // if(req.body.code < 100000 || req.body.code > 1000000) { // check code is within 6 digits
    //     res.send('wrongcode')
    // } else {

      datObj = {
          // 'code' : req.body.code,
          'love' : 0,
          'respect' : 0,
          'inclusive' : 0,
          'accompany': 0,
          'support':0,
          'meals':0,
          'nagging':0,
          'interfere':0,
          'fight':0,
          'diary':0
      }

        datObj[req.body.group1] = 1
        datObj[req.body.group2] = 1
        datObj[req.body.group3] = 1

        voted = rdb.save("records",datObj).then(function(record){
            if(record.errors == 0) {
                res.send("success")
            } else {
                res.send("voted")
            }
        })
    // }
})
// Send result to deploy client (view over here)
app.get('/poll', function(req, res){

  r.connect({db:"parents"}).then(function(conn){
      var stack = {}
      stack.love = function(cb) {
          r.table('records').filter({'love' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.respect = function(cb) {
          r.table('records').filter({'respect' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.inclusive = function(cb) {
          r.table('records').filter({'inclusive' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.accompany = function(cb) {
          r.table('records').filter({'accompany' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.support = function(cb) {
          r.table('records').filter({'support' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.meals = function(cb) {
          r.table('records').filter({'meals' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.nagging = function(cb) {
          r.table('records').filter({'nagging' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.interfere = function(cb) {
          r.table('records').filter({'interfere' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }

      stack.fight = function(cb) {
          r.table('records').filter({'fight' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }
      stack.diary = function(cb) {
          r.table('records').filter({'diary' : 1}).count().run(conn, function(err, count){
              cb(null, count)
          })
      }

        async.parallel(stack, function(err, results){
            if(err){
                console.log(err)
            }
            var pollData = {
                'group1' : [
                    {label :'无条件的爱', y: results.love},
                    {label :'尊重', y:results.respect},
                    {label :'等', y: results.wait},
                ],
                'group2': [
                    {label:'包容', y: results.inclusive},
                    {label:'陪伴', y: results.accompany},
                    {label:'支持', y: results.support},
                    {label:'饭菜', y: results.meals},
                ],
                'group3': [
                    {label: '碎碎念', y: results.nagging},
                    {label: '过分干涉', y: results.interfere},
                    {label: '父母吵架', y:results.fight},
                    {label: '偷看日记', y:results.diary},
                ]
            };
            console.log(results)
            console.log(pollData)
            res.render("poll", {pollData: pollData})

        })

    })
})

app.get('/poll-update', function(req, res){

})

http.listen(3000)
