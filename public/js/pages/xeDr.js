const header= document.querySelector("header")
    window.addEventListener("scroll",function(){
        x=this.window.scrollY
        if(x>0){
            header.classList.add("hiddenb")
        }
        else{
            header.classList.remove("hiddenb")
        }
    })


    // ___________________________________________________________ //


const bigImg = document.querySelector(".xeItem-content-left-Big img")
const smallImg = document.querySelectorAll(".xeItem-content-left-Small img")

smallImg.forEach(function(imgItem,x){
    imgItem.addEventListener("click", function(){
        bigImg.src = imgItem.src
    })
})


function logo() {
    window.location.href="/pageDriver/pageDriver.ejs"
  }






















