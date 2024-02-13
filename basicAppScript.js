let itemInput = document.getElementById("item-input");
let addButton = document.getElementById("add-button");
let itemsList = document.getElementById("items-list");
let controlDiv = document.getElementById("control-div");

let blubSvg = document.querySelector(".blub-svg");
let settingsSvg = document.querySelector(".settings-svg");

let noItemsInList = false;
let darkMode = false;

let tasksObj;

function addToList() {
  let itemVar = itemInput.value.trim();
  itemInput.value = "";

  if (itemVar) {
    if (noItemsInList) {
      itemsList.innerHTML = "";
      noItemsInList = false;
    }
    if (localStorage.getItem("tasks")) {
      tasksObj = JSON.parse(localStorage.getItem("tasks"));
      tasksObj[Object.keys(tasksObj).length + 1] = {
        task: itemVar,
        completed: false,
        order: Object.keys(tasksObj).length + 1,
        color: "default",
        uniqueNumber: getUniqueNumber()
      };
      function getUniqueNumber() {
        let uniqueNumbersUsed = []
        Object.keys(tasksObj).forEach(task => uniqueNumbersUsed.push(tasksObj[task]["uniqueNumber"]))
        let uniqueNumberValue = 1
        while (uniqueNumbersUsed.indexOf(uniqueNumberValue) >= 0) {
          uniqueNumberValue++
        }
        return uniqueNumberValue
      }
    }
    console.log(tasksObj);
    localStorage.setItem("tasks", JSON.stringify(tasksObj));

    
    let currentTaskNumber = Object.keys(tasksObj).length;
    itemsList.innerHTML += `<li draggable="true" class="item-list iNumber${tasksObj[currentTaskNumber]['uniqueNumber']} completed-False"><p onclick='taskCompleted(${tasksObj[currentTaskNumber]['uniqueNumber']})'>${itemVar}</p><img onclick="deleteTask(${tasksObj[currentTaskNumber]['uniqueNumber']})" class="delete-svg" src="images/eraser.svg" alt="Delete this task"></li>`;
  }
  putTheEventListner();
}

function switchModes(wannaChange) {

  /* 0 is light  ||||| 1 is dark ||||| 01 means from light to dark |||| 10 from dark to light |||| 11 leave dark |||| 00 leave light */
  if (localStorage.getItem("darkMode") == "true") {
    if (wannaChange == "no") changeColors("11");
    else {
      changeColors("10");
      localStorage.setItem("darkMode", "false");
    }
  }
  else {
    if (wannaChange == "no") changeColors("00");
    else {
      changeColors("01");
      localStorage.setItem("darkMode", "true");
    }
  }

  function changeColors(cOA) {
    if (cOA == "10" || cOA == "00") {
      document.documentElement.style.setProperty("--firstColor","rgb(235, 235, 235)");
      document.documentElement.style.setProperty("--secondColor","rgb(34, 34, 34)");
      document.documentElement.style.setProperty("--firstColorDeeper", "white");
      document.documentElement.style.setProperty("--secondColorDeeper","black");
      blubSvg.src = "images/light-bulb-black.svg";
      settingsSvg.src = "images/configuration-gear-black.svg";

    } else if (cOA == "01" || cOA == "11") {
      document.documentElement.style.setProperty("--firstColor","rgb(34, 34, 34)");
      document.documentElement.style.setProperty("--secondColor","rgb(235, 235, 235)");
      document.documentElement.style.setProperty("--firstColorDeeper", "black");
      document.documentElement.style.setProperty("--secondColorDeeper","white");
      blubSvg.src = "images/light-bulb-white.svg";
      settingsSvg.src = "images/configuration-gear-white.svg";
    }
  }
}

function deleteTask(taskUniqueNumber) {
  delete tasksObj[getTaskNumber(taskUniqueNumber)];
  itemsList.innerHTML = "";
  let tasksObjNew = {};
  let orderInObject = 1;
  Object.keys(tasksObj).forEach((obj) => {
    tasksObjNew[orderInObject] = tasksObj[obj];
    tasksObjNew[orderInObject]["order"] = orderInObject;
    orderInObject++;
  });
  tasksObj = tasksObjNew;

  localStorage.setItem("tasks", JSON.stringify(tasksObjNew));
  addOldTasks();
}

