const express= require('express')
const router=express.Router()
const path=require('path')
const con=require("../connection/sql")
const fs=require("fs")
const { default: parseJSON } = require('date-fns/parseJSON')
router.get('/addevents',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','addmore.html'))
})

router.post('/',(req,res)=>{
    const ev=JSON.stringify(req.body)
    const data=JSON.parse(ev)
    var size=data.d.length
      if (size>2){
      for (i=0;i<data.d.length;i++)
      {
      var date=data.d[i]
      var month=data.m[i]
      var year=data.y[i]
      var eve=data.eve[i]
      var msg=data.msg[i]
      var dd=`${date}-${month}-${year}`
      console.log(dd)
      var sql = "INSERT INTO `defaultevent`(`date`, `events`) VALUES ('"+dd+"','"+eve+"')";
      con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
  });
}}else{
    var date=data.d
    var month=data.m
    var year=data.y
    var eve=data.eve
    var msg=data.msg
    var dd=`${date}-${month}-${year}`
    console.log(dd)
    var sql = "INSERT INTO `defaultevent`(`date`, `events`) VALUES ('"+dd+"','"+eve+"')";;
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
});}
        fs.writeFile(path.join(__dirname,'..','data','addeventsdata.json'),ev,(err)=>{
            if (!err) console.log("complete")
        })

        res.redirect('/');
})

router.get('/common',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','common.js'))
})

module.exports=router
