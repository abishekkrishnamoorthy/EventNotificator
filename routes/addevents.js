const express= require('express')
const router=express.Router()
const path=require('path')
const con=require("../connection/sql")
const fs=require("fs")
var sql="SELECT * FROM `defaultevent`"
        
router.get('/addevents',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','addmore.html'))
})
router.get('/common',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','common.js'))
})
router.get('/routes/calender',(req,res)=>{
    res.sendFile(path.join(__dirname,'calender.js'))
})
module.exports=router
