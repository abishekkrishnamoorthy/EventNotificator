const schedule= require('node-schedule')
const transporter=require('../connection/mail')
const { format } = require('date-fns');
const con=require("../connection/sql")
var year=`${format(new Date(), 'yyyy')}`
var month=`${format(new Date(), 'M')}`
var day=`${format(new Date(), 'd')}`
var curtime="22:10:00"
var scheduletime=`${year}-${month}-${day}\t${curtime}`
var curdate=`${day}-${month}-${year}`
console.log(curtime)
var sql="SELECT * FROM `defaultevent`"
const email=schedule.scheduleJob(scheduletime,()=>{
    con.query(sql,(err,result)=>{
        const ev=JSON.stringify(result)
        const date=JSON.parse(ev)
        var mail="false"
        var no=0
        for (var i=0; i < date.length; i++){
              if(curdate==date[i].date){
                 mail="true"
                 no=i
                 break
            }
        }
        console.log(mail)
        console.log(no)
        if(mail=="true"){
        var message = {
            from: "abi.heaventreecko@gmail.com",
            to: "abishekkrishnamoorthy04@gmail.com",
            subject: "id",
            text: `${date[no].events} hello`
        }; 
        transporter.sendMail(message,(err, info) => {
                console.log(info.envelope);
                console.log(info.messageId);
                if (!err) res.sendFile(path.join(__dirname,'..','views','index.html'))
                else res.send("error")
        })
         }
        else{
          console.log("no")    
        }
      })
})

module.exports=email