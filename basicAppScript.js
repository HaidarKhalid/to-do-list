let itemInput = document.getElementById('item-input')
let addButton = document.getElementById('add-button')
let itemsList = document.getElementById('items-list')
let controlDiv = document.getElementById('control-div')

let blubSvg = document.querySelector('.blub-svg')
let settingsSvg = document.querySelector('.settings-svg')


let noItemsInList = false
let darkMode = false

let tasksObj;

let inSettings = false
let editingNow = false

function addToList() {
    if (!inSettings) {
        let itemVar = itemInput.value.trim()
        itemInput.value = ""
    
        if (itemVar) {
            if (noItemsInList) {
                itemsList.innerHTML = '';
                noItemsInList = false
            }
    
            if (localStorage.getItem('tasks')) {
                tasksObj = JSON.parse(localStorage.getItem('tasks'))
                tasksObj[Object.keys(tasksObj).length + 1] =
                {
                    task: itemVar,
                    completed: false,
                    order: Object.keys(tasksObj).length + 1,
                    color: "default"
                };
            }
            localStorage.setItem('tasks',JSON.stringify(tasksObj))
            
            itemsList.innerHTML = ''
            addOldTasks()
        }
    }

}


function switchModes(wannaChange) {
    
    /* 0 is light  ||||| 1 is dark ||||| 01 means from light to dark |||| 10 from dark to light |||| 11 leave dark |||| 00 leave light */
    if (localStorage.getItem('darkMode') == "true") {
        if (wannaChange == 'no') changeColors('11') 
        else {changeColors('10'); localStorage.setItem('darkMode',"false");}        
    } else {
        if (wannaChange == 'no') changeColors('00') 
        else {changeColors('01'); localStorage.setItem('darkMode',"true")}
    }

    function changeColors(cOA) {
        if (cOA == "10" ||cOA == "00") {
            document.documentElement.style.setProperty("--firstColor", "rgb(235, 235, 235)")
            document.documentElement.style.setProperty("--secondColor", "rgb(34, 34, 34)")
            document.documentElement.style.setProperty("--firstColorDeeper", "white")
            document.documentElement.style.setProperty("--secondColorDeeper", "black")
            blubSvg.src = "media/images/light-bulb-black.svg"
            settingsSvg.src = "media/images/configuration-gear-black.svg"
        }
        else if (cOA == '01' || cOA == '11') {
            document.documentElement.style.setProperty("--firstColor", "rgb(34, 34, 34)")
            document.documentElement.style.setProperty("--secondColor", "rgb(235, 235, 235)")
            document.documentElement.style.setProperty("--firstColorDeeper", "black")
            document.documentElement.style.setProperty("--secondColorDeeper", "white")
            blubSvg.src = "media/images/light-bulb-white.svg"
            settingsSvg.src = "media/images/configuration-gear-white.svg"
        }
    }
    toggleSettings(false)
}


function deleteTask(indexOfTask) {
    if (!inSettings) {
        delete tasksObj[indexOfTask]
        itemsList.innerHTML = ''
        let tasksObjNew = {};
        let orderInObject = 1
        Object.keys(tasksObj).forEach(obj => {
            tasksObjNew[orderInObject] = tasksObj[obj]
            tasksObjNew[orderInObject]["order"] = orderInObject
            orderInObject++
        })
        tasksObj = tasksObjNew
        new Audio('media/SFX/remove.mp3').play()
        localStorage.setItem('tasks',JSON.stringify(tasksObjNew))
        if (inSettings == true) toggleSettings(false)
        else addOldTasks()
        
    }
}

