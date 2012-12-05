//////// Client ////////////////
Client = function() {

    //this.avatarPath = "http://dev-mobile.herokuapp.com/tmp/";
	this.avatarPath = "http://localhost:8089/tmp/";

    this.username = "";
    this.crypt = new Crypt(this);
    this.crypt.connect(window.location);
    this.isFavorite = false;
    this.isArchive = false;
    this.isTrash = false;
    this.credentials = {};
    this.mailHolder = [];   // store all mail get from server
    
    this.found = false;
    
    
    this.type = "all";  // default fetch mail from server
    this.category = 1;
    
    this.contactHolder = [];
    this.groupHolder = {};      // store list of groups
}


Client.prototype.salted = function(data) {
    console.log('salted ' + data.salt);
    var credentials = this.credentials || this.getInputs();
    
    console.log('\tcredentials = ' + JSON.stringify(this.credentials));
    var hashed = this.crypt.salthash(credentials.password, data.salt);
    console.log('hashed = ' + JSON.stringify(hashed))
    
    var hashedAgain = this.crypt.salthash(hashed.hashed);
    this.greet('signin', $.extend({
        username:credentials.username
    }, hashedAgain));

}

Client.prototype.greet = function(verb, credentials) {
    this.crypt.setId(credentials.username);
    var msg = $.extend(credentials, {
        event:verb
    });
    
    this.crypt.send(msg, 'server');
}

Client.prototype.authed = function(data) {
    console.log('authenticate -- ' + data.success);
    var i = this.getInputs();
    var reason = data.reason;
    if (data.success) {
        if(reason.startsWith("signup")) {
            console.log("sign up ok------------------------------");
            jAlert("Successfully signed up!");
        //            $("#error-msg").html("<i>Successfully signed up and automatically sign in a moment!</i>").delay(3000);
        }
        
        
        if  (i.username.length) {
            this.credentials.username = i.username;
			this.credentials.password = i.password;
            if (data.email)
                this.credentials.email = data.email;
            if (data.website)
                this.credentials.website = data.website;
            if (data.firstname)
                this.credentials.firstname = data.firstname;
            if (data.lastname)
                this.credentials.lastname = data.lastname;
            if (data.avatar) {
                this.credentials.avatar = data.avatar;
            }
            
        //            if (this.fChecked)
        //            {
        //                localStorage.credentials = JSON.stringify(i);
        //            }
        }
        // request to fetch all mail from server
        this.requestAllMail();
		
        localStorage.setItem("login", true);
        successLogin();         // success to login
    }
    else {
        if(reason.startsWith("signup")) {
            console.log("sign up failed------------------------------");
            $("#error-msg").show();
            $("#error-msg").html("<i>Username already exist. Plz try different username!</i>").delay(2000).fadeOut('fast');           
        }else {
            this.credentials = {};
            failedLogin();
        }
    }
}
 
Client.prototype.texted = function(data) {
    console.log('texted -- ' + JSON.stringify(data));
    
    if(data.groupId) { 
        console.log("Mail to group " + JSON.stringify(data));
        displayMailGroup(data);
        return;
    }
    
    if(typeof data.isarchive === "undefined" &&
        typeof data.istrash === "undefined" &&
        typeof data.isfavorite === "undefined") {
        this.type = "all";
    }

    if(this.type === "all" && typeof data.istrash === "undefined") {
        console.log('request all mail');
        this.mailHolder.push(data);     
        console.log("length of mail holder:................" + this.mailHolder.length);
        displayMailList(data);
    }else if(this.type === "favorite") {
        console.log('request favorite mail');
        
        displayFavoriteMail(data);
    }else if(this.type === "archive") {
        
        console.log('request archive mail');
        displayArchiveMail(data);
    }else if(this.type === "trash") {
        console.log('request trash mail');
        displayTrashMail(data);
    }
}

Client.prototype.textmail = function(data) {
    console.log('textmail -- ' + JSON.stringify(data));
    
}

