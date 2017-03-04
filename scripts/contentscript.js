
//adding css
addCSS();

/*Since react code sometimes does modification such that dom is not fully populated, run script at intervals until
 * correct dom elements are there
 */
var waitToRetry = setInterval(runScript, 500);

function runScript(){
    //Get offices
    var offices = document.getElementsByClassName('component__buildingCard__1BNLK');

    if(offices.length > 0){
        //Once sure have list of offices. get the city for all the offices
        var city = getCity();

        //Add favorite buttons
        for (var i = 0; i < offices.length; i++) {

            //Url for a particular office
            var hrefElement = offices[i].getElementsByClassName('SL_norewrite link__buildingCard__1Fa6h');

            //Office name
            var currOffice = offices[i].getElementsByClassName('title__buildingCard__TKgTF')[0].innerText;

            //Add button to webpage
            if(offices[i].getElementsByClassName("favorite").length == 0){
                offices[i].appendChild(createFavoriteButton(hrefElement[0].href, currOffice, city));
            }
        }

        //Dont need to keep retrying once button is added
        clearInterval(waitToRetry);
    }
}
function addCSS(){
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('css/contentscriptstyle.css');
    (document.head||document.documentElement).appendChild(style);
}

function getCity(){
    var cityParent = document.getElementsByClassName('breadcrumb__breadcrumbs__-PfiP last__breadcrumbs__1Yyfh');
    return cityParent[0].getElementsByClassName('SL_norewrite link__breadcrumbs__1Hh6U caption')[0].innerText;
}

function createFavoriteButton(url, name, city){

    var favoriteButton=document.createElement("button");
    favoriteButton.className = "large__button__1Z5di solidSecondary__button__2lHG6 nonText__button__lRvKq " +
        "base__button__2xa7u h4 fullWidth__button__1JGSC favorite";
    favoriteButton.id = url;

    /*Get the HTML to populate the button to reflect if office is a favorite.
    * If there is an error, an error message is returned
    * */
    getFavStatus('status', url).then(function(msg){
        favoriteButton.innerHTML = msg;
    }).catch(function(msg){
        console.log(msg);

    });

    //Add listener to update text if added to favorites
    favoriteButton.addEventListener('click', click.bind(favoriteButton, 'update', url, name, city));

    //Wrap button in a div for styling
    var buttonWrapper = document.createElement("div");
    buttonWrapper.className = "button_wrapper";
    buttonWrapper.appendChild(favoriteButton);

    return buttonWrapper;

}
function click(type, url, name, city){
    /*Send message to background.js to update favorite status of an office, returns html for the new status and its
     *replaced in the button
     */
    chrome.runtime.sendMessage({actionType: type, officeURL: url, officeName: name, officeCity: city}, function(response){
        if(response == 'error getting offices in update') {
            console.log(response);
        }else{
            document.getElementById(url).innerHTML = response.result;
        }
    });

}

function getFavStatus(type, url){

    return new Promise(function(resolve, reject){
        /*Send message to background.js to get current favorite status of an office.
        * The response will return the appropriate html or will pass an error message back.
        */
        chrome.runtime.sendMessage({actionType: type, officeURL: url}, function(response){
            if(response.result == 'error getting offices in getLocationHTML'){
                reject('getFavStatus came back null');
            }else{
                resolve(response.result);
            }

        });
    });
}



