var rdb = require("rethinkdb")
var dbConfig = require('../config/database')

rdb.connect(dbConfig).then(function(conn){

    // create database with primary key
    rdb.db('parents').tableCreate('records', {primaryKey: 'code'}).run(conn, function(tb){
        console.log("created db")
        console.log(tb)
    });
})
