/** 
 * Handle event for Favorite
 */

function handleFavorite() {
    $("#ui-favorites-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active favorite-a");
        handleDisplayMenu("#ui-favorites");
		client.setType("favorite");
		console.log('now switch to favorite.............' + client.category);
		
        if(client.category!==4){
            // erase before re-draw
            $("div#content-center").find("div#ui-favorites ul#current-content4").empty();
            client.requestMailType('favorite');
            _noResultFavorite();
        }
        client.category = 4;
        updateState(client.category);
    });
    
}



function displayFavoriteMail(data) {
    var id = data.id;
    $("#current-content4").ready(function() {
        $("#current-content4").prepend(createOneMailPlaceHolder(id));
        parseMailData(id, data);
    });
    $("#noti-of-favorite").hide();
   
}

function markAsFavorite(id) {
    console.log('mark as favorite-------------------');
    $(".ui-favorites-shortcut").off('click').on("click", function() {
        var type = $(this).attr("class");
        var _parent = $(this).parents("li.user-online");
        var _id = _parent.find("input:hidden.mail-id").val();
        if(endsWith(type, "-a")) {
            console.log("unticked");
            $(this).attr("class", "ui-favorites-shortcut user-icon icon-favorite");
            client.requestMarkedMail('markAsFavorite', _id, 'NO');
            if(client.category===4){
                _parent.remove();
                _noResultFavorite();
            }
            updateHome(_id, 'favorite');
        }else{
            console.log("ticked");
            $(this).attr("class", "ui-favorites-shortcut user-icon icon-favorite-a");
            client.requestMarkedMail('markAsFavorite', _id, 'YES');
        }
    });
}

function _noResultFavorite() {
    var _numChil = $("div#content-center").find("div#ui-favorites ul#current-content4").find("li").length;
    console.log('num chile: ' + _numChil);
    if(_numChil == 0) {
        $("#noti-of-favorite").show();
    }
}

