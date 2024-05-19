document.addEventListener('DOMContentLoaded', (event) => {
document.getElementById('order_submit').addEventListener('click', function(e) {
    e.preventDefault();
  
    var fromTime = document.getElementById('fromtime_input').value;
    var fromCity = document.getElementById('fromcity_input').value;
    var fromProvince = document.getElementById('fromprovince_input').value;
    var fromVillage = document.getElementById('fromvillage_input').value;
    var fromAddress = document.getElementById('fromaddress_input').value;
    var toCity = document.getElementById('tocity_input').value;
    var toProvince = document.getElementById('toprovince_input').value;
    var toVillage = document.getElementById('tovillage_input').value;
    var toAddress = document.getElementById('toaddress_input').value;
    var vehicleType = document.getElementById('sl1').value;
  
    var data = {
      fromTime: fromTime,
      fromCity: fromCity,
      fromProvince: fromProvince,
      fromVillage: fromVillage,
      fromAddress: fromAddress,
      toCity: toCity,
      toProvince: toProvince,
      toVillage: toVillage,
      toAddress: toAddress,
      vehicleType: vehicleType
    };
  
    fetch('/user/order/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Đơn hàng đã được gửi thành công!');
      window.location = "/"
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi gửi đơn hàng.');
    });
  });
});





const header= document.querySelector("header")
    window.addEventListener("scroll",function(){
        var x=this.window.scrollY
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
        window.location.href="/pageUser/pageUser.ejs"
      }







    
