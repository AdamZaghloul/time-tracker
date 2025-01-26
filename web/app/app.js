document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token){
        window.location='/';
    }

    resetTrackForm();
});

document
  .getElementById("track-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitActivity();
  });

function logout() {
    localStorage.removeItem("token");
    window.location='/';
}

async function submitActivity() {
    const startArray = document.getElementById("start_time").value.split(":");
    let startTime = new Date(new Date().setHours(startArray[0], startArray[1], 0, 0));
    startTime = new Date(startTime.getTime() - (startTime.getTimezoneOffset() * 60000));

    const activity = document.getElementById("activity").value;
    const overrideDuration = document.getElementById("override_duration").value;
    
    let endTime = new Date();
    endTime = new Date(endTime.getTime() - (endTime.getTimezoneOffset() * 60000));
  
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ startTime, activity, overrideDuration, endTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Failed to create activity: ${data.error}`);
      }
      
      resetTrackForm(data.Activity);

      console.log("Activity logged!")
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  function resetTrackForm(activity){
    let date = new Date();
    let hour = date.getHours();
    let hourText = "";
    if(hour < 10){
        hourText = "0" + hour;
    }else{
        hourText = hour;
    }

    let min = date.getMinutes();
    let minText = "";
    if(min < 10){
        minText = "0" + min;
    }else{
        minText = min;
    }

    document.getElementById("start_time").value = `${hourText}:${minText}`;

    document.getElementById("activity").value = "";
    document.getElementById("override_duration").value = "";

    let message = document.getElementById("submit-message");

    if (activity){
        message.textContent = `Activity Logged: ${activity}`;
        setTimeout(() => {
            message.textContent = "";
        }, 5000);
    }else{
        message.textContent = "";
    }

    document.getElementById("activity").focus();
  }