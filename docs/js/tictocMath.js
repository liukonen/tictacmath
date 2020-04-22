var agentE;
var operator;
var agentName;
var logNumber;
var useNegatives;
var globalItems = [];

function nextAgent (agentName) {
    if (!agentName) return;
    clippy.load(agentName, agent => {
        window[agentName] = agent
        agent.show();
        agent.speak("Hello, My name is " + agentName + ". Ready to play some Tic Tac Math?");
        agentE = agent;
    });
}

function speak(text){

  var msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
  agentE.speak(text);
}

function swapAgent(agentName){
  localStorage.setItem("agentName", agentName);
  agentE.hide();
  nextAgent(agentName);

}

function swapOperator(OperatorChar){
  operator = OperatorChar;
  localStorage.setItem("operator", OperatorChar);
  LoadPage(OperatorChar);
}

function swapPlaceHolder(placeHolderNumber){
  logNumber = placeHolderNumber;
  localStorage.setItem("placeholder", placeHolderNumber);
  LoadPage(operator);
}


function TryTalk(){
  agentE.speak("I am in control... You are in control!")

}

function MoveAgent(element){
  agentE.stop();
  let rect = element.getBoundingClientRect();
  agentE.moveTo(rect.left, rect.top);

}

function getRndInteger(min, max) { return Math.floor(Math.random() * (max - min) ) + min;}

function LoadPage(OperatorType){
  if (globalItems.length > 0){globalItems.splice(0, globalItems.length);}
  for (var i = 1; i <= 9; i++) {
    let Num1 = getRndInteger(1, Math.pow(10, logNumber));
    let Num2 = getRndInteger(1, Math.pow(10, logNumber));
    switch (operator)
    {
      case "/":
      Num1 *= Num2;
      break;
      case "-":
      if (Num1 < Num2){let placeHolder = Num1;  Num1 = Num2; Num2 = placeHolder;}
      break;
    }
    let ItemToSave = {Number1:Num1, Number2:Num2, Checked:"N"}
    globalItems.push(ItemToSave);
    $("#cardText" + i).html(Num1.toString() + "<br />" + OperatorType + Num2.toString());
    $("#txtBox" + i).val("");
    $("#txtBox" + i).prop("disabled", false);
    $("#btn" + i).prop("disabled", false);
    $("#card" + i).attr('class', 'card mb-4 box-shadow')
  }
        console.log(globalItems);
}

function GetFromStorage(name, defaultValue){
  if (localStorage.getItem(name) === null){return defaultValue;}
  return localStorage.getItem(name);
}

function Check_Click(Number){
  //console.log($("#txtBox"+ Number.toString()).val().toString())
  //{
 let NumberToCheck = parseInt($("#txtBox"+ Number.toString()).val());

console.log(NumberToCheck);

if (!isNaN(NumberToCheck))
{
  let Item = globalItems[Number-1];
  console.log(Item);
  let answer = CalculateValue(Item);
  let opName = GetOperatorText();
  if (answer == NumberToCheck){
      Item.Checked = "U";
      speak("Correct");
    $("#card" + Number).attr('class', 'card mb-4 box-shadow bg-info');
    }
  else
    {
        $("#card" + Number).attr('class', 'card mb-4 box-shadow bg-danger')
        Item.Checked = "C";
        speak(Item.Number1.toString() + opName + Item.Number2.toString() + " equals " + answer.toString());
      }
  $("#btn" + Number).prop("disabled", true);
let win =  CheckForWin();
if (!win){  PlayerMove()};

}
else{speak("you need to enter a value. try again")}
}

function CalculateValue(Item){
  switch (operator) {
    case "+":
      return Item.Number1 + Item.Number2;
      case "-":
      return Item.Number1 - Item.Number2;
      case "*":
      return Item.Number1 * Item.Number2;
    default:
      return Item.Number1 / Item.Number2;
  }

}

