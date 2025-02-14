let editableRow = null;
let editableCell = null;
let categoryNames = [];
let categoryValues = [];
let categoryTerms = [];
let projectNames = [];
let projectValues = [];
let projectTerms = [];

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
    if(editableCell && editableCell != event.target && editableCell != event.target.parentNode && event.target.getAttribute("type") != "button"){  
      makeCellUneditable(editableCell);
      editableCell = null;
      return;
    }
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("start_time");
    localStorage.removeItem("activity");
    localStorage.removeItem("override_duration");
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

function navRemove(){
    document.getElementById("track-section").style.display = "none";
    document.getElementById("log-section").style.display = "none";
    //document.getElementById("report-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";

    document.getElementById("track-link").classList.remove("selected");
    document.getElementById("log-link").classList.remove("selected");
    //document.getElementById("report-link").classList.remove("selected");
    document.getElementById("settings-link").classList.remove("selected");
}

function nav(page){

    navRemove();

    let section = page + "-section";
    let link = page + "-link"
    
    document.getElementById(section).style.display = "block";
    document.getElementById(link).classList.add("selected");

    if(page == 'log'){
        refreshLog();
    }else if(page == 'settings'){
      refreshSettings();
    }
   
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
      table.innerHTML = '';

      for (const activity of data){
        let row = table.insertRow();
        row.setAttribute('id', activity.ID);

        updateLogRow(row, activity);
      }

      loadDropdowns();
}

function enableCellEdit(cell){
    cell.addEventListener("click",function(){
        if(editableCell) {
            if(cell != editableCell){
                makeCellUneditable(editableCell);
            }
        }else{
        
            var input;
            var type = cell.getAttribute('type');

            if(type == 'select'){
                input = document.createElement('select');
                subType = cell.getAttribute('select-type');
                var nameArray = [];
                var valueArray = [];

                if(subType == 'category'){
                    nameArray = categoryNames;
                    valueArray = categoryValues
                }else if(subType == 'project'){
                    nameArray = projectNames;
                    valueArray = projectValues;
                }else{
                    alert("Invalid select type.");
                    return;
                }

                var option = document.createElement("option");
                option.value = "00000000-0000-0000-0000-000000000000";
                option.text = "";
                input.appendChild(option);

                for (var i = 0; i < nameArray.length; i++) {
                    var option = document.createElement("option");
                    option.value = valueArray[i];
                    option.text = nameArray[i];
                    if(option.value == cell.getAttribute("id")){
                      option.selected = true;
                    }

                    input.appendChild(option);
                }
            }else{
            
                input = document.createElement('input');
            }
    
            input.setAttribute('type', type);
            input.setAttribute('id','input-edit');
            if (type != 'select'){
              input.value = cell.innerHTML;
            }
            //input.style.width = cell.offsetWidth - (cell.clientLeft * 2) + "px";
            //input.style.height = cell.offsetHeight - (cell.clientTop * 2) + "px";
            
            cell.innerHTML = '';
            cell.append(input);
            type != 'select' ? cell.firstElementChild.select(): document.getElementById('input-edit').focus();
            
            editableCell = cell;

            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                  makeCellUneditable(editableCell);
                }
            });
        }
    });
}

