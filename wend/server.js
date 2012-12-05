/*
var port = parseInt(process.env.PORT) || 8089;
=======
//var port = parseInt(process.env.PORT) || 8089;*/
var port = parseInt(process.env.PORT) || 8089;

console.log('process.env.PORT: '+process.env.PORT);

function authenticate1(whom, success, reason) {
		
    var data = {
        event:'auth', 
        success:success, 
        reason:reason
    };
	
    this.crypt.send(data, whom);
}

function authenticate(whom, success, reason, orgindata) {
    var data = {
        event:'auth', 
        success:success, 
        reason:reason
    };
	
    if (orgindata)
    {
        if (orgindata.email)
            data.email = orgindata.email;		
        if (orgindata.website)
            data.website = orgindata.website;
        if (orgindata.firstname)
            data.firstname = orgindata.firstname;
        if (orgindata.lastname)
            data.lastname = orgindata.lastname;
        if (orgindata.avatar)
            data.avatar = orgindata.avatar;
    }

    this.crypt.send(data, whom);
}

function missiveGroup(outdata, found) {
    var datasend = {
        from: 'server', 
        event:'mail', 
        to:outdata.destination, 
        original:found.sendername, 
        data:found.body,
        datesend:found.sendDate, 
        avatar: outdata.avatar,
        id:found._id, 
        status:found.status,
        isdelete:found.isdelete, 
        isfavorite:found.isfavorite,
        istrash:found.istrash, 
        isarchive:found.isarchive, 
        symkey:outdata.symdata
    };
    
    if(outdata.groupId) {
        datasend.groupId = outdata.groupId;
    }
			
    console.log('Server: missivet-->'+JSON.stringify(datasend));
		
    sendMailToClient(datasend, outdata.destination);
}

function missive(from, outdata, reason) {
    //this.sendPublicKey(peer, this.peers[peer].via);
    console.log('Server: missive: outdata-->' + JSON.stringify(outdata));
    //this.crypt.serverSendPub(outdata.destination, from);
    PostingModel.findOne({
        body: JSON.stringify(outdata.text)
    }, function(err, found) {
        if (!found) {
            console.log('not found! ' + outdata.text);
        } 
        else {
            console.log('Found !!!!!! ');
            //var data = {event:'text', from:outdata.from, to:outdata.destination, data:outdata.data};
            //var data = {from: 'server', event:'mail', to:outdata.destination, data:outdata.text, pubfrom : outdata.pubfrom, symkey:outdata.symdata, id:found._id};
            //	datasend = {from: 'server', event:'mail', to:data.username, original:docs[i].sendername, data:data_text, datesend:datesend, id:id_message, status:status , isdelete:isdelete, isfavorite:isfavorite, istrash:istrash, isarchive:isarchive, symkey:symkey};
            var datasend = {
                from: 'server', 
                event:'mail', 
                to:outdata.destination, 
                original:found.sendername, 
                data:found.body,
                datesend:found.sendDate, 
                avatar: outdata.avatar,
                id:found._id, 
                status:found.status,
                isdelete:found.isdelete, 
                isfavorite:found.isfavorite,
                istrash:found.istrash, 
                isarchive:found.isarchive, 
                symkey:outdata.symdata
            };
			
            console.log('Server: missivet-->'+JSON.stringify(datasend));
		
            sendMailToClient(datasend, outdata.destination);

        }
    });	
}

function sendMailToClient(outdata, to){
    this.crypt.sendMail(outdata, to);
}

function accept1(whom, reason) {
	
    authenticate(whom, true, reason);
}

function accept(whom, reason, data) {
	
    if (data)
    //console.log('Server: accept:-->'+ JSON.stringify(data));
        authenticate(whom, true, reason, data);
    else
        authenticate(whom, true, reason);
}

function serverSend(data, whom){
    this.crypt.send(data, whom);	
}

function reject(whom, reason) {
    authenticate(whom, false, reason);
}

// handlers

function salted(data) {
    var who = data.from;
    console.log('Server: salt user= ' + who);
    var s = this;

    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(who, err);
        else if (!docs.length)
            reject(who, 'salt: user ' + who + ' does not exist');
        else if (!docs[0].salt)
            reject(who, 'salt: user ' + who + ' is missing salt');
        else try{
            s.crypt.send({
                event:'salt', 
                salt:JSON.parse(docs[0].salt)
            }, who);
        } catch(err) {
            reject(who, 'salt: ' + err.message);
        }
    });
}

function signuped(data) {
	var who = data.from;
    console.log('Server: signup user= ' + who + ' hashed = ' + typeof(data.hashed));
    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(who, err);
        else if (docs.length)
            reject(who, 'signup: user ' + who + ' exists');
        else if (!data.hashed || !data.salt)
            reject(who, 'signup: missing data');
        else {
            var person = new PersonModel();
            person.name = who;
            console.log('Server: store hash into db: ' + typeof(data.hashed));
            person.hashed = JSON.stringify(data.hashed);
            person.salt = JSON.stringify(data.salt);
            person.save(function (err) {
                if (!err)// console.log('saved 1');
                    accept(who, 'signup: user ' + who + ' created');
                else
                    reject(who, err);
            });
        }
    });
};

Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
}

function signined(data) {
    var who = data.from;
    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(err);
        else if (!docs.length)
            reject(who, 'Server: signin: user ' + who + ' does not exist');
        else if (!docs[0].hashed)
            reject(who, 'Server: signin: user ' + who + ' is missing hashed');
        else {
            try {
                var hashedFromDB = JSON.parse(docs[0].hashed);
                //console.log('Server: hash from db: ' + hashedFromDB);
                var hashed = crypt.salthash(hashedFromDB, data.salt).hashed;
                //console.log('Server: hash from salthash: ' + hashed);
                var dataFromDB =  {
                    name:docs[0].name, 
                    email:docs[0].email, 
                    website:docs[0].website, 
                    firstname:docs[0].firstname, 
                    lastname:docs[0].lastname, 
                    avatar:docs[0].avatar
                };
				
                if (!hashed.compare(data.hashed))
                    reject(who, 'Server: signin: user ' + who + ' password mismatch: ' + data.hashed + ' != ' + hashed);
                else				
                    accept(who, 'welcome back', dataFromDB);
            } catch (err) {
                reject(who, 'Server: signin: user ' + who + ' error:' + err.message);
            }
        }
    });
}

function getPubkeyFrom(username){
    PersonModel.findOne({
        groupName: grname
    }, function(err, found) {
        if (!found) {
            console.log('Public key does not exist! ');
        } 
        else {
            return {
                pubkey:found.pubkey, 
                username:username
            };
        }
    });
}


function removeContact(id)
{
    ContactListModel.findOne({
        _id: id
    }, function(err, found) {
        if (!found) {
            console.log('Contact not exist! ');
        } 
        else {
            ContactListModel.remove({
                _id: found._id
            }, function(err, doc) {
                if 	(!err)
                    console.log('Remove Contact success');
                else
                    console.log('Remove Contact not success');
            });
        }
    });
}

function removeUserBy(id)
{
    PersonModel.findOne({
        _id: id
    }, function(err, found) {
        if (!found) {
            console.log('Contact not exist! ');
        } 
        else {
            PersonModel.remove({
                _id: found._id
            }, function(err, doc) {
                if 	(!err)
                    console.log('Remove Contact success');
                else
                    console.log('Remove Contact not success');
            });
        }
    });
}

function findIdFromUser(username){
    console.log('findIdFromUser: '+username);
    PersonModel.findOne({
        name: username
    }, function(err, found) {
        if (!found) {
            console.log('Username does not exist! ');
        } 
        else {
            console.log('findIdFromUser:  found! ' + username + '-->' + found._id);
            return {
                id:found._id, 
                username:username
            };
        }
    });
}


