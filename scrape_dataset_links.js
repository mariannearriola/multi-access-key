const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const numWords = require('num-words');
var natural = require('natural');
var $ = require("jquery");

var WordPOS = require('wordpos');

var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';

var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);

var databaseLinks = require('./database_links.json');

function scrapeIt(url) {
    var retArr = [];
    // SCRAPE KEY
    request(url, (error, response, html) => {
        if(!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            // Helper functions

            function splitValue(value, begin, end) {
                return value.substring(begin, end);
            }
            
            function isLetter(c) {
                return c.toLowerCase() != c.toUpperCase();
            }

            function isNumeric(s) {
                return !isNaN(s-parseFloat(s));
            }
            
            // "fixes" string for formatting in prolog
            function fix(str) {
                var final = str;
                for(var i = 0; i < final.length; i++) {
                    var c = final.charAt(i);
                    
                    if((!isLetter(c) && isNaN(c)) || c == ' ' || c == "\n") {
                        final = final.replace(c,'_');
                    }
                }
                if(final.indexOf("or ") == 0) {
                    final = final.replace("or ","");
                }
                final = final.split("__").join("_");
                if(final.charAt(final.length-1) == "_") {
                    final = final.substring(0,final.length-1);
                }
                while(final.charAt(0) == "_") {
                    final = final.substring(1);
                }
                if(isNumeric(final.charAt(0))) {
                    var strTmp = numWords(final.charAt(0));
                    final = strTmp + final.substring(1);
                }
                return final.toLowerCase();
            }
            console.log(fix("5_ok"));

            // Form frame

            var title = $('h3').text();
            var frameTitle = "frame(";
            title = title.toLowerCase();
            frameTitle += fix(title.substring(1,title.length-1));
            frameTitle += ",";
            retArr.push(frameTitle);
            var newTrait = "[";

            // Add to frame

            $('p').each((i, el) => {
                // iterates through each section, stops @ illustrations
                if($(el).children('span.itemsubheading').text() && !$(el).children('span.itemsubheading').text().includes("Illustrations.") && !$(el).children('span.itemsubheading').text().includes("General remarks.")) {
        
                    $(el).children('span.itemsubheading').remove();

                    // isolate text and iterate through each attr
                    
                    var splitPer = [];
                    splitPer.push(-1);
                    var attr = "";
                    var vals = [];

                    // FIND INDICES OF .'s, EXCLUDING ()'S
                    var tok = $(el).text();
                    tok = tok.split("\n").join(" ");

                    for(var s = 0; s < tok.length; s++) {
                        if(tok.charAt(s) == "(") {
                            while(tok.charAt(s) != ")") { s++; }
                        }
                        if(tok.charAt(s) == ".") { splitPer.push(s); }
                    }

                    // SPLIT BY .'s
                    // NEW ATTR
                    // ITERATE THROUGH .'s
                    // CHANGE!!! (this is for testing) p < 1
                    console.log(splitPer.length);
                    for(var p = 0; p < splitPer.length-1; p++) {
                        var tmp = splitValue(tok,splitPer[p]+1,splitPer[p+1]+1);
                        // FIND ATTR, split by ;'s
                        var findSCs = tmp.split(";");

                        // ITERATE THROUGH ;'s
                        for(var sc = 0; sc < findSCs.length; sc++) {
                            // FIND MULTIPLE VALS, split by ,'s
                            var splitCom = [];
                            
                            // parameter to com
                            var SCtoCOM = findSCs[sc];
                            // offset
                            splitCom.push(-1);
                            
                            // if NEW ATTRIBUTE to be created
                            if(attr == "") {
                                var prepNoun = 0;
                                // FIND INDICES OF , OR's, EXCLUDING ()'s
                                for(var sp = 0; sp < SCtoCOM.length; sp++) {
                                    if(SCtoCOM.charAt(sp) == "(") {
                                        while(SCtoCOM.charAt(sp) != ")") { sp++; }
                                    }
                                    // CHECK IF PREPOSITION EXISTS BEFORE COMMA, THEN CHECK IF COMMAS CONTAIN NOUNS
                                    if(SCtoCOM.charAt(sp) == ",") {
                                        //console.log(findSCs[sc].substring(sp,sp+4));
                                        if(SCtoCOM.substring(sp).length >= 4 && SCtoCOM.substring(sp,sp+4) == ", or") {
                                            splitCom.push(sp);
                                            var sub1 = SCtoCOM.substring(0,sp+1);
                                            var sub2 = SCtoCOM.substring(sp+4);
                                            SCtoCOM = sub1+sub2;
                                        }

                                        if(SCtoCOM.includes(", and") && !(SCtoCOM.split(",")[0].includes(" "))) {
                                            splitCom.push(sp);
                                            if(SCtoCOM.substring(sp).length >= 5 && SCtoCOM.substring(sp,sp+5) == ", and") {
                                                var sub1 = SCtoCOM.substring(0,sp+1);
                                                var sub2 = SCtoCOM.substring(sp+5);
                                                SCtoCOM = sub1+sub2;
                                            }
                                        }

                                        if(SCtoCOM.includes(":")) {
                                            splitCom.push(sp);
                                        }
                                        // *** WORKAROUND? MAKE SURE EVERY SINGLE INSTANCE AFTER PREPOSOITION IS  A ONE WORD NOUN
                                        // check for preposition -> noun lists
                                        /*var sp = SCtoCOM.split(" ");
                                        var listRes = tagger.tag(sp);
                                        var listArr = JSON.stringify(listRes);
                                        var findListTokens = listArr.substring(16).split("{\"token\":\"");
                                        // CHECK IF LINE CONTAINS A PREPOSITION
                                        for(var i = 1; i < findListTokens.length-1; i++) {
                                            if(findListTokens[i].includes("\"tag\":\"IN")) {
                                                //console.log(findListTokens);
                                                // CHECK IF FOLLOWING WORDS IS A LIST CONTAINING ONE WORD NOUNS
                                                if(i <= findListTokens.length-4) {
                                                    var tokCom1 = findListTokens[i+1].substring(0,findListTokens[i+1].indexOf("\""));
                                                    var tokCom2 = findListTokens[i+2].substring(0,findListTokens[i+2].indexOf("\""));
                                                    console.log(findListTokens[i+1]);
                                                    console.log("---");
                                                    console.log(findListTokens[i+2]);
                                                    console.log(findListTokens[i+3]);
                                                    console.log("***");
                                                    if(tokCom1.includes(",") && tokCom2.includes(",") && findListTokens[i+1].includes("\"tag\":\"N") && findListTokens[i+2].includes("\"tag\":\"N")) {
                                                        prepNoun = 1;
                                                    }
                                                }
                                            }
                                        }
                                        // sad i know
                                        if(prepNoun == 1) {
                                            splitCom.push(sp);
                                        }*/
                                    }
                                }
                                prepNoun = 0;
                            }
                            // TO DO: ACCOUNT FOR AND'S!!!!

                            // SEPARATE , OR'S's
                            // COMMAS CAN BE ALLOWED!! ex: when not proliferated, 3
                            for(var c = 0; c < splitCom.length; c++) {
                                
                                var findCommas;
                                if(splitCom.length > 1) { findCommas = splitValue(SCtoCOM,splitCom[c]+1,splitCom[c+1]); }
                                else { findCommas = SCtoCOM; }
                                // EXCLUDE ()'s
                                if(findCommas.includes("(")) {
                                    findCommas = findCommas.substring(0, findCommas.indexOf("(")-1);
                                }

                                // REMOVE EXTRA " "'s
                                while(findCommas.charAt(0) == " ") {
                                    findCommas = findCommas.substring(1); 
                                }

                                if(c == splitCom.length-1) {findCommas = findCommas.substring(0,findCommas.length);}
                                
                                // tokenize string
                                var tokenizer = new natural.WordTokenizer();
                                var wordArr = tokenizer.tokenize(findCommas);
                                
                                // exclude etc's
                                if(wordArr.length == 1 && wordArr[0] == "etc") { continue; }
                                
                                // IF ONE WORD including OR, excluding ()'s
                                if(wordArr.length == 1 && (attr == "")) {
                                    //console.log(wordArr[0]);
                                    newTrait += fix(wordArr[0]);
                                    newTrait += "-true";
                                    newTrait += ","
                                    //console.log(wordArr[0]);
                                }
                                // ATTR IS EMPTY
                                if(attr == "") {
                                    // IF TWO WORDS and ATTR EMPTY
                                    if(wordArr.length == 2 && (attr == "")) {
                                        // if is a noun (2 words)
                                        var tagRes = tagger.tag(wordArr);
                                        var tagArr = JSON.stringify(tagRes);
                                        var findTokens = tagArr.substring(16).split("{\"token\":\"");
                                        if(findTokens[1].includes("\"tag\":\"JJ")) {
                                            if(findTokens[2].includes("\"tag\":\"N")) {
                                                attr = wordArr[0] + "_" + wordArr[1];
                                                vals.push("true");
                                            }
                                        }
                                        else {
                                            attr = wordArr[0];
                                            vals.push(findCommas.substring(findCommas.search(wordArr[1])));
                                        }
                                        newTrait += fix(attr);
                                        newTrait += "-";
                                        newTrait += fix(vals[vals.length-1]);
                                        newTrait += ",";
                                    }
                                    // IF COLON PRESENT
                                    // BUG: not everything is a val after a :
                                    else if(findCommas.includes(":") && attr == "") {
                                        var colonSplit = findCommas.split(": ");
                                        attr = colonSplit[0];
                                        vals.push(colonSplit[1]);
                                        newTrait += fix(attr);
                                        newTrait += "-",
                                        newTrait += fix(vals[vals.length-1]);
                                        newTrait += ",";
                                    }
                                    // MORE THAN TWO WORDS AND ATTR EMPTY
                                    else if(wordArr.length > 2 && (attr == "")) {
                                        // if verb found, separate w/ verb on val side
                                        // else, find noun/adj pair, begin from end
                                        // iterate through words BACKWARDS
                                        var str = "";
                                        for(var f = 0; f < wordArr.length; f++) {
                                            str += wordArr[f];
                                            if(f != wordArr.length-1) {
                                                str += " ";
                                            }
                                        }

                                        // tag words


                                        var tagRes = tagger.tag(wordArr);
                                        var tagArr = JSON.stringify(tagRes);

                                        // split by tokens + tags
                                        var findTokens = tagArr.substring(16).split("{\"token\":\"");
                                        // if it contains... "tag":"etc"
                                        // traverse through tokens
                                        for(var ft = findTokens.length-1; ft > 0; ft--) {
                                            // VERB
                                            // IF WORD CONNECTED BY -
                                            // DELETE PREPOSITIONS
                                            // OMIT - connected words
                                            var t = findTokens[ft].substring(0,findTokens[ft].indexOf("\""));
                                            
                                            // VERB/PREPOSITION/- CONNECTED WORDS
                                            if(((findTokens[ft].includes("\"tag\":\"V") && !(findTokens[ft].includes("\"tag\":\"VBN"))) || findTokens[ft].includes("\"tag\":\"IN")) && findCommas.charAt(findCommas.indexOf(tok)-1) != "-") {
                                                var valStart = t;
                                                if(findTokens[ft].includes("\"tag\":\"IN")) {
                                                    attr = findCommas.substring(0,findCommas.indexOf(valStart)+valStart.length);
                                                    vals.push(findCommas.substring(findCommas.indexOf(valStart)+valStart.length));
                                                }
                                                else {
                                                    attr = findCommas.substring(0,findCommas.indexOf(valStart));
                                                    vals.push(findCommas.substring(findCommas.indexOf(valStart)));
                                                }
                                                newTrait += fix(attr);
                                                newTrait += "-",
                                                newTrait += fix(vals[vals.length-1]);
                                                newTrait += ",";
                                                break;
                                            }
                                            // ADJECTIVE
                                            if(findTokens[ft].includes("\"tag\":\"JJ")) {
                                                // check if preceding word is a noun
                                                if(ft != 1) {
                                                    if(findTokens[ft-1].includes("\"tag\":\"N")) {
                                                        var valStart = t;
                                                        attr = findCommas.substring(0,findCommas.indexOf(valStart));
                                                        vals.push(findCommas.substring(findCommas.indexOf(valStart)));
                                                        newTrait += fix(attr);
                                                        newTrait += "-",
                                                        newTrait += fix(vals[vals.length-1]);
                                                        newTrait += ",";
                                                        break;
                                                    }
                                                }
                                                // NO nouns found
                                                if(ft == 1) {
                                                    // traverse backwards, if TO found
                                                    for(var to = ft; to < findTokens.length-1; to++) {
                                                        if(findTokens[to].includes("\"tag\":\"TO")) {
                                                            attr = findCommas.substring(0,findCommas.indexOf(" to "));
                                                            newTrait += fix(attr);
                                                            newTrait += "-true,";
                                                            retArr.push(newTrait);
                                                            newTrait = "";
                                                            
                                                            attr = findCommas.substring(findCommas.indexOf("to ") + 3);
                                                            newTrait += fix(attr);
                                                            newTrait += "-true,";
                                                            retArr.push(newTrait);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            // ONLY NOUNS (adj may be in front)?
                                            
                                            // NO VERB/ADJECTIVE FOUND, separate by last word
                                            if(!findTokens[ft].includes("\"tag\":\"JJ") && !findTokens[ft].includes("\"tag\":\"V") && ft == 1) {
                                                var valStart = findTokens[findTokens.length-1].substring(0,findTokens[findTokens.length-1].indexOf("\""));
                                                attr = findCommas.substring(0,findCommas.indexOf(valStart));
                                                vals.push(findCommas.substring(findCommas.indexOf(valStart)));
                                                newTrait += fix(attr);
                                                newTrait += "-",
                                                newTrait += fix(vals[vals.length-1]);
                                                newTrait += ",";
                                                break;
                                            }
                                        }
                                    }
                                }
                                // ATTR IS NOT EMPTY
                                else if (attr != "" && attr != "SELF") {
                                    newTrait += fix(attr);
                                    newTrait += "-";
                                    newTrait += fix(findCommas);
                                    newTrait += ",";
                                }                    
                                retArr.push(newTrait);
                                newTrait = "";
                            }
                        }
                        attr = "";
                        vals = [];
                    }
                }

                // COMPOSE THIS STRING:
                // "frame(mammal,"+
                // "[warm_blooded-true])."

            });
            var lastWord = retArr[retArr.length-1];
            retArr[retArr.length-1] = retArr[retArr.length-1].substr(0,lastWord.length-1);
            //retArr[retArr.length-1] = retArr[retArr.length-1].substring(0,retArr.length-1);
            retArr[retArr.length-1] += "]).";
            /*(for(var i = 0; i < retArr.length; i++) {
                console.log(retArr[i]);
                console.log("---");
            }*/
        }
        var data = fs.readFileSync('output.json');
        var json = JSON.parse(data);
        json.push(retArr);
        fs.writeFileSync('output.json',JSON.stringify(json));
        //fs.writeFileSync('output.json',JSON.stringify(retArr));
    });
    return retArr;
}

// access database_links.json

databaseLinks.forEach(el => {
    request(el, (error, response, html) => {
        if(!error && response.statusCode == 200) {
            var linkHead = el;
            console.log(el);
            const $ = cheerio.load(html);
            var links = [];
            $('a').each((i, l) => {
                var link = $(l).attr('href');
                if(link && link.length > 4 && link.substring(link.length-4) == ".htm" && link.substring(0,4) == "www/" && link != "www/implicit.htm" && link != "www/chars.htm" && link != "www/data-from-web-publications.htm") {
                    var linkFormat = linkHead;
                    linkFormat = linkFormat.substring(0,linkFormat.search("index.htm"));
                    linkFormat += link;
                    links.push(linkFormat);
                }
            });
            if(links.length > 0) {
                var data = fs.readFileSync('dataset_links.json');
                var json = JSON.parse(data);
                json.push(links);
                fs.writeFileSync('dataset_links.json',JSON.stringify(json));
            }
        }
    });
});