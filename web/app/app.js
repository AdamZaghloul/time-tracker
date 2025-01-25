document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token){
        window.location='/';
    }
});

function logout() {
    localStorage.removeItem("token");
    window.location='/';
}