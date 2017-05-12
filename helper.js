const MONEY_URL = "https://api.fixer.io/latest";

// Mini jquery
function $$(selector){
    return document.querySelector(selector);
}

// Only digits
function digits(string){
    return string.replace(/[^\d.-]/g, '');
}

// Make async request
function request(url, callback){
    console.debug("[Request] Making request to", url);
    var xml = new XMLHttpRequest();
    xml.open("GET", url, true);
    xml.setRequestHeader('Content-Type', 'application/json, text/javascript, */*; q=0.01')
    xml.send(null);
    xml.onload = function(){
        callback(xml);
    }
}

function betterFloat(fl){
	fl = fl.toString();
	return betterNumber(fl.lastIndexOf('.')>-1 ? fl.substring(0, Math.min(fl.lastIndexOf('.')+3, fl.length)) : fl);
}

function betterNumber(n) {
    var splitted = n.toString().split('.');
    var first = splitted.shift().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var decimal = splitted.pop();
    return first+(decimal==undefined ? "" : "."+decimal);
}

function getBuyersData(membersDOM){
    var buyers = new Map();
    var exchanges = {};

    var pricedSales = 0;
    var freeSales = 0;

    var csv = "Date;User;Money";

    function pushExchange(exchange, amount){
        exchanges[exchange] = (exchanges[exchange]==undefined ? amount : exchanges[exchange]+amount)
    }

    function createBuyer(userID, exchange, price, date){
        buyers.set(userID, {exchange: exchange, price: price, date: date});
    }

    for(var i = 0; i < membersDOM.length; i++){
        var cm = membersDOM[i];
        var free = cm.querySelectorAll(".muted").length===1;
        if(!free){
            //Purchased for: *amount* *exchange*
            var pur = cm.querySelectorAll(".muted")[1].innerHTML;
            var exchange = pur.substring(pur.length-4, pur.length-1);
            var money = parseFloat(digits(pur));
            var userID = digits(cm.querySelector(".avatar").classList[1]);
            var date = cm.querySelector(".DateTime").title;
            var username = cm.querySelector(".username .StatusTooltip").innerHTML;
            createBuyer(userID, exchange, money, date);
            pushExchange(exchange, money);
            csv += `#${date};${username};${money+" "+exchange}`;
            pricedSales++;
        }else{
            freeSales++;
        }
    }

    return {
        buyers: buyers,
        exchanges: exchanges,
        pricedSales: pricedSales,
        freeSales: freeSales,
        csv: csv
    };
}