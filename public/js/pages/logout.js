window.addEventListener("load", () => {
    document.getElementById("logout_submit").addEventListener("click", () => {
        logout()
    })
})
    

export async function logout() {

    const result = await fetch('/auth/logout', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST"
    })

    const data = await result.json();
    console.log(data)
    if (data.status === 200) {
        alert(data.message);
        window.location = "/"
    } else {
        alert(data.message)
    }
}