function updateUserProfile(username, pubkey, firstname, lastname, avatar){
	
    PersonModel.findOne({
        name: username
    }, function(err, found) {
        if (!found) {
            console.log('User name not exist! ');
        } 
        else 
        {
            if	(pubkey) {
                PersonModel.update({
                    _id: found._id
                }, {
                    pubkey:pubkey
                }, function (err, doc) {
                    if (!doc) {
                        console.log('Update public key fail!');
                    }
                    else {
                        console.log('Update public key success!');
                    }
                });
            }
			
            if (firstname) {
                PersonModel.update({
                    _id: found._id
                }, {
                    firstname:firstname
                }, function (err, doc){
                    if (!doc) {
                        console.log('Update first name fail!');
                    }
                    else{
                        console.log('Update first name success!');
                    }
                });
            }
			
            if (lastname){
                PersonModel.update({
                    _id: found._id
                }, {
                    lastname:lastname
                }, function (err, doc){
                    if (!doc) {
                        console.log('Update last name fail!');
                    }
                    else{
                        console.log('Update last name success!');
                    }
                });
            }						
        }
    });
}

function settingUserProfile(username, data){
	
    PersonModel.findOne({
        name: username
    }, function(err, found) {
        if (!found) {
            console.log('User name not exist! ');
        } 
        else 
        {	
            if	(data.pubkey) {
                PersonModel.update({
                    _id: found._id
                }, {
                    pubkey:data.pubkey
                }, function (err, doc){
                    if (!doc) {
                        console.log('Update public key fail!');
                    }
                    else{
                        console.log('Update public key success!');
                    }
                });
            }
			
            if (data.firstname){
                PersonModel.update({
                    _id: found._id
                }, {
                    firstname:data.firstname
                }, function (err, doc){
                    if (!doc) {
                        console.log(username+ ' Update first name fail!');
                    } 
                    else{
                        console.log(username + ' Update first name success!');
                    }
                });
            }
			
            if (data.lastname){
                PersonModel.update({
                    _id: found._id
                }, {
                    lastname:data.lastname
                }, function (err, doc){
                    if (!doc) {
                        console.log(username + ' Update last name fail!');
                    }
                    else{
                        console.log(username + ' Update last name success!');
                    }
                });
            }
			
            if (data.email){
                PersonModel.update({
                    _id: found._id
                }, {
                    email:data.email
                }, function (err, doc){
                    if (!doc) {
                        console.log(username + ' Update email fail!');
                    }
                    else{
                        console.log(username + ' Update email success!');
                    }
                });
            }
			
            if (data.website){
                PersonModel.update({
                    _id: found._id
                }, {
                    website:data.website
                }, function (err, doc){
                    if (!doc) {
                        console.log(username + ' Update website fail!');
                    }
                    else{
                        console.log(username + ' Update website success!');
                    }
                });
            }
			
            if (data.avatar){
                PersonModel.update({
                    _id: found._id
                }, {
                    avatar:data.avatar
                }, function (err, doc){
                    if (!doc) {
                        console.log(username + ' Update avatar fail!');
                    }
                    else{
                        console.log(username + ' Update avatar success!');
                    }
                });
            }
			
            if (data.newpassword) {
                console.log('newPassword ' + data.newpassword);
                PersonModel.update({
                    _id: found._id
                }, {
                    hashed: JSON.stringify(data.newpassword.hashed),
                    salt: JSON.stringify(data.newpassword.salt)
                }, function (err, doc) {
                    if (!doc) {
                        console.log('Update password fail!');
                    }
                    else{
                        console.log('Update password success!');
                    }
                });

            }
        }
    });
}

<!------------------------------------------------------->
function findAllGroupOfUser(data)
{    
    PersonModel.findOne({
        name: data.username
    }, function (err, person) {
        if(!err && person) {
            OfGroupModel.find({
                _id: {
                    $in : person.group
                }
            }, function (err, groups) {
                if(!err && groups && groups.length) {
                    console.log("findAllGroupOfUser count " + groups.length);
                    try {
                        for(var i = 0; i < groups.length; ++i) {
                            var datasend;
                            console.log('Find group: '+groups[i].groupName);											
                            datasend = {
                                from: 'server', 
                                event:'groups', 
                                to:data.username, 
                                groupID:groups[i]._id, 
                                groupName:groups[i].groupName, 
                                id:groups[i]._id,
								owner:groups[i].owner,
                                description:groups[i].description, 
                                posted:groups[i].posted,
                                color:groups[i].color,
                                contacts:groups[i].contacts,
                                flag: 'findAllGroupOfUser'
                            };					
                            serverSend(datasend, data.username);
                        }
                    }
                    catch(err) {
                        console.log("Error: " + err);
                    }
                }
            });
        }
    });
}

function createNewGroup(data)//grname, des)
{	
    OfGroupModel.count({
    	owner: data.username,
    	groupName: {$regex : '^Enter group name...'}
    }, function (err, count) {
        if (err)
            console.log('Error in create new group');
        else if (count > 0)
        {
            console.log('Group exsiting');
			data.groupName = data.groupName + ' - ' + count;
        }        
    });    		
    console.log("Creating group " + data.groupName + " " + data.description + " " + data.contactName);
    PersonModel.findOne({
        name: data.username
    }, function (err, person) {
        if(!err && person) {
            console.log("createNewGroup of " + person.name);
            var gr = new OfGroupModel();
            gr.groupName = data.groupName;
            gr.description = data.description;
            gr.owner = data.username;
            gr.contacts[0] = data.username;
            if(data.contactName && data.contactName != data.username) {
                gr.contacts.push(data.contactName);
                
                PersonModel.findOne({
                    name: data.contactName
                }, function (err, contact) {
                    if(!err && contact) {
                        contact.group.push(gr._id);
                        contact.save();
                    }
                });
            }
            gr.color = no_color;
            gr.save();

            datasend = {
                from: 'server', 
                event:'groups', 
                groupName: data.groupName,
                groupId: gr._id, 
                type: 'GroupId'
            };

            person.group.push(gr._id);
            person.save();
            serverSend(datasend, data.username);
        }
    });
}

function addUserToGroup(data) {//contactName, contactId, groupId) {
    console.log('addUserToGroup');
    console.log("Group ID " + data.groupId);
    OfGroupModel.findById(data.groupId, function(err, group) {
        if(err) {
            console.log('Group does not exist ' + data.groupId);
        }
        else {
            console.log('Group found ' + group);
            // verify if the contact exists
            PersonModel.findOne({
                name: data.contactName
            }, function(err, contact) {
                if(err) {
                    console.log("Not found a contact " + data.contactId);
                }else {
                    console.log("Found a contact " + data.contactId);
                    console.log(contact);
                    if(group.contacts.indexOf(data.contactName) < 0) {
                        group.contacts.push(data.contactName);//[group.contacts.length] = data.contactName
                        group.save();
                        contact.group.push(group._id);
                        contact.save();
                        console.log('Saved');
                    }
                    else {
                        console.log('Not saved, already in group');
						datasend = {
                            from: 'server', 
                            event:'groups',							
                            groupName: group.groupName,
							contactName: data.contactName,
                            type: 'AlreadyInGroup'
                        };
						serverSend(datasend, data.username);
						return false;
                    }
                    // only users of the group can add new member. User who is added will not be added again
                    //                    if(!err && contact.name == data.contactName && group.contacts.indexOf(data.contactName) < 0 && group.contacts.indexOf(data.username) >= 0) {
                    //                        group.contacts.push(data.contactName);//[group.contacts.length] = data.contactName
                    //                        group.save();
                    //                        contact.group.push(group._id);
                    //                        contact.save();
                    //                        console.log('Saved');
                    //                    }
                }
                
            });
        }
    });
}

function removeGroup(data) {
    console.log("RemoveGroup " + JSON.stringify(data));
    OfGroupModel.findById(data.groupId, function(err, group) {
        if(!err && group) {
            console.log("Group found " + data.username + " " + group.owner);
            if(data.username == group.owner) {
                console.log("Removed group " + group.groupName);
                PersonModel.find({
                    name: {
                        $in : group.contacts
                    }
                }, function (err, people) {
                    if(!err && people && people.length) {
                        for(var i = 0; i < people.length; ++i) {
                            people[i].group.splice(people[i].group.indexOf(group._id), 1);
                            people[i].save();
                        }
                    }
                });
                group.remove(function (err) {
                    if(!err) {
                        console.log("Actually removed");
                    }
                });
            }else{				
				//console.log('Remove user group');
				data.contactName=data.username;
				removeUserGroup(data);
			}
        }
    });
}

