/** 
 * Handle event for Contact function
 * 
 */

var draggedContact;

function updateGroupIdForNewGroup(data) {
    $('.contact-g-head > input.groupId[value="undefinedGroupId"]').val(data.groupId);
	var currentGroup = $('.contact-g-head > input.groupId[value="'+data.groupId+'"]').parents("div.contact-g-head");
	var lb_grname = currentGroup.find("label.display-gr-name");	
	lb_grname.html(data.groupName);
	// remove temp class
	$('.setting-name').removeClass('setting-name-tmp');	
} 

function callbackUpdateGroupNameFailed(data) {
    var currentGroup = $('.contact-g-head > input.groupId[value="'+data.groupId+'"]').parents("div.contact-g-head");
	var lb_grname = currentGroup.find("label.display-gr-name");	
	lb_grname.html(data.currentName);	
} 

function callbackAddUserToGroupSuccess(data){
	// remove temp class
	$('.setting-name').removeClass('setting-name-tmp');	
}

function callbackAddUserToGroupFailed(){	
	var errContact = $('div.setting-name-tmp');
	errContact.remove();
}

function createContactWrapper() {
    var _cTpl = '<div class="dragbox contact-friend dragbox-content contact-friend-tmp" style="padding: 20px 0 0 0;">' +
    '<div id="draggable" class="setting-name contact-draggable ui-draggable contact-draggable-tmp" style="left: 0px; top: 0px;">' +
    '<input type="hidden" value="test2">' +
    '<div class="contact-avatar"></div>' +
    '<div style="float: left; width: 200px;">' +
    '<label class="label-name">Username 02</label>' +
    '<label class="label-domain">www.yourdomain.com</label>' +
    '</div>' +
    '<div class="contact-action">' +
    '<i class="action-add"></i>' +
    '<i class="action-delete del-contact"></i>' +
    '</div>' +
    '</div>' +
    '</div>';
    return _cTpl;
}

function createGroupWrapper() {
    var _template = '<div class="contact-group contact-group contact-group-tmp">' +
    '<div class="contact-g-head contact-g-head-tmp">' + 
    '<label class="display-gr-name"></label>' +
    '<input type="hidden" class="groupId" value="undefinedGroupId">' + 
    '</div>' +
    '<div class="contact-g-h-action">' +
    '<div style="display: none;" class="action-set-background">' +
    '<i name="yellow" class="i-color i-color-yellow"></i>' +
    '<i name="orange" class="i-color i-color-orange"></i>' +
    '<i name="red" class="i-color i-color-red"></i>' +
    '<i name="blue" class="i-color i-color-blue"></i>' +
    '<i name="grey" class="i-color i-color-grey"></i>' +
    '</div>' +
    '<i class="add-icon push-contact" id="push-contact"></i>' +
    '<i class="set-background" id="set-background"></i>' +
    '<i class="delete-icon" id="del-group"></i>' +
    '</div>' +
                        
    // setting name   
    '</div>';
    return _template;
}

function createGroupListView() {
    var _lv = '<div class="setting-name setting-name-tmp">' +
    '<input type="hidden" class="contact-id contact-id-tmp"/>' +
    '<div class="contact-avatar"></div>' +
    '<div style="float: left; width: 200px;">' +
    '<label class="label-name label-name-tmp"></label>' +
    '<label class="label-domain label-domain-tmp"></label>' +
    '</div>' +
    '<div class="contact-action">' +
    '<i class="action-delete del-group"></i>' +
    '</div>' +
    '</div>';
    return _lv;
}


function handleContact() {
    $("#ui-contacts-icon").off('click').on('click',  function(){
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
        if(client.category===2){
        	//$('div#group-placeholder').empty();
        }
        updateState(client.category);
    });
    addNewContact();
    $("input#send-btn-group").off('click').on('click',  function(){ // send email 
        var content = $("textarea#content-msg-to-send-group").val();
        client.sendMail($('#receiver-group-name-hidden').val(), content, $('#receiver-group-id-hidden').val()); // send mail
        $("textarea#content-msg-to-send-group").val("");
        handleDisplayMenu("#ui-contacts");
    });
}

