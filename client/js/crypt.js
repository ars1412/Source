if (typeof require != 'undefined') {
    sjcl = require('./sjcl');
}

function Crypt(listener, id, port) {
    this.listener = listener;
    this.id = id;

    this.uri2socket = {};
    this.socketList = [];
    this.peers = {};
    this.queue = {};

    seedRNG();
    this.keys = sjcl.ecc.elGamal.generateKeys(384, 10);
    this.pubstr = JSON.stringify(this.keys.pub.serialize());
    console.log('pubstr-->'+this.pubstr);
	
    if (port) { // then listen
        var io = require('socket.io').listen(port);
        io.set("log level", 1);
        io.configure(function () { 
            io.set("transports", ["xhr-polling"]); 
            io.set("polling duration", 10); 
        });
		
        io.sockets.on('connection', function (socket) {
            console.log('Client: connected')
            crypt.addSocket(socket);
        });
		
        this.io = io;
    }
}

Crypt.prototype.setId = function(id) {
    console.log('setId to ' + id);
    this.id = id;
    for (peer in this.peers)
        this.sendPublicKey(peer, this.peers[peer].via);
}

Crypt.prototype.connect = function(uri) {
    console.log('Client: connnect');
    if (this.uri2socket[uri])
        this.listener.connected(uri);
    else {

        socket = io.connect('http://localhost:8089');//12374
//        socket = io.connect('http://dev-mobile.herokuapp.com/');

		
        /*socket = new WebSocket('http://localhost:8089/');
		socket.onopen = function() {
			this.addSocket.bind(this, socket, uri);
			console.log('connected');
	 		alert('connected');
		};
		
	 
		// alerts message pushed from server
		socket.onmessage = function(msg) {
	 		alert(JSON.stringify(msg));
		};
	 
		// alert close event
		socket.onclose = function() {
	 		alert('closed');
		};*/
        //socket = new io.Socket("localhost", { port: 8089 , rememberTransport: false });
		
        //socket = io.connect(uri);
        socket.on('connect', this.addSocket.bind(this, socket, uri));
		
        console.log('Client: Socket is connected: ' + socket.id);
    }
}

Crypt.prototype.addSocket = function(socket, uri) {
    console.log('Client: addSocket ' );
    if (uri)
        this.uri2socket[uri] = socket.id;
    socket.on('message', this.handle.bind(this, socket));
    socket.send(this.pubstr);
    console.log(this.pubstr);
    socket['ali'] = 'Add: '+this.id;
    this.socketList.push(socket);
    console.log('adSocket: socket-->'+socket.id+' socketList:'+this.socketList.length);
}

function setAttributes(dst, src) {
    for (key in src)
    {
        //console.log('key-->'+key+ ' src_key-->' + JSON.stringify(src[key]));
        dst[key] = src[key];
        dst['ali'] = 'to: '+this.id;
    }
}

Crypt.prototype.receivedPublicKey = function(socket, datastr, from) {
    console.log('receivedPublicKey' + (from ? ' from ' + from : ''));
    var pubjson = JSON.parse(datastr);
    var point = sjcl.ecc.curves['c'+pubjson.curve].fromBits(pubjson.point)
    var pubkey = new sjcl.ecc.elGamal.publicKey(pubjson.curve, point.curve, point);
    var symkey =  this.keys.sec.dh(pubkey);

    console.log('receivedPublicKey: socket-->' + socket.id);
    if (from) {
        this.peers[from] = {
            socketId:socket.id
        };//from server
        setAttributes(this.peers[from],{
            pub:pubkey, 
            sym:symkey, 
            via:socket
        });//???????????
        var q = this.queue[from];
        for (var i in q)
            this.send(q[i], from);
        delete this.queue[from];
    } else {
        console.log('socket secured ');
        socket.symkey = symkey;
        for (var to in this.queue)
            this.sendPublicKey(to, socket);
    }
}

