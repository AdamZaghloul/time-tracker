let editableRow = null;
let editableCell = null;
let categoryNames = [];
let categoryValues = [];
let categoryTerms = [];
let projectNames = [];
let projectValues = [];
let projectTerms = [];
let firstButtons = {};

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token){
        window.location='/';
    }

    var url = document.location.href;
    var urlSections = url.split("#");
    var page = urlSections[1];

    nav(page);

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
        const err = new Error(`Failed to create activity: ${data.error}`);
        err.code = res.status;
        throw err;
      }
      
      resetTrackForm(data.Activity, endTime);

      console.log("Activity logged!")
    } catch (error) {
      if(error.code == '401'){
        alert(error.code);
        logout();
      }else{
        alert(`Error: ${error.message}`);
      }
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
    document.getElementById("report-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";

    document.getElementById("track-link").classList.remove("selected");
    document.getElementById("log-link").classList.remove("selected");
    document.getElementById("report-link").classList.remove("selected");
    document.getElementById("settings-link").classList.remove("selected");
}

function nav(page){

    document.location.href = "#" + page;

    let section = page + "-section";
    let link = page + "-link"

    if(!document.getElementById(section)){
      return;
    }

    if(!document.getElementById(link)){
      return;
    }

    navRemove();
    
    document.getElementById(section).style.display = "block";
    document.getElementById(link).classList.add("selected");

    if(page == 'log'){
      refreshLog();
    }else if(page == 'settings'){
      refreshSettings();
    }else if(page == 'report'){
      refreshReport();
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
          const err = new Error(`Failed to get activities: ${data.error}`);
          err.code = res.status;
          throw err;
        }
      } catch (error) {
        if(error.code == '401'){
          alert(error.code);
          logout();
        }else{
          alert(`Error: ${error.message}`);
        }
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

    if(table == "logTableBody"){
      category = document.getElementsByClassName("category-" + id)[0].getAttribute("id");
      if(category == "null"){
        category = null;
      }

      project = document.getElementsByClassName("project-" + id)[0].getAttribute("id");
      if(project == "null"){
        project = null;
      }
    }

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
          const err = new Error(`Failed to update ${table}: ${data.error}`);
          err.code = res.status;
          throw err;
        }
    } catch (error) {
      if(error.code == '401'){
        alert(error.code);
        logout();
      }else{
        alert(`Error: ${error.message}`);
        input.remove();
        editableCell = null;
          
        return;
      }
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
  button.classList.add("subtle");
  button.addEventListener("click", function(){
    deleteObject("category", row);
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
  button.classList.add("subtle");
  button.addEventListener("click", function(){
    deleteObject("project", row);
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
      const err = new Error(`Failed to delete ${type}: ${data.error}`);
      err.code = res.status;
      throw err;
    }
  } catch (error) {
    if(error.code == '401'){
      alert(error.code);
      logout();
    }else{
      alert(`Error: ${error.message}`);
      return;
    }
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
    startTime.innerHTML = activity.StartTime.split('T')[1].split('Z')[0].split(':').slice(0,-1).join(':');
    startTime.classList.add("edit");
    startTime.setAttribute('type', 'time');
    startTime.setAttribute('time-type', 'start');
    enableCellEdit(startTime);

    let endTime = row.insertCell(4);
    endTime.innerHTML = activity.EndTime.split('T')[1].split('Z')[0].split('.')[0].split(':').slice(0,-1).join(':');
    endTime.classList.add("edit");
    endTime.setAttribute('type', 'time');
    endTime.setAttribute('time-type', 'end');
    enableCellEdit(endTime);

    let category = row.insertCell(5);
    category.innerHTML = activity.Category.String;
    category.classList.add("edit");
    category.classList.add("category-" + activity.ID);
    category.setAttribute('type', 'select');
    category.setAttribute('select-type', 'category');
    category.setAttribute("id", activity.CategoryID)
    enableCellEdit(category);

    let project = row.insertCell(6);
    project.innerHTML = activity.Project.String;
    project.classList.add("edit");
    project.classList.add("project-" + activity.ID);
    project.setAttribute('type', 'select');
    project.setAttribute('select-type', 'project');
    project.setAttribute("id", activity.ProjectID)
    enableCellEdit(project);

    let deleteRow = row.insertCell(7);
    button = document.createElement('button');
    button.innerHTML = `<i class="fa fa-trash-o"></i>`;
    button.classList.add("subtle");
    button.addEventListener("click", function(){
      deleteObject("activity", row);
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
          const err = new Error(`Failed to get categories: ${data.error}`);
          err.code = res.status;
          throw err;
        }
      } catch (error) {
        if(error.code == '401'){
          alert(error.code);
          logout();
        }else{
          alert(`Error: ${error.message}`);
        }
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
          const err = new Error(`Failed to get projects: ${data.error}`);
          err.code = res.status;
          throw err;
        }
      } catch (error) {
        if(error.code == '401'){
          alert(error.code);
          logout();
        }else{
          alert(`Error: ${error.message}`);
        }
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
  const projectTable = document.getElementById("projectTableBody");

  for (i = 0; i < categoryTable.rows.length-1; i++){
    categoryTable.deleteRow(i);
    i--;
  }

  for (var i = 0; i < categoryNames.length; i++){
    if (categoryValues[i] != "00000000-0000-0000-0000-000000000000"){
      let row = categoryTable.insertRow(categoryTable.rows.length - 1);
      row.setAttribute('id', categoryValues[i]);

      updateCategoryRow(row, i);
    }
  }

  for (var i = 0; i < projectTable.rows.length-1; i++){
    projectTable.deleteRow(i);
    i--;
  }

  for (var i = 0; i < projectNames.length; i++){
    if (projectValues[i] != "00000000-0000-0000-0000-000000000000"){
      let row = projectTable.insertRow(projectTable.rows.length - 1);
      row.setAttribute('id', projectValues[i]);

      updateProjectRow(row, i);
    }
  }
}

async function downloadSample() {
  var link = document.createElement("a");
  link.href = "/files/sample.csv";
  link.click();
}

async function importFile() {

  var file = document.getElementById("file-input").files[0];

  if (!file){
    alert("Please select a file.");
    return;
  }

  var reader = new FileReader();

  reader.onload = function (e){
    processImport(this.result);
  };

  reader.readAsText(file);
}

async function processImport(text){
  var startTime;
  var endTime;
  var activity;
  var category;
  var project;
  var found = false;
  var data = null;
  var finalJSON = "[";

  var lines = text.split("\n");
  headerLine = lines[0].split(",");

  if (headerLine.length != 5){
    alert("Invalid number of input columns. Please refer to sample for required format.")
    return;
  }

  for(i = 1; i < lines.length; i++){
    if(lines[i] == ""){
      continue;
    }

    fields = lines[i].split(",");
    
    category = "00000000-0000-0000-0000-000000000000";
    project = "00000000-0000-0000-0000-000000000000";
    startTime = new Date(fields[0]);
    endTime = new Date(fields[1]);
    startTime = new Date(startTime.getTime() - (startTime.getTimezoneOffset() * 60000));
    endTime = new Date(endTime.getTime() - (endTime.getTimezoneOffset() * 60000));

    activity = fields[2];
    categoryCheck = fields[3].trim();
    projectCheck = fields[4].trim();

    for(j = 0; j < categoryNames.length; j++){
      if(categoryNames[j] == categoryCheck){
        category = categoryValues[j];
        found = true;
        break;
      }
    }

    if(!found && categoryCheck != ""){
      if(confirm(`The category "${categoryCheck}" does not exist. Press OK to add it, or Cancel to make all instances of "${categoryCheck}" blank.`)){
        try {
          var categoryProjectName = categoryCheck;
          const res = await fetch("/api/categories", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ categoryProjectName }),
          });
          data = await res.json();
          if (!res.ok) {
            const err = new Error(`Failed to add category: ${data.error}`);
            err.code = res.status;
            throw err;
          }
        } catch (error) {
          if(error.code == '401'){
            alert(error.code);
            logout();
          }else{
            alert(`Error: ${error.message}`);
            return;
          }
        }

        categoryValues.push(data.ID);
        categoryNames.push(data.Category);
        categoryTerms.push("");
        category = data.ID;

      }else{
        categoryNames.push(categoryCheck);
        categoryValues.push("00000000-0000-0000-0000-000000000000");
        categoryTerms.push("");
        category = "00000000-0000-0000-0000-000000000000";
      }
    }

    found = false;

    for(j = 0; j < projectNames.length; j++){
      if(projectNames[j] == projectCheck){
        project = projectValues[j];
        found = true;
        break;
      }
    }

    if(!found && projectCheck != ""){
      if(confirm(`The project "${projectCheck}" does not exist. Press OK to add it, or Cancel to make all instances of "${projectCheck}" blank.`)){
        try {
          var categoryProjectName = projectCheck;
          const res = await fetch("/api/projects", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ categoryProjectName }),
          });
          data = await res.json();
          if (!res.ok) {
            const err = new Error(`Failed to add project: ${data.error}`);
            err.code = res.status;
            throw err;
          }
        } catch (error) {
          if(error.code == '401'){
            alert(error.code);
            logout();
          }else{
            alert(`Error: ${error.message}`);
            return;
          }
        }

        projectValues.push(data.ID);
        projectNames.push(data.Category);
        projectTerms.push("");
        project = data.ID;
      }else{
        projectNames.push(projectCheck);
        projectValues.push("00000000-0000-0000-0000-000000000000");
        projectTerms.push("");
        project = "00000000-0000-0000-0000-000000000000";
      }
    }

    found = false;
    var json = JSON.stringify({ startTime, endTime, activity, category, project });
    finalJSON += json + ", ";
  }

  finalJSON = finalJSON.substring(0, finalJSON.length - 2) + "]";

  try {
    const res = await fetch("/api/bulk/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: finalJSON,
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(`Failed to import activities: ${data.error}`);
      err.code = res.status;
      throw err;
    }

    alert("Import completed successfully.")
    document.getElementById('file-input').value = null;
    nav("log");
  } catch (error) {
    if(error.code == '401'){
      alert(error.code);
      logout();
    }else{
      alert(`Error: ${error.message}`);
    }
  }
}