function setBackgroundGroup() {
    $(".set-background").mouseover(function() {
        var _parent = $(this).parents("div.contact-g-h-action");
        var actionSetBg = _parent.children("div.action-set-background");
        actionSetBg.show();
        actionSetBg.mouseover(function() {
            actionSetBg.show();
            var iColorChild = actionSetBg.children("i.i-color").off('click').on('click', function() {
                var _cl = $(this).attr("name");
                var _gParent = $(this).parents("div.contact-group");
                _gParent.attr("class", "contact-group contact-group-common contact-group-"+_cl);
				
            });
            
            _parent.mouseout(function() {
                actionSetBg.hide();
            });
			
        });
        
    });
    
}

function _selectColor(color) {
    $(".i-color-"+color).off('click').on('click', function() {
        $(".contact-group").attr("class", "contact-group contact-group-common contact-group-"+color);
    });
}

function addNewContact() {
    $("#add-new-contact").off('click').on('click', function() {
        if($("#contact-search-box").is(':visible')) {
            console.log('visible, should not hide');
            $("#contact-search-box").hide();
            $('#contact-placeholder').show();
            $('#contact-search-placeholder').empty();
            $('#contact-search-placeholder').hide();
        }else {
            $("#contact-search-box").show();
            $("#contact-search-box > .contact-search-text").val("");
            //            $("#contact-search-box").keyup(function(e) {
            $("#contact-search-box").off('keyup').on('keyup', function(e) {
                var _val = $("#contact-search-box > .contact-search-text").val();
                if(_val != '') {
                    $('#contact-placeholder').hide();
                    $('div#contact-search-placeholder').show();

                    var ret = _searchContact(client.contactHolder, _val);
                    if(ret.length > 0) {
                        $('#contact-search-placeholder').empty();
                        _displayMatchedContact(ret, $('div#contact-search-placeholder'));
                    }else {
                        $('#contact-search-placeholder').empty();
                        if(e.keyCode === 13) { // enter to search over server
                            console.log('find to add a contact......................');
                            client.requestFindContact(_val);
                        }else {
                            $('div#contact-search-box > input.contact-search-btn').off('click').on('click', function(e){
                                console.log('find to add a contact......................');
                                client.requestFindContact(_val);
                            });
                        }
                    }
                }else {
                    $('#contact-placeholder').show();
                    $('div#contact-search-placeholder').empty();
                }

                e.preventDefault();
            });
        }
    });

}

function _displayMatchedContact(mContact, searchHolderEle) {
    for (var i=0; i<mContact.length; i++) {
        var _mTpl = createContactWrapper();
        searchHolderEle.append(_mTpl);
        $('div.contact-friend-tmp').find('input:hidden').val(mContact[i]);
        $('div.contact-friend-tmp').find('label.label-name').html(mContact[i]);
        $('div.contact-friend-tmp').find('label.label-domain').html('tohsoft.com');
        
        // remove temp class
        $('div.contact-friend').removeClass('contact-friend-tmp');
    }
    composeToContact();
    createNewGroup();
    removeContact();
}

function displayMatchedContactFromServer(data, searchHolderEle) {
    var _mTpl = createContactWrapper();
    searchHolderEle.append(_mTpl);
    $('div.contact-friend-tmp').removeClass('contact-friend');
    $('div.contact-friend-tmp').addClass('contact-not-friend');
    $('div.contact-friend-tmp').find('input:hidden').val(data.id);
    $('div.contact-friend-tmp').find('label.label-name').html(data.name);
    $('div.contact-friend-tmp').find('label.label-domain').html(data.website);

    // remove temp class
    $('div.contact-friend').removeClass('contact-friend-tmp');
    $('div.contact-not-friend').removeClass('contact-friend-tmp');
    
    $('#contact-search-placeholder').find('i.action-add').off('click').on('click', function() {
        client.requestAddContact($("#contact-search-box > .contact-search-text").val());
        $(this).parents('div.dragbox-content').attr("class", "dragbox contact-friend dragbox-content");        
    });
    
    composeToContact();
    createNewGroup();
    removeContact();
}

