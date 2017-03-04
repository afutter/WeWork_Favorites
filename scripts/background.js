//HTML variables for the favorite buttons
var unfavored='<span class="unfavored"> ♡  Favorite This Location</span>';
var favored= '<span class="favored"> ♥  Favorited This Location</span>';


//Control Handler, redirects to different functions based on message passed in
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

    if(request.actionType =='update'){
        /*If user clicks on a button, update its status in memory and return corresponding HTML.
         * Return the error message that comes back otherwise.
         */
        update(request.officeURL, request.officeName, request.officeCity).then(function(msg){
            sendResponse((msg == 'unfavored')? {result:unfavored} : {result:favored});
        }).catch(function(msg){
            sendResponse(msg);
        });
    }else if (request.actionType == 'status'){
        /* Gets current status of a given office and returns corresponding HTML.
         *  Return the error message that comes back otherwise.
         */
        getLocationHTML(request.officeURL).then(function(msg){
            sendResponse((msg == 'unfavored')? {result:unfavored} : {result:favored});
        }).catch(function(msg){
            sendResponse(msg);
        });

    }else if (request.actionType == 'getFavorites'){
        /* Returns a list of favorites to populate the popup.
         * Return the error message that comes back otherwise.
         */
        getAllFavorites().then(function(msg){
            sendResponse(msg);
        }).catch(function(msg){
            sendResponse(msg);
        });
    }else if(request.actionType == 'goTo'){
        /* If a user clicks on an office in the popup, redirect the current tab to the corresponding office's page */
        chrome.tabs.update(null,{url: request.href});
    }
    return true;
});

//Rerun script when you change location pages to re-inject the buttons
chrome.tabs.onUpdated.addListener((function(tabId, changeInfo, tab){
    if(changeInfo.url != null){
        chrome.tabs.executeScript(null, {file: 'scripts/contentscript.js', runAt: 'document_end'});
    }
}));


function update(officeURL, officeName, officeCity){
    return new Promise(function(resolve, reject) {
        //Get object holding offices' statuses
        chrome.storage.sync.get('offices', function (result) {
            if(chrome.runtime.error){
                reject('error getting offices in update');
            }else {
                /* If an object exists in memory it means its was favorite, remove from memory and return 'unfavored'.
                 * If an object does not exist in memory it means it was not a favorite. Add it to memory and return
                 * 'favored'.
                 *
                 * The structure of the key/value pair for a favorite office is the following.
                 * Key: URL of office
                 * Value{
                 *  Name of office,
                 *  City of office
                 * }
                 */
                var offices = result['offices'];

                if(offices[officeURL] == undefined){
                    offices[officeURL] = {
                        name: officeName,
                        city: officeCity
                    };
                    resolve('favored');
                    chrome.storage.sync.set({'offices': offices});
                }else{
                    resolve('unfavored');
                    delete offices[officeURL];
                    chrome.storage.sync.set({'offices': offices});
                }
            }
        })

    })

}

function getAllFavorites(){
    return new Promise(function(resolve, reject) {
        //Get object holding favorite offices and return it
        chrome.storage.sync.get('offices', function (result){
            if(chrome.runtime.error){
                reject('error getting offices in all favorites');
            }else {
                resolve(result['offices']);
            }
        })
    })

}
function getLocationHTML(officeURL){
    return new Promise(function(resolve, reject){
        //Get object holding favorite offices
        chrome.storage.sync.get('offices', function(result) {
            if (chrome.runtime.error) {
                reject('error getting offices in getLocationHTML');
            } else {
                var offices = result['offices'];
                /*If the offices object does not exist in memory. Create it, add the first city to the object
                 * and store it.
                 */
                if (offices == undefined) {
                    //add it to storage, add
                    offices = {}
                    chrome.storage.sync.set({'offices': offices});
                    resolve('unfavored');

                } else {
                    /*If current Office is in memory it means it is a favorite.
                     * If so, return 'favored' if not return 'unfavored'
                     */
                    resolve((offices[officeURL] == undefined)? 'unfavored' : 'favored');
                }
            }
        })
    })
}
