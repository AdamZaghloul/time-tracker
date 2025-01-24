document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (token){
        window.location='/app';
    }
});

document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        await login(email, password);
    });

async function login(email, password){
    try{
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password}),

        });

        const data = await res.json();
        if(!res.ok){
            throw new Error(`Failed to login: ${data.error}`);
        }

        if(data.token){
            localStorage.setItem("token", data.token);
            window.location='/app';
        }else{
            alert("Login failed. Please check your credentials.");
        }
    } catch(error){
        alert(`Error: ${error.message}`);
    }
}