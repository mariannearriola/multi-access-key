const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const numWords = require('num-words');
var natural = require('natural');
var $ = require("jquery");
var linksToTravel = [];

// find database links

request('https://www.delta-intkey.com/www/data.htm', (error, response, html) => {
    if(!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        var links = [];
        $('a').each((i, el) => {
            var link = $(el).attr('href');
            if(link.substring(link.length-10) == "/index.htm" && link.substring(0,3) == "../") {
                links.push(link);
            }
        });
        for(var i = 2; i < links.length; i++) {
            var linkTravel = "https://www.delta-intkey.com";
            linkTravel += links[i].substring(2);
            linksToTravel.push(linkTravel);
        }
        
        var data = fs.readFileSync('database_links.json');
        var json = JSON.parse(data);
        json.push(linksToTravel);
        fs.writeFileSync('database_links.json',JSON.stringify(json));
    }
});