const {boostMap, isBoost, isStop, setBoost, setStop, stopMap} = require( "../rules/boost-and-stop");
var rules = require('../rules/rules.json');
var oracle = require('../src/oracle/data')
var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

const object ={
    data:{test:"yop"},
    date: new Date().toString()
}

/* GET applog */
router.get('/log', function (req, res) {

    res.setHeader('content-type', 'text/plain');

    const p = "plop.log"
    fs.readFile(p, 'utf8', function (err,data) {
        if (err) {
            res.status(404);
            res.send(err)
        }
        res.status(200);

        const lines = data.split('\n').reverse().join('\n')

        res.send(lines)
    });

});

/* GET applog */
router.get('/boost', function (req, res) {

    res.setHeader('content-type', 'application/json');

    res.status(200);
    const names = rules.map(r => r.name)
    const struct = names.map(
      name => (
        {
            name,
            isBoost : isBoost(name),
            isStop : isStop(name)
        }
      )
    )
    res.send({
        struct,
        now:new Date().getTime(),
        boostMap : mapToObj(boostMap),
        stopMap : mapToObj(stopMap)
    })



});


router.post('/', function (req, res) {
    const data = req.body;
    if (!data) {
        res.status(406);
        res.send({message: "no valid 'name' key provided "});
        return;
    }
    object.data=data;
    object.date=new Date().toString()
    object.headers = req.headers;
    res.status(201);
    res.json("created");
});

router.post('/boost', function (req, res) {
    const data = req.body;
    if (!data) {
        res.status(406);
        res.send({message: "no data provided "});
        return;
    }
    const name = data.name
    let time = data.time
    if(!name){
        res.status(400);
        res.json("no device name (LILI or BEDROOM)");
        return;

    }
    if(!time){
        res.status(400);
        res.json("no given time, integer for hours");
        return;

    }
    time = Math.floor(time)

    setBoost(name, time)
    res.status(201);
    res.json(`Boost created for ${time} hours`);
});

router.post('/stop', function (req, res) {
    const data = req.body;
    if (!data) {
        res.status(406);
        res.send({message: "No data provided "});
        return;
    }

    const name = data.name
    let time = data.time
    if(!name){
        res.status(400);
        res.json("no device name (LILI or BEDROOM)");
        return;
    }

    if(!time){
        res.status(400);
        res.json("no given time, integer for hours");
        return;
    }
    time = Math.floor(time)

    setStop(name, time)
    res.status(201);
    res.json(`Stop created for ${time} hours`);
});


/* GET applog */
router.get('/oracle', function (req, res) {

    //res.setHeader('content-type', 'application/json');
    try{
        res.status(200);
        res.json(oracle())
    }catch (e){
        res.status(500)
        res.json(e.toString())
    }



});


module.exports = router;

const mapToObj = m => {
    return Array.from(m).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
};