async function makeCellUneditable(cell) {
    input = document.getElementById("input-edit");
    table = cell.parentNode.parentNode.id;
    val = input.value;
    let startTime = null;
    let endTime = null;
    let activity = null;
    let category = null;
    let project = null;
    let categoryProjectName = null;
    let categoryProjectTerms = null;
    let data = null;
    let endpoint = null;
    let jsonBody = null;
    let apiMethod = null;
    let id = cell.parentNode.getAttribute("id");

    if(cell.getAttribute('type') == 'date'){
        var dateArray = val.split("-");
        var year = dateArray[0];
        var month = parseInt(dateArray[1], 10) - 1;
        var date = dateArray[2];
        var baseDate = new Date(year, month, date);

        const startArray = cell.parentNode.querySelector('[time-type="start"]').innerHTML.split(":");
        startTime = new Date(new Date(baseDate.getTime()).setHours(startArray[0], startArray[1], 0, 0));

        const endArray = cell.parentNode.querySelector('[time-type="end"]').innerHTML.split(":");
        endTime = new Date(new Date(baseDate.getTime()).setHours(endArray[0], endArray[1], 0, 0));

        startTime = new Date(startTime.getTime() - (startTime.getTimezoneOffset() * 60000));
        endTime = new Date(endTime.getTime() - (endTime.getTimezoneOffset() * 60000));

    }else if(cell.getAttribute('type') == 'text'){
      if(table == "logTableBody"){  
        activity = val;
      }else if (table == "categoryTableBody" || table == "projectTableBody"){
        if (cell.cellIndex == 0){
          categoryProjectName = val; 
        }else if (cell.cellIndex == 1){
          categoryProjectTerms = val;
        }else{
          alert("Invalid cell index.");
          return;
        }
      }
    }else if (cell.getAttribute('type') == 'time'){
        var dateArray = cell.parentNode.querySelector('[type="date"]').innerHTML.split("-");
        var year = dateArray[0];
        var month = parseInt(dateArray[1], 10) - 1;
        var date = dateArray[2];
        var baseDate = new Date(year, month, date);

        const newTimeArray = val.split(":");
        let newTime = new Date(new Date(baseDate.getTime()).setHours(newTimeArray[0], newTimeArray[1], 0, 0));

        if(cell.getAttribute('time-type') == 'start'){
            startTime = new Date(newTime.getTime() - (newTime.getTimezoneOffset() * 60000));
        }else if (cell.getAttribute('time-type') == 'end'){
            endTime = new Date(newTime.getTime() - (newTime.getTimezoneOffset() * 60000));
        }else{
            alert("Invalid time cell being updated.");
            return;
        }
    }else if (cell.getAttribute('type') == 'select'){
        dropdown = document.getElementById('input-edit');

        if(cell.getAttribute('select-type') == 'category'){
            category = dropdown.options[dropdown.selectedIndex].value;
        }else if(cell.getAttribute('select-type') == 'project'){
            project = dropdown.options[dropdown.selectedIndex].value;
        }else{
            alert("Invald select type.")
        }
    }else{
        alert("Invalid cell being updated.");
        return;
    }

    if(table == "logTableBody"){
      apiMethod = "PUT";
      endpoint = "/api/activities";
      jsonBody = JSON.stringify({ id, startTime, activity, endTime, category, project });
    }else if(table == "categoryTableBody" || table == "projectTableBody"){
      if(id == ""){
        jsonBody = JSON.stringify({ categoryProjectName });
        apiMethod = "POST";
        if(categoryProjectName == ""){
          cell.parentNode.remove();
          editableCell = null;
          return;
        }
      }else{
        jsonBody = JSON.stringify({ id, categoryProjectName, categoryProjectTerms });
        apiMethod = "PUT";
      }
      if(table == "categoryTableBody"){
        endpoint = "/api/categories";
      }else{
        endpoint = "/api/projects";
      }
    }
    
    try {
        const res = await fetch(endpoint, {
            method: apiMethod,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: jsonBody,
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(`Failed to update ${table}: ${data.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
        input.remove();
        editableCell = null;
          
        return;
    }
    
    row = cell.parentNode;
    row.innerHTML = null;
    input.remove();
    if(table == "logTableBody"){
      updateLogRow(row, data);
    }else if(table == "categoryTableBody"){
      if (id == ""){
        categoryValues.push(data.ID);
        categoryNames.push(data.Category);
        categoryTerms.push(data.AutofillTerms);
        row.setAttribute("id", data.ID);

        updateCategoryRow(row, categoryValues.length - 1);
      }else{
        i = row.rowIndex;
        categoryValues[i] = data.ID;
        categoryNames[i] = data.Category;
        categoryTerms[i] = data.AutofillTerms;

        updateCategoryRow(row, i);
      }
    }else if(table == "projectTableBody"){
      if(id == ""){
        projectValues.push(data.ID);
        projectNames.push(data.Project);
        projectTerms.push(data.AutofillTerms);
        row.setAttribute("id", data.ID);
        
        updateProjectRow(row, projectValues.length - 1);
      }else{
        i = row.rowIndex;
        projectValues[i] = data.ID;
        projectNames[i] = data.Project;
        projectTerms[i] = data.AutofillTerms;

        updateProjectRow(row, i);
      }
    }

    editableCell = null;
}

function updateCategoryRow(row, i){
  let categoryRow = row.insertCell(0);
  categoryRow.innerHTML = categoryNames[i];
  categoryRow.classList.add("edit");
  categoryRow.setAttribute('type', 'text');
  enableCellEdit(categoryRow);

  let termsRow = row.insertCell(1);
  termsRow.innerHTML = categoryTerms[i];
  termsRow.classList.add("edit");
  termsRow.setAttribute('type', 'text');
  enableCellEdit(termsRow);

  let deleteRow = row.insertCell(2);
  button = document.createElement('button');
  button.innerHTML = `<i class="fa fa-trash-o"></i>`;
  button.classList.add("delete");
  button.addEventListener("click", function(){
    deleteObject("category", row)
  });
  deleteRow.append(button);
}

function updateProjectRow(row, i){
  let projectRow = row.insertCell(0);
  projectRow.innerHTML = projectNames[i];
  projectRow.classList.add("edit");
  projectRow.setAttribute('type', 'text');
  enableCellEdit(projectRow);

  let termsRow = row.insertCell(1);
  termsRow.innerHTML = projectTerms[i];
  termsRow.classList.add("edit");
  termsRow.setAttribute('type', 'text');
  enableCellEdit(termsRow);

  let deleteRow = row.insertCell(2);
  button = document.createElement('button');
  button.innerHTML = `<i class="fa fa-trash-o"></i>`;
  button.classList.add("delete");
  button.addEventListener("click", function(){
    deleteObject("project", row)
  });
  deleteRow.append(button);
}

async function deleteObject(type, row) {
  let endpoint = null;
  let message = null;
  id = row.getAttribute("id");

  if(type == "category"){
    endpoint = "/api/categories";
    message = `Any activities associated with this ${type} will become unassigned. Are you sure you want to delete?`;
  }else if(type == "project"){
    endpoint = "/api/projects";
    message = `Any activities associated with this ${type} will become unassigned. Are you sure you want to delete?`;
  }else if(type == "activity"){
    endpoint = "/api/activities";
    message = "Are you sure you want to delete?"
  }else{
    alert("Error: invalid type.")
    return;
  }

  if(!confirm(message)){
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id }),
    });
    data = await res.json();
    if (!res.ok) {
      throw new Error(`Failed to delete ${type}: ${data.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
    return;
  }

  row.remove();

  if(type == "category" || type == "project"){
    loadDropdowns();
  }
}

function updateLogRow(row, activity){
    let date = row.insertCell(0);
    date.innerHTML = activity.Date.split('T')[0];
    date.classList.add("edit");
    date.setAttribute('type', 'date');
    enableCellEdit(date);

    let activityRow = row.insertCell(1);
    activityRow.innerHTML = activity.Activity;
    activityRow.classList.add("edit");
    activityRow.setAttribute('type', 'text');
    enableCellEdit(activityRow);

    let duration = row.insertCell(2);
    duration.innerHTML = activity.Duration;

    let startTime = row.insertCell(3);
    startTime.innerHTML = activity.StartTime.split('T')[1].split('Z')[0];
    startTime.classList.add("edit");
    startTime.setAttribute('type', 'time');
    startTime.setAttribute('time-type', 'start');
    enableCellEdit(startTime);

    let endTime = row.insertCell(4);
    endTime.innerHTML = activity.EndTime.split('T')[1].split('Z')[0].split('.')[0];
    endTime.classList.add("edit");
    endTime.setAttribute('type', 'time');
    endTime.setAttribute('time-type', 'end');
    enableCellEdit(endTime);

    let category = row.insertCell(5);
    category.innerHTML = activity.Category.String;
    category.classList.add("edit");
    category.setAttribute('type', 'select');
    category.setAttribute('select-type', 'category');
    category.setAttribute("id", activity.CategoryID)
    enableCellEdit(category);

    let project = row.insertCell(6);
    project.innerHTML = activity.Project.String;
    project.classList.add("edit");
    project.setAttribute('type', 'select');
    project.setAttribute('select-type', 'project');
    project.setAttribute("id", activity.ProjectID)
    enableCellEdit(project);

    let deleteRow = row.insertCell(7);
    button = document.createElement('button');
    button.innerHTML = `<i class="fa fa-trash-o"></i>`;
    button.classList.add("delete");
    button.addEventListener("click", function(){
      deleteObject("activity", row)
    });
    deleteRow.append(button);
}

async function loadDropdowns(){
    var data;
    projectNames = [];
    projectTerms = [];
    projectValues = [];
    categoryNames = [];
    categoryTerms = [];
    categoryValues = [];

    try {
        const res = await fetch("/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(`Failed to get categories: ${data.error}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }

      if (data == null){
        categoryNames.push("Add categories in Settings");
        categoryValues.push("00000000-0000-0000-0000-000000000000");
        categoryTerms.push("");
      }else{
        for (const category of data){
            categoryNames.push(category.Category);
            categoryValues.push(category.ID);
            categoryTerms.push(category.AutofillTerms);
          }
      }

      try {
        const res = await fetch("/api/projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(`Failed to get projects: ${data.error}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }

      if (data == null){
        projectNames.push("Add projects in Settings");
        projectValues.push("00000000-0000-0000-0000-000000000000");
        projectTerms.push("");
      }else{
        for (const project of data){
            projectNames.push(project.Project);
            projectValues.push(project.ID);
            projectTerms.push(project.AutofillTerms);
          }
      }
}

async function addCategoryProject(type){
  const table = document.getElementById(type + "TableBody");
  let row = table.insertRow(table.rows.length - 1);
  row.setAttribute('id', "");

  let nameCell = row.insertCell(0);
  nameCell.classList.add("edit");
  nameCell.setAttribute('type', 'text');
  enableCellEdit(nameCell);

  let termsCell = row.insertCell(1);
  termsCell.classList.add("edit");
  termsCell.setAttribute('type', 'text');
  enableCellEdit(termsCell);

  nameCell.click();
}

async function refreshSettings(){
  
  await loadDropdowns();

  const categoryTable = document.getElementById("categoryTableBody");
  for (var i = 0; i < categoryTable.rows.length-1; i++){
    categoryTable.deleteRow(i);
  }

  for (var i = 0; i < categoryNames.length; i++){
    if (categoryValues[i] != "00000000-0000-0000-0000-000000000000"){
      let row = categoryTable.insertRow(categoryTable.rows.length - 1);
      row.setAttribute('id', categoryValues[i]);

      updateCategoryRow(row, i);
    }
  }

  const projectTable = document.getElementById("projectTableBody");
  for (var i = 0; i < projectTable.rows.length-1; i++){
    projectTable.deleteRow(i);
  }

  for (var i = 0; i < projectNames.length; i++){
    if (projectValues[i] != "00000000-0000-0000-0000-000000000000"){
      let row = projectTable.insertRow(projectTable.rows.length - 1);
      row.setAttribute('id', projectValues[i]);

      updateProjectRow(row, i);
    }
  }
}