Client.prototype.contacted = function(data) {
    console.log('contact -- ' + JSON.stringify(data));
    if(data.status === 'found') {
        displayMatchedContactFromServer(data, $('div#contact-search-placeholder'));
        displayContactList(data);
        this.contactHolder.push(data.name);
        this.found = true;
        $('div#contact-search-placeholder').find('#contact-search-placeholder').empty();
    } else if(data.status === 'notfound'){
        console.log('no contact found-------------------------------');
        this.found = false;
        $('#contact-search-placeholder').html('<i>The contact does not exist.</i>');
    } else if(data.status === 'removedok') {
        console.log('removed contact-------------------------------');
        
    }
    console.log('length: ' + this.contactHolder.length);
}

Client.prototype.grouped = function(data) {
    console.log('group -- ' + JSON.stringify(data));    
    if(data.type == 'GroupExsiting') {
        jAlert('Group: ' + data.groupName + ' exsiting', 'Warning', function() {
			callbackUpdateGroupNameFailed(data);
		});
		return false;
    }else if(data.type == 'AlreadyInGroup') {
        jAlert('User: ' + data.contactName + ' already in group ' + data.groupName, 'Warning', function() {
			callbackAddUserToGroupFailed(data);
		});
		return false;
    }else if(data.type == 'AddContactSuccess'){
		callbackAddUserToGroupSuccess(data);
	}else if(data.type == 'GroupId') {
        updateGroupIdForNewGroup(data);
    }
    if(data.flag === 'findAllGroupOfUser') {
        // display group from server
        if(this.category == 2) {    // currently in contact tab
            displayMyGroups(data);
        }
        else if(this.category == 3) {   // currently in group tab
            displayGroupHeader(data);
        }
    }
}

Client.prototype.receivecontact = function(data) {
    //contactFromServer(data);
    }

Client.prototype.receiveGroup = function(data) {
    //groupFromServer(data);
    }

Client.prototype.informed = function (data) {
    displayUserInfo(data);
}
    
/**
 * Handle input/output from server
*/
Client.prototype.handle = function(data) {
    console.log('receive msg from server:........' + JSON.stringify(data));
    if (data.event === 'salt') {
        this.salted(data);
    }
    else if(data.event === 'info') {
        this.informed(data);
    }
    else if (data.event === 'auth') {
        this.authed(data);
    }
    else if (data.event === 'text') {
        this.texted(data);          
    }
    else if (data.event === 'mail') {
        this.textmail(data);        
    }
    else  if (data.event === 'contact') {
        this.contacted(data);
    }
    else  if (data.event === 'groups'){
        this.grouped(data);
    }
}

Client.prototype.setUsername = function(username) {
    this.username = username;
}

Client.prototype.getUsername = function() {
    return this.username;
}

Client.prototype.setCredentials = function(credentials) {
    this.credentials = credentials;
}

Client.prototype.getCredentials = function() {
    return this.credentials;
}

Client.prototype.setType = function(type) {
    this.type = type;
}

Client.prototype.getType = function() {
    return this.type;
}



/**
 * Get username and password to log in
 */
Client.prototype.getInputs = function() {
    // store username and password at local storage
    if(!localStorage.username && !localStorage.password) {
        localStorage.username = $("#username").val();
        localStorage.password = $("#password").val();
    }
    return { 
        username: localStorage.username, 
        password: localStorage.password
    };
}

Client.prototype.signin = function(credentials) {
    console.log('signin ' + JSON.stringify(credentials));
        
    $("#ui-signedin-checker").val("0");
    this.credentials = credentials || this.getInputs();
    
    console.log('signin-------------------: ' + JSON.stringify(this.credentials));
	
    $.extend(this, this.credentials);
    this.greet('salt', {
        username: this.credentials.username
    });
}

Client.prototype.signup = function(credentials) {
    console.log('signup ' + JSON.stringify(credentials));
    var hashed = this.crypt.salthash(credentials.password);
    console.log("signup hashed " + JSON.stringify(hashed));
    this.greet('signup', $.extend({
        username:credentials.username
    }, hashed));
}


/**
 * Check whether or not the username is already logged in
 * @return true if already loggin, otherwise false
*/
function beforeRender() {
    if(localStorage.getItem("login") !== null) {
        return true;
    }
    return false;
}