function _searchContact(contactHolder, val) {
    var matched = [];
    for (var i=0; i<contactHolder.length; i++) {
        if(contactHolder[i].indexOf(val) >= 0) {
            matched.push(contactHolder[i]);
        }
    }
    console.log('Number of matched contacts: ' + matched.length);
    return matched;
}

function dragContact() {
    var _thisEle;
    $("div#ui-contacts").find(".contact-draggable").draggable({
        revert: true
    });
    $("div#ui-contacts").find(".contact-draggable").bind("dragstop", function(event, ui) {
        _thisEle = $(this);
        $("#droppable-new-contact").droppable({
            drop: function(event, ui) {
                console.log("create new group.....................");
            }
        }); 
    });
    
    return _thisEle;
    
}

function createNewGroup() {
    
    var _thisEle; // this draggable element
    var _name;
    var _idContact;
    $("div#ui-contacts").find(".contact-draggable").draggable({
        revert: true, 
        start: function(event, ui) { 
            _thisEle = $(this); 
            draggedContact = _thisEle;
        }
    });
    $("div#ui-contacts").find(".contact-draggable").bind("dragstop", function(event, ui) {
        $("#droppable-new-contact").droppable({
            drop: function(event, ui) {
                // create new group
                console.log("create new group.....................");
                _createAContactInGroup(_idContact, _name, _thisEle);                
                client.requestCreateGroup($('.contact-g-head > label').html(), 'group Description', _thisEle.find('div > label.label-name').html());
            }
        }); 
        
        $('div.contact-group').droppable({
            drop: function(event, ui) {
                _idContact = _thisEle.children('input:hidden').val();
                _name = _thisEle.find('div > label.label-name').html();
                console.log(_name);
                if(!_inList($(this), _idContact)) {
                    var _row = createGroupListView();
                    $(this).append(_row);

                    $('.contact-g-head-tmp').html(_name);
                    $('.contact-group-tmp').append(_row);
                    $('.label-name-tmp').html(_name);
                    $('.label-domain-tmp').html("www.yourdomain.com/"+_name);
                    $('input:hidden.contact-id-tmp').val(_idContact);
                    var groupId = $(this).find('input.groupId').val();
                    client.requestAddUserToGroup(_name, _idContact, groupId);
                    // remove temp class
                    $('.contact-g-head').removeClass('contact-g-head-tmp');
                    $('.contact-group').removeClass('contact-group-tmp');
                    $('.label-name').removeClass('label-name-tmp');
                    $('.label-domain').removeClass('label-domain-tmp');
                    $('input:hidden.contact-id').removeClass('contact-id-tmp');	

					composeToContact('setting-name');
					_commonEventOnContact();
                } 
            }
        });               
    });   
}

function _inList(contactGroup, val) {
    var _checker = false;
    console.log('check user in list');
    contactGroup.find('div.setting-name').each(function(index) {
        var target = $(this).find('input:hidden.contact-id').val();
        console.log('target: ' + target);
        console.log('val: ' + val);
        if(target == val) {
            console.log('equals');
            _checker = true;
        }
    });    
    return _checker;
}

function _inList2(contactGroup, val) {
    var _checker = false;
    console.log('check user in list: ' + val);
    contactGroup.find('div.setting-name').each(function(index) {        
        var target = $(this).find('div > label.label-name').html();
        console.log('target: ' + target);
        console.log('val: ' + val);
        if(target == val) {
            console.log('equals');
            _checker = true;
        }
    });
    
    return _checker;
}