Crypt.prototype.route = function(data) {
    try{
        var sid = this.peers[data.to].socketId;
        var outsocket = this.io.sockets.socket(sid);
        console.log('Client: outsocket-->' + sid);
        if (!outsocket)
            console.log('Client: no socket for ' + data.to);
        else {
            console.log('Client: route to ' + data.to);
            this.sendOnSocket(outsocket, data);
        }
    }catch (e) {
        
    }
}

Crypt.prototype.handle = function(socket, socketData) {
	
    console.log('Alert: You are stay in Crypt.prototype.handle ??????');
    if (!socket.symkey) {
        this.receivedPublicKey(socket, socketData);
        return;
    }
    var peerCipherData = sjcl.decrypt(socket.symkey, socketData);///??????????
    var data = JSON.parse(peerCipherData);
    var from = data.from;
    console.log('Crypt.prototype.handle -->recv: data.to=' + data.to +', from=' + from);
    console.log('Crypt.prototype.handle -->recv:' + socket.id + ' data:-->'+ JSON.stringify(data));
    if (data.to != this.id)
    {
        this.route(data);
    }
    else if (data.pk) { // pk for me
        console.log('Client revc publickey???');
        this.receivedPublicKey(socket, data.pk, from);
        if (!data.isResponse)
        {
            console.log('if reponse');
            this.sendPublicKey(from, socket, true);
        }
    } else if (this.peers[from]) {
        var s = data.data;
        var cleardata;
        if	(data.event == 'mail') 
        {
            //var pk = '{\"point\":[1426769227,-1364754083,1578417547,-1719514425,279538672,683711452,-1667382351,565186452,2018805517,1697758370,238653628,-1158158373,-1592295020,505836869,822861818,-1115229814,201289353,-77262853,-467025113,1211997034,546157440,-1622865326,-1203782861,2007867177],\"curve\":384}';
            var temppeerCipherData =  sjcl.decrypt(this.peers[from].sym, data.data);
            var cleardata1 = JSON.parse(temppeerCipherData);
								
            var descyptdata; 
		
            var sym = cleardata1.symkey;
            var desdata = JSON.parse(cleardata1.data);
            if (cleardata1.symkey)
            {
                descyptdata = sjcl.decrypt(sym, desdata);
			
                cleardata = {
                    event:'text', 
                    to:cleardata1.destination, 
                    original:cleardata1.original, 
                    text:descyptdata, 
                    datesend:cleardata1.datesend, 
                    id:cleardata1.id, 
                    status:cleardata1.status ,
                    isdelete:cleardata1.isdelete, 
                    isfavorite:cleardata1.isfavorite, 
                    istrash:cleardata1.istrash, 
                    isarchive:cleardata1.isarchive,
                    avatar: cleardata1.avatar
                };
                
                if(cleardata1.groupId) {
                    cleardata.groupId = cleardata1.groupId;
                }
//                if(cleardata1.avatar) {
//                    cleardata.avatar = cleardata1.avatar;
//                }
//                
                cleardata = JSON.stringify(cleardata);	
            }
            else
            {
                cleardata =  sjcl.decrypt(this.peers[from].sym, cleardata1.data);		
            }
			
			
            //cleardata =  JSON.stringify({event:"mail", text:descyptdata});
            var s = this.peers[from];
            if	(s)
                console.log('Decrypted message-->socket:?????????' + JSON.stringify(s.socketId) + ' sym:'+this.peers[from].sym + ' from' + from);
        }
        else  //	"{"event":"text","text":"klj "}"
            cleardata =  sjcl.decrypt(this.peers[from].sym, data.data);		
        console.log('Client --> decrypted: ' + cleardata);
        var parsed = JSON.parse(cleardata);
        parsed.from = from;
        this.listener.handle(parsed);
    } else
        console.log("I don't have a pk for " + from);
    console.log('Alert: You are out of Crypt.prototype.handle ....');
}