function failedLogin() {
    // show error message
    removeTimeout();
    localStorage.clear();
    $("#ui-login-page").show();
    $("#ui-splash-loading").hide();
    $("#error-msg").fadeIn("fast", function(){
        $("#error-msg").html("<i>Maybe username or password incorrect!</i>");
    });
    
    
}

function successLogin() {
    // show error message
    $("body").unbind("keypress");
    $("#ui-login-page").hide();
    $("#ui-splash-loading").hide();
    $("#ui-contaner").show();   // show the mail page
    removeTimeout();
    localStorage.username = client.credentials.username;
    localStorage.password = client.credentials.password;
    $("#ui-signedin-checker").val("1");     // represent logged in successfully
    
    if(state > 0) {
        restoreState(state);
    }
}

/**
 * Send an email to given address
 * @param dest Given address
 * @param content The content will be sent to given address
 * @param groupId ID of the group or null if not a group mail
 */
Client.prototype.sendMail = function(dest, content, groupId) {
    // encrypt content before send
    var encryptdata = this.crypt.encryptMessage(content);
    console.log("Sending mail " + dest + " " + content + " " + groupId);
    
    // send message to specific address
    if(groupId) {
        this.crypt.send({
            event:'mail', 
            destination: dest, 
            text:encryptdata.data, 
            symdata : encryptdata.symdata,
            groupId: groupId
        }, 'server');
    }
    else {
        this.crypt.send({
            event:'mail', 
            destination: dest, 
            text:encryptdata.data, 
            symdata : encryptdata.symdata
        }, 'server');
    }
}

/**
 * Send request to server for saving setting
 * @param profData profile data will be sent to server for updating setting
 */
Client.prototype.saveSetting = function(profData) {
    console.log("update profile setting.....................................");
    
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username,
        type: 'profile',
        msg: profData
    }, 'server');	
}

/**
 * Send an email to given address
 * @param dest Given address
 * @param content The content will be sent to given address
 * @param groupId ID of the group or null if not a group mail
 */
//function sendMail(dest, content, groupId) {
//    // encrypt content before send
//	console.log("Sending mail");
////	console.log("Sending mail " + dest + " " + content + " " + groupId);
//	
//    var encryptdata = client.crypt.encryptMessage(content);
//    
//    // send message to specific address
//    client.crypt.send({
//        event:'mail', 
//        destination: dest, 
//        text:encryptdata.data, 
//        symdata : encryptdata.symdata,
//        groupId: groupId
//    }, 'server');	
//}

Client.prototype.requestAllMail = function() {
    // request all message
    console.log("send request to get all mail from server.......................");
    this.setType("all");
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username
    }, 'server');  
}

/**
 * Request all contact from server
 */
Client.prototype.requestContact = function(found) {
    // request all contact from server for given username
    console.log("send request to get my contact.......................");
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        type: 'mycontact', 
        msg: 'AllContact',
        found: found
    }, 'server'); 
}

/**
 * Request to add all contact from server has
 */
Client.prototype.requestFindContact = function(target) {
    // request all contact from server for given username
    console.log("send request to find  contact from server.......................");
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        target: target,
        type: 'mycontact', 
        msg: 'FindContact'
    }, 'server'); 
}

/**
 * Request to add all contact from server has
 */
Client.prototype.requestAddContact = function(target) {
    // request all contact from server for given username
    console.log("send request to add  contact from server.......................");
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        target: target,
        type: 'mycontact', 
        msg: 'AddContact'
    }, 'server'); 
}


/**
 * Request remove a contact from contact list
 * @param contactID a given contact ID will be removed
 */
Client.prototype.requestRemoveContact = function(contactID) {
    // request remove a contact from server for given contact ID
    console.log("send request to remove a contact.......................");

    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        type: 'mycontact', 
        msg: 'RemoveContact',
        id: contactID
    }, 'server'); 
}

Client.prototype.requestRemoveGroup = function (groupId) {
    if(!groupId) {
        return;
    }
    console.log("requestRemoveGroup " + groupId);
    
    this.crypt.send({
        event: 'mess',
        username: this.credentials.username,
        groupId: groupId,
        type: 'mygroup',
        msg: 'RemoveGroup'
    }, 'server');
}

