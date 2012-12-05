<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html manifest="../wend.appcache">
<head>
<meta charset="utf-8">
<link href="../favicon.ico" rel="shortcut icon">
<link rel="stylesheet"  href="../app/_assets/css/landing_screen.css" />

<title>Filsil Mail</title>
<script src="_assets/js/utils.js"></script>
<script src="../js/socket.io.js"></script>
<script src="../js/websocket.js"></script>

<script src="../js/jquery-1.8.0.js"></script>

<script src="../js/modernizr.js"></script>
<script src="../js/sjcl.js"></script>
<script src="../js/crypt.js"></script>
<script src="../js/client.js"></script>
<script src="_assets/js/app.js"></script>
<script src="_assets/js/common.js"></script>
<script src="_assets/js/agent/handle_archive.js"></script>
<script src="_assets/js/agent/handle_contact.js"></script>
<script src="_assets/js/agent/handle_favorite.js"></script>
<script src="_assets/js/agent/handle_group.js"></script>
<script src="_assets/js/agent/handle_logout.js"></script>
<script src="_assets/js/agent/handle_mail.js"></script>
<script src="_assets/js/agent/handle_setting.js"></script>
<script src="_assets/js/agent/handle_trash.js"></script>
</head>
<body>
<div class="container">
<div class="header">	
	<div class="logo">
	<img src="../app/_assets/images/Fisil-Archive-V1_06.png" class="ui-fisil-logo"/>	
	</div>	
	<div class="search">
		<input class="search-text" type="text"/>
		<input class ="search-btn" type="button"/>
	</div>
</div>
<div class="content">
	<div class="menu-left">
		<ul>
			<li id="active" class="active message-a">
				<div class="logo">	
				</div>
			</li>
			<li class="message">
				<div class="logo" id="ui-msg-icon">	
				</div>
				<label>Messages</label>
			</li>
			<li class="contact">
				<div class="logo" id="ui-contacts-icon">	
				</div>
				<label>Contacts</label>
			</li>
			<li class="groups">
				<div class="logo" id="ui-groups-icon">	
				</div>
				<label>Groups</label>
			</li>
			<li class="favorite">
				<div class="logo" id="ui-favorites-icon">	
				</div>
				<label>Favorites</label>
			</li>
			<li class="archive">
				<div class="logo" id="ui-archives-icon">	
				</div>
				<label>Archive</label>
			</li>
			<li class="trash">
				<div class="logo" id="ui-trash-icon">	
				</div>
				<label>Trash</label>
			</li>
			<li class="setting">
				<div class="logo" id="ui-setting-icon">	
				</div>
				<label>Setting</label>
			</li>
			<li class="logout">
				<div class="logo" id="logo-log-out">	
				</div>
				<label>Logout</label>
			</li>
		</ul>
	</div>	
 	<div class="content-center" id="content-center">
 		<div id="ui-home" style="display: block;" class="ui-show">
 		<ul style="display: block;" class="content-ul" id="current-content">
 			<li class="user-online">
 				<div class="user-avatar" style="background-image: url('_assets/images/songoku.jpg');">
 					
 				</div>
 				<div class="user-header">
 					<label class="user-name">
 						Pharetra Tristique Ultricies	
 					</label>
 					<div class="right">
 						<div class="user-icon icon-delete">
 						</div>
 						<div class="separator"></div>
 					
 						<div id="ui-archives-shortcut" class="user-icon icon-archive">
 						</div>
 						<div class="separator"></div>
 						<div id="ui-favorites-shortcut" class="user-icon icon-favorite-a">
 						</div>
 						<div class="separator"></div>
 						<label class="user-date">
 							12 July 2012 - 11:20 PM
 						</label>
 						
 					</div>
 				</div>
 				<div class="user-text">
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				</div>
 			</li>
 			<li class="user-off">
 				 	<div class="user-header">
 					<div class="user-reply-icon" style="background-image: url('_assets/images/reply-icon.png');">
 					</div>
 					<label class="user-name">
 						Pharetra Tristique Ultricies	
 					</label>
 					<div class="right">
 						<div class="user-icon icon-delete">
 						</div>
 						<div class="separator"></div>
 					
 						<div class="user-icon icon-archive-a">
 						</div>
 						<div class="separator"></div>
 						<div class="user-icon icon-favorite">
 						</div>
 						<div class="separator"></div>
 						<label class="user-date">
 							12 July 2012 - 11:20 PM
 						</label>
 						
 					</div>
 				</div>
 				<div class="user-text">
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				</div>
 			</li>
 			<li class="user-online"> 
 			<div class="user-avatar" style="background-image: url('_assets/images/Fisil-LoginScreen-Portrait-V1_03.png');">
 			</div>   
 				<div class="user-header">
 					<label class="user-name">
 						Pharetra Tristique Ultricies	
 					</label>
 					<div class="right">
 						<div class="user-icon icon-delete">
 						</div>
 						<div class="separator"></div>
 					
 						<div class="user-icon icon-archive">
 						</div>
 						<div class="separator"></div>
 						<div class="user-icon icon-favorite-a">
 						</div>
 						<div class="separator"></div>
 						<label class="user-date">
 							12 July 2012 - 11:20 PM
 						</label>
 						
 					</div>
 				</div>
 				<div class="user-text">
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				</div>
 			</li>
 			<li class="user-off">
 				<div class="user-avatar" style="background-image: url('_assets/images/Fisil-LoginScreen-Portrait-V1_03.png');">
 				</div> 
 				<div class="user-reply-icon" style="background-image: url('_assets/images/reply-icon.png');">
 				</div>  
 				 	<div class="user-header">
 					<label class="user-name">
 						Pharetra Tristique Ultricies	
 					</label>
 					<div class="right">
 						<div class="user-icon icon-delete">
 						</div>
 						<div class="separator"></div>
 					
 						<div class="user-icon icon-archive-a">
 						</div>
 						<div class="separator"></div>
 						<div class="user-icon icon-favorite">
 						</div>
 						<div class="separator"></div>
 						<label class="user-date">
 							12 July 2012 - 11:20 PM
 						</label>
 						
 					</div>
 				</div>
 				<div class="user-text">
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				Try disabling network prediction by following these steps: Go to the wrench menu > Settings > Show advanced settings... and deselect "Predict network actions to improve page load performance." If this does not resolve the issue, we recommend selecting this option again for improved performance.
 				</div>
 			</li> 			
 		</ul>
 		</div>
 	    <div id="ui-write-msg" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-contacts" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-groups" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-favorites" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-archives" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-trash" style="display: none;" class="ui-hidden">
 	    </div>
 	    <div id="ui-setting" style="display: none;" class="ui-hidden">
 	    </div>
 	</div>
</div>

</div>

</body>
</html>