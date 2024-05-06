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
        window.location.href="/"
    }





    const ctx = document.getElementById('lineChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fre', 'Mar', 'Apr', 'May', 'Jun','Aug','Sep', 'Oct','Nov','Dec'],
          datasets: [{
            label: 'Sales in $',
            data: [3050,2070,4060,5090,3060,4020,2780,3970,4050,2005,4030,5500],
            backgroundColor:[
                    'rgba(85,85,85,1)'
            ],
            borderColor: [
                'rgba(41,155,99)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true
        }
      });
    
      