/**
 * Get all group for current signed in username
 */
Client.prototype.requestGroup = function() {
    console.log("send request to get group .......................");
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        type: 'mygroup', 
        msg: 'AllGroups'
    }, 'server'); 
}

Client.prototype.requestRemoveUserGroup = function (groupId, contactName) {
    if(!groupId) {
        return;
    }
    console.log("requestRemoveUserGroup " + groupId + " " + contactName);
    
    this.crypt.send({
        event: 'mess',
        username: this.credentials.username,
        type: 'mygroup',
        msg: 'RemoveUser',
        contactName: contactName, 
        groupId: groupId
    }, 'server');
}

/**
 * Get mails of a group
 */
Client.prototype.requestGroupMail = function (groupId) {
    if(!groupId) {
        return;
    }
    console.log("requestGroupMail " + groupId);
    this.crypt.send({
        event: 'mess',
        username: this.credentials.username,
        type: 'mygroup',
        msg: 'GroupMail',
        groupId: groupId
    }, 'server');
}

Client.prototype.requestAllGroupMail = function () {
    console.log("requestAllGroupMail ");
    this.crypt.send({
        event: 'mess',
        username: this.credentials.username,
        type: 'mygroup',
        msg: 'GroupMail'
    }, 'server');
}

Client.prototype.requestGroupMessage = function() {
    console.log("send request to get message of group .......................");

    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        type: 'group', 
        msg: 'YES'
    }, 'server'); 
}


/**
 * Send request to create new group
 * @param grName group name
 * @param grDesc group description
 */
Client.prototype.requestCreateGroup = function(grName, grDesc, contactName) {
    console.log("Request create group " + grName + " " + grDesc + " " + contactName);

    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        groupName: grName,
        description: grDesc,
        contactName: contactName,
        type: 'creategroup', 
        msg: 'CreateGroup'
    }, 'server'); 
}

/**
 * Request to change group description and name
 * @param grName group name
 * @param grDes group description
 * @param groupID id of the group
 * @param color
 */
Client.prototype.requestUpdateGroup = function(groupID, grName, grDes, color) {
    if(!groupID) {
        return;
    }
    
    console.log("Update group " + grName + " " + grDes + " " + groupID + " " + color);
	
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        groupName: grName,
        description: grDes,
        color: color,
        type: 'myGroup', 
        msg: 'UpdateGroup',
        groupId: groupID
    }, 'server'); 
}

/**
 * Request to change group description and name
 * @param contactName 
 * @param contactID
 * @param groupID
 */
Client.prototype.requestAddUserToGroup = function(contactName, contactID, groupID) {
    console.log("Add User To group " + contactName + " " + contactID + " " + groupID);
	
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        contactName: contactName,
        contactId: contactID,
        type: 'myGroup', 
        msg: 'AddUserGroup',
        groupId: groupID
    }, 'server'); 
}

/**
 * Request mail type. There are 3 types of mail: favorite, trash, and archive
 * @param type the type of mail which can be favorite, trash or archive
 */
Client.prototype.requestMailType = function(type) {
    console.log("send request to get " + type +".......................");
    this.setType(type);
    this.crypt.send({
        event: 'mess', 
        username: this.credentials.username, 
        type: type, 
        msg: 'YES'
    }, 'server'); 
}

Client.prototype.requestMarkedMail = function(type, id, isMarked) {
    console.log("send request to mark a mail " + type +".......................");
    // 'markAsFavorite', 'markAsDelete', 'markAsTrash', 'markAsArchive'
    // isMarked: YES or NO
    this.crypt.send({
        event: 'mark', 
        id: id,
        destination: this.credentials.username,
        text: isMarked,
        type: type
    }, 'server'); 
}

Client.prototype.requestUserInfo = function() {
    console.log('requestUserInfo');
    this.crypt.send({
        event: 'mess',
        msg: 'UserInfo',
        username: this.credentials.username
    }, 'server');
}