function displayContactList(data) {    
    $('div#contact-placeholder').append();
    
    var _mTpl = createContactWrapper();
    $('div#contact-placeholder').append(_mTpl);
    $('div.contact-friend-tmp').find('input:hidden').val(data.id);
    $('div.contact-friend-tmp').find('label.label-name').html(data.name);
    $('div.contact-friend-tmp').find('label.label-domain').html(data.website);

    // remove temp class
    $('div.contact-friend').removeClass('contact-friend-tmp');
    
    composeToContact();
    createNewGroup();
    removeContact();
}

function removeContact() {
    $('i.del-contact').off('click').on('click', function() {
        var parentEle = $(this).parents('div.dragbox');
        var contactID = parentEle.find('div#draggable > input:hidden').val();
        jConfirm('Are you sure to delete this contact?', 'Confirmation', function(r) {
            if(r===true){
                console.log('remove contact ID: '+ contactID);
                client.requestRemoveContact(contactID);
                parentEle.remove();
            }
        });        
    });
}

function composeToContact(sclass){
	$("label.label-name").mouseover(function() {
		$(this).attr('style', 'cursor: pointer;');
	});
	$('label.label-name').off('dblclick').on('dblclick',  function() {
    	handleDisplayMenu("#ui-compose-msg");
		if(typeof sclass == 'undefined') {
			sclass = 'dragbox';			
		}			
		var currentContact = $(this).parents('div.' + sclass);
		$("#receiver").val(currentContact.find("label.label-name").html());
        $("#receiver").attr('readonly', 'readonly');
        $("#content-msg-to-send").val('');
    });
}

function displayMyGroups(data) {
	//$('div#group-placeholder').empty();
    console.log("display my group.....................");
    
	var _gWrapper = createGroupWrapper();
                
    $('div#group-placeholder').prepend(_gWrapper);
    
    console.log('color:------------------- ' + data.color);
    var _groupColor = 'contact-group-'+data.color;
    
	$('div.contact-group').attr('_bgcolor', data.color);	
    $('.contact-group-tmp').addClass(_groupColor);
    $('.contact-group-tmp').addClass('contact-group-common');
    
    $('div.contact-g-head-tmp').find('label').html(data.groupName);
    $('div.contact-g-head-tmp').find('input:hidden').val(data.id);   	
   
    // remove temp class
    $('div.contact-g-head').removeClass('contact-g-head-tmp');
    var _contacts = data.contacts;
    console.log('length: ' + _contacts.length);
    for(var i=0;i<_contacts.length;i++) {
        if(_contacts[i]!=client.credentials.username) {
            var _row = createGroupListView();
            $('.contact-group-tmp').append(_row);
            _idContact = $('div.setting-name-tmp').find('input:hidden').val('1234567890');
            _name = $('div.setting-name-tmp').find('div > label.label-name').html(_contacts[i]);
			composeToContact('setting-name');
			if(client.credentials.username != data.owner)
				$('i.action-delete').remove();
            $('div.setting-name').removeClass('setting-name-tmp');
        }
    }
    
    // remove temp class
    $('.' + _groupColor).removeClass('contact-group-tmp');
    $('.contact-g-head').removeClass('contact-g-head-tmp');
    $('.contact-group').removeClass('contact-group-tmp');
    $('.label-name').removeClass('label-name-tmp');
    $('.label-domain').removeClass('label-domain-tmp');
    $('input:hidden.contact-id').removeClass('contact-id-tmp');
        
    _commonEventOnContact();
  
}

