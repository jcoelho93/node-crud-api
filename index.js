var config = {
    mysql:{
        host: 'localhost',
        port: 3306,
        user: 'grafana_user',
        password: 'grafana',
        database: 'weather',
    },
    mappings:[
        {
            field: 'scmInfo.scmCity',
            table: 'temperatures',
            column: 'city'
        }
    ]
}

var express = require('express');
var mysql = require('mysql');

var app = express();
app.use(express.json())

var con = mysql.createConnection(config.mysql);

app.post('/records/:table', function(req, res){
    var body = req.body;
    var table = req.params.table

    config.mappings.forEach(function(elem){
        if(elem.table == table){
            console.log("111")
            body[elem.column] = resolveProperties(body, elem.field);
            delete body[elem.field.split(".")[0]];
        }
    });

    var columns = Object.keys(body);
    var values = Object.values(body);
    
    sql = "INSERT INTO " + req.params.table + " (" + columns.join() + ") VALUES ("
    values = values.map(elem => (typeof elem == 'string' ? "'" + elem + "'" : elem))
    sql += values.join() + ")"

    con.connect(function(err){
        con.query(sql, function(err, result){
            if(err) res.send(err).sendStatus('500')
            console.log("Could not connect to MySQL");
            res.send(result)
        })
    })
});

app.get('/records/:table', function(req, res){
    sql = "SELECT * FROM " + req.params.table
    con.connect(function(err){
        con.query(sql, function(err, result){
            if(err) res.send(err).sendStatus('500')
            console.log("Could not connect to MySQL");
            res.send(result)
        })
    })
});

app.get('/records/:table/:id', function(req, res){
    sql = "SELECT * FROM " + req.params.table + " WHERE id = " + req.params.id
    con.connect(function(err){
        con.query(sql, function(err, result){
            if(err) res.send(err).sendStatus('500')
            console.log("Could not connect to MySQL");
            res.send(result)
        })
    })
});

function checkNested(obj, level,  ...rest) {
    if (obj === undefined) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}

function resolveProperties(obj, path){
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : null
    }, obj || self)
}

var server = app.listen(8081, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port);
});