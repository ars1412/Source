

function handleLogout() {
    // log out
    $("#logo-log-out").off('click').on('click',  function(){
        client.category = 8;
        $("#ui-logout-dialog").dialog({ 
            closeOnEscape: true, 
            closeText: "", 
            hide: "slide", 
            show: "slide", 
            resizable: false,
            close: function(event, ui) { 
                $("#ui-container-dim").hide(); 
                
            },
            open: function(event, ui) {      
                $("#ui-container-dim").show(); 
                $("#ui-logout-icon").off('click').on('click',  function() {
                    doLogout();
                    
                });
            }
        });
			
    $("#ui-container-dim").off('click').on('click',  function() {
        $("#ui-logout-dialog").dialog( "close" )
        $("#ui-container-dim").hide(); 
    });
    
    });
	
}

  
function doLogout() {
		// clear all local storage
		localStorage.clear();
		location.reload();
} 