Crypt.prototype.sendPublicKey = function(to, socket, isResponse) { // sent to peer
    console.log('sendPublicKey to ' + to);
    var pk = JSON.stringify(this.keys.pub.serialize());
    var data = {
        event:'pubkey', 
        from:this.id, 
        isResponse:isResponse, 
        pk:pk, 
        to:to
    };
    this.sendOnSocket(socket, data);
}

Crypt.prototype.sendMissive = function(data, to) {
    //client.crypt.send({event:'text', text:text},  to);
    //client.crypt.send({event:'mail', destination:to, text:text}, 'server');
		
    var cleardata = JSON.stringify(data);
    console.log('Crypt client    shall send -->' + cleardata);
    var cipherdata = sjcl.encrypt(peer.sym, cleardata);
    data = {
        to:to, 
        from:this.id, 
        data:cipherdata
    };
		
    console.log('first send pubkey to ' + to);
    if (!this.queue[to])
        this.queue[to] = [];
    this.queue[to].push(data);

    for (var i=0; i<this.socketList.length; i++) { // todo: don't flood
        var socket = this.socketList[i];
        this.sendPublicKey(to, socket);
    }
}

Crypt.prototype.encryptData = function(data, pub) {
    var pubjson = JSON.parse(pub);
    var point = sjcl.ecc.curves['c'+pubjson.curve].fromBits(pubjson.point)
    var pubkey = new sjcl.ecc.elGamal.publicKey(pubjson.curve, point.curve, point);
    var symkey =  this.keys.sec.dh(pubkey);
    return {
        data:sjcl.encrypt(symkey, data), 
        symdata:symkey
    };
}

Crypt.prototype.descryptData = function(data, pub) {
	
    var pubjson = JSON.parse(pub);
    var point = sjcl.ecc.curves['c'+pubjson.curve].fromBits(pubjson.point)
    var pubkey = new sjcl.ecc.elGamal.publicKey(pubjson.curve, point.curve, point);
    var symkey =  this.keys.sec.dh(pubkey);
    return sjcl.decrypt(symkey, data);
}

Crypt.prototype.descryptDataWithSym = function(data, symkey) {
	
	
    return sjcl.decrypt(symkey, data);
}

Crypt.prototype.descryptDataWith = function(data, pub) {
    var symkey =  this.keys.sec.dh(pub);
    return sjcl.decrypt(symkey, data);
}


Crypt.prototype.encryptMessage = function(data, pub) {
    pk = JSON.stringify(this.keys.pub.serialize());
    return this.encryptData(data, pk);
}

Crypt.prototype.encryptText = function(data, pub) {
    var pk = '{\"point\":[1426769227,-1364754083,1578417547,-1719514425,279538672,683711452,-1667382351,565186452,2018805517,1697758370,238653628,-1158158373,-1592295020,505836869,822861818,-1115229814,201289353,-77262853,-467025113,1211997034,546157440,-1622865326,-1203782861,2007867177],\"curve\":384}';
    //var hashed = salthash(pk);
    pk = JSON.stringify(this.keys.pub.serialize()); 
	
    //	pk = this.peers[this.id].sym;
    console.log('????????????????????????PK-->:'+pk);
    console.log('pubstr: '+ this.pubstr);
    /*var pubjson = JSON.parse(data);
	var point = sjcl.ecc.curves['c'+pubjson.curve].fromBits(pubjson.point)
	var pubkey = new sjcl.ecc.elGamal.publicKey(pubjson.curve, point.curve, point);*/
    //var s =  this.keys.sec.dh(pk);
    return sjcl.encrypt(pk, data);
}

