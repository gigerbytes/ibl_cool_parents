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
    if(req.body.code < 100000 || req.body.code > 1000000) { // check code is within 6 digits
        res.send('wrongcode')
    } else {

        datObj = {
            'code' : req.body.code,
            'PIECES' : 0,
            'Unigay' : 0,
            'MUN': 0,
            'Orchestra':0,
            'Chess_Club':0,
            'Student_Theater':0,
            'Student_Impact':0,
            'IGNITE':0,
            'Oikos':0
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
    }
})
// Send result to deploy client (view over here)
app.get('/poll', function(req, res){

    r.connect({db:"parents"}).then(function(conn){
        var stack = {}
        stack.PIECES = function(cb) {
            r.table('records').filter({'PIECES' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Unigay = function(cb) {
            r.table('records').filter({'Unigay' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.MUN = function(cb) {
            r.table('records').filter({'MUN' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Oikos = function(cb) {
            r.table('records').filter({'Oikos' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Chess_Club = function(cb) {
            r.table('records').filter({'Chess_Club' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Orchestra = function(cb) {
            r.table('records').filter({'Orchestra' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Student_Theater = function(cb) {
            r.table('records').filter({'Student_Theater' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }

        stack.Oikos = function(cb) {
            r.table('records').filter({'Oikos' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.IGNITE = function(cb) {
            r.table('records').filter({'IGNITE' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }
        stack.Student_Impact = function(cb) {
            r.table('records').filter({'Student_Impact' : 1}).count().run(conn, function(err, count){
                cb(null, count)
            })
        }

        async.parallel(stack, function(err, results){
            if(err){
                console.log(err)
            }
            var pollData = {
                'group1' : [
                    {label :'PIECES', y: results.PIECES},
                    {label :'Unigay', y:results.Unigay},
                    {label :'MUN', y: results.MUN},
                ],
                'group2': [
                    {label:'Chess_Club', y: results.Chess_Club},
                    {label:'Orchestra', y: results.Orchestra},
                    {label:'Student_Theater', y: results.Student_Theater},
                ],
                'group3': [
                    {label: 'Oikos', y: results.Oikos},
                    {label: 'IGNITE', y: results.IGNITE},
                    {label: 'Student_Impact', y:results.Student_Impact},
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
