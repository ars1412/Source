/**
 * Handle event for Trash function
 */

function handleTrash() {
    $("#ui-trash-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active trash-a");
        
        handleDisplayMenu("#ui-trash");
		console.log('now switch to trash.............');
		client.setType("trash");
		
        if(client.category!==6){
            $("div#content-center").find("div#ui-trash ul#current-content6").empty();
            client.requestMailType('trash');
            _noResultTrash();
        }
        client.category = 6;
        updateState(client.category);
    });
}

function displayTrashMail(data) {
    var id = data.id;
    $("#current-content6").ready(function() {
        $("#current-content6").prepend(createOneMailPlaceHolder(id));
        parseMailData(id, data);
    });
    $("#noti-of-trash").hide();
   
}


function markAsTrash(id) {
    if(client.category!==6) {
        $(".ui-trash-shortcut").off('click').on("click", function() {
            var type = $(this).attr("class");
            var _parent = $(this).parents("li.user-online");
            var _id = _parent.find("input:hidden.mail-id").val();
            jConfirm('Are you sure to delete this mail?', 'Confirmation', function(r) {
                if(r===true){
                    _parent.empty();
                    if(endsWith(type, "-a")) {
                        console.log("unticked");
                        
                        $(this).attr("class", "ui-trash-shortcut user-icon icon-delete");
                        client.requestMarkedMail('markAsTrash', _id, 'NO');
                        if(client.category===6){
                            _parent.remove();
                            _noResultTrash();
                        }
                        updateHome(_id, 'trash');
                    }else{
                        console.log("ticked");
                        $(this).attr("class", "ui-trash-shortcut user-icon icon-delete-a");
                        client.requestMarkedMail('markAsTrash', _id, 'YES');
                    }
                }
            });
            
        });
    }
}

function markAsDelete(id) {
    if(client.category===6) {
        $(".ui-trash-shortcut").off('click').on("click", function() {
            var type = $(this).attr("class");
            var _parent = $(this).parents("li.user-online");
            var _id = _parent.find("input:hidden.mail-id").val();
            jConfirm('Are you sure to delete this mail permanently?', 'Confirmation', function(r) {
                if(r===true){
                    if(endsWith(type, "-a")) {
                        console.log("unticked");
                        $(this).attr("class", "ui-trash-shortcut user-icon icon-delete");
                        client.requestMarkedMail('markAsDelete', _id, 'NO');
                        if(client.category===6){
                            _parent.remove();
                            _noResultTrash();
                        }
                        updateHome(_id, 'delete');
                    }else{
                        console.log("ticked");
                        $(this).attr("class", "ui-trash-shortcut user-icon icon-delete-a");
                        client.requestMarkedMail('markAsDelete', _id, 'YES');
                    }
                }
            });
            
        });
    }
}


function _noResultTrash() {
    var _numChil = $("div#content-center").find("div#ui-trash ul#current-content6").find("li").length;
    console.log('num chile: ' + _numChil);
    if(_numChil == 0) {
        $("#noti-of-trash").show();
    }
}