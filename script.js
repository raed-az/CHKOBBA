/* ================= CONSTANTS ================= */
const suits = ["S","H","C","D"];
const ranks = [
 {r:"A",v:1},{r:"2",v:2},{r:"3",v:3},{r:"4",v:4},
 {r:"5",v:5},{r:"6",v:6},{r:"7",v:7},
 {r:"J",v:8},{r:"Q",v:9},{r:"K",v:10}
];
const playerColors = ["yellow","blue","green","red"];
const tunisianComments = [
  "يا حسرة! 😅","آه يا خويا على الحظ 😎","هات يدك يا صاح 😆",
  "خلينا نحسبها صح 😉","واو! حركة ذكية 🃏","باهي برشا 😁",
  "يزي عالطيور 🐦","يا سيدي هذا موش ساهل 🤣","هادي تربحها المرة الجاية 😏",
  "يا لطيف! 🤯","هاو شوف اللعب! 😂","مش معقول 😅",
  "عملت فيها محترف 😎","أووووه! 🤣","خليها على الحظ 😜"
];

/* ================= GAME STATE ================= */
let deck=[], table=[];
let players=[
 {name:"YOU",hand:[],taken:[],score:0},
 {name:"BOT1",hand:[],taken:[],score:0},
 {name:"BOT2",hand:[],taken:[],score:0},
 {name:"BOT3",hand:[],taken:[],score:0}
];
let turn=0;
let lastTaker=null;
let selectedHand=null;
let selectedTable=[];
let totalRounds = 0;

/* ================= START ================= */
function startGame(){
    
 buildDeck();
 shuffle(deck);
 dealTable();
 dealHands();
 render();
 setTurn(0);
 logMessage("ابدأ اللعب! 🎲");
}

/* ================= DECK ================= */
function buildDeck(){
 deck=[];
 for(let s of suits)
  for(let r of ranks)
   deck.push({src:`img/PNG/${r.r}${s}.png`,v:r.v,r:r.r,suit:s});
}

function shuffle(a){
 for(let i=a.length-1;i>0;i--){
  let j=Math.floor(Math.random()*(i+1));
  [a[i],a[j]]=[a[j],a[i]];
 }
}

/* ================= DEAL ================= */
function dealTable(){
 table=[];
 for(let i=0;i<4;i++) table.push(deck.pop());
}

function dealHands(){
 players.forEach(p=>p.hand=[]);
 for(let r=0;r<3;r++)
  players.forEach(p=>{ if(deck.length) p.hand.push(deck.pop()); });
}

/* ================= TURN ================= */
function setTurn(t){
 turn=t;
 document.querySelectorAll(".player").forEach((p,i)=>{
  p.style.boxShadow = "";
  p.style.borderColor = "";
 });
 let playerEl = document.querySelector(`.player:nth-child(${t+1})`);
 if(playerEl){
  playerEl.style.boxShadow = `0 0 20px 5px ${playerColors[t]}`;
  playerEl.style.borderColor = playerColors[t];
 }
 if(turn!==0) setTimeout(botTurn, 1000 + Math.random()*2000);
}

/* ================= BUTTONS ================= */
const confirmBtn = document.getElementById("confirm-play");
const dropBtn = document.getElementById("drop-card");
confirmBtn.onclick = () => confirmPlay();
dropBtn.onclick = () => { if(selectedHand!==null) dropCardAnywhere(selectedHand); };

/* ================= HAND SELECTION ================= */
function selectHand(i){
  if(turn!==0 || !players[0].hand[i]) return;
  clearSelection(false);
  selectedHand=i;
  document.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected"));
  document.getElementById(`Ppos${i+1}`).classList.add("selected");
  highlightTableValid();
  updateActionButtons();
}

/* ================= TABLE SELECTION ================= */
function selectTable(idx){
  if(selectedHand===null) return;
  if(selectedTable.includes(idx)){
    selectedTable = selectedTable.filter(x=>x!==idx);
  } else {
    selectedTable.push(idx);
  }
  updateTableHighlight();
  updateActionButtons();
}

function updateTableHighlight(){
  if(selectedHand===null) return;
  let card = players[0].hand[selectedHand];
  let sum = selectedTable.reduce((s,i)=>s+table[i].v,0);
  table.forEach((c,i)=>{
    let img = document.getElementById(`pos${i+1}`);
    img.style.boxShadow = "";
    if(selectedTable.includes(i)){
      if(sum===card.v) img.style.boxShadow = "0 0 15px cyan";
      else img.style.boxShadow = "0 0 15px red";
    }
  });
}

/* ================= ENABLE/DISABLE BUTTONS ================= */
function updateActionButtons(){
  if(selectedHand===null){
    confirmBtn.disabled = true;
    dropBtn.disabled = true;
    return;
  }
  confirmBtn.disabled = selectedTable.length===0;
  dropBtn.disabled = false;
}