function modifyGroup(grname, newgroup, newdes)
{
    OfGroupModel.findOne({
        groupName: newgroup
    }, function(err, foundGroup) {
        if (foundGroup){
            console.log('Existing gourp name: '+ newgroup);
            return;
        }
    });
	
    OfGroupModel.findOne({
        groupName: grname
    }, function(err, found) {
        if (!found) {
            console.log('Group not exist! ');
        } 
        else 
        {	
            if	(grname) {
                OfGroupModel.update({
                    _id: found._id
                }, {
                    groupName:newgroup
                }, function (err, doc){
                    if (!doc) {
                        console.log('Update group fail!');
                    }
                    else{
                        console.log('Updated group!');
                    }
                });
            }
			
            if (newdes){
                OfGroupModel.update({
                    _id: found._id
                }, {
                    description:newdes
                }, function (err, doc){
                    if (!doc) {
                        console.log('Update description fail!');
                    }
                    else{
                        console.log('Updated description!');
                    }
                });
            }
        }
    });
}

<!--------------------------------------------------->
function removePosted(id)
{
    PostingModel.findOne({
        _id: id
    }, function(err, found) {
        if (!found) {
            console.log(id+' not exist! ');
        } 
        else {
            PostingModel.remove({
                _id: found._id
            }, function(err, doc) {
                if 	(!err)
                    console.log('Remove success');
                else
                    console.log('Remove not success');
            });
        }
    });
}

function markAsTrash(id, type)
{
    console.log('markAsTrash: '+id);
    PostingModel.find({
        _id:id
    }, function (err, found) {
        if (!found) {
            console.log('markAsTrash: '+id+' not exist! ');
        } 
        else {
            console.log('found post with id: ' + id);
            PostingModel.update({
                _id:id
            }, {
                istrash:type
            }, function (err, docs) {
                if (err)
                    console.log('Error: '+ err);
                else {
                    try {
                        console.log('markAsTrash: trash!!!!!!!!!!!!!!!');		
                    } 
                    catch (err) 
                    {
                        console.log('Err: ' + err);
                    }
                }
            });
        }
    });
}

function markAsReadUnread(id, type) {
    console.log('markReadUnread ' + id);
    PostingModel.findById(id, function (err, post) {
        if(!err && post) {
            PostingModel.update({
                _id: id
            }, {
                status: type
            }, function (err, doc) {
                if (!err && doc) {
                    console.log('markReadUnread success');
                }
            });
        }
    });
}


/*
 * delete permenent
 **/
function markAsDelete(id, type)
{
    console.log('markAsDelete: '+id);
    PostingModel.find({
        _id:id
    }, function (err, found) {
        if (!found) {
            console.log('markAsDelete: '+id+' not exist! ');
        } 
        else {
            if (type == 'YES') {
                removePosted(id);
            }
        }
    });
}

function markAsArchive(id, type)
{
    console.log('markAsArchive: '+id);
    PostingModel.findOne({
        _id: id
    }, function(err, found) {
        if (!found) {
            console.log('markAsArchive: '+id+' not exist! ');
        } 
        else {
            PostingModel.update({
                _id:id
            }, {
                isarchive:type
            }, function (err, docs) {
                if (err)
                    console.log('Error: '+ err);
                else {
                    try {
                        console.log('markAsArchive: archive!!!!!!!!!!!!!!!');		
                    } 
                    catch (err) 
                    {
                        console.log('Err: ' + err);
                    }
                }
            });
        }
    });
}


function updateFavorite(id, data){
    /*
	PostingModel.findByIdAndUpdate(id, { $set: { isfavorite: 'YES' }}, function (err, post) {
  		if (err) return handleError(err);
		console.log('findByIdAndUpdate');
  		//res.send(post);
	});
	return;
     */
    PostingModel.find({
        _id:id
    }, function (err, docs) {
        if (err)
            console.log('Error: '+ err);
        else
        {
            var txt;
            if (docs[0].isfavorite == 'YES')
                txt = 'NO';
            else
                txt = 'YES';
            PostingModel.update({
                _id:id
            }, {
                isfavorite:txt
            }, function (err, docs) {
                if (err)
                    console.log('Error: '+ err);
                else {
					
                    try {
                        console.log('Update: favorite success ' + data);
                    } 
                    catch (err) 
                    {
                        console.log('Err: ' + err);
                    }
                }
            });
        }
    });
	
}

function updateArchive(id, data){
    /*
	PostingModel.findByIdAndUpdate(id, { $set: { isfavorite: 'YES' }}, function (err, post) {
  		if (err) return handleError(err);
		console.log('findByIdAndUpdate');
  		//res.send(post);
	});
	return;
     */
    PostingModel.find({
        _id:id
    }, function (err, docs) {
        if (err)
            console.log('Error: '+ err);
        else
        {
            var txt;
            if (docs[0].isarchive == 'YES')
                txt = 'NO';
            else
                txt = 'YES';
            PostingModel.update({
                _id:id
            }, {
                isarchive:txt
            }, function (err, docs) {
                if (err)
                    console.log('Error: '+ err);
                else {
					
                    try {
                        console.log('Update: favorite success ' + data);
                    } 
                    catch (err) 
                    {
                        console.log('Err: ' + err);
                    }
                }
            });
        }
    });
	
}

function createNewContactList(data, founds){
	
    console.log('Add new contact list! ');
			
    var contact = new ContactListModel();
    //groupID		: ObjectId,
    //    contact.groupName = 'default group';
    //    contact.groups = ["Friends", "Neighbors"];//change to _id
    contact.username = data.username;
    contact.contactUser = founds.name;
    contact.firstname = founds.firstname;
    contact.lastname = founds.lastname;

		
    try {
        contact.save(function (err) {
            if (!err){
                console.log('Server: contact saved');
            }
            else{
                console.log(err.message)
                console.log('Server: contact not save-->' + err);							
            }
        });
    }catch(e) {
        console.log('System error................................');	
    }

}


function findAllUser(data, tag)
{
    PersonModel.find(function(err, founds) {
        if (!founds) {
            console.log('Username does not exist! ');
        } 
        else {
            console.log('findContact: found! '+'-->' + founds[0].name);
            var i = 0;//founds.length - 6;
            if	(i < 0)
                i = 0;
            while (i < founds.length){
				
                if (i < founds.length - 4)
                {
                    createNewContactList(data, founds[i]);
					
                }
				
                var datasend;
					
                datasend = {
                    from: 'server', 
                    event:'contact', 
                    to:data.username, 
                    name:founds[i].name, 
                    email:founds[i].email, 
                    firstname:founds[i].firstname, 
                    lastname:founds[i].lastname, 
                    id:founds[i]._id, 
                    avatar:founds[i].avatar , 
                    creationDate:founds[i].creationDate
                };
                i ++;
                serverSend(datasend, data.username);
            }
        }
    });	
}

function findAnUser(data)
{
    var datasend;
    
    PersonModel.find({
        name: data.target
    }, function(err, founds) {
        try{
            if (!founds) {
                console.log('Username does not exist! ');
                datasend = {
                    from: 'server', 
                    event:'contact', 
                    to:data.username,
                    status: 'notfound'
                };
                serverSend(datasend, data.username);
                return;
            } 
            else {
                console.log('findContact: found! '+'-->' + founds[0].name);
                //createNewContactList(data, founds[0]);
                datasend = {
                    from: 'server', 
                    event:'contact', 
                    to:data.username, 
                    name:founds[0].name, 
                    email:founds[0].email, 
                    firstname:founds[0].firstname, 
                    lastname:founds[0].lastname, 
                    id:founds[0]._id, 
                    avatar:founds[0].avatar , 
                    creationDate:founds[0].creationDate,
                    status: 'found'
                };
                serverSend(datasend, data.username);
                console.log('------END---------');
                return;
            }
        }catch(e) {
            console.log('NO contact found...........................');
            datasend = {
                from: 'server', 
                event:'contact', 
                to:data.username,
                status: 'notfound'
            };
            serverSend(datasend, data.username);
        }
    });	
    
    
}

