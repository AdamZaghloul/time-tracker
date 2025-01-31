let editableRow = null;
let editableCell = null;

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token){
        window.location='/';
    }

    const startTime = localStorage.getItem("start_time");
    const activity = localStorage.getItem("activity");
    const overrideDuration = localStorage.getItem("override_duration");

    if(!startTime || (startTime && !activity && !overrideDuration)){
        resetTrackForm();
    }else{
        document.getElementById("start_time").value = startTime;
        document.getElementById("activity").value = activity;
        document.getElementById("override_duration").value = overrideDuration;
    }
});

document
  .getElementById("track-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitActivity();
  });

document.addEventListener("click",function(event){
    if(editableCell && editableCell != event.target && editableCell != event.target.parentNode){
        makeCellUneditable(editableCell);
        editableCell = null;
        return;
    }
});

function logout() {
    localStorage.removeItem("token");
    window.location='/';
}

async function submitActivity() {
    const startArray = document.getElementById("start_time").value.split(":");
    let startTime = new Date(new Date().setHours(startArray[0], startArray[1], 0, 0));

    const activity = document.getElementById("activity").value;
    const overrideDuration = document.getElementById("override_duration").value;
    
    let endTime = new Date();
    if(overrideDuration){
        endTime = new Date(startTime.getTime() + (overrideDuration * 60000));
    }

    startTime = new Date(startTime.getTime() - (startTime.getTimezoneOffset() * 60000));
    endTime = new Date(endTime.getTime() - (endTime.getTimezoneOffset() * 60000));
  
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ startTime, activity, endTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Failed to create activity: ${data.error}`);
      }
      
      resetTrackForm(data.Activity, endTime);

      console.log("Activity logged!")
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

function resetTrackForm(activity, endTime){
    localStorage.removeItem("start_time");
    localStorage.removeItem("activity");
    localStorage.removeItem("override_duration");

    let date = new Date();
    if(endTime){
        date = new Date(endTime)
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }

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

function storeProgress(key){
    localStorage.setItem("start_time", document.getElementById("start_time").value);
    localStorage.setItem(key, document.getElementById(key).value);
}

function navTrack(){
    document.getElementById("track-section").style.display = "block";
    document.getElementById("log-section").style.display = "none";

    document.getElementById("track-link").classList.add("selected");
    document.getElementById("log-link").classList.remove("selected");
   
}

async function navLog(){
    document.getElementById("track-section").style.display = "none";
    document.getElementById("log-section").style.display = "block";

    document.getElementById("track-link").classList.remove("selected");
    document.getElementById("log-link").classList.add("selected");

    refreshLog();
}

async function refreshLog(){
    var data;

    try {
        const res = await fetch("/api/activities", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(`Failed to get activities: ${data.error}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
      
      const table = document.getElementById("logTableBody");

      for (const activity of data){
        let row = table.insertRow();

        let date = row.insertCell(0);
        date.innerHTML = activity.Date.split('T')[0];
        date.classList.add("edit");

        let activityRow = row.insertCell(1);
        activityRow.innerHTML = activity.Activity;
        activityRow.classList.add("edit");

        let duration = row.insertCell(2);
        duration.innerHTML = activity.Duration;

        let startTime = row.insertCell(3);
        startTime.innerHTML = activity.StartTime.split('T')[1].split('Z')[0];
        startTime.classList.add("edit");

        let endTime = row.insertCell(4);
        endTime.innerHTML = activity.EndTime.split('T')[1].split('Z')[0].split('.')[0];
        endTime.classList.add("edit");
      }

      enableEdit();
}

async function enableEdit(){
    let editableCells = document.querySelectorAll(".edit");

    editableCells.forEach(function(cell){
        cell.addEventListener("click",function(){
            if(editableCell) {
                if(cell != editableCell){
                    makeCellUneditable(editableCell);
                }
            }else{
            
                var input = document.createElement('input');
                input.setAttribute('type','text');
                input.setAttribute('id','input-edit');
                input.value = cell.innerHTML;
                //input.style.width = cell.offsetWidth - (cell.clientLeft * 2) + "px";
                //input.style.height = cell.offsetHeight - (cell.clientTop * 2) + "px";
                
                cell.innerHTML = '';
                cell.append(input);
                cell.firstElementChild.select();
                
                editableCell = cell;

                input.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                      makeCellUneditable(editableCell);
                    }
                });
            }
        });
      });
}

function makeCellUneditable(cell) {
    input = document.getElementById("input-edit");
    cell.innerHTML = input.value;
    input.remove();

    editableCell = null;
}