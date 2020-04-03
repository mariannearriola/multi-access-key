const http = require('http');
const express = require('express');
const fs = require('fs');
const port = 3000;
var app = express();

var bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.static('static_files'));

var pl = require("./core.js");
var loader = require("./lists.js" );
loader(pl);
var session = pl.create(1000);
var program = "item(id(1), name(bread)).";
session.consult(program);

session.query("item(id(1),X).");
var ans;
session.answers(x => ans = pl.format_answer(x));
console.log(ans);

const fakeDatabase = {
    'Philip': {job: 'professor', pet: 'cat.jpg'},
    'John': { job: 'student', pet: 'dog'}
};

app.get('/users', (req, res) => {
    var a = req.query.city;
    console.log(JSON.stringify(a));
    const allUsernames = Object.keys(fakeDatabase);
    console.log(allUsernames);
    res.send("sup");
});

app.get('/users/:userid', (req, res) => {
    const nameToLookup = req.params.userid;
    const val = fakeDatabase[nameToLookup];
    console.log(nameToLookup, '->', val);
    if(val) {
        res.send(val);
    }
    else {
        res.send({});
    }
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000/');
});