function taskCompleted(taskUniqueNumber) {
  let indexOfTask = getTaskNumber(taskUniqueNumber)
  let taskElement = document.querySelector(`.iNumber${taskUniqueNumber}`);
  if (JSON.parse(localStorage.getItem("tasks"))[indexOfTask]["completed"] == false) {
    taskElement.classList.add("completed-True");
    taskElement.classList.remove("completed-False");
    tasksObj[indexOfTask]["completed"] = true;
  } else {
    taskElement.classList.remove("completed-True");
    taskElement.classList.add("completed-False");
    tasksObj[indexOfTask]["completed"] = false;
  }
  localStorage.setItem("tasks", JSON.stringify(tasksObj));
}

////////////////////////////// DRAG AND DROP ////////////////////////////////////

function putTheEventListner() {

  //////// Style And Class //////
  let allItems = document.querySelectorAll(".item-list");

  allItems.forEach((oneItem) => {
    oneItem.addEventListener("dragstart", () => {
      oneItem.classList.add("dragging-item");
    });
    oneItem.addEventListener("dragend", () => {
      oneItem.classList.remove("dragging-item");
    });
  });


  itemsList.addEventListener("dragover", (e) => {
    setTimeout(()=> {
    ////// Reorder In HTML ///////
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging-item");
    let otherItems = [...document.querySelectorAll(".item-list:not(.dragging-item)")];
    let nextItem = otherItems.find((oneItem) => {
      return e.pageY <= oneItem.offsetTop + oneItem.offsetHeight / 2;
    });
    itemsList.insertBefore(draggingItem, nextItem);

    /////// Make "Order" Element In JavaScript Object Real //////
    let itemsListAfterReordering = document.querySelectorAll(".item-task-title");
    for (let i = 1; i <= itemsListAfterReordering.length; i++) {
      let valueOfItem = itemsListAfterReordering[i - 1].innerHTML;
      Object.keys(tasksObj).forEach((e) => {
        if (tasksObj[e]["task"] == valueOfItem) {
          tasksObj[e]["order"] = i;
        }
      });
    }


    /////// Reorder To View In Page Later And Store It In LocalStorage ///////
    let orderedTasksObj = {};
    Object.keys(tasksObj).forEach((e) /* we need it only for the order number */ => {
      Object.keys(tasksObj).forEach((el) /* find the object that has ordered number */ => {
        if (tasksObj[el]["order"] == e) {

            orderedTasksObj[e] = tasksObj[el];
        }
      });
    });
    localStorage.setItem("tasks", JSON.stringify(orderedTasksObj));
    });
        }, 50)

    }

//////////////////////// RUN CODES WHILE PAGE IS ACTIVE //////////////////////
///////// resize the list box
addEventListener("load",() => (itemsList.style.width = controlDiv.offsetWidth + "px"));
addEventListener("resize", () => {itemsList.style.width = controlDiv.offsetWidth + "px";});


////////// Add item to list when clicking "Enter" on the keyboard
itemInput.addEventListener("keydown", (e) => e["key"] == "Enter" ? addToList() : "");

///////// Add items saved before from localstorage
function addOldTasks() {
  if (localStorage.getItem("tasks") && Object.keys(JSON.parse(localStorage.getItem("tasks"))).length > 0) {
    tasksObj = JSON.parse(localStorage.getItem("tasks"))
    for (let task in tasksObj){
        itemsList.innerHTML += `<li draggable="true" class="item-list iNumber${tasksObj[task]['uniqueNumber']} ${tasksObj[task]['completed'] == true ? 'completed-True': 'completed-False'}"><p class="item-task-title" onclick='taskCompleted(${tasksObj[task]['uniqueNumber']})'>${tasksObj[task]['task']}</p><img onclick="deleteTask(${tasksObj[task]['uniqueNumber']})" class="delete-svg" src="images/eraser.svg" alt="Delete this task"></li>`
    }
    putTheEventListner();
  } else {
    localStorage.setItem("tasks", "{}");
    itemsList.innerHTML = `<li draggable="true" class='item-list' style='border:none;'><h1>There is no tasks to show</h1></h1>`;
    noItemsInList = true;
  }
}
addOldTasks();

///////// Apply last mode
switchModes("no");


function getTaskNumber(num) {
  for (let i = 1; i <= Object.keys(tasksObj).length; i++) {
    if (tasksObj[i]['uniqueNumber'] == num) {
      return Number(i)
    }
  }

}