async function exportFile() {
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
        const err = new Error(`Failed to get activities: ${data.error}`);
        err.code = res.status;
        throw err;
      }
  } catch (error) {
    if(error.code == '401'){
      alert(error.code);
      logout();
    }else{
      alert(`Error: ${error.message}`);
    }
  }
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,"
    + "Activity" + ","
    + "Duration" + ","
    + "Start Time" + ","
    + "End Time" + ","
    + "Category" + ","
    + "Project" + ","
    + "\r\n";

  for (const activity of data){
    csvContent += activity.Date.split('T')[0] + ","
      + activity.Activity + ","
      + activity.Duration + ","
      + activity.StartTime.split('T')[1].split('Z')[0] + ","
      + activity.EndTime.split('T')[1].split('Z')[0].split('.')[0] + ","
      + activity.Category.String + ","
      + activity.Project.String + "\r\n";
  }

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
  
}

function allYearsReport(){
  alert("all years report");
}

async function refreshReport(){

    var data = await getReportData("years", null);
    firstButtons = {};
    
    const table = document.getElementById("reportTableBody");
    const tableHead = document.getElementById("reportTableHead");
    table.innerHTML = '';

    await loadDropdowns();

    let numCats = categoryNames.length;
    let numProjs = projectNames.length;

    var colElems = document.getElementsByClassName("report-col");

    for(var i = 0; i < colElems.length; i++){
      colElems[i].remove();
      i--;
    }

    for(var i = 0; i < numCats; i++){
      let col = tableHead.insertCell(i);
      let th = document.createElement('th');
      col.replaceWith(th);
      th.innerHTML = categoryNames[i];
      th.classList.add("report-col");
    }

    for(var i = 0; i < numProjs; i++){
      let col = tableHead.insertCell(numCats+1+i);
      let th = document.createElement('th');
      col.replaceWith(th);
      th.innerHTML = projectNames[i];
      th.classList.add("report-col");
    }

    const catLabel = document.getElementById("category-label");
    const projLabel = document.getElementById("project-label");

    catLabel.setAttribute('colspan', numCats+1);
    projLabel.setAttribute('colspan', numProjs+1);

    for (const year of data){
      let row = table.insertRow();

      updateReportRow("years", year, row, numCats, numProjs);
    }
    firstButtons['years'].click();
}

