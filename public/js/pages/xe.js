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

/*................................................................................. */
const itemslidebar = document.querySelectorAll(".xe-left-li")
itemslidebar.forEach(function(menu,index){
    menu.addEventListener("click",function(){
        menu.classList.toggle("block")
    })
})
function logo() {
    window.location.href="/"
  }