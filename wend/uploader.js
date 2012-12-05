/* 
 * Create new server for uploading file at port 5001
 * 
 */

var uploadPort = parseInt(process.env.PORT) || 5001;
//var uploadPort = 5001;

var io  = require('socket.io').listen(uploadPort),
dl  = require('delivery'),
fs  = require('fs');

io.sockets.on('connection', function(socket){
    var delivery = dl.listen(socket);
    delivery.on('receive.success',function(file){
        console.log("Receive file " + file.name + " " + file.uid);
        fs.writeFile('tmp/'+file.uid, file.buffer, function(err){
            if(err){
                console.log('File could not be saved.');
            }else{
                console.log('File saved.');
            };
        });
    });
});