function updateReportRow(type, entry, row, numCats, numProjs){
  row.setAttribute('year', entry.Year);
  row.setAttribute('expanded', false);
  row.setAttribute('type', type);
  let dateVal = null;
  let childType = null;

  if(type == "years"){
    dateVal = entry.Year;
    childType = "months";
  }else if(type == "months"){
    dateVal = entry.Month;
    row.setAttribute("month", entry.Month);
    childType = "weeks";
  }else if(type == "weeks"){
    dateVal = `Week of ${entry.Week.split('T')[0].split('-').slice(1,3).join('-')}`;
    row.setAttribute("month", entry.Month);
    row.setAttribute("week", entry.Week.split('T')[0].split('-').slice(1,3).join('-'));
    childType = "days";
  }else if(type == "days"){
    dateVal = `${entry.Dayname} ${entry.Day.split('T')[0].split('-').slice(1,3).join('-')}`;
    row.setAttribute("month", entry.Month);
    row.setAttribute("week", entry.Week.split('T')[0].split('-').slice(1,3).join('-'));
    row.setAttribute("day", entry.Day.split('T')[0].split('-').slice(1,3).join('-'));
    childType = "null";
  }

  let date = row.insertCell(0);
  date.innerHTML = dateVal;

  let startTime = row.insertCell(1);
  startTime.innerHTML = entry.StartTime;

  let totalCol = row.insertCell(2);
  let total = 0;

  for(var i = 0; i < numCats; i++){
    let cell = row.insertCell(3 + i);
    if(!entry.CategoryData[categoryValues[i]]){
      cell.innerHTML = 0;
    }else{
      cell.innerHTML = entry.CategoryData[categoryValues[i]];
      total += Number(entry.CategoryData[categoryValues[i]]);
    }
  }

  let cell = row.insertCell(3 + numCats);
  if(!entry.CategoryData["null"]){
    cell.innerHTML = 0;
  }else{
    cell.innerHTML = entry.CategoryData["null"];
    total += Number(entry.CategoryData["null"]);
  }

  for(var i = 0; i < numProjs; i++){
    let cell = row.insertCell(3 + numCats + 1 + i);
    if(!entry.ProjectData[projectValues[i]]){
      cell.innerHTML = 0;
    }else{
      cell.innerHTML = entry.ProjectData[projectValues[i]];
    }
  }

  cell = row.insertCell(3 + numCats + 1 + numProjs);
  if(!entry.ProjectData["null"]){
    cell.innerHTML = 0;
  }else{
    cell.innerHTML = entry.ProjectData["null"];
  }
  
  totalCol.innerHTML = total;

  cell = row.insertCell(3 + numCats + 1 + numProjs+1);
  let button = document.createElement('button');
  button.innerHTML = `<i class="fa fa-bar-chart"></i>`;
  button.classList.add("subtle");
  button.addEventListener("click", function(){
    dashboardReport(type, row);
  });
  cell.append(button);

  if(type != 'days'){

    let button2 = document.createElement('button');
    button2.innerHTML = `<i class="fa fa-caret-down"></i>`;
    button2.classList.add("subtle");
    button2.addEventListener("click", function(){
      drillDownReport(type, childType, row, button2);
    });
    cell.append(button2);

    if(!firstButtons[type]){
      firstButtons[type] = button2;
    }
  }
}

