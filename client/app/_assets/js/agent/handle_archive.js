/** 
 * Handle event for Archive function
 * 
 */

function handleArchive() {
    $("#ui-archives-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active archive-a");
        
        handleDisplayMenu("#ui-archives");
		client.setType("archive");
		console.log('now switch to archive.............' + client.category);
        if(client.category!==5){
            // erase before re-draw
            $("div#content-center").find("div#ui-archives ul#current-content5").empty();
            client.requestMailType('archive');
            _noResultArchive();
        }
        client.category = 5;
        updateState(client.category);
    });
}

function displayArchiveMail(data) {
    var id = data.id;
    $("#current-content5").ready(function() {
        $("#current-content5").prepend(createOneMailPlaceHolder(id));
        parseMailData(id, data);
        
    });
    $("#noti-of-archive").hide();
}


function markAsArchive(id) {
    $(".ui-archive-shortcut").off('click').on("click", function() {
        var type = $(this).attr("class");
        var _parent = $(this).parents("li.user-online");
        var _id = _parent.find("input:hidden.mail-id").val();
        if(endsWith(type, "-a")) {
            console.log("unticked");
            $(this).attr("class", "ui-archive-shortcut user-icon icon-archive");
            client.requestMarkedMail('markAsArchive', _id, 'NO');
            if(client.category===5){
                _parent.remove();
                _noResultArchive();
            }
            updateHome(_id, 'archive');
        }else{
            console.log("ticked");
            $(this).attr("class", "ui-archive-shortcut user-icon icon-archive-a");
            client.requestMarkedMail('markAsArchive', _id, 'YES');
        }
    });
}

function _noResultArchive() {
    var _numChil = $("div#content-center").find("div#ui-archives ul#current-content5").find("li").length;
    console.log('num chile: ' + _numChil);
    if(_numChil == 0) {
        $("#noti-of-archive").show();
    }
}