function clickOnTask(indexOfTask) {
    if (inSettings && !editingNow && document.querySelector(`.container${indexOfTask}`).classList[2] == 'itsHidden') {
        let taskClicked = document.querySelector(`.iNumber${indexOfTask}`)
        taskClicked.innerHTML = `<input class="editing-input editing-task${indexOfTask}" type="text" onkeydown="inputKeyDown(event,${indexOfTask})"/><img onclick="editTask(${indexOfTask})" class="beside-svg" src="media/images/save-edit.svg" alt="Edit this task">`
        tasksObj = JSON.parse(localStorage.getItem("tasks"))
        document.querySelector(`.editing-task${indexOfTask}`).value = tasksObj[indexOfTask]['task']
        taskClicked.style = 'animation: 2s flashingBorder linear infinite'
        editingNow = true
    } else if (!inSettings) {
        // mark task as done
        let taskElement = document.querySelector(`.iNumber${indexOfTask}`)
        if (JSON.parse(localStorage.getItem("tasks"))[indexOfTask]['completed'] == false) {
            taskElement.classList.add('completed-True')
            taskElement.classList.remove('completed-False')
            tasksObj[indexOfTask]['completed'] = true
            new Audio('media/SFX/done.mp3').play()
        } else {
            taskElement.classList.remove('completed-True')
            taskElement.classList.add('completed-False')
            tasksObj[indexOfTask]['completed'] = false
        }
        localStorage.setItem('tasks',JSON.stringify(tasksObj))
    }
}

///////////////////// Settings ///////////////
function toggleSettings(change) {
    if (!inSettings && change) {
        inSettings = true
        settingsSvg.classList.add('make-element-rotate')
        document.querySelector('.note-ar').style = 'animation: 9s opacityAr infinite'
        document.querySelector('.note-en').style = 'animation: 9s opacityEn infinite'
        itemsList.innerHTML = ''
        for (let task in tasksObj){
            itemsList.innerHTML += `<li class="item-list iNumber${task} ${tasksObj[task]['completed'] == true ? 'completed-True': 'completed-False'}">${colorsSVGColor(tasksObj[task]['color'], task)}${putColorsContainer(task)}<p style="color: ${colorFunction(tasksObj[task]["color"])};" onclick='clickOnTask(${task})'>${tasksObj[task]['task']}</p></li>`
        }
    } else if (inSettings && !change) {
        itemsList.innerHTML = ''
        for (let task in tasksObj){
            itemsList.innerHTML += `<li class="item-list iNumber${task} ${tasksObj[task]['completed'] == true ? 'completed-True': 'completed-False'}">${colorsSVGColor(tasksObj[task]['color'], task)}${putColorsContainer(task)}<p style="color: ${colorFunction(tasksObj[task]["color"])};" onclick='clickOnTask(${task})'>${tasksObj[task]['task']}</p></li>`
        }
    } else {
        inSettings = false
        settingsSvg.classList.remove('make-element-rotate')
        document.querySelector('.note-ar').style = 'animation: none; opacity: 0'
        document.querySelector('.note-en').style = 'animation: none; opacity: 0'
        itemsList.innerHTML = ''
        addOldTasks()
    }
}

// editing tasks

function editTask(indexOfTask) {
        let inputOfEditingTask = document.querySelector(`.editing-task${indexOfTask}`)
        tasksObj[indexOfTask]['task'] = inputOfEditingTask.value
        localStorage.setItem('tasks', JSON.stringify(tasksObj))
        let taskClicked = document.querySelector(`.iNumber${indexOfTask}`)
        taskClicked.style = 'animation: none'
        itemsList.innerHTML = ''
        editingNow = false
        
        if (inSettings == true) toggleSettings(false)
        else addOldTasks()
}


//////////////////////// RUN CODES WHILE PAGE IS ACTIVE //////////////////////


////////// Add item to list when clicking "Enter" on the keyboard
itemInput.addEventListener('keydown' ,(e)=> e['key'] == "Enter" ? addToList() : "");
////////// Edit task when clicking "Enter" on the keyboard
function inputKeyDown(e,indexOfTask) {if (e['key'] == 'Enter') {editTask(indexOfTask)}};


///////// Add items saved before from localstorage 
function addOldTasks() {
    if(localStorage.getItem("tasks") && Object.keys(JSON.parse(localStorage.getItem("tasks"))).length > 0) {
        tasksObj = JSON.parse(localStorage.getItem("tasks"))
        for (let task in tasksObj){
            itemsList.innerHTML += `<li class="item-list iNumber${task} ${tasksObj[task]['completed'] == true ? 'completed-True': 'completed-False'}"><p style="color: ${colorFunction(tasksObj[task]["color"])};" onclick='clickOnTask(${task})'>${tasksObj[task]['task']}</p><img onclick="deleteTask(${task})" class="beside-svg" src="media/images/eraser.svg" alt="Delete this task"></li>`
        }
    } else {
        localStorage.setItem('tasks',"{}")
        itemsList.innerHTML = `<li class='item-list' style='border:none;'><h1>There is no tasks to show</h1></h1>`
        noItemsInList = true
    }
}

