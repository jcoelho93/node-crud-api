var config = {
    mysql:{
        host: 'localhost',
        port: 3306,
        user: 'grafana_user',
        password: 'grafana',
        database: 'weather',
    }
}

var express = require('express');
var mysql = require('mysql');

var app = express();
app.use(express.json())

var con = mysql.createConnection(config.mysql);
con.connect(function(err){
    if(err) console.log(err);
});

app.delete('/records/:table/:id', function(req, res){
    var body = req.body;

    sql = "DELETE FROM " + req.params.table + " WHERE id = " + req.params.id

    con.query(sql, values, function(err,result){
        if(err) res.send(err);
        console.log(sql);
        res.send(result);
    });
});

app.put('/records/:table/:id', function(req, res){
    var body = req.body;
    var columns = Object.keys(body);
    var values = Object.values(body);

    sql = "UPDATE " + req.params.table + " SET "
    columns.forEach(function(column, index){
        sql += column + " = ?"
        if(index != columns.length-1)
            sql += ", "
    });

    con.query(sql, values, function(err,result){
        if(err) res.send(err);
        console.log(sql);
        res.send(result);
    });
});

app.post('/records/:table', function(req, res){
    var body = req.body;
    var table = req.params.table

    var columns = Object.keys(body);
    var values = Object.values(body);
    
    sql = "INSERT INTO " + table + " (" + columns.join() + ") VALUES (?" + ",?".repeat(values.length - 1) + ")"

    con.query(sql, values, function(err, result){
        if(err) res.send(err);
        res.send(result);
    })
});

app.get('/records/:table', function(req, res){
    sql = "SELECT * FROM " + req.params.table
    con.query(sql, function(err, result){
        if(err) res.send(err)
        console.log("Could not connect to MySQL");
        res.send(result)
    })
});

app.get('/records/:table/:id', function(req, res){
    sql = "SELECT * FROM " + req.params.table + " WHERE id = " + req.params.id
    con.query(sql, function(err, result){
        if(err) res.send(err)
        console.log("Could not connect to MySQL");
        res.send(result)
    })
});

var server = app.listen(8081, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port);
});