/* ================= CLEAR SELECTION ================= */
function clearSelection(clearHand=true){
  selectedTable=[];
  document.querySelectorAll(".table-selected").forEach(e=>e.classList.remove("table-selected"));
  table.forEach((c,i)=>document.getElementById(`pos${i+1}`).style.boxShadow="");
  if(clearHand){
    selectedHand=null;
    document.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected"));
  }
  updateActionButtons();
}

/* ================= CONFIRM PLAY ================= */
function confirmPlay(){
  if(selectedHand===null) return;
  let card = players[0].hand[selectedHand];
  let sum = selectedTable.reduce((s,i)=>s+table[i].v,0);

  if(selectedTable.length>0 && sum!==card.v){
    logMessage("اختيار خاطئ! 😅");
    playSound('sounds/error.mp3');
    selectedTable.forEach(i=>{
      let img = document.getElementById(`pos${i+1}`);
      img.style.boxShadow="0 0 15px red";
    });
    setTimeout(()=>updateTableHighlight(),400);
    return;
  }

  let taken = selectedTable.map(i=>table[i]);
  let sweep=false;
  if(taken.length === table.length) sweep=true;

  taken.forEach(c=>{
    let img = document.getElementById(`pos${table.indexOf(c)+1}`);
    animateCardMove(img, document.querySelector(".player.you"));
    table.splice(table.indexOf(c),1);
  });

  let handImg = document.getElementById(`Ppos${selectedHand+1}`);
  animateCardMove(handImg, document.querySelector(".player.you"));
  players[0].taken.push(card,...taken);
  players[0].hand[selectedHand] = null;
  lastTaker = players[0];

  playSound('sounds/pick.mp3');
  if(sweep) showSweep();

  logMessage(`YOU took ${taken.map(c=>c.r+c.suit).join(", ")||"nothing"} with ${card.r+card.suit}`);
  clearSelection();
  render();
  nextTurn();
}

/* ================= DROP CARD ================= */
function dropCardAnywhere(i){
  if(selectedHand===null) return;
  let card = players[0].hand[i];
  table.push(card);
  animateCardMove(document.getElementById(`Ppos${i+1}`),document.querySelector("section"));
  players[0].hand[i] = null;
  playSound('sounds/drop.mp3');
  logMessage(`YOU dropped ${card.r+card.suit}`);
  clearSelection();
  render();
  nextTurn();
}

/* ================= BOT TURN ================= */
function botTurn(){
  let p=players[turn];
  if(p.hand.every(c=>!c)){ nextTurn(); return; }
  let card = getBotCard(p);
  if(!card){ nextTurn(); return; }

  let caps = findCapture(card);
  let sweep=false;
  if(caps.length===table.length && caps.length>0) sweep=true;

  if(caps.length>0){
    caps.forEach(c=>table.splice(table.indexOf(c),1));
    p.taken.push(card,...caps);
    lastTaker=p;

    caps.forEach(c=>{
      let img = document.getElementById(`pos${table.indexOf(c)+1}`);
      animateCardMove(img, document.querySelector(`.player:nth-child(${turn+1})`));
    });
    animateCardMove(null, document.querySelector(`.player:nth-child(${turn+1})`));
    playSound('sounds/pick.mp3');

    logMessage(`${p.name} took ${caps.map(c=>c.r+c.suit).join(", ")} with ${card.r+card.suit}`);
    if(Math.random()<0.7){
      logMessage(`${p.name}: ${tunisianComments[Math.floor(Math.random()*tunisianComments.length)]}`);
    }
    if(sweep) showSweep();
  } else {
    table.push(card);
    animateCardMove(null, document.querySelector("section"));
    playSound('sounds/drop.mp3');
    logMessage(`${p.name} dropped ${card.r+card.suit}`);
  }
  p.hand[p.hand.indexOf(card)] = null;
  render();
  setTimeout(nextTurn, 600);
}

function getBotCard(p){
  let valid=p.hand.filter(c=>c);
  if(valid.length===0) return null;
  for(let c of valid) if(findCapture(c).length) return c;
  return valid.sort((a,b)=>a.v-b.v)[0];
}

function findCapture(card){
  let same = table.find(c=>c.v===card.v);
  if(same) return [same];
  let best=[];
  function dfs(sum,i,path){
    if(sum===card.v && path.length){ if(path.length>best.length) best=[...path]; return;}
    if(sum>card.v) return;
    for(let j=i;j<table.length;j++)
      dfs(sum+table[j].v,j+1,[...path,table[j]]);
  }
  dfs(0,0,[]);
  return best;
}