function GetOperatorText(){
  switch (operator) {
    case "+": return" plus ";
    case "-":return " minus ";
    case "*":return " times ";
    default: return " divided by "
  }
}

function CheckForWinItems()
{
  if (globalItems[0].Checked != "N" && globalItems[0].Checked == globalItems[1].Checked && globalItems[0].Checked == globalItems[2].Checked){return globalItems[0].Checked;}
  if (globalItems[0].Checked != "N" && globalItems[0].Checked == globalItems[3].Checked && globalItems[0].Checked == globalItems[6].Checked){return globalItems[0].Checked;}
  if (globalItems[0].Checked != "N" && globalItems[0].Checked == globalItems[4].Checked && globalItems[0].Checked == globalItems[8].Checked){return globalItems[0].Checked;}
  if (globalItems[1].Checked != "N" && globalItems[1].Checked == globalItems[4].Checked && globalItems[1].Checked == globalItems[7].Checked){return globalItems[0].Checked;}
  if (globalItems[2].Checked != "N" && globalItems[2].Checked == globalItems[5].Checked && globalItems[2].Checked == globalItems[8].Checked){return globalItems[0].Checked;}
  if (globalItems[2].Checked != "N" && globalItems[2].Checked == globalItems[4].Checked && globalItems[2].Checked == globalItems[6].Checked){return globalItems[0].Checked;}
  if (globalItems[3].Checked != "N" && globalItems[3].Checked == globalItems[4].Checked && globalItems[3].Checked == globalItems[5].Checked){return globalItems[0].Checked;}
  if (globalItems[6].Checked != "N" && globalItems[6].Checked == globalItems[7].Checked && globalItems[6].Checked == globalItems[8].Checked){return globalItems[0].Checked;}
  return "";
}
function CheckForWin(){
    let animations = agentE.animations();
  let item = CheckForWinItems();
  console.log(item);
  if (item != ""){

    if (item == "U"){
      if (animations.includes("Congratulate")){agentE.play("Congratulate");}
      speak("Congratulations, you won!");
      return true;    LoadPage(operator);
    }
    else{
      if (animations.includes("Think")){agentE.play("Think");}
      if (animations.includes("Wave")){agentE.play("Wave");}
      speak("Sorry, I won, maybe next time!");    LoadPage(operator);
      return true;
    }

  }
  console.log(MoreMoves());
  if (!MoreMoves()){
    if(animations.includes("Searching")){agentE.play("Searching");}
    speak("No more moves. Good game."); LoadPage(operator);
  return true;}
  return false;
}


function MoreMoves(){
  let value = false;
  globalItems.forEach(item => {
    console.log(item);
    if (item.Checked == "N"){value = true;}
  });
  return value;

//  globalItems.forEach((item) => {console.log(item.Checked); if (item.Checked == "N"){return true;}});
}

function PlayerMove(){
  if (MoreMoves()){
    let Found = false;
    let valueToUse;
    while (!Found) {
      let Test = getRndInteger(0, 8);
      if (globalItems[Test].Checked == "N"){Found = true; valueToUse = Test;}
    }
    let controlNumber = valueToUse +1;
    let tb = $("#txtBox" + controlNumber);
    let position  = tb.offset();//getBoundingClientRect();
    $("#card" + controlNumber).attr('class', 'card mb-4 box-shadow bg-danger')
    let itemToUse = globalItems[valueToUse];
    tb.val(CalculateValue(itemToUse));
    itemToUse.Checked = "C";
    speak(itemToUse.Number1.toString() + GetOperatorText() + itemToUse.Number2.toString() + " equals " + CalculateValue(itemToUse));
    tb.prop("disabled", true );
    $("#btn" + controlNumber).prop("disabled", true);

    agentE.moveTo(position.left, position.top);

    CheckForWin();
  }
}

//Load Items

agentName = GetFromStorage("agentName", "Merilin");
logNumber = GetFromStorage("logNumber", 1);
operator = GetFromStorage("operator", "+");

LoadPage(operator);
nextAgent(agentName);
