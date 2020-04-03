const express = require('express');
var app = express();

var $ = require('jquery');

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

var program = 
            "member(X, [X | _])." +
            "member(X, [_ | T]) :- member(X, T).";
var debug = "";

var inc = 0;
for(var i = 0; i < 5; i++) {
    if(i == 8) { continue; }
    var filename = "./output";
    filename += i;
    filename += ".json";
    var input = require(filename);
    input.forEach(el => {
        program += el;
    });
}

//console.log(program);

program += "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(Slot-Value, Slots)."+
            "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(is_a-Class, Slots),"+
                "query(Class, Slot, Value)."+
            "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(ako-Parent, Slots),"+
                "query(Parent, Slot, Value).";
/*
var program = 
            "member(X, [X | _])." +
            "member(X, [_ | T]) :- member(X, T)." +
            
            "frame(mammal,"+
                "[warm_blooded-true])."+

            "frame(herbivore,"+
                "[is_a-mammal,"+
                "eats-plants])."+

            "frame(carnivore,"+
                "[is_a-mammal,"+
                "eats-animals])."+

            "frame(horse,"+
                "[is_a-herbivore,"+
                "sound-nays,"+
                "travel-walks])."+

            "frame(bird,"+
                "[is_a-herbivore,"+
                "travel-flies,"+
                "sound-chirps])."+

            "frame(canary,"+
                "[is_a-bird,"+
                "color-yellow])."+
                
            "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(Slot-Value, Slots)."+
            "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(is_a-Class, Slots),"+
                "query(Class, Slot, Value)."+
            "query(ID, Slot, Value) :-"+
                "frame(ID, Slots),"+
                "member(ako-Parent, Slots),"+
                "query(Parent, Slot, Value).";
                */

session.consult(program);
/*
const fakeDatabase = {
    'Philip': {job: 'professor', pet: 'cat.jpg'},
    'John': { job: 'student', pet: 'dog'}
};*/

app.get('/users', (req, res) => {
    var a = req.query.query;
    session.query(a);
    var ans = '';
    var cur = '';
    while(cur != 'false.') {
        session.answers(x => cur = pl.format_answer(x));
        if(cur == 'false.') { break; }
        ans += cur;
    }
    // send raw results of query
    res.send(ans);
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