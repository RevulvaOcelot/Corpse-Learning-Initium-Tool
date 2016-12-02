// ==UserScript==
// @name         CLIT
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Corpse Learning Initium Tool
// @author       RevulvaOcelot
// @match        *https://www.playinitium.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

const ver = "scraperdata001";
(function() {
    'use strict';
    $(document).ready(function() {

        setTimeout(function() {
            $('.main-description').first().append("<br/><a id='scraperexport' style='font-size: small;' href='#'>export mob data</a>");
            $("#inline-characters").children().children("h4").append("<br/><a id='scraper' style='font-size: small;' href='#'>scrape</a> - <a id='scraperexport' style='font-size: small;' href='#'>export</a>");

            $("#scraperexport").on("click", function(e) {
                e.preventDefault();
                exportCorpseData();
            });
            if( $("#inline-characters:contains('Dead ')").length === 0) return;
            
            $("#scraper").on("click", function(e) {
                e.preventDefault();
                $("#scraper").text("scraper running");

                getCorpseData();
            });


            $("#scraper").text("scraper running");
            getCorpseData();

        }, 2000);
    });

})();

function getCorpseData() {


    var data = JSON.parse(GM_getValue(ver, JSON.stringify({})));

    var corpses = $("#inline-characters").children().find("a:contains('Dead ')");
    console.log("Found " + corpses.length + " corpses.");
    console.log(corpses);
    console.log("Initiating loop.");
    corpses.each(function(k,e) {
        var url = $(e).prop('rel');
        var mobdata = {};
        $.ajax(url).complete(function(resp) {
            var res = resp.responseText;
            mobdata.id = url.split("=")[1];
            mobdata.name = $("[style='display:inline-block; max-width:230px'] > a", res).first().text().split(' ').slice(1).join(' ');
            mobdata.hp = $("[style='margin:0px; padding:0px; width:100px; text-align:left; display:block; font-size:11px;position:absolute;font-family:Sans-serif;']", res).text().split("/")[1];
            mobdata.hp = parseInt(mobdata.hp);
            $(".main-item-subnote", res).each(function(k, e) {
                var ename = $(e).attr("name");
                mobdata[ename] = parseInt($(e).text().split(" ")[0]);
            });
            var eqs = {};
            $(".main-item-name", res).each(function(k, e) {
                var slot = $(e).parent().parent().parent().parent().text().split(":")[0];      
                eqs[slot] = $(e).text();
            });

            mobdata.equipment = eqs;
            if(typeof data[mobdata.name] === 'undefined') data[mobdata.name] = {};

            console.log(JSON.stringify(mobdata));

            data[mobdata.name][mobdata.id] = mobdata;
            if(k == corpses.length -1) {
                $("#scraper").text("scrape OK");
                GM_setValue(ver, JSON.stringify(data));
                console.log("Scraper data saved.");
            }
        });


    });

}

function exportCorpseData() {
    var myjson = JSON.stringify(JSON.parse(GM_getValue(ver, JSON.stringify({}))), null, 2);
    console.log(myjson);
    var x = window.open();
    x.document.open();
    x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
    x.document.close();
}
