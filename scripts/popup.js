document.addEventListener('DOMContentLoaded', function () {
    //Get current list of favorites and build table of results. Replace table with a message if no favorites selected
    getFavorites().then(function(results){
        if( (Object.keys(results).length === 0 && results.constructor === Object) || results == null){
            var noFavorites = document.createElement("h3");
            noFavorites.innerText = "No Favorites Selected";
            document.body.replaceChild(noFavorites, document.getElementById("table"));

        }else {
            document.getElementById('table_body').innerHTML = addRows(results).join('');
            var link = document.getElementsByTagName('a');

            for (var i = 0; i < link.length; i++) {
                link[i].addEventListener('click', click.bind(this, link[i].href));
            }
        }
    }).catch(function(msg){
        console.log(msg);
        var noFavorites = document.createElement("h3");
        noFavorites.innerText = "No Favorites Selected";
        document.body.replaceChild(noFavorites, document.getElementById("table"));
    });
});

function click(href){
    //Send message to background.js to go to office's page
    chrome.runtime.sendMessage({actionType: 'goTo', href: href});
    window.close();
}

function getFavorites() {
    //Get list of favorites from background.js and return. If there is an error, return error message
    return new Promise(function(resolve, reject) {
        if(chrome.runtime.error){
            reject('could not get favorites');
        }else {
            chrome.runtime.sendMessage({actionType: 'getFavorites'}, function (response) {
                if(response == 'error getting offices in all favorites'){
                    reject(response);
                }else {
                    resolve(response)
                }

            })
        }
    })
}

function addRows(favorites){
    //Return array of HTML elements to add
    var toAppendToTable = [];
    for(var k in favorites){
        toAppendToTable.push(
            "<tr><td class = 'location_name'><a href='"+k+"'>"+favorites[k].name+"–"+favorites[k].city+"</a></td></tr>"
        )}
    return toAppendToTable;
}