function _createAContactInGroup(_idContact, _name, _thisEle) {
    var _gWrapper = createGroupWrapper();
                
    $('div#group-placeholder').prepend(_gWrapper);    

    var _row = createGroupListView();
    _idContact = _thisEle.children('input:hidden').val();
    _name = _thisEle.find('div > label.label-name').html();
    console.log(_name);

    $('.contact-g-head-tmp').find('label').html("Enter group name...");
    $('.contact-group-tmp').append(_row);
    $('.label-name-tmp').html(_name);
    $('.label-domain-tmp').html("www.yourdomain.com/"+_name);
    $('input:hidden.contact-id-tmp').val(_idContact);

    // remove temp class
    $('.contact-g-head').removeClass('contact-g-head-tmp');
    $('.contact-group').removeClass('contact-group-tmp');
    $('.label-name').removeClass('label-name-tmp');
    $('.label-domain').removeClass('label-domain-tmp');
    $('input:hidden.contact-id').removeClass('contact-id-tmp');
	
	_commonEventOnContact();
}

function _commonEventOnContact() {
    $(".set-background").mouseover(function() {
        var _parent = $(this).parents("div.contact-g-h-action");
        var actionSetBg = _parent.children("div.action-set-background");
        actionSetBg.show();
        actionSetBg.mouseover(function() {
            actionSetBg.show();
            var iColorChild = actionSetBg.children("i.i-color").off('click').on('click', function() {
                var _cl = $(this).attr("name");
                var _gParent = $(this).parents("div.contact-group");
                _gParent.attr("class", "contact-group contact-group-common contact-group-"+_cl);
                client.requestUpdateGroup(_gParent.find("input.groupId").val(), _gParent.find("label.display-gr-name").html(), "group description", _cl);
            });

            _parent.mouseout(function() {
                actionSetBg.hide();
            });

        });

    });

    $('i.delete-icon').off('click').on('click', function() {
        var temp = $(this).parents("div.contact-group");
        jConfirm('Are you sure to delete this group?', 'Confirmation', function(r) {
            if(r===true){
                client.requestRemoveGroup(temp.find('input.groupId').val());
                temp.remove();
            }
        });
        
    });
    
    $('.contact-g-head > label').off('click').on('click', function() {// edit group name
        var _lb = $(this);
        var _val = $(this).html();
        var _pr = $(this).parent();
		var _cl = $(this).parents('div.contact-group');		
        $(this).hide();
        _pr.append('<input type="text" value="'+_val+'" class="edit-gr-name" />');
        _pr.find('input.edit-gr-name').focus();
        _pr.find('input.edit-gr-name').focusout(function() {
            $(this).remove();
            _lb.show();
            _lb.html($(this).val());			
            client.requestUpdateGroup(_lb.parent().find('input:hidden').val(), _lb.html(), 'group Description', _cl.attr('_bgcolor'));
        });		
		_pr.find('input.edit-gr-name').off('keyup').on('keyup', function(e) {
			if(e.keyCode === 13){
				$(this).remove();
				_lb.show();
				_lb.html($(this).val());
				client.requestUpdateGroup(_lb.parent().find('input:hidden').val(), _lb.html(), 'group Description', _cl.attr('_bgcolor'));
			}
		});
    }); 
    
    $('div.contact-action > i.del-group').off('click').on('click', function() {		
        var _rowC = $(this).parents('div.setting-name');
        var groupId = $(this).parents('div.contact-group').find('input.groupId').val();
        console.log("_rowC " + _rowC.html());
        var _numChil = $(this).parents('div.contact-group').find('div.setting-name').length;
        if(_numChil === 1) {
            client.requestRemoveGroup(groupId);
            $(this).parents('div.contact-group').remove();
        } else {
            client.requestRemoveUserGroup(groupId, _rowC.find("label.label-name").html());
            _rowC.remove();
        }
    });
    
    $('.push-contact').off('click').on('click',  function() {
        var currentGroup = $(this).parents("div.contact-group");
        handleDisplayMenu("#ui-compose-msg-group");
        $("#receiver-group").val(currentGroup.find("label.display-gr-name").html());
        $('#receiver-group-id-hidden').val(currentGroup.find("input.groupId").val());
        $('#receiver-group-name-hidden').val(currentGroup.find("label.display-gr-name").html());
    });
}
