const express= require('express')
const router=express.Router()
const path=require('path')
const con=require("../connection/sql")
const fs=require("fs")
var sql="SELECT * FROM `defaultevent`"
router.get('^/$|index',(req,res)=>{
    con.query(sql,(err,result)=>{
        const ev=JSON.stringify(result)
        fs.writeFile(path.join(__dirname,'..','data','eventsdata.json'),ev,(err)=>{
            if (!err) console.log("complete")
        })
        if(!err) res.sendFile(path.join(__dirname,"..","views","index.html"))
      })
})
        
router.get('/data/eventsdata.json',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','data','eventsdata.json'))
})
router.get('/common',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','common.js'))
})
router.get('/routes/calender',(req,res)=>{
    res.sendFile(path.join(__dirname,'calender.js'))
})
module.exports=router
