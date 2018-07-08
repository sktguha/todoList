function getNewWidget(data, onAttrChangeCb, onTextIpClickCB){
    return {
        deleted : false,
        getMinusDivWithId: function (id) {
            var minus = document.createElement("button");
            minus.innerText = "-";
            minus.class = "minus";
            minus.setAttribute("data-id", id);
            return minus;
        },
        createUniqueId: function () {
            return Math.random() + Date.now() + "";
        },
        setupListenersForAttrChange: function () {
            this.input.oninput = onAttrChangeCb;
            this.ck.oninput = onAttrChangeCb;
            var that = this;
            this.input.onclick = function() {
                onTextIpClickCB(that);
            }
        },
        getDiv : function() {
            var input = document.createElement("textarea");
            var ck = document.createElement("input");
            ck.type = "checkbox"
            if (data) {
                input.value = data.text;
                ck.checked = data.checked;
            }

            var id = this.createUniqueId();
            var minus = this.getMinusDivWithId(id);

            var div = document.createElement("div");
            div.appendChild(input);
            div.appendChild(ck);
            div.appendChild(minus);
            div.id = id;

            this.id = id;
            this.input = input;
            this.ck = ck;
            this.div = div;
            this.onAttrChangeCb = onAttrChangeCb;
            this.setupListenersForAttrChange();
            return div;
        },
        getData : function () {
            var textValue = this.input.value;
            if(!textValue) return;

            return {
                text : textValue,
                checked : this.ck.checked
            }
        }
    }
}

var widgetList = {};
var list = document.getElementById("list");
var currWidget;

function onListClicked(e){
    if(e.target.class === "minus"){
        onMinusClick(e);
    }
}

function getNewWidgetAndAppend(data) {
    var widget = getNewWidget(data, function(){
        saveToStorage();
    }, function (widget) {
        currWidget = widget;
    });
    var div = widget.getDiv();
    list.appendChild(div);
    widget.input.focus();
    widgetList[widget.id] = widget;
}

function onPlusClick(){
    getNewWidgetAndAppend();
}

function onMinusClick(e) {
    var id = e.target.dataset.id;
    delete widgetList[id];
    var div = document.getElementById(id);
    div.parentElement.removeChild(div);
    saveToStorage();
}

function restoreWidget(id){

}

function saveToStorage() {
    var dataList = [];
    for(var i in widgetList){
        var widget = widgetList[i];
        var data = widget.getData();
        data && dataList.push(data);
    }
    localStorage['dataList'] = JSON.stringify(dataList);
}

function parseFromDataAndCreateDom(dataList) {
    try {
        var dataList = JSON.parse(dataList);
        for (var i in dataList) {
            var data = dataList[i];
            getNewWidgetAndAppend(data);
        }
    } catch (e) {
        console.error("error in parsing from storage", e);
    }
}

function addKeyboardShortcuts() {
    document.body.onkeydown = function (e) {
        if (e.key === "k" && e.ctrlKey) {
            onPlusClick();
            e.preventDefault();
        }
        else if(e.key === "ArrowDown" && e.ctrlKey){
            if(Object.keys(widgetList).length === 0) return;

            moveFocus("down");
        }
        else if(e.key === "ArrowUp" && e.ctrlKey){
            if(Object.keys(widgetList).length === 0) return;

            moveFocus("up");
        }
    }
}

function moveFocus(dir) {
    var arr = [];
    for(var i in widgetList){
        arr.push(i);
    }
    var id = currWidget && currWidget.id;
    var targetId ;

    if(!id){
        targetId = 0;
    } else {
        targetId = arr.indexOf(id);
        if (dir === "down") {
            if (targetId === arr.length - 1) {
                targetId = 0;
            } else {
                targetId++;
            }
        } else if(dir === "up"){
            if(targetId === 0){
                targetId = arr.length - 1;
            } else {
                targetId--;
            }
        } else {
            console.error("unknown dir specified", dir);
        }
    }
    var widget = widgetList[arr[targetId]];
    widget.input.focus();
    currWidget = widget;
}

function main(){
    var dataList = localStorage['dataList'];
    if(!dataList) return;
    list.onclick = onListClicked;
    parseFromDataAndCreateDom(dataList);
    addKeyboardShortcuts();
    window.onclose = saveToStorage();
}

main();