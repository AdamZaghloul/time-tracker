document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token){
        window.location='/app';
    }
});

function logout() {
    localStorage.removeItem("token");
    window.location='/';
}