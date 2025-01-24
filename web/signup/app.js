document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (token){
        window.location='/app';
    }
});

document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await signup();
  });

async function signup(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try{
        const res = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password}),
        })
        
        if (!res.ok){
            const data = await res.json();
            throw new Error(`Failed to create user: ${data.error}`);
        }

        console.log("User created!");
        await login(email, password);
    }catch (error){
        alert(`Error: ${error.message}`)
    }
}

function check_pass() {
    if (document.getElementById('password').value == document.getElementById('confirm-password').value) {
        document.getElementById('submit').disabled = false;
    } else {
        document.getElementById('submit').disabled = true;
    }
}