/* ================= NEXT TURN ================= */
function nextTurn(){
  if(turn<3) setTurn(turn+1);
  else{
    totalRounds++;
    if(players.every(p=>p.hand.every(c=>!c)) && deck.length){
      dealHands();
      render();
      setTurn(0);
    } else if(players.every(p=>p.hand.every(c=>!c)) && deck.length===0){
      if(table.length>0 && lastTaker){
        lastTaker.taken.push(...table);
        logMessage(`${lastTaker.name} takes remaining table cards!`);
        table=[];
      }
      endGame();
    } else setTurn(0);
  }
}

/* ================= END GAME ================= */
function endGame(){
  countScore();
  render();
  let winner = players.reduce((a,b)=>a.score>b.score?a:b);
  let scores = players.map(p=>`${p.name}: ${p.score}`).join(" | ");
  setTimeout(()=>{
    alert(`End of game!\nWinner: ${winner.name}\nScores: ${scores}`);
    startGame(); // restart on OK
  },200);
}

/* ================= SCORING ================= */
function countScore(){
  players.forEach(p=>{
    p.score=0;
    const taken=p.taken;

    // 7♦
    if(taken.some(c=>c.v===7 && c.suit==="D")) p.score++;

    // More than 20 cards
    if(taken.length>20) p.score++;

    // 3-4 sevens
    let sevens=taken.filter(c=>c.v===7).length;
    if(sevens>=3 && sevens<=4) p.score++;

    // 3-4 sixes
    let sixes=taken.filter(c=>c.v===6).length;
    if(sixes>=3 && sixes<=4) p.score++;

    // All cards of a suit
    for(let s of suits){
      let suitCards=ranks.map(r=>r.r+s);
      let hasAll = suitCards.every(rc=>taken.some(c=>c.r+c.suit===rc));
      if(hasAll) p.score++;
    }
  });
}

/* ================= UI RENDER ================= */
function render(){
  document.querySelectorAll(".pos img").forEach(p=>p.src="");

  table.forEach((c,i)=>{
    let img=document.getElementById(`pos${i+1}`);
    img.src=c.src;
    img.onclick=()=>{ if(turn===0 && selectedHand!==null) selectTable(i); };
  });

  players[0].hand.forEach((c,i)=>{
    let img=document.getElementById(`Ppos${i+1}`);
    img.src=c?c.src:"";
    img.style.cursor=c?"pointer":"default";
    img.onclick=()=>{ if(turn===0 && c) selectHand(i); };

    img.classList.remove("fan-left","fan-middle","fan-right");
    if(i===0) img.classList.add("fan-left");
    else if(i===1) img.classList.add("fan-middle");
    else if(i===2) img.classList.add("fan-right");
  });

  players.forEach((p,i)=>document.getElementById(`s${i}`).innerText=p.score);
  updateActionButtons();
}

/* ================= CARD ANIMATION ================= */
function animateCardMove(img,target){
  if(!img) return;
  let clone=img.cloneNode(true);
  clone.style.position="absolute";
  let rect=img.getBoundingClientRect();
  clone.style.left=rect.left+"px";
  clone.style.top=rect.top+"px";
  clone.style.width=img.width+"px";
  clone.style.height=img.height+"px";
  clone.style.zIndex=1000;
  document.body.appendChild(clone);

  setTimeout(()=>{
    if(target){
      let tRect=target.getBoundingClientRect();
      clone.style.left=tRect.left+"px";
      clone.style.top=tRect.top+"px";
      clone.style.transform="scale(0.3)";
    } else {
      clone.style.top="200px";
      clone.style.left="400px";
      clone.style.transform="scale(0.5)";
    }
  },10);

  setTimeout(()=>document.body.removeChild(clone),700);
}

/* ================= LOG ================= */
function logMessage(msg){
  let logPanel=document.getElementById("log-panel");
  if(!logPanel) return;
  let entry=document.createElement("div");
  entry.className="log-entry";
  entry.innerText=msg;
  logPanel.appendChild(entry);
  logPanel.scrollTop=logPanel.scrollHeight;
}

/* ================= HIGHLIGHT TABLE ================= */
function highlightTableValid(){
  if(selectedHand===null) return;
  let card=players[0].hand[selectedHand];
  table.forEach((c,i)=>{
    let img=document.getElementById(`pos${i+1}`);
    img.style.boxShadow=(c.v===card.v)?"0 0 15px cyan":"";
  });
}

/* ================= SHOW SWEEP ================= */
function showSweep(){
  playSound('sounds/sweep.mp3');
  const img=document.createElement("img");
  img.src="img/logo-chkobba.png";
  img.style.position="fixed";
  img.style.top="50%";
  img.style.left="50%";
  img.style.transform="translate(-50%,-50%)";
  img.style.width="300px";
  img.style.height="300px";
  img.style.zIndex=2000;
  document.body.appendChild(img);
  setTimeout(()=>document.body.removeChild(img),1500);
}

/* ================= PLAY SOUND ================= */
function playSound(file){
  const audio = new Audio(file);
  audio.play();
}
