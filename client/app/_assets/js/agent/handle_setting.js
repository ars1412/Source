/**
 * Handle event for Setting function
 */

function handleSetting() {
    $("#ui-setting-icon").off('click').on('click',  function(){
        $("#active").attr("class", "active setting-a");
        
        handleDisplayMenu("#ui-setting");
        client.requestUserInfo();
        client.category = 7;
        updateState(client.category);
    });
    
    setProfile();
    sendFile();
}

function displayUserInfo(data) {
    var pElem = $('#ui-setting');
    pElem.find('#st-name').html(data.lastname + ' ' + data.firstname);
    pElem.find('#st-website').html(data.website);
    pElem.find('#txt-fist-name').val(data.firstname);
    pElem.find('#txt-last-name').val(data.lastname);
    pElem.find('#txt-email').val(data.email);
    pElem.find('#txt-website').val(data.website);
    pElem.find('.setting-name').css('background', 'url(' + client.avatarPath +data.avatar + ') no-repeat scroll 9px 9px transparent');
    pElem.find('.setting-name').css('background-size', '52px 52px');
}

function checkFileSize() {
    var upload = $("#input-choose-file");
    var file = upload[0].files[0];
    console.log("checkFileSize " + JSON.stringify(file));
    if(file.size > 1048576) {
        alert("Image is too large, max size is 1MB");
        var parent = upload.parent();
        console.log(parent.html());
        console.log(upload.html());
        var html = parent.html();
        upload.remove();
        parent.append(html);
        return false;
    }
    
    return true;
}

function sendFile(){
    var socket = io.connect('http://localhost:5001');
//    var socket = io.connect('http://dev-mobile.herokuapp.com:5001/');
//    var socket = io.connect('http://dev-mobile.herokuapp.com:5001/');

    socket.on('connect', function(){
        var delivery = new Delivery(socket);

        delivery.on('delivery.connect',function(delivery){
            $("#setting-save").off('click').on('click',  function(evt) {
                var file = $("#input-choose-file")[0].files[0];
                if(file) {
                    delivery.send(file);
                    evt.preventDefault();

                    delivery.on('send.success', function (file) {
                        console.log("file uid " + file.uid);
                        if(typeof(Storage)!=="undefined") {
                            console.log("localStorage on");
                            localStorage.avatar = file.base64Data;

                        }

                        $(".setting-choose-picture").css('background', 'url(' + file.base64Data + ') no-repeat scroll 9px 9px transparent');
                        $(".setting-choose-picture").css('background-size', '52px 52px');
                        $(".setting-name").css('background', 'url(' + file.base64Data + ') no-repeat scroll 9px 9px transparent');
                        $(".setting-name").css('background-size', '52px 52px');

                        var profData = {
                            firstname: $("input#txt-fist-name").val(),
                            lastname: $("input#txt-last-name").val(),
                            email: $("#txt-email").val(),
                            website: $("#txt-website").val(),
                            avatar: file.uid // just link to image
                        };
                        
                        console.log('-------' + JSON.stringify(profData));

                        client.saveSetting(profData);
                        $("#st-name").html($("input#txt-fist-name").val() + " " + $("input#txt-last-name").val());
                        $("#st-website").html($("#txt-website").val());

                        $("html, body").animate({
                            scrollTop:0
                        }, "fast");
                        $("#st-notify-msg").fadeTo("fast", 0.8, function() {
                            $("#st-notify-msg").html("Profile saved!!!");
                        }).fadeOut(9000);
                    });
                }
                else {
                    var oldPass = $('input[name="old-password"]').val();
                    var newPass = $('input[name="new-password"]').val();
                    var rePass = $('input[name="re-password"]').val();
                    $('input[name="old-password"]').val('');
                    $('input[name="new-password"]').val('');
                    $('input[name="re-password"]').val('');
                    if(oldPass.length || newPass.length || rePass.length) {
                        if(oldPass != client.credentials.password) {
                            alert('Your old password is not match');
                            return;
                        }
                        if(newPass != rePass) {
                            alert('New passwords not match');
                            return;
                        }
                    }
                    var profData = {
                        firstname: $("input#txt-fist-name").val(),
                        lastname: $("input#txt-last-name").val(),
                        email: $("#txt-email").val(),
                        website: $("#txt-website").val()
                    };
                    
                    if(newPass && newPass.length) {
                        profData.newpassword = client.crypt.salthash(newPass);
                        client.credentials.password = newPass;
                        localStorage.password = newPass;
                        console.log('newPassword ' + JSON.stringify(profData.newpassword));
                    }

                    client.saveSetting(profData);
                    $("#st-name").html($("input#txt-fist-name").val() + " " + $("input#txt-last-name").val());
                    $("#st-website").html($("#txt-website").val());

                    $("html, body").animate({
                        scrollTop:0
                    }, "fast");
                    $("#st-notify-msg").fadeTo("fast", 0.8, function() {
                        $("#st-notify-msg").html("Profile saved!!!");
                    }).fadeOut(9000);
                }
            });
        });
    });
}

function setProfile() {
    $("#st-name").html(client.credentials.firstname + " " + client.credentials.lastname);
    $("#st-website").html(client.credentials.website);
    $("#txt-username").val(client.credentials.username);
    $("#txt-email").val(client.credentials.email);
    $("#txt-website").val(client.credentials.website);
    $("input#txt-fist-name").val(client.credentials.firstname);
    $("input#txt-last-name").val(client.credentials.lastname);
    
    
}