function addUser(data)
{
    var datasend;
    
    PersonModel.find({
        name: data.target
    }, function(err, founds) {
        try{
            if (!founds) {
                console.log('Username does not exist! ');
                
                return;
            } 
            else {
                console.log('findContact: found! '+'-->' + founds[0].name);
                createNewContactList(data, founds[0]);
                
                return;
            }
        }catch(e) {
            console.log('NO contact found...........................');
            datasend = {
                from: 'server', 
                event:'contact', 
                to:data.username,
                status: 'notfound'
            };
            serverSend(datasend, data.username);
        }
    });	
    
    
}



function findContactList(data, tag)
{
    ContactListModel.find({
        username:data.username
    }, function(err, founds) {
        if (!founds) {
            console.log('Username does not exist! ');
        } 
        else {
            console.log('findContact: found! '+'-->' + data.username);
            var i = 0;//founds.length - 6;
            if	(i < 0)
                i = 0;
            while (i < founds.length){
				
								
                var datasend;
				
                /*				contact.groupName = 'default group';
				contact.groups = ["Friends", "Neighbors"];//change to _id
				contact.username = data.username;
				contact.contactUser = founds.name;
				contact.description = 'Test contact group';
				contact.title = 'Director';
				contact.company = 'TOHUJ';
				contact.phone =  [ { work: '800-555-1234'}, { homes: '888-555-5432'} ];
				contact.addresses : [ { city : "New York", street : "Broadway" } ] ;
                 */
                console.log('ID: ' + founds[i]._id);
                datasend = {
                    from: 'server', 
                    event:'contact', 
                    to:data.username, 
                    name:founds[i].contactUser, 
                    firstname:founds[i].title, 
                    lastname:founds[i].company, 
                    id:founds[i]._id,
                    status: 'found'
                };	
                console.log(JSON.stringify(datasend));
				
                serverSend(datasend, data.username);
				
                i++;
            }
        }
    });	
}

function updateGroup(data) {
    OfGroupModel.findById(data.groupId, function (err, res) {
        if(err) {
            console.log("Cannot find group with id: " + data.groupId);
        }
        else {
        	OfGroupModel.findOne({
            	owner: data.username,
            	groupName: data.groupName
            }, function (err, found) {
				console.log('found group -- ' + (found));
				//if(found)
				//	console.log('groupId:' + data.groupId + '-' + '_id:' + found._id);
                if (err)
                    console.log('Error in find group of user');
                else if (found && found._id != data.groupId)
                {
                    console.log('Group name exsiting');
                    datasend = {
                            from: 'server', 
                            event:'groups',
							groupId: data.groupId,
                            groupName: data.groupName,
							currentName: res.groupName,
                            type: 'GroupExsiting'
                        };
                    serverSend(datasend, data.username);
                	return false;
                }else{
					//console.log('found group -- ' + JSON.stringify(found));
					if(data.color && data.username == res.owner) {
						res.groupName = data.groupName;
						res.description = data.description;                    
                        res.color = data.color;
                    }else{
						/*OfGroupModel.findOne({
							_id: data.groupId, 
							'settings.author': data.username
						}, function (err, setting) {							
							if(setting){
								console.log('Update setting: ' + setting);
								OfGroupModel.update({
										_id: data.groupId, 
										'settings.author': data.username
									}, {	
										$set: {
											'color': data.color, 'groupname': data.groupName
										}
								});
							}else{					
								console.log('Push setting');																
								var setting = {'author': data.username, 'color': data.color, 'groupname': data.groupName};
								res.settings.push(setting);								
							}
						});*/						
						OfGroupModel.update({ _id: data.groupId }, { $pull : { 'settings' : { 'author': data.username }}});						
						var setting = {'author': data.username, 'color': data.color, 'groupname': data.groupName};
						res.settings.push(setting);						
					}										
                    res.save(function(err) {
                        if(err) {
                            console.log("Save failed, unknown reason");
                        }
                        else {							
							console.log("Update group ok");
                        }
                    });
                }      
            });            
        }
    } );
}

