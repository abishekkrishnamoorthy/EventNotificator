const express=require("express")
const app=express()
const path=require("path")
const email=require("./notification/email")
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join('./public')))
app.use(express.static(path.join('./routes')))
app.use(express.static(path.join('./data')))
app.use('/',require('./routes/calender'))
app.use('/',require('./routes/addevents'))
app.listen('3500',console.log("running"))