///// logo color by text color
function colorFunction(color) {
    if (color == 'default' && localStorage.getItem('darkMode') == "true") return 'rgb(235, 235, 235)'
    else if (color == 'default' && localStorage.getItem('darkMode') == "false") return "rgb(34, 34, 34)"
    else return color
}
function colorsSVGColor(color, index) {
    function getSVG(coLor) {
        return `<svg onclick="hideNshowColorsContainer(${index})" class="colors-box-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="${coLor}" d="M7.08 11.25A4.84 4.84 0 0 1 8 9.05L4.43 5.49A9.88 9.88 0 0 0 2 11.25zM9.05 8a4.84 4.84 0 0 1 2.2-.91V2a9.88 9.88 0 0 0-5.76 2.43zm3.7-6v5A4.84 4.84 0 0 1 15 8l3.56
        -3.56A9.88 9.88 0 0 0 12.75 2M8 15a4.84 4.84 0 0 1-.91-2.2H2a9.88 9.88 0 0
         0 2.39 5.76zm3.25 1.92a4.84 4.84 0 0 1-2.2-.92l-3.56 3.57A9.88 9.88 0 0 0 11.25 22zM16 9.05a4.84 4.84 0 0 1 .91 2.2h5a9.88 9.88 0 0 0-2.39-5.76zM15 16a4.84 4.84 0 0 1-2.2.91v5a9.88 9.88 0 0 0 5.76-2.39zm1.92-3.25A4.84 4.84 0 0 1 16 15l3.56 3.56A9.88 9.88 0 0 0 22 12.75z"/></svg>`
    }
    if (color == 'default' && localStorage.getItem('darkMode') == "true") return getSVG('rgb(235, 235, 235)')
    else if (color == 'default' && localStorage.getItem('darkMode') == "false") return getSVG("rgb(34, 34, 34)")
    else return getSVG(color)
    
}

function putColorsContainer(index) {
    return `    
    <div class="colors-container container${index} itsHidden">
        <button onclick="changeColorOfTask(${index},'Red')" style="background-color: Red;">Red</button>
        <button onclick="changeColorOfTask(${index},'Orange')" style="background-color: Orange;">Orange</button>
        <button onclick="changeColorOfTask(${index},'Gold')" style="background-color: Gold;">Gold</button>
        <button onclick="changeColorOfTask(${index}, 'rgb(223, 168, 177)')" style="background-color: rgb(223, 168, 177);">Pink</button>
        <button onclick="changeColorOfTask(${index},'Green')" style="background-color: Green;">Green</button>
        <button onclick="changeColorOfTask(${index},'rgb(35, 35, 255)')" style="background-color: rgb(35, 35, 255);">Blue</button>
    </div>`
}

function hideNshowColorsContainer(index) {
    let container = document.querySelector(`.container${index}`)
    if (container.classList[2] == 'itsHidden') {
        container.classList.remove('itsHidden');
        container.classList.add('itsFlex');
        container.style.display = 'flex';
    } else {
        container.classList.add('itsHidden');
        container.classList.remove('itsFlex');
        container.style.display = 'none';
    }

}
function changeColorOfTask(index,color) {
    console.log(index, color)
    tasksObj[index]['color'] = color
    localStorage.setItem('tasks',JSON.stringify(tasksObj))
    toggleSettings(false)
}
///////// Add old tasks saved in the localstorage
addOldTasks()
///////// Apply last mode
switchModes('no')
///////// resize the list box and the colors box
let colorsButtonsDiv = document.querySelector('.colors-container')
addEventListener('load',()=>{
    itemsList.style.width = (controlDiv.offsetWidth) + 'px'
})
addEventListener("resize",()=>{
    itemsList.style.width = (controlDiv.offsetWidth) + 'px'

})
