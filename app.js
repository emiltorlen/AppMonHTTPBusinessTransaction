var fs = require('fs');
var express = require('express');
var app = express();
//var https = require("https");
var http = require("http")
var Buffer = require('buffer').Buffer
var protoBuf = require('protobufjs')
var fs = require('fs')




app.use(function (req, res, next) {
    console.log("Something is happening!")
    next();
});

app.use((req, res, next) => {
    if (!req.is('application/octet-stream')) return next()
    var data = [] // List of Buffer objects
    req.on('data', function (chunk) {
        data.push(chunk) // Append Buffer object
    })
    req.on('end', function () {
        if (data.length <= 0) return next()
        data = Buffer.concat(data) // Make one large Buffer of it
        // console.log('Received buffer', data)
        req.raw = data
        next()
    })
})


function decodeMessage(buffer, callback) {
    // console.log(protoBuf)
    protoBuf.load("message.proto", function (err, root) {
        if (err) {
            console.error(err);
            return callback(null)
        }
        var element = root.lookupType("export.bt.BusinessTransactions")
        var message = element.decode(buffer);
        var jsonMessage = JSON.stringify(message)
        fs.appendFile("result.txt",jsonMessage,(err)=>{
            if(err){
                callback(err)
            }else{
                callback(null)
            }
        })
    });
}

app.post("/post/", function (req, res) {
    // console.log(req.body)
    if (req.raw) {
        try {
            decodeMessage(req.raw, () => {})
            // console.log(req.raw)
            // var reader = ProtoBuf.Reader.create(req.raw);
            // while (reader.pos < reader.len) {
            //   var frame = DevicesFrame.decodeDelimited(reader);
            //   console.log(frame)
            // }
            // Decode the Message
            // var msg = Message.decode(req.raw)
            // console.log('Received "%s" in %s', msg.text, msg.lang)
        } catch (err) {
            console.log('Processing failed:', err)
            res.sendStatus(200)
        }
    } else {
        console.log("Not binary data")
    }
    res.sendStatus(200)
    // console.log(req.)
})

app.post("/testpost", (req, res) => {
    res.sendStatus(200)
})

app.get("/", (req, res) => {
    res.send("This is working")
})

app.listen(3000, function () {
    console.log('app listening on port 3000!')
})