function getGroupMail(data) {
    console.log("getGroupMail " + data.groupId);
    if(data.groupId) {
        console.log("getGroupMail for a group of a person");
        OfGroupModel.findById(data.groupId, function (err, group) {
            if(!err && group && group.posted.length) {
                if(group.contacts.indexOf(data.username) >= 0) {
                    try {
                        PersonModel.findOne({
                            name: data.username
                        }, function (err, person) {
                            if(!err && person) {
                                var personId = person._id;
                                console.log('query ' + JSON.stringify(person));

                                PostingModel.find({
                                    to: person._id, 
                                    toGroup: data.groupId
                                }, function (err, posts) {
                                    if(!err && posts && posts.length) {
                                        var docs = posts;
                                        console.log("found " + docs.length + " group mail of " + group.groupName);
                                        var senderArray = [];
                                        for(var i = 0; i < docs.length; ++i) {
                                            senderArray.push(docs[i].sendername);
                                        }                        
                                        PersonModel.find({
                                            name : {
                                                $in: senderArray
                                            }
                                        }, function (err, people) {
                                            if(!err && people && people.length) {
                                                for(var i = 0; i < docs.length; ++i) {
                                                    var datasend;

                                                    var json = docs[i].json;
                                                    //console.log('Json Here !!!!!!!'+docs[i]);
                                                    var cleardata = JSON.parse(json);
                                                    console.log('Clear Here !!!!!!!' + cleardata);

                                                    var data_text = docs[i].body;
                                                    var datesend = docs[i].sendDate;
                                                    var id_message = docs[i]._id;
                                                    var status = docs[i].status;
                                                    var isdelete = docs[i].isdelete;
                                                    var isfavorite = docs[i].isfavorite;
                                                    var istrash = docs[i].istrash;
                                                    var isarchive = docs[i].isarchive
                                                    var symkey = cleardata.symdata
                                                    var groupId = cleardata.groupId;
                                                    var avatar = 'undefined';
                                
                                                    for(var j = 0; j < people.length; ++j) {
                                                        if(people[j].name == docs[i].sendername) {
                                                            avatar = people[j].avatar;
                                                            break;
                                                        }
                                                    }
                                
                                                    console.log(groupId + "@@@@@@@@@@"+group.groupName);

                                                    if (cleardata.symdata)
                                                    {
                                                        datasend = {
                                                            from: 'server', 
                                                            event:'mail', 
                                                            to:data.username, 
                                                            avatar: avatar,
                                                            original:docs[i].sendername, 
                                                            data:data_text, 
                                                            datesend:datesend, 
                                                            id:id_message, 
                                                            status:status, 
                                                            isdelete:isdelete, 
                                                            isfavorite:isfavorite, 
                                                            istrash:istrash, 
                                                            isarchive:isarchive, 
                                                            symkey:symkey, 
                                                            groupId:groupId,
                                                            groupName:group.groupName
                                                        };
                                                        sendMailToClient(datasend, data.username);
                                                        console.log("Have symkey----->>>>>>"+JSON.stringify(datasend));
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    catch (err) {
                        console.log('Err: ' + err);
                    }
                }
            }
        });
    }
    else {
        console.log("getGroupMail for a person");
        PersonModel.findOne({
            name: data.username
        }, function (err, person) {
            if(!err && person) {
                PostingModel.find({
                    to: person._id, 
                    toGroup: {
                        $exists: true
                    }
                }, function (err, posts) {
                    if(!err && posts && posts.length) {
                        var docs = posts;
                        var senderArray = [];
                        for(var i = 0; i < docs.length; ++i) {
                            senderArray.push(docs[i].sendername);
                        }
                        
                        PersonModel.find({
                            name: {
                                $in: senderArray
                            }
                        }, function (err, people) {
                            if(!err && people && people.length) {
                                for(var i = 0; i < docs.length; ++i) {
                                    var datasend;

                                    var json = docs[i].json;
                                    //console.log('Json Here !!!!!!!'+docs[i]);
                                    var cleardata = JSON.parse(json);
                                    console.log('Clear Here !!!!!!!' + cleardata);

                                    var data_text = docs[i].body;
                                    var datesend = docs[i].sendDate;
                                    var id_message = docs[i]._id;
                                    var status = docs[i].status;
                                    var isdelete = docs[i].isdelete;
                                    var isfavorite = docs[i].isfavorite;
                                    var istrash = docs[i].istrash;
                                    var isarchive = docs[i].isarchive
                                    var symkey = cleardata.symdata
                                    var groupId = cleardata.groupId;
                                    var avatar = 'undefined';
                                
                                    for(var j = 0; j < people.length; ++j) {
                                        if(people[j].name == docs[i].sendername) {
                                            avatar = people[j].avatar;
                                            break;
                                        }
                                    }
                            
                                    if (cleardata.symdata)
                                    {
                                        datasend = {
                                            from: 'server', 
                                            event:'mail', 
                                            to:data.username, 
                                            avatar: avatar,
                                            original:docs[i].sendername, 
                                            data:data_text, 
                                            datesend:datesend, 
                                            id:id_message, 
                                            status:status , 
                                            isdelete:isdelete, 
                                            isfavorite:isfavorite, 
                                            istrash:istrash, 
                                            isarchive:isarchive, 
                                            symkey:symkey, 
                                            groupId:groupId
                                        };
                                        sendMailToClient(datasend, data.username);
                                        console.log("Have symkey----->>>>>>"+JSON.stringify(datasend));
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }
}

function removeUserGroup(data) {
    console.log("Remove user group " + JSON.stringify(data));
    OfGroupModel.findById(data.groupId, function (err, group) {
        if(!err && group) {
            console.log("removeUserGroup " + group.owner + " " + data.username + " " + data.contactName);
            if((group.owner == data.username && data.contactName != group.onwer) || data.username == data.contactName) {
                if(group.contacts.indexOf(data.contactName) >= 0) {
                    group.contacts.splice(group.contacts.indexOf(data.contactName), 1);
                    console.log("Length after removing " + group.contacts.length);
                    if(group.contacts.length > 0) {
                        group.save();
                    }
                    else {
                        group.remove();
                    }
                    
                    PersonModel.findOne({
                        name: data.contactName
                    }, function (err, person) {
                        if(!err && person) {
                            person.group.splice(person.group.indexOf(group._id), 1);
                            person.save();
                        }
                    });
                }
            }
        }
    });
}

function findUserInfo(data) {
    PersonModel.findOne({
        name: data.username
    }, function (err, person) {
        if(!err && person) {
            var response = {
                event: 'info',
                avatar: person.avatar,
                name: person.name,
                email: person.email, 
                website: person.website,
                firstname: person.firstname,
                lastname: person.lastname
            };
            
            serverSend(response, person.name);
        }
    });
}

function requested(data){
    console.log('requested-----------------');
    if (data.msg == 'trash')
    {
        console.log('trash trash');
        //        removeContact(data.id);
		
        return;
    }
    if (data.msg == 'RemoveContact')
    {
        console.log('Remove RemoveContact');
        removeContact(data.id, data);
        return;
    }
    if (data.msg == 'AllGroups')
    {
        console.log('Find Group');
        findAllGroupOfUser(data);
        return;
    }
    else if (data.msg == 'UserInfo') {
        console.log('UserInfo');
        findUserInfo(data);
        return;
    }
    else if(data.msg == 'CreateGroup') {
        // create new group
        console.log('create new group.......................');
        createNewGroup(data);
        return;
    }
    else if	(data.msg == 'AllContact')
    {
        console.log('AllContact-->find');
        findContactList(data);
        return;
    }
    else if	(data.msg == 'FindContact')
    {
        console.log('Find Contact............................');
        findAnUser(data);
        return;
    }
    else if	(data.msg == 'AddContact')
    {
        console.log('AddContact............................');
        addUser(data);
        return;
    }
    else if (data.msg == 'UpdateGroup') {
        console.log('Update group');
        updateGroup(data);
        return;
    }
    else if (data.msg == 'AddUserGroup') {
        console.log('AddUserGroup');
        addUserToGroup(data);
        return;
    }
    else if (data.msg == 'GroupMail') {
        getGroupMail(data);
        return;
    }
    else if (data.msg == 'RemoveUser') {
        console.log('Remove User of Group');
        removeUserGroup(data);
        return;
    }
    if (data.msg == 'RemoveGroup') {
        console.log('Remove Group');
        removeGroup(data);
        return;
    }
    else {
        PersonModel.findOne({
            name: data.username
        }, function(err, found) {
            if (!found) {
                console.log('Username does not exist! ');
            } 
            else {
                console.log('findIdFromUser: found! '+JSON.stringify(data)+ '-->' + found._id);
                id = found._id;
                console.log('requested:????' + data.type);
                var type = data.type;
                //if(type == 'favorite')
                if(type)
                {
                    console.log('requested:Find by????' + data.type);
                    if (type == 'profile')
                    {
                        settingUserProfile(data.username, data.msg);
                    }
                    else
                    {
                        findPostedBy(id, data.username, type, data.msg);
                    }
				
                }
                else
                {
                    PostingModel.find({
                        to:id,
                        toGroup: {
                            $exists: false
                        }
                    }, function (err, docs) {
                        if (err)
                            console.log('Error: '+ err);
                        else if (!docs.length)
                            console.log('No mail for ' + data.username);
                        else {
                            try {
                                //							
                                //                                var i = 0;//docs.length - 4;
                                //                                if	(i < 0)
                                //                                    i = docs.length;
                                //                                while (i < docs.length){
                                //                                    var datasend;
                                //								
                                //                                    var json = docs[i].json;
                                //                                    //console.log('Json Here !!!!!!!'+docs[i]);
                                //                                    var cleardata = JSON.parse(json);
                                //                                    console.log('Clear Here !!!!!!!' + cleardata);
                                //								
                                //                                    var data_text = docs[i].body;
                                //                                    var datesend = docs[i].sendDate;
                                //                                    var id_message = docs[i]._id;
                                //                                    var status = docs[i].status
                                //                                    var isdelete = docs[i].isdelete;
                                //                                    var isfavorite = docs[i].isfavorite;
                                //                                    var istrash = docs[i].istrash;
                                //                                    var isarchive = docs[i].isarchive;
                                //                                    var symkey = cleardata.symdata;
                                //                                    
                                //                                    
                                //                                    if	(cleardata.symdata)
                                //                                    {
                                //                                        datasend = {
                                //                                            from: 'server', 
                                //                                            event:'mail', 
                                //                                            to:data.username, 
                                //                                            original:docs[i].sendername, 
                                //                                            data:data_text, 
                                //                                            datesend:datesend, 
                                //                                            id:id_message, 
                                //                                            status:status , 
                                //                                            isdelete:isdelete, 
                                //                                            isfavorite:isfavorite, 
                                //                                            istrash:istrash, 
                                //                                            isarchive:isarchive, 
                                //                                            symkey:symkey
                                //                                        };
                                //                                        PersonModel.findOne({
                                //                                            name: docs[i].sendername
                                //                                        }, function(err, founds) {
                                //                                            if (!founds) {
                                //                                                console.log('Username does not exist! ');
                                //                                            } 
                                //                                            else 
                                //                                            {
                                //                                                console.log('++++++++++++++++++' + JSON.stringify(founds));
                                //                                                if(founds.avatar) {
                                //                                                    datasend.avatar = founds.avatar;
                                //                                                    
                                //                                                }
                                //                                                sendMailToClient(datasend, data.username);
                                //                                                console.log("Have symkey----->>>>>>"+JSON.stringify(datasend));
                                //
                                //                                            }
                                //                                        });
                                //                                        
                                //                                    }
										
                                //                                    PersonModel.findOne({
                                //                                        _id: docs[i].from
                                //                                    }, function(err, founds) {
                                //                                        if (!founds) {
                                //                                            console.log('Username does not exist! ');
                                //                                        } 
                                //                                        else 
                                //                                        {
                                //                                        /*console.log('Username original for from :-->! '+founds.name);
                                //										if	(cleardata.symdata)
                                //										{
                                //											datasend = {from: 'server', event:'mail', to:data.username, original:founds.name, data:data_text, datesend:datesend, id:id_message, status:status ,isdelete:isdelete, isfavorite:isfavorite, istrash:istrash, isarchive:isarchive, symkey:symkey};
                                //											sendMailToClient(datasend, data.username);
                                //											console.log("Have symkey----->>>>>>"+JSON.stringify(datasend));
                                //										}
                                //										/*else
                                //										{
                                //											console.log("No symkey----->>>>>>"+docs[i].jkey + docs[i]);
                                //											datasend = {event:'text', text:docs[i].body, datesend:docs[i].sendDate, id:docs[i]._id, status:docs[i].status ,isdelete:docs[i].isdelete, isfavorite:docs[i].isfavorite, istrash:docs[i].istrash, isarchive:docs[i].isarchive, symkey:docs[i].symdata};
                                //											serverSend(datasend, data.username);
                                //										}*/
                                //                                        }
                                //									
                                //                                    });	
                                    
                                //                                    i++;
                                //                                }
                                var senderArray = [];
                                for(var i = 0; i < docs.length; ++i) {
                                    senderArray.push(docs[i].sendername);
                                }
                                
                                //                                senderArray = senderArray.uniq();
                                
                                PersonModel.find({
                                    name: {
                                        $in: senderArray
                                    }
                                }, function (err, people) {
                                    for(var i = 0; i < docs.length; ++i) {
                                        var datasend;

                                        var json = docs[i].json;
                                        //console.log('Json Here !!!!!!!'+docs[i]);
                                        var cleardata = JSON.parse(json);
                                        console.log('Clear Here !!!!!!!' + cleardata);

                                        var data_text = docs[i].body;
                                        var datesend = docs[i].sendDate;
                                        var id_message = docs[i]._id;
                                        var status = docs[i].status
                                        var isdelete = docs[i].isdelete;
                                        var isfavorite = docs[i].isfavorite;
                                        var istrash = docs[i].istrash;
                                        var isarchive = docs[i].isarchive;
                                        var symkey = cleardata.symdata;
                                        var avatar = 'undefined';
                                        
                                        for(var j = 0; j < people.length; ++j) {
                                            if(people[j].name == docs[i].sendername) {
                                                avatar = people[j].avatar;
                                                break;
                                            }
                                        }

                                        if (cleardata.symdata)
                                        {
                                            datasend = {
                                                from: 'server', 
                                                event:'mail', 
                                                to:data.username, 
                                                avatar: avatar,
                                                original:docs[i].sendername, 
                                                data:data_text, 
                                                datesend:datesend, 
                                                id:id_message, 
                                                status:status , 
                                                isdelete:isdelete, 
                                                isfavorite:isfavorite, 
                                                istrash:istrash, 
                                                isarchive:isarchive, 
                                                symkey:symkey
                                            };
                                            
                                            sendMailToClient(datasend, data.username);
                                        }
                                    }
                                });
                            } 
                            catch (err) 
                            {
                                console.log('Err: ' + err);
                            }
                        }
                    });
                }
            }
        });
    }
}

function _findAvatarByUsername(username) {
    var avatar = null;
    PersonModel.findOne({
        name: username
    }, function(err, founds) {
        if (!founds) {
            console.log('Username does not exist! ');
        } 
        else 
        {
            console.log('++++++++++++++++++' + JSON.stringify(founds));
            if(founds.avatar) {
                avatar = founds.avatar;
                return founds.avatar;
            }
            
        }
    });
    
    return avatar;
}

function markRequested(data){
    if (data.type == 'markAsFavorite'){
        if	(data.id != 'undefinded'){
            /*PostingModel.update({_id:data.id}, {isfavorite:data.text}, function (err, docs) {
				if (err)
					console.log('Error: '+ err);
				else if (!docs.length)
					console.log('Server: ' + ' does not exist');
				else {
					try {						
					} 
					catch (err) 
					{
						console.log('Err: ' + err);
					}
				}
			});*/
            updateFavorite(data.id, data.text);
        }
    }
    else if (data.type == 'markAsTrash'){
        if	(data.id != 'undefinded'){
            markAsTrash(data.id, data.text);
        }
    }
    else if (data.type == 'markAsDelete'){
        if	(data.id != 'undefinded'){
            markAsDelete(data.id, 'YES');
        }
    }
    else if (data.type == 'markAsArchive'){
        if	(data.id != 'undefinded'){
            //removePosted(data.id);
            //console.log(JSON.stringify(data));
            //            markAsArchive(data.id, 'YES');
            updateArchive(data.id, data.text);
        }
    }
    else if(data.type == 'markAsReadUnread') {
        if(data.id) {
            markAsReadUnread(data.id, data.text);
        }
    }
    
}

function findPostedBy(id, username, type, msg){
    /*	
	PostingModel.findByIdAndUpdate(id, { $set: { size: 'large' }}, function (err, tank) {
  	if (err) return handleError(err);
  		res.send(tank);
	});
     */	
    var query;
    if (type == 'messageofgroup')
    {
        query = {
            to:id, 
            groupname:msg
        };
    }
    else if (type == 'favorite')
    {
        query = {
            to:id, 
            isfavorite:'YES'
        };
    }
    else if (type == 'trash')
    {
        console.log('Query Trash!!!');
        query = {
            to:id, 
            istrash:'YES'
        };
    }
    else if (type == 'archive')
    {
        console.log('Query archive!!!');
        query = {
            to:id, 
            isarchive:'YES'
        };
    }
    else if (id != 'undefined')
    {
        query = {
            to:id
        };
    }
	
	
    PostingModel.find(query, function (err, docs) {
        if (err)
            console.log('Error: '+ err);
        else if (!docs.length)
            console.log('Query: '+JSON.stringify(query) + ' does not exist');
        else {
            try {
                console.log(JSON.stringify(query) + ' found!!!!!!!!!!!!!!!!!!!!!!!!');
                var senderArray = [];
                for(var i = 0; i < docs.length; ++i) {
                    senderArray.push(docs[i].sendername);
                }
                
                PersonModel.find({name: {$in: senderArray}}, function (err, people) {
                    if(err || !people || !people.length) {
                        return;
                    }
                    
                    var i = 0;//docs.length-4;
                    if	(i < 0)
                        i = 0;
                    while (i < docs.length)
                    {
                        var datasend;
                        var json = docs[i].json;
                        //console.log('Json Here !!!!!!!'+docs[i]);
                        var cleardata = JSON.parse(json);
								
                        var symkey = cleardata.symdata
                        //datasend = {event:'text', text:docs[i].body, datesend:docs[i].sendDate, id:docs[i]._id, status:docs[i].status ,isdelete:docs[i].isdelete, isfavorite:docs[i].isfavorite, istrash:docs[i].istrash, isarchive:docs[i].isarchive};
                        //serverSend(datasend, username);
                        
                        datasend = {
                            from: 'server', 
                            event:'mail', 
                            to:username, 
                            original:docs[i].sendername, 
                            data:docs[i].body, 
                            datesend:docs[i].sendDate, 
                            id:docs[i]._id, 
                            status:docs[i].status , 
                            isdelete:docs[i].isdelete, 
                            isfavorite:docs[i].isfavorite, 
                            istrash:docs[i].istrash, 
                            isarchive:docs[i].isarchive, 
                            symkey:symkey
                        };
                        
                        for(var j = 0; j < people.length; ++j) {
                            if(docs[i].sendername == people[j].name) {
                                datasend.avatar = people[j].avatar;
                                break;
                            }
                        }
                        
                        sendMailToClient(datasend, username);
                        i ++;					
                    }
                });
            }
            catch (err) 
            {
                console.log('Err: ' + err);
            }
        }
    });
}

function pushEmbedData(username, myGroup, myDescription, post){
    console.log('Embed data:-->' + username);
    PersonModel.find({
        name:username
    }, function (err, docs) {
        if (err)
            console.log('Embed data error!');
        else if (!docs.length) {
            console.log('Embed data error! length');
        }
        else if (!docs[0].hashed) {
            console.log('Embed data not found');
        }
        else {
		
            //PersonModel.findOne({'group.groupName': myGroup}, function(err, found) {
            PersonModel.findOne({
                'groupName': myGroup
            }, function(err, found) {
                if (!found) {
                    console.log('Embed data now!!!'+myGroup); 
                    //{from: fromId, to: toId, body: message, dateSend: new Date()}
                    //docs[0].group.push({ groupName: myGroup, description: myDescription, posted: post });
                    //docs[0].group.push({ groupName: myGroup, description: myDescription, posted: [{ dateSend: new Date()}] });
                    docs[0].group.push({
                        groupName: myGroup, 
                        description: myDescription, 
                        posted: [{
                                from: post.fromId, 
                                to: post.toId, 
                                body: post.body, 
                                dateSend: new Date()
                            }]
                    });
                    //docs[0].group.push({ groupName: myGroup, description: myDescription});
			
                    docs[0].save(function (err) {
                        if (!err) console.log('Success!');
                        else console.log('Push group err!!'+ err.message);
                    });
                } 
                else 
                {
                    console.log('Group was existed');
                    //docs[0].group.push({ posted: post });
                    //docs[0].group.push({ groupName: myGroup, description: myDescription, posted: [{ dateSend: new Date()}] });
					
                    docs[0].save(function (err) {
                        if (!err) console.log('Success!');
                        else console.log('Push group err!!'+ err.message);
                    });
                }
            });
        }
    });
}


function missiveOfGroupUser(username, myGroup, myDescription, post, fromID, toID){
    PersonModel.find({
        name:username
    }, function (err, docs) {
        if (err)
            console.log('Embed data error!');
        else if (!docs.length) {
            console.log('Embed data error! length');
        }
        else if (!docs[0].hashed) {
            console.log('Embed data not found');
        }
        else {
			
            PersonModel.findOne({
                'group.groupName': myGroup
            }, function(err, found) {
                //PersonModel.findOne({'groupName': myGroup}, function(err, found) {
                if (!found) {
                    console.log('Add group!!!'+myGroup);
                    console.log( post.json);
                    //{from: fromId, to: toId, body: message, dateSend: new Date()}
                    docs[0].group.push({
                        groupName: myGroup, 
                        description: myDescription,
                        posted: [{
                                from: fromID, 
                                to: toID, 
                                body: post.body, 
                                dateSend: new Date(), 
                                json: post.json
                            }]
                    });
                    //found.group.push({ groupName: 'test1', description: myDescription, posted: [{from: fromID, to: toID, body: post.body, dateSend: new Date(), json: post.json }] });
                    docs[0].save(function (err) {
                        //found.save(function (err) {
                        if (!err) console.log('Success!');
                        else console.log('Push group err!!'+ err.message);
                    });
                } 
                else 
                {
                    /*PersonModel.find({from:fromID},{group:1}, function(err, fn) {
						if (fn)
						{
							console.log('Find fromID: '+JSON.stringify(fn));
							fn[0].posted.insert({ dateSend: new Date() });
						}else
						{
							console.log('Find: Error');
						}
					});*/
                    console.log('Add group!!!'+myGroup);
                    console.log('Group was existed:Updating..');// + JSON.stringify(found));
                    
                    console.log('found._id-->'+found._id);
                    
                    PersonModel.update({
                        'group.groupName': 'default group'
                    }, {
                        $push:{
                            'group.posted': [{
                                    from: fromID, 
                                    to: toID, 
                                    body: post.body, 
                                    dateSend: new Date(), 
                                    json: post.json
                                }]
                        }
                    }, function (err, fn){
                        //						 db.post.update({ _id: db.ObjectId(req.body.id) }, {$push: { comments: data }}, { safe: true }, function(err, field) {});
                        if (fn)
                        {
                            console.log('Update posted success: ');
							
                        }else
                        {
                            console.log('Update: Error: '+err.message);
                        }
                    });											 					
               
                }
            });
        }
    });
}

function postMeessageOfGroup(id, groupname, type)
{
    console.log('update group: ' + id);
    PostingModel.findOne({
        receivename: id
    }, function(err, found) {
        if (!found) {
            console.log('messageOfGroup: '+id+' not exist! ');
        } 
        else {
            PostingModel.update({
                receivename:id
            }, {
                groupname:groupname
            }, function (err, docs) {
                if (err)
                    console.log('Error: '+ err);
                else {
                    try {
                        console.log('messageOfGroup: group!!!!!!!!!!!!!!!');		
                    } 
                    catch (err) 
                    {
                        console.log('Err: ' + err);
                    }
                }
            });
        }
    });
}

function missiveOfGroup(groupname, fromId, toId, message){
    OfGroupModel.findOne({
        groupName: groupname
    }, function(err, found) {
        if (!found) {
            console.log('Group was not found in database');
        } 
        else 
        {
            console.log('missiveOfGroup: was push!!'+message);
            
            found.posted.push( {
                from: fromId, 
                to: toId, 
                body: message, 
                dateSend: new Date()
            });
            //found.save();
            found.save(function(err) {
                if (!err) console.log('missiveOfGroup: Success! ');
                else console.log('Error!! ' + err.message);
            });
        }
    });
    console.log('Hererereee!!!!!!!!h!!'+message);
}

function savePostingArray(array) {
    var post = array.pop();
    
    post.save(function (err) {
        if(!err) {
            console.log('savePostingArray ' + array.length);
            if(array.length) {
                savePostingArray(array);
            }
            else {
                return false;
            }
            return true;
        }
        
        return false;
    });
}

function posted(data) {
    var who = data.from;
   
    console.log('Server: posted data user= ??????????????????' + who);
	
    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(who, err);
        else if (!docs.length) {
        }
        else if (!docs[0].hashed) {
        }
        else {
            var posting = new PostingModel();
            var fromId  = docs[0]._id;
            var toId;
            if(data.groupId) {
                console.log("Group mail");
                // send mail to group
                OfGroupModel.findById(data.groupId, function (err, group) {
                    if(err) {
                        console.log('Cannot find group  ' + data.groupId);
                    }
                    else {
                        posting.to = data.groupId;
                        posting.sendername = data.from;
                        posting.from = fromId;
                        posting.status = 'unread';
                        posting.body = JSON.stringify(data.text);
                        posting.sendDate = new Date;
                        posting.json = JSON.stringify(data);
                        posting.toGroup = data.groupId;
                        //                        for(var v = 0; v < group.contacts.length; v++) {
                        //                            posting.toGroup.push(group.contacts[v]);
                        //                        }

                        PersonModel.find({
                            name : {
                                $in : group.contacts
                            }
                        }, function (err, cts) {
                            if(err || !cts || !cts.length) {
                                console.log('Error, cannot find contacts');
                            }
                            else {
                                var groupPost = [];
                                for(var i = 0; i < cts.length; ++i) {
                                    var newPost = new PostingModel();
                                    newPost.to = cts[i]._id;
                                    newPost.sendername = data.from;
                                    newPost.from = fromId;
                                    newPost.body = posting.body;
                                    newPost.sendDate = new Date;
                                    newPost.json = posting.json;
                                    newPost.toGroup = data.groupId;
                                    newPost.status = 'unread';
                                    groupPost.push(newPost);
                                    console.log("Pushing contact id " + cts[i]._id);
                                }
                                
                                
                                
                                posting.save(function (err) {
                                    if(!err) {
                                        PostingModel.findOne({
                                            body: JSON.stringify(data.text)
                                        }, function (err, found) {
                                            if(!err && found) {
                                                for(var v = 0; v < group.contacts.length; v++) {
                                                    data.destination = group.contacts[v];
                                                    data.avatar = docs[0].avatar;
                                                    missiveGroup(data, found);
                                                    console.log("Sending mail group to " + group.contacts[v] + " " + v);
                                                    //                                                    console.log("Posting is: " + JSON.stringify(found));
                                                } 
                                            }
                                        });
                                    }
                                });
                                
                                group.posted.push(posting._id);
                                group.save();
                                savePostingArray(groupPost);
                            }
                        });
                    }
                });
            } else {
                console.log("Personal mail " + data.destination);
                PersonModel.find({
                    name:data.destination
                }, function (err, des) {
                    if (err)
                        reject(who, err);
                    else if (!des.length) {
                    }
                    else if (!des[0].hashed) {
                    }
                    else {
                        posting.sendername = data.from;
                        posting.receivename = data.destination;
                        posting.from = fromId;
                        posting.to = des[0]._id;
                        posting.body = JSON.stringify(data.text);
                        posting.sendDate = new Date;
                        posting.status = 'unread';
                        posting.json = JSON.stringify(data);
                        posting.save(function (err) {
                            if (!err)// console.log('saved 1');
                            {
                                console.log('Server: saved');
                                PersonModel.findOne({name: posting.sendername}, function (err, person) {
                                    if(!err && person) {
                                        console.log('Sending with avatar');
                                        data.avatar = person.avatar;
                                        missive( data.from, data, 'success');
                                    }
                                });
                            }
                            else
                            {
                                console.log(err.message)
                                console.log('Server: not save-->' + err);							
                            }
                        });
                    }
                });
            }
	
        }
    });
}

function checkContactList(id)
{
	
    ContactListModel.find({
        _id:id
    }, function(err, founds) {
        if (!founds) {
            console.log('Username does not exist! ');
        } 
        else {
            console.log('findContact: found! '+'-->' + founds[0].username);
            return true;
        }
    });	
}


function postedEmbed(data) {
    var who = data.from;
    var publ = '{"point":[1324584956,888748133,1231178966,-196007002,-651318423,-2048041408,-1085381145,584870534,61805138,-691949372,1699866676,1201966708,-692370907,-186422022,535481603,-40753102,-392759041,158128584,-689615161,-566445758,-1225297779,-306726469,-793701110,556865080],"curve":384}';
	
    updateUserProfile(who, publ);
	 
    console.log('Server: posted data user= ??????????????????' + who);
	
    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(who, err);
        else if (!docs.length) {
        }
        else if (!docs[0].hashed) {
        }
        else {
            var person = new PersonModel();
           
            person.group.push({
                groupName: 'My Group'
            });
            person.group.push({
                description: 'descript'
            });
			
            PersonModel.update({
                _id: docs[0]._id
            }, {
                firstname:'Tai232 test'
            }, function (err, doc){
                if (!doc) {
                    console.log('update group fail!');
                }
                else {
                    console.log('Updated data ...........?????????');
                }
            });
			
            PersonModel.findOne({
                _id: docs[0]._id
            }, function(err, found) {
                if (!found) {
                    console.log('URL was not found in update_incoming_url ' + url);
                } 
                else 
                {
                    console.log('Find Update by Save data now ...........');
                    found.group.description = "i am modifi";
                    found.save();
                    //found.save(function(err) {});
                }
            });
			
            var posting = new PostingModel();
            var from  = docs[0]._id;
            //console.log('DOCS-->' + docs);
            //console.log('idFrom-->' + from);
            posting.sendername = data.from;
            posting.receivename = data.destination;
            posting.from = from;
            posting.to = from;
            posting.body = JSON.stringify(data.text);
            posting.sendDate = new Date;
            posting.jkey =  JSON.stringify(data.symdata);
            posting.json = JSON.stringify(data);
			
			
            posting.save(function (err) {
                if (!err)// console.log('saved 1');
                {
                    console.log('Server: store data into db: jkey:'+ JSON.stringify(posting.jkey));
                    console.log('Server: saved!!!!!');
                    missive(from, data, 'success');
					 
                    //accept(who, 'posted: user ' + who + ' created');
                }
                else
                {
                    console.log(err.message)
                    console.log('Server: not save-->' + err);
                    //reject(who, err);
                }
            });
        }
    });
}

function postedEmbeg(data) {
    var who = data.from;
    console.log('Server: posted data user= ??????????????????' + who);
    PersonModel.find({
        name:who
    }, function (err, docs) {
        if (err)
            reject(who, err);
        else if (!docs.length)
            reject(who, 'Server: posted: user ' + who + ' does not exist');
        else if (!docs[0].hashed)
            reject(who, 'Server: posted: user ' + who + ' is missing hashed');
        else {
            var posting = new PostingModel();
            var from  = docs[0]._id;
            //console.log('DOCS-->' + docs);
            //console.log('idFrom-->' + from);
            posting.from = from;
            posting.to = from;
            posting.body = JSON.stringify(data.text);
            posting.sendDate = new Date;
            posting.json = JSON.stringify(data);
			
            //console.log('Server: store data into db: '+ JSON.stringify(posting));
			
            posting.save(function (err) {
                if (!err)// console.log('saved 1');
                {
                    console.log('Server: saved');
                    missive(from, data, 'success');
					 
                    //accept(who, 'posted: user ' + who + ' created');
                }
                else
                {
                    console.log(err.message)
                    console.log('Server: not save-->' + err);
                    //reject(who, err);
                }
            });
        }
    });
}

// setup

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/fisilchat');
// mongodb://<user>:<password>@ds037637.mongolab.com:37637/heroku_app7182084

var PersonSchema = new Schema({
    uid		: String,
    hashed	: String,
    salt	: String,
    name	: String,
    pubkey  : String,
    email			: String, //here
	
    website			: String,
    firstname		: String,
    lastname		: String,
    avatar			: String,
    creationDate	: Date,
    modificationDate: {
        type: Date, 
        dedault: Date.now
    },
    contacts		: [ContactListModel],
    posted			: [PostingModel],
    group : [OfGroupModel]
});
var PersonModel = mongoose.model('Person', PersonSchema);

var ContactOfGroupSchema = new Schema({
    groupID		: ObjectId,
    groupName	: String,
    description	: String,
    contacts	: [String],//username
    UserId		: ObjectId	
});
var ContactOfGroupModel = mongoose.model('ContactOfGroup', ContactOfGroupSchema);

var ContactListSchema = new Schema({
    groupID		: ObjectId,
    groupName	: String,
    userId		: ObjectId,
    username	: String, //contact of username
    name		: String,
    contactUser	: String,
    firstname	: String,
    lastname	: String,
    description	: String,

    title		: String,// �President�
    company		: String,
    website		: String,
    groups		: [],//groupId
    addresses 	: [],

    phone		: [],//array ofwork,cell �phones� : [{"work" : "202-555-1111"},{"cell" : "800-555-1212"}]
    contacts	: []//contact list of username
});
var ContactListModel = mongoose.model('ContactList', ContactListSchema);

var no_color = 'no_color', red_color = 'red', yellow_color = 'yellow', grey_color = 'grey', blue_color = 'blue', orange_color = 'orange';
var OfGroupSchema = new Schema({
    groupID		: ObjectId,
    owner: String,
    groupName	: String,
    description	: String,
    color: String,
    contacts	: [],//username
    settings		: [],//{author: username, color: red, groupname: abc} 
    posted	: [PostingModel]
});
var OfGroupModel = mongoose.model('ofGroup', OfGroupSchema);

var GroupSettingSchema = new Schema({
	groupID		: ObjectId,
	groupName	: String,
	color		: String,
	userId		: ObjectId
});
var GroupSettingMode = mongoose.model('groupSetting', GroupSettingSchema);

var PostingSchema = new Schema({
    from		: ObjectId,
    to			: ObjectId,
    toGroup 	: ObjectId,
    groupname	: String,
    sendername	: String,
    receivename	: String,
    title		: String,
    body		: String,
    sendDate	: Date,
    receivedDate: Date,
    modifyDate	: Date,
    status 		: String, 
    isdelete	: String,//Yes, no
    isfavorite 	: String,
    istrash		: String,
    isarchive	: String,
    jkey		: String,
    json		: String
});
var PostingModel = mongoose.model('Posting', PostingSchema);
<!---------------------->

var ProfileSchema = new Schema({
    uid				: ObjectId,
    email			: String,
    firstname		: String,
    lastname		: String,
    avatar			: String,
    creationDate	: Date,
    modificationDate: {
        type: Date, 
        dedault: Date.now
    }
});
var ProfileModel = mongoose.model('Profile', ProfileSchema);

var LoginSchema = new Schema({
    userID		: ObjectId,
    Username	: String,
    Name		: String,
    startTime	: Date,
    endTime		: Date
});
var LoginModel = mongoose.model('Login', LoginSchema); 

//Using with the Express web framework //npm install socket.io express
//Middleware
//Middleware via Connect can be passed to express.createServer() as you would with a regular Connect server
var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname));
app.listen(port);
console.log('Server listening on port: ' + port);

var handler = function(data) {
    console.log(new Date+'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('Event handler: --> ' + data.event);
    //	console.log('Server: data from client--> ' + JSON.stringify(data));
  
    var handler = {
        salt:salted, 
        signup:signuped, 
        signin:signined, 
        mail:posted, 
        mess:requested, 
        mark:markRequested
    }
    [data.event];
    handler && handler(data);
}

var Crypt = require('./crypt');
crypt = new Crypt({
    handle:handler
}, 'server', app);

