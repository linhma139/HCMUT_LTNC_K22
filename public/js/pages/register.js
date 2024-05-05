// const name = document.querySelector('#name')
// const email = document.querySelector('#email')
// const phonenumber = document.querySelector('#phonenumber')
// const username = document.querySelector('#username')
// const password = document.querySelector('#password')
// const confirm = document.querySelector('#confirm')
// const form = document.querySelector('form')

// function showError (input, mes){
//     let parent= input.parentElement;
//     let small= parent.querySelector('small')

//     parent.classList.add('error')
//     small.innerText = mes;
// }

// function showSuccess (input, mes){
//     let parent= input.parentElement;
//     let small= parent.querySelector('small')

//     parent.classList.remove('error')
//     small.innerText =''
// }

// function checkEmptyError(listInput){
//     let isEmptyError =false;
//     listInput.forEach(input=>{
//         input.value= input.value.trim()
//         if(!input.value){
//             showError(input,'Cannot be left blank - Không được để trống')
//             isEmptyError=true;
//         }
//         else{
//             showSuccess(input)
//         }
//     });
//     return isEmptyError
// }

// let isEmptyError = checkEmptyError([ name, email, phonenumber, username, password, confirm])
// const name = document.getElementById('name')
// const email = document.getElementById('email')
// const phonenumber = document.getElementById('phonenumber')
// const username = document.getElementById('username')
// const password = document.getElementById('password')
// const confirm = document.getElementById('confirm')
// const form = document.getElementById('form')

if(submit.onclick)
function checkPassword(){
    
    let password = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;
    console.log(password,confirm);
    let message = document.getElementById("message");

    if(password != 0){
        if(password==confirm){
            message.textContent="Password Match";
            message.style.backgroundColor = "#35DB32";
        }
        else{
            message.textContent="Password Don't Match!!!";
            message.style.backgroundColor = "#DB3732";
        }
    }
    else{
       alert("Password can't be empty!!!");
        // message.style.backgroundColor = "#DB3732";
        message.textContent="";
    }
}



// form.addEventListener('submit', (e) => {
//     e.preventDefault()

    
// })

