const express= require('express')
const router=express.Router()
const path=require('path')
const fs=require("fs")
const con=require("../conn/dbc")
var sql="create table abis( sno int auto_increment,  name varchar(255) not null,primary key(sno));"
router.get('^/([^/]+)$|index',(req,res)=>{
    console.log(req.url)
    res.sendFile(path.join(__dirname,'..','views','index.html'))
})
router.post('/generatelink',(req,res)=>{
    const calname=req.body.calname
    const url=`/${calname}`
    console.log(url)
    var sql="create table "+calname+"( sno int auto_increment,  date varchar(255) not null,event varchar(255) not null,primary key(sno));"
    var sql1="INSERT INTO `link`(`links`) VALUES ('"+calname+"')"
    con.query(sql, function (err, result){
        if (err) throw err
        console.log("table created");        
   })
   con.query(sql1, function (err, result){
    if (err) throw err
    console.log("added");        
})
    res.send("hi")
})        

module.exports=router
