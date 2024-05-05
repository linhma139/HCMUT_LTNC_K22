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


    const imgPosition = document.querySelectorAll(".aspect-ratio-169 img")
    const imgContainer = document.querySelector('.aspect-ratio-169')
    const dotItem = document.querySelectorAll(".dot")
    let index=0
    let number=imgPosition.length
    imgPosition.forEach(function(image,index){
        image.style.left = index*100 + "%"
        dotItem[index].addEventListener("click", function(){
        slider(index)
        })
    })

    function imgSlide(){
        index++;
        if(index>=number){index=0}
        slider(index)
    }
    function slider(index){
        imgContainer.style.left= "-" + index*100 + "%"
        const dotActive = document.querySelector('.active')
        dotActive.classList.remove("active")
        dotItem[index].classList.add("active")
    }
    setInterval(imgSlide,3000)


    function logo() {
        window.location.href="/pageDriver/pageDriver.ejs"
      }












