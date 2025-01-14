document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (token){
        window.location='/signup';
    }
});

document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        await login();
    });

async function login(){

}