Crypt.prototype.encryptText1 = function(data, pub) {
    var pk = '{\"point\":[1426769227,-1364754083,1578417547,-1719514425,279538672,683711452,-1667382351,565186452,2018805517,1697758370,238653628,-1158158373,-1592295020,505836869,822861818,-1115229814,201289353,-77262853,-467025113,1211997034,546157440,-1622865326,-1203782861,2007867177],\"curve\":384}';
    //var hashed = salthash(pk);
    pk = JSON.stringify(this.keys.pub.serialize());
	
    console.log('????????????????????????PK-->:'+pk);
    /*var pubjson = JSON.parse(data);
	var point = sjcl.ecc.curves['c'+pubjson.curve].fromBits(pubjson.point)
	var pubkey = new sjcl.ecc.elGamal.publicKey(pubjson.curve, point.curve, point);*/
    //var s =  this.keys.sec.dh(pk);
    return sjcl.encrypt(pk, data);
}

Crypt.prototype.send = function(data, to) {
    console.log('Crypt client: send to ' + to +': data-->'+ JSON.stringify(data));
	
    var peer = this.peers[to];//peer server 
    if	(data.event == 'mail')
    {
        data.pubfrom = JSON.stringify(this.keys.pub.serialize());
        data.symclient = peer.sym;
    }
    if (peer && peer.pub) {
        var cleardata = JSON.stringify(data);
        console.log('Crypt client    shall send -->' + cleardata);
        //"{"username":"test","event":"salt"}"; "{"username":"test","has...4704],"event":"signin"}"
		
        //console.log(cleardata);
        var s = this.peers[to];
        if (s)
            console.log('this.peers[from]-->socket:' + JSON.stringify(s.socketId) + ' sym:'+this.peers[to].sym) + ' to' + to; 
        if (peer)
            console.log('Encrypted message-->socket: '+JSON.stringify(peer.socketId) +  ' sym:'+peer.sym + ' to:'+to);
        var cipherdata = sjcl.encrypt(peer.sym, cleardata);//peer cua to
        data = {
            to:to, 
            from:this.id, 
            data:cipherdata
        };
        this.sendOnSocket(peer.via, data);//peer socket cua to

    } else if (!peer || !peer.pubd) {

        console.log('first send pubkey to ' + to);
        if (!this.queue[to])
            this.queue[to] = [];
        this.queue[to].push(data);

        for (var i=0; i<this.socketList.length; i++) { // todo: don't flood
            var socket = this.socketList[i];
            console.log('SymKey'+socket.symkey);
            this.sendPublicKey(to, socket);
        }
    }
}

Crypt.prototype.sendOnSocket = function(socket, data) {
    var datastr = JSON.stringify(data);
    if (!socket.symkey) {
        console.log('Client: no symkey for socket');
        return;
    }
    data.from = this.id;
    console.log('Client: encrypt and send ' + datastr);
    console.log('Client: sendOnSocket ' + socket.symkey);
    console.log('Client: sendOnSocket ' + socket.socketId);
    var cipherdata = sjcl.encrypt(socket.symkey, datastr);
    //socket.send(cipherdata);
    if (socket.send(cipherdata))
    {
        console.log('Client: Message sent');
    }
    else {
        console.log('Client: Message not sent');
    }
	
}

Crypt.prototype.salthash = function (password, salt) {
    //	console.log('salthash ' + typeof(salt));
    salt = salt || sjcl.random.randomWords(8);
    //	salt = salt ? sjcl.codec.hex.toBits(salt) : sjcl.random.randomWords(8);
    console.log('salthash: ' + typeof(password) + ', ' + typeof(salt) + ' -- ' + password +' and '+ salt);
    var	count = 2048;
    var hpw = sjcl.misc.pbkdf2(password, salt, count);
    return {
        hashed:hpw, 
        salt:salt
    };
}

function seedRNG() {
    sjcl.random.setDefaultParanoia(0);
    for (var i=0; i<1024; i++) {
        var r = Math.floor((Math.random()*100)+1);
        sjcl.random.addEntropy(r, 1);
    }
}

if (typeof module != 'undefined') {
    module.exports = Crypt;
}