async function getReportData(type, row){
  let year = null;
  let month = null;
  let week = null;
  var data;
  let endpoint = "";

  if(!row){
    endpoint = `/api/reports/years`;
  }else{
    year = row.getAttribute("year");

    if (type == "months"){
      endpoint = `/api/reports/months/${year}`;
    }else if(type == "weeks"){
      month = row.getAttribute("month");

      endpoint = `/api/reports/months/${year}/weeks/${month}`;
    }else if(type == "days"){
      month = row.getAttribute("month");
      week= row.getAttribute("week");
      endpoint = `/api/reports/months/${year}/weeks/${month}/days/${year}-${week}`;
    }
  }

  try {
    const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    data = await res.json();
    if (!res.ok) {
      const err = new Error(`Failed to get report ${type}: ${data.error}`);
      err.code = res.status;
      throw err;
    }
  } catch (error) {
    if(error.code == '401'){
      alert(error.code);
      logout();
    }else{
      alert(`Error: ${error.message}`);
        
      return null;
    }
  }

  return data;

}

async function drillDownReport(parentType, childType, row, button){

  index = row.rowIndex;
  table = row.parentNode;
  
  if(row.getAttribute('expanded') == 'true'){
    button.classList.remove('fa-rotate-180');
    rowCheck = table.rows[index-1];

    while(isChild(parentType, rowCheck.getAttribute('type'))){
      rowCheck.remove();
      if(table.rows.length >= index-1){
        rowCheck = table.rows[index-1];
      }else{
        break;
      }
    }

    row.setAttribute('expanded', false);
    return;
  }

  data = await getReportData(childType, row);
  button.classList.add('fa-rotate-180');

  let numCats = categoryNames.length;
  let numProjs = projectNames.length;
  let doIClick = false;
  
  if(!firstButtons[childType]){
    doIClick = true;
  }

  if(!data){
    return;
  }

  let i = 0;
  for(const entry of data){
    newRow = table.insertRow(index-1+i);
    updateReportRow(childType, entry, newRow, numCats, numProjs);
    i++;
  }

  row.setAttribute('expanded', true);

  if(firstButtons[childType] && doIClick){
    firstButtons[childType].click();
  }

}

function dashboardReport(type, row){
  alert(`${type} dashboard`);
}

function isChild(parentType, childType){
  if(parentType == 'years'){
    if(childType == 'months' || childType == 'weeks' || childType == 'days'){
      return true;
    }
  }else if(parentType == 'months'){
    if(childType == 'weeks' || childType == 'days'){
      return true;
    }
  }else if(parentType == 'weeks'){
    if(childType == 'days'){
      return true;
    }
  }

  return false;
}