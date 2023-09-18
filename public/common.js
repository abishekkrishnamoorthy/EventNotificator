const calender=document.querySelector("#calender")
let nav=0
const monthname=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthtitle=document.querySelector("#month")

const loadcalender=async()=>{
   const dt =new Date()
   if(nav!=0){
      dt.setMonth(new Date().getMonth()+nav)
   }
   const day=dt.getDate()
   const month= dt.getMonth()
   const year=dt.getFullYear()

   monthtitle.innerHTML=`${monthname[month]}\t${year} `
   
   calender.innerHTML=""
   const dayinmonth=new Date(year,month+1,0).getDate()
   const dayinweek=new Date(year,month,1)
   const daytext=dayinweek.toLocaleDateString("en-us",{
      weekday:"long",
      year:"numeric",
      month:"numeric",
      day:"numeric",
   })
   var emptydays=dayinweek.getDay()
   for (let j=1;j<=emptydays;j++) {
      const emptydaybox =document.createElement("div")
      emptydaybox.classList.add("emptydays")
      calender.append(emptydaybox)
   }
   for (let i=1; i<=dayinmonth;i++){
      const daybox =document.createElement("div")
      daybox.classList.add("day")
      var datetext=`${i}-${month+1}-${year}`
      if(i===day && nav==0) {
         daybox.id="curdate"
      }
      daybox.innerHTML=i;
      calender.append(daybox)
      await fetch("/data/eventsdata.json")
      .then((res) => {
      return res.json();
      })
        .then((data) =>{
            for (var i=0; i < data.length; i++) {
            if(data[i].date==datetext){
            const eventdiv=document.createElement("div")
            eventdiv.classList.add("event")
            eventdiv.innerHTML=data[i].events
            daybox.appendChild(eventdiv)
        }
      }
   });  
}

}
 const btnevent=()=>{
 const btnback=document.querySelector("#btnback")
 const btnnext=document.querySelector("#btnnext")
 btnback.addEventListener("click",()=>{
   nav--;
   loadcalender();
 })
 btnnext.addEventListener("click",()=>{
   nav++;
   loadcalender();
 })
}

const modal=document.querySelector("#modal")
const showmodal=()=>{
   modal.style.display="block"
}
const dataj=""
export {loadcalender , btnevent}