const mysql = require('mysql');
const express= require('express')
const router=express.Router()
const path=require('path')
const fs=require('fs')
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"createcal"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports=con