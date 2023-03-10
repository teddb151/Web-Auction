import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {io} from 'socket.io-client'

interface auction{
  name:string;
  isBidActive:boolean;
  auctionDescription:string;
  targetPrice:number;
}

interface Bid{
  name:string;
  value:number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Week11Lab';
  socket:any;
  itemName = '';
  userName= '';
  desc = '';
  isBidder = false;
  time = 0;
  pricePoint = 0;
  checker = true;
  bidAmount = 0;
  buyerName = '';

  localAuction:auction={
    name: '',              // name of the auction generator
    isBidActive: false,    // true if the auction is still active; false otherwise
    auctionDescription: '',// Describe the auction
    targetPrice: 0 // THe asked price for the auction
  } 

  localBid:Bid = {
    name: '',
    value: 0
  }

  bidsArray: Bid[] = [];

  bestBid:Bid = {
    name: '',
    value: 0
  }

  ngOnInit(){
    this.socket = io();
    this.listenToEvents();
  }

  listenToEvents() {
    this.socket.on("connection");
    this.socket.on('onAuctionUpdate', (data:auction)=>{
       this.localAuction=data;
    })
    this.socket.on("bidUpdate", (data:Bid)=>{
      this.localBid = data;
    })
    this.socket.on("createBidder", (check:boolean)=>{
      this.isBidder = check;
    })

    this.socket.on("onBid", (data:Bid)=>{
      this.localBid = data;
      this.bidsArray.push(this.localBid);
      if(this.localBid.value > this.bestBid.value){
        this.bestBid = this.localBid;
      }
    })

    this.socket.on("onAuction", (data:auction)=>{
      this.localAuction = data;
      this.bidsArray = [];
    })
  }

  startTimer(){
    let seconds = this.time * 1000;
    console.log(seconds);
    this.socket.emit("setTimer", seconds);
  }

  createNewAuction(){
   let userAuction:auction = {
    name: this.userName,
    isBidActive:true,
    auctionDescription: this.desc,
    targetPrice:this.pricePoint,
   }
   this.socket.emit("getAuction", userAuction);
  }

  sendBid(){
    let userBid:Bid = {
      name:this.userName,
      value: this.bidAmount
    }
    this.socket.emit("bid", userBid);
  }
}
