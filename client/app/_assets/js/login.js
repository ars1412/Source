/** 
 * Handle login event
 * 
 */

var idInt;       // ID of interval

$(document).ready(function() {
	loadrm();
});

function handleInputLogin(client) {	
    $("#username").bind("focus", function(event, ui) {
        var _user = $("#username").val();
        if(_user === "Username...") {
            $("#username").val("");
        }
        $("#username").css({
            "-moz-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "-webkit-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "border-radius": "0px 0px 0px 0px"
        });
    });
    $("#username").bind("focusout", function(event, ui) {
        var _user = $("#username").val();    
        loadrm(_user);    
        if(_user === "") {
            $("#username").val("Username...");
        }
    });
	
    $("#password").bind("focus", function(event, ui) {
        $("#password").css({
            "-moz-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "-webkit-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "border-radius": "0px 0px 0px 0px"
        });
    });
	
    $("#ui-keep-login").bind("click", function(event, ui) {
        var type = $("#ui-keep-login").attr("class");
        if(endsWith(type, "on")) {
            $("#ui-keep-login").attr("class", "ui-keep-login ui-keep-login-off");
        } else {
            $("#ui-keep-login").attr("class", "ui-keep-login ui-keep-login-on");
            
        }
		
    });
	
    $("#tmp-password").bind("focus", function(event, ui) {
        $("#tmp-password").css({
            "-moz-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "-webkit-box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "box-shadow": "0px 0px 0px rgba(0, 0, 0, .0)",
            "border-radius": "0px 0px 0px 0px"
        });
        $("#tmp-password").hide();
        $("#password").show();
        $("#password").focus();
    });
    $("#password").bind("focusout", function(event, ui) {
        var _pwd = $("#password").val();
        if(_pwd === "") {
            $("#password").hide();
            $("#tmp-password").show();
        }
    });

    $("#ui-go-btn").live("click", function(event, ui) {
       doLogin(client);
    });
    $("body").keypress(function(event) {
        if(event.keyCode===13) { // press enter to login
           doLogin(client);
        } 
    });    
}



/**
 * set timeout to login
 **/
function timeout(millisecond) {
    if(typeof millisecond === undefined)
        millisecond = 10000;    // set default 10 seconds for timeout
    return setInterval(function() {
        failedLogin();
    }, millisecond);
}

function removeTimeout() {
    return window.clearInterval(idInt);
}
/**
 * Do login action
 */
function doLogin(client) {
	var _k_e_y_ = 'a3c56c6b41841b4acd07f91c266fa7d17dce85d8f98628cec6b6';
	var rem_class_type = $("#ui-keep-login").attr("class");
	if (endsWith(rem_class_type, "on")) {
		var _user =  $("#username").attr("value");
		var _password = $.rc4EncryptStr($("#password").val(), _k_e_y_);
		// set cookies to expire in 15 days
		$.cookie('usrn', _user, { expires: 15 }, '/');
		$.cookie('pwd', _password, { expires: 15 }, '/');
		$.cookie('remember', 1, { expires: 15 }, '/');
	} else {
		// reset cookies
		$.cookie('usrn', null);
		$.cookie('pwd', null);
		$.cookie('remember', null);
	}
	$("#ui-login-page").hide();
 	$("#ui-splash-loading").show();
 	idInt = timeout(30000);     // set login timeout 30 seconds
	if(client.credentials.username && client.credentials.password){
		client.signin(client.credentials);
	}else {
		client.signin();
	}
}
function loadrm(user_name){
	 var remember = 0;
	 var _k_e_y_ = 'a3c56c6b41841b4acd07f91c266fa7d17dce85d8f98628cec6b6';
	 if(typeof user_name == 'undefined'){
		 remember = $.cookie('remember');
	 }else{
		 remember = ($.cookie('remember') == 1 && $.cookie('usrn') == user_name) ? 1 : 0;
	 }	 
	 if ( remember == 1 ) {
    	 $("#ui-keep-login").attr("class", "ui-keep-login ui-keep-login-on");
    	 var _usrname = $.cookie('usrn');
    	 var _pwd = $.rc4DecryptStr($.cookie('pwd'), _k_e_y_);
    	 $('#username').val(_usrname);
    	 $('#password').val(_pwd);
    	 $('#tmp-password').hide();
    	 $('#password').show();
    }else{
	   	 $('#password').val('');
	   	 $('#tmp-password').show();
	   	 $('#password').hide();
    }
}