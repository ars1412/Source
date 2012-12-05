/** 
 * Handle event for Mail function
 * 
 */
 
function createOneMailPlaceHolder(id) {
    var _oneMail = '<li class="user-online">' +
    '<input type="hidden" class="sender-name sender-name-tmp" />' +
    '<input type="hidden" class="mail-id mail-id-tmp" />' +
    '<div class="backgroud-left">' +
    '<div class="background-left-top"></div>' +
    '<div class="background-left-bottom"><div class="reply-icon reply-btn"> </div></div>' +
    '</div>' +
    '<div class="user-avatar user-avatar-tmp" id="user-avatar_'+id+'" ></div>' +
    '<div class="user-header">' +
    '<label class="user-name user-name-tmp" id="user-name_'+id+'"></label>' +
    '<div class="right">' +
    '<input type="hidden" class="groupId groupId-tmp"/>' +
    '<div id="ui-trash-shortcut" class="ui-trash-shortcut user-icon icon-delete icon-trash1"></div>' +
    '<div class="separator"></div>' +
    '<div id="ui-archive-shortcut" class="ui-archive-shortcut user-icon icon-archive icon-archive1"></div>' +
    '<div class="separator"></div>' +
    '<div id="ui-favorites-shortcut" class="ui-favorites-shortcut user-icon icon-favorite icon-favorite1"></div>' +
    '<div class="separator"></div>' +
    '<div id="reply-btn" class="user-icon icon-reply reply-btn"> </div>' +
    '<div class="separator"></div>' +
    '<label class="user-date sent-date sent-date-tmp" id="sent-date_'+id+'"></label>' +
    '</div>' +
    '</div>' +
    '<div class="user-text mail-content mail-content-tmp" id="mail-content_'+id+'"></div>' +
    '</li>';
        
    return _oneMail;
}

function createReplyTemplate() {
    var replyTpl = '<li class="write-message">' +
    '<input type="hidden" class="sender-name-rep" />' +
    '<input type="hidden" class="mail-id-rep" />' +
    '<div class="write-message-left">' +
    '<div class="user-avatar"></div>' +
    '<div class="write-message-bottom"></div>' +
    '<div class="wms-camera"></div>' +
    '<div class="wms-attach"></div>' +
    '</div>' +
    '<div class="user-header user-header-rep"></div>' +
    '<div class="user-text user-text-rep"></div>' +
    '<div class="div-message-text-box">' +
    '<textarea class="message-text-box" name="comments" id="ui-text-content"></textarea>' +
    '</div>' +
    '<button class="reply-message" id="ui-reply-btn"></button>' +
    '</li>';
    return replyTpl;
}

function handleMessage() {
    $("#ui-msg-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active message-a");
        handleDisplayMenu("#ui-home");
        client.setType("all");
        client.category = 1;
        updateState(client.category);
        console.log('now switch to mail list.............' + client.category);
    });
    composeMail();
    replyMail();
    
}

function displayMailList(data) {
    var id = data.id;
    $("#current-content").prepend(createOneMailPlaceHolder(id));
    parseMailData(id, data);
    
}

function composeMail() {
    $("input#send-btn").off('click').on('click',  function(){ // send email 
        var rec = $("input#receiver").val();
        var content = $("#content-msg-to-send").val();
        client.sendMail(rec, content); // send mail
        
        // after send mail, refresh content
        //
        client.setType("all");
        handleDisplayMenu("#ui-home");
    });
    $("#ui-compose").off('click').on('click',  function(){
        $("#content-msg-to-send").val("");
        $("#active").attr("class", "active message-a");
        
        handleDisplayMenu("#ui-compose-msg");
    });
}

