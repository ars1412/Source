/**
 * Handle event for Group
 */
function handleGroup() {
    $("#ui-groups-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active groups-a");
        $("html, body").animate({
            scrollTop:0
        }, "fast");
        handleDisplayMenu("#ui-groups");
        
        if(client.category!==3){
            $("#current-content-9").empty();
            client.requestAllGroupMail();
            $('div.groups-head').html('');
            client.requestGroup();
        }
        
        client.category = 3;
        updateState(client.category);
    });
}

function createGroupHeaderWrapper(data) {
    var re = '<div class="group-title groups-' + data.color + '">' + 
    data.groupName +
    '<input type="hidden" value="' + data.id + '" class="groupId">' +
    '</div>';
    
    return re;
}

function displayGroupHeader(data) {
    $('div.groups-head').prepend(createGroupHeaderWrapper(data));
    var thizGroup = $('div.groups-head div.group-title input:hidden[value=' + data.id + ']').parent();
    thizGroup.off('click').on('click',  function () {
        $("#current-content-9").empty();
        client.requestGroupMail($(this).find('input.groupId').val());
    });
}

function displayMailGroup(data) {
    console.log("call displayMailGroup");
    var id = data.id;
    $("#current-content-9").ready(function() {
        $("#current-content-9").prepend(createOneMailPlaceHolder(id));
        parseMailData(id, data);
    });
//    $("#noti-of-group").hide();
}
