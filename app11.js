const express =require('express');
const app=express();
const path=require('path');
const server=require('http').Server(app);
const io=require('socket.io')(server);

server.listen(8080);

let bid = {
    name: '',
    value: 0
    };

let auction={
    name: '',              // name of the auction generator
    isBidActive: false,    // true if the auction is still active; false otherwise
    auctionDescription: "",// Describe the auction
    targetPrice: 0         // THe asked price for the auction
};

app.use(express.static(path.join(__dirname,"dist/week11-lab")));

io.on('connection',(socket)=>{// socket is a ref to the new client

    console.log("New connection made from ID" + socket.id);
    console.log(socket);
    socket.emit("auctionUpdate", auction);
    socket.emit("bidUpdate", bid);

    socket.on('getAuction', (obj)=>{
        console.log("auction recieved from ID" + socket.id);
        auction = obj;
        socket.emit('createBidder', true);
        auction.isBidActive = true;
        io.emit('onAuction', auction);
    })

    socket.on("bid", data =>{
        console.log("bid recieved from ID " + socket.id);
        if (data.value > bid.value ){
            bid = data;
            io.emit("onBid", bid);
        }
        if(data.value >= auction.targetPrice){
            auction.isBidActive = false;
            io.emit("onAuction", auction)
        }
    })
    socket.on("setTimer", time =>{
        setTimeout(finishFunc, time);
    })

});

function finishFunc(){
    auction.isBidActive = false;
    io.emit("onAuction", auction)
    time = 0;
}

// server.listen(port, () => {
//     console.log("Listening on port " + port);
// });