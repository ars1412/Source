/**
 * Common javascript
 * 
 */

function handleShortcutIcon() {
    $("#ui-favorites-shortcut").click(function(){
        var _type = $("#ui-favorites-shortcut").attr("class");
		
        if(endsWith(_type, "-a")) {
            $("#ui-favorites-shortcut").attr("class", "user-icon icon-favorite");
        } else {
            $("#ui-favorites-shortcut").attr("class", "user-icon icon-favorite-a");
        }
    });
    
    $("#ui-archives-shortcut").click(function(){
        var _type = $("#ui-archives-shortcut").attr("class");
		
        if(endsWith(_type, "-a")) {
            $("#ui-archives-shortcut").attr("class", "user-icon icon-archive");
        } else {
            $("#ui-archives-shortcut").attr("class", "user-icon icon-archive-a");
        }
    });
}

/**
 * Handle display menu when it's selected from the left menu, 
 * and hide the rest
 */
function handleDisplayMenu(id) {
    
    $("html, body").animate({
        scrollTop:0
    }, "fast");
    // hide all menu
    $(".ui-hidden").hide();
    $(".ui-show").hide();
    
    
    // show only choosen menu
    $(id).show();
    $(id).attr("class", "ui-show");
}

function loadLayout() {
    $("#ui-archives").load("app/_assets/views/archive.html", function(event) {
        // show the archives
        });
    
    $("#ui-contacts").load("app/_assets/views/contacts.html", function(event) {
        // show the contacts
            
        });
    $("#ui-favorites").load("app/_assets/views/favorites.html", function(event) {
        // show the favorites
            
        });
    $("#ui-groups").load("app/_assets/views/groups.html", function(event) {
        // show the groups
            
        });
    $("#ui-write-msg").load("app/_assets/views/reply_mail.html", function(event) {
        // show the reply mail
            
        });
    $("#ui-setting").load("app/_assets/views/setting.html", function(event) {
        // show the setting
            
        });
        
    $("#ui-trash").load("app/_assets/views/trash.html", function(event) {
        // show the trash
            
        });
}

function updateHome(id, type) {
    if(client.category === 1) {
        return false;
    }
    console.log('update home with type: ' + type);
    var checker = false;
    var tarEle;
    var _fd;
    var _state;
    $('div#ui-home').find('li.user-online').each(function(index) {
        console.log('find: ' +  index);
        tarEle = $(this);
        
        var target = $(this).find('input:hidden.mail-id').val();
        console.log('target: ' + target);
        if(target == id) {
            console.log('equals');
            checker = true;
            return false;
        }
    });
    if(checker) {
        if(type==='favorite') {
            _fd = tarEle.find('.ui-favorites-shortcut');
            _state = _fd.attr("class");
            console.log('state: ' + _state);
            
            if(endsWith(_state, "-a")) {
                _fd.attr("class", "ui-favorites-shortcut user-icon icon-favorite");
            }else {
                _fd.attr("class", "ui-favorites-shortcut user-icon icon-favorite-a");
            }
        }else if(type==='trash') {
            _fd = tarEle.find('.ui-trash-shortcut');
            _state = _fd.attr("class");
            console.log('state: ' + _state);
            if(endsWith(_state, "-a")) {
                _fd.attr("class", "ui-trash-shortcut user-icon icon-delete");
            }else {
                _fd.attr("class", "ui-trash-shortcut user-icon icon-delete-a");
            }
        }else if(type==='archive') {
            _fd = tarEle.find('.ui-archive-shortcut');
            _state = _fd.attr("class");
            console.log('state: ' + _state);
            if(endsWith(_state, "-a")) {
                _fd.attr("class", "ui-archive-shortcut user-icon icon-archive");
            }else {
                _fd.attr("class", "ui-archive-shortcut user-icon icon-archive-a");
            }
            
        }else if(type==='delete') {
            tarEle.remove();
        }
        
        
    }
    
    return true;
}


jQuery.fn.watch = function( id, fn ) {
 
    return this.each(function(){
 
        var self = this;
 
        var oldVal = self[id];
        $(self).data(
            'watch_timer',
            setInterval(function(){
                if (self[id] !== oldVal) {
                    fn.call(self, id, oldVal, self[id]);
                    oldVal = self[id];
                }
            }, 100)
            );
 
    });
 
    return self;
};
 
jQuery.fn.unwatch = function( id ) {
 
    return this.each(function(){
        clearInterval( $(this).data('watch_timer') );
    });
 
};
 
 
jQuery.fn.valuechange = function(fn) {
    return this.bind('valuechange', fn);
};
 
jQuery.event.special.valuechange = {
 
    setup: function() {
 
        jQuery(this).watch('value', function(){
            jQuery.event.handle.call(this, {
                type:'valuechange'
            });
        });
 
    },
 
    teardown: function() {
        jQuery(this).unwatch('value');
    }
 
};

function scrollable() {
    $("#content-center").mCustomScrollbar({
        advanced:{
            updateOnBrowserResize:true, 
            updateOnContentResize:false, 
            autoExpandHorizontalScroll:false 
        }
    });
    
    $("#content-center").mCustomScrollbar("update");
}

function removeCategory() {
    $("div#content-center").find("div#ui-favorites ul#current-content4").empty();
    $("div#content-center").find("div#ui-archives ul#current-content5").empty();
    $("div#content-center").find("div#ui-trash ul#current-content6").empty();
}

function updateState(state) {
    localStorage.state = state;
}

function restoreState(state) {
    switch (state) {
        case 2: // contacts
            activateContact();
            break;
        case 3: // groups
            activateGroup();
            break;
        case 4: // favorites
            activateFavorite();
            break;
        case 5: // archives
            activateArchive();
            break;
        case 6: // trash
            activateTrash();
            break;
        case 7: // setting
            activateSetting();
            break;
        default:
            console.log('As first time for log in');
    }
    
    updateState(state);
}

function activateContact() {
    $("#active").attr("class", "active contact-a");
        
    handleDisplayMenu("#ui-contacts");
    if(client.category!==2){
        client.contactHolder = [];
        client.requestContact();
        client.requestGroup();
        $('div#contact-placeholder').empty();
        $('div#contact-search-placeholder').empty();
        $('div#contact-search-placeholder').hide();
        $('div#group-placeholder').empty();
    }
    client.category = 2;
        
    addNewContact();
    $("input#send-btn-group").off('click').on('click',  function(){ // send email 
        var content = $("textarea#content-msg-to-send-group").val();
        client.sendMail($('#receiver-group-name-hidden').val(), content, $('#receiver-group-id-hidden').val()); // send mail
        $("textarea#content-msg-to-send-group").val("");
        handleDisplayMenu("#ui-contacts");
    });
}

function activateGroup() {
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
}

function activateFavorite() {
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
}

function activateArchive() {
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
}
function activateTrash() {
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
}
function activateSetting() {
    $("#active").attr("class", "active setting-a");

    handleDisplayMenu("#ui-setting");
    client.requestUserInfo();
    client.category = 7;
    
    setProfile();
    sendFile();
}
 
//// Usage:
//$('input').bind('valuechange', function(){
//    log('Value changed... New value: ' + this.value);
//});