function parseMailData(id, data) {
    console.log('favorite:------ ' + data.isfavorite);
    console.log('archive:------ ' + data.isarchive);
    console.log('trash:------ ' + data.istrash);
    if(typeof data.isfavorite !== "undefined" && data.isfavorite === "YES") {
        $(".icon-favorite1").attr("class", "ui-favorites-shortcut user-icon icon-favorite-a");
    }
    if(typeof data.isarchive !== "undefined" && data.isarchive === "YES") {
        $(".icon-archive1").attr("class", "ui-archive-shortcut user-icon icon-archive-a");
    }
    
    if(typeof data.istrash !== "undefined" && data.istrash === "YES") {
        console.log('YES');
        $(".icon-trash1").attr("class", "ui-trash-shortcut user-icon icon-delete-a");
    }else {
        console.log('NO');
        $(".user-icon").removeClass("icon-trash1");
    }

    var _avatar = client.avatarPath + data.avatar;
    $(".user-avatar-tmp").css("background-image", "url(" + _avatar + ")");
    $(".mail-content-tmp").html(data.text);
    $(".sent-date-tmp").html(data.datesend);
    $(".user-name-tmp").html(data.original);
    $(".sender-name-tmp").val(data.original);
    $(".mail-id-tmp").val(id);
    $(".groupId-tmp").val(data.groupId);
    
    // remove class temporary
    $(".user-avatar").removeClass("user-avatar-tmp");
    $(".sender-name").removeClass("sender-name-tmp");
    $(".mail-content").removeClass("mail-content-tmp");
    $(".sent-date").removeClass("sent-date-tmp");
    $(".user-name").removeClass("user-name-tmp");
    $(".user-icon").removeClass("icon-favorite1");
    $(".user-icon").removeClass("icon-archive1");
    $(".user-icon").removeClass("icon-trash1");
    $(".mail-id").removeClass("mail-id-tmp");
    $(".groupId").removeClass("groupId-tmp");
    
    replyMail();
    markAsFavorite(id); // mark as favorite
    markAsArchive(id); // mark as archive
    markAsTrash(id); // mark as trash
    markAsDelete(id);

}

function replyMail() {
    $(".reply-btn").off('click').on("click", function() {
        
        var liEle = $(this).parents("li");
        var groupId = $(this).parent().find("input.groupId").val();
        var senderName = liEle.children("input.sender-name").val();
        var content = liEle.children("div.user-text").html();
        var mailID = liEle.children("input.mail-id").val();
        var userHeader = liEle.children("div.user-header").html();
        console.log('sender name:     ' + senderName);
        console.log('content:     ' + content);
        console.log('Mail ID:     ' + mailID);
        
        console.log('userheader:     ' + userHeader);
        handleDisplayMenu("#ui-reply-msg");
        
        
        $("#ui-reply-msg ul.content-ul").ready(function() {
            $("#ui-reply-msg ul.content-ul").html(createReplyTemplate());
            
            // show customize scroll-bar
            $("#ui-reply-msg ul.content-ul").find("#ui-text-content").slimScroll({
                height: '205px',
                width: '586px',
                start: 'top',
                railVisible: true,
                size: '10px',
                color: '#0000FF'

            }).css({
                position:'absolute',
                top:'0',
                left:'0',
                width:'566',
                height:'205'
            });
            
            $("#ui-reply-msg ul.content-ul").find("div.user-header-rep").html(userHeader);
            $("#ui-reply-msg ul.content-ul").find("div.user-text-rep").html(content);
            $("#ui-reply-msg ul.content-ul").find("input.sender-name-rep").val(senderName);
            $("#ui-reply-msg ul.content-ul").find("input.mail-id-rep").val(mailID);
            
            $("#ui-reply-msg ul.content-ul").find(".reply-btn").off('click').on('click',  function() {
                $("#ui-reply-msg ul.content-ul").find("#ui-text-content").focus(function() {
                    $(this).select();
                });
            });
            
            $("#ui-reply-msg ul.content-ul").find("#ui-reply-btn").off('click').on('click',  function() {
                var _replyContent = $("#ui-reply-msg ul.content-ul").find("#ui-text-content").val();
                console.log("reply to:     " + senderName);
                if(groupId && groupId.length > 0) {
                    console.log("Reply to group " + groupId);
                    client.sendMail(groupId, _replyContent, groupId); // send mail
                    handleDisplayMenu("#ui-groups");
                }
                else {
                    console.log("Reply to user " + senderName);
                    client.sendMail(senderName, _replyContent);
                    client.setType("all");
                    handleDisplayMenu("#ui-home");
                }
            });
        });
        return false;
    });
    
    
    
    
}



