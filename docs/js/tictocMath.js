var agentE;
var operator;
var agentName;
var logNumber;
var useNegatives;
var globalItems = [];

//View
function GenerateMainView(items)
{
  $("#mainRow").empty();
  $("#itemTempate").tmpl(items).appendTo("#mainRow");
}

function nextAgent (agentName) {
    if (!agentName) return;
    clippy.load(agentName, agent => {
        window[agentName] = agent
        agent.show();
        agent.speak("Hello, My name is " + agentName + ". Ready to play some Tic Tac Math?");
        agentE = agent;
    });
}

//Event Handles

//Dropdown to swap Agent type
function swapAgent(agentName){
  localStorage.setItem("agentName", agentName);
  agentE.hide();
  nextAgent(agentName);
}

//Dropdown to swap Operator
function swapOperator(OperatorChar){
  operator = OperatorChar;
  localStorage.setItem("operator", OperatorChar);
  LoadPage(OperatorChar);
}

//Dropdown to swap placeholder
function swapPlaceHolder(placeHolderNumber){
  console.log("swapPlaceholder");
  logNumber = placeHolderNumber;
  localStorage.setItem("placeholder", placeHolderNumber);
  LoadPage(operator);
}

//Button Click event to validate checkbox
function Check_Click(Number){
  let NumberToCheck = parseInt($("#txtBox"+ Number.toString()).val());
  if (!isNaN(NumberToCheck)){
    let Item = globalItems[Number];
    let answer = CalculateValue(Item);
    let opName = GetOperatorText();
    if (answer == NumberToCheck){
        Item.Checked = "U";
        speak("Correct");
        MarkCard("U", Number);
      }
      else{
          Item.Checked = "C";
          speak(Item.Number1.toString() + opName + Item.Number2.toString() + " equals " + answer.toString());
          MarkCard("C", Number);
        }
        let win =  CheckForWin();
        if (!win){  PlayerMove()};
      }
      else{speak("you need to enter a value. try again")}
}

//Main Controller
function LoadPage(OperatorType){
  globalItems = Array.from(new Array(9),(val,index)=>generateModel(operator, index));
  GenerateMainView(globalItems);
}

function generateModel(operator, i)
{
  console.log(operator);
  let Num1 = getRndInteger(1, Math.pow(10, logNumber));
  let Num2 = getRndInteger(1, Math.pow(10, logNumber));
  switch (operator)
  {
    case "÷": Num1 *= Num2; break;
    case "-": if (Num1 < Num2){let placeHolder = Num1;  Num1 = Num2; Num2 = placeHolder;} break;
  }
  return {Number1:Num1, Number2:Num2, Checked:"N", id:i}
}

function PlayerMove(){
  if (MoreMoves()){
    let F = globalItems.filter((currentItem) => currentItem.Checked === "N");
    let controlNumber = (F.length == 1) ? F[0].id : F[getRndInteger(0, F.length)].id;
    let tb = $("#txtBox" + controlNumber);

    MoveAgent(tb[0]);
    MarkCard("C", controlNumber);
    let itemToUse = globalItems[controlNumber];
    let answer = CalculateValue(itemToUse);

    tb.val(answer);
    itemToUse.Checked = "C";
    speak(itemToUse.Number1.toString() + GetOperatorText() + itemToUse.Number2.toString() + " equals " + CalculateValue(itemToUse));
    tb.prop("disabled", true );

    CheckForWin();
  }
}

function CheckForWin(){
  let item = CheckForWinItems();
  if (item != "" || !MoreMoves()){
    animateWin(item);
    LoadPage(operator);
    return true;
    }
  return false;
}

// Helper functions
function MoreMoves(){return globalItems.some((item)=> item.Checked === "N");}
function getRndInteger(min, max) { return Math.floor(Math.random() * (max - min) ) + min;}
function allEqual(arr){return arr.every(v => v === arr[0]); }
function GetFromStorage(name, defaultValue){return (localStorage.getItem(name) === null) ? defaultValue : localStorage.getItem(name);}

function CalculateValue(Item){
  switch (operator) {
    case "+": return Item.Number1 + Item.Number2;
      case "-":return Item.Number1 - Item.Number2;
      case "x":return Item.Number1 * Item.Number2;
    default: return Item.Number1 / Item.Number2;
  }
}

function CheckForWinItems()
{
  let MapedTable = globalItems.map(x => x.Checked);
  if (MapedTable[0] != "N" && allEqual([0,1,2].map(x => MapedTable[x]))){return MapedTable[0];}
  if (MapedTable[0] != "N" && allEqual([0,3,6].map(x => MapedTable[x]))){return MapedTable[0];}
  if (MapedTable[0] != "N" && allEqual([0,4,8].map(x => MapedTable[x]))){return MapedTable[0];}
  if (MapedTable[1] != "N" && allEqual([1,4,7].map(x => MapedTable[x]))){return MapedTable[1];}
  if (MapedTable[2] != "N" && allEqual([2,5,8].map(x => MapedTable[x]))){return MapedTable[2];}
  if (MapedTable[2] != "N" && allEqual([2,4,6].map(x => MapedTable[x]))){return MapedTable[2];}
  if (MapedTable[3] != "N" && allEqual([3,4,5].map(x => MapedTable[x]))){return MapedTable[3];}
  if (MapedTable[6] != "N" && allEqual([6,7,8].map(x => MapedTable[x]))){return MapedTable[6];}
  return "";
}

// Animation UI logic
function animateWin(userType)
{
    let animations = agentE.animations();
    switch (userType) {
      case "U":
      if (animations.includes("Congratulate")){agentE.play("Congratulate");}
      speak("Congratulations, you won!");
      console.log("win");
      break;
      case "C":
        if (animations.includes("Think")){agentE.play("Think");}
        if (animations.includes("Wave")){agentE.play("Wave");}
        speak("Sorry, I won, maybe next time!");
        console.log("lose");
        break;
        default://tie
        if(animations.includes("Searching")){agentE.play("Searching");}
        speak("No more moves. Good game.");
        console.log("tie");
      }
}

function GetOperatorText(){
  switch (operator) {
    case "+": return" plus ";
    case "-":return " minus ";
    case "x":return " times ";
    default: return " divided by "
  }
}

function speak(text){
  var msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
  agentE.speak(text);
}

function MoveAgent(element){
  agentE.stop();
  let rect = element.getBoundingClientRect();
  agentE.moveTo(rect.left, rect.top);
}

 function MarkCard(user, cardNumber){
    $("#card" + cardNumber).attr("class", (user == "U") ? "card mb-4 box-shadow bg-info":"card mb-4 box-shadow bg-danger");
    $("#btn" + cardNumber).prop("disabled", true);
  }

//Load Items
agentName = GetFromStorage("agentName", "Merlin");
logNumber = GetFromStorage("logNumber", 1);
operator = GetFromStorage("operator", "+");
LoadPage(operator);
nextAgent(agentName);
