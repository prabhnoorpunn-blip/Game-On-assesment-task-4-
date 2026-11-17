

const c=document.getElementById("game"),ctx=c.getContext("2d");
let players=[],enemies=[],gems=[],level=1,score=0,mode=1,playing=false;
let keys={},power=0,audio,musicTimer;
const notes=[262,330,392,523,392,330,294,440];
let beat=0;

function sound(f){
 let o=audio.createOscillator(),g=audio.createGain();
 o.frequency.value=f;o.connect(g);g.connect(audio.destination);
 g.gain.value=.08;o.start();
 g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);
 o.stop(audio.currentTime+.2);
}

function music(){
 if(musicTimer)clearInterval(musicTimer);
 musicTimer=setInterval(()=>{
 if(!playing)return;
 let o=audio.createOscillator(),g=audio.createGain();
 o.type="triangle";o.frequency.value=notes[beat%8];
 g.gain.value=.025;o.connect(g);g.connect(audio.destination);
 o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);
 o.stop(audio.currentTime+.3);beat++;
 },300);
}

function start(n){
 mode=n;level=1;score=0;playing=true;power=0;
 document.getElementById("menu").style.display="none";
 document.getElementById("end").innerHTML="";
 audio=audio||new(window.AudioContext||window.webkitAudioContext)();
 audio.resume();beat=0;music();
 players=[{x:100,y:250,lives:3,color:"#00ffff",shield:0,hit:0}];
 if(n===2)players.push({x:150,y:250,lives:3,color:"#ff00cc",shield:0,hit:0});
 setup();loop();
}

function setup(){
 let target=level*3+2;
 gems=Array.from({length:target},()=>({x:30+Math.random()*730,y:40+Math.random()*420}));
 enemies=Array.from({length:level+2},()=>({x:100+Math.random()*600,y:50+Math.random()*400,dx:2+level}));
 players.forEach(p=>{p.x=100;p.y=250});
 document.getElementById("info").innerText="LEVEL "+level+" | COLLECT "+target+" CRYSTALS";
}

onkeydown=e=>{keys[e.key.toLowerCase()]=true;if(e.key.startsWith("Arrow")||e.key===" ")e.preventDefault()};
onkeyup=e=>keys[e.key.toLowerCase()]=false;

function loop(){
 if(!playing)return;
 ctx.clearRect(0,0,800,500);
 ctx.fillStyle="#151535";ctx.fillRect(0,0,800,500);
 ctx.fillStyle="#29295a";
 for(let x=0;x<800;x+=40)for(let y=0;y<500;y+=40)ctx.fillRect(x,y,2,2);

 enemies.forEach(e=>{
 e.x+=e.dx;if(e.x<10||e.x>770)e.dx*=-1;
 ctx.fillStyle="#ff3344";ctx.shadowColor="red";ctx.shadowBlur=15;
 ctx.fillRect(e.x,e.y,22,22);ctx.shadowBlur=0;
 });

 gems.forEach(g=>{
 ctx.fillStyle="#ffff00";ctx.shadowColor="yellow";ctx.shadowBlur=18;
 ctx.beginPath();ctx.arc(g.x,g.y,8,0,7);ctx.fill();ctx.shadowBlur=0;
 });

 players.forEach((p,i)=>{
 let up=i?"arrowup":"w",down=i?"arrowdown":"s";
 let left=i?"arrowleft":"a",right=i?"arrowright":"d";
 let special=i?"enter":" ";
 if(keys[up])p.y-=4;if(keys[down])p.y+=4;
 if(keys[left])p.x-=4;if(keys[right])p.x+=4;
 p.x=Math.max(12,Math.min(788,p.x));
 p.y=Math.max(12,Math.min(488,p.y));
 if(keys[special]&&p.shield<=0){p.shield=180;sound(700)}
 if(p.shield>0)p.shield--;
 if(p.hit>0)p.hit--;

 ctx.fillStyle=p.color;ctx.shadowColor=p.color;
 ctx.shadowBlur=p.shield>0?30:15;
 ctx.beginPath();ctx.arc(p.x,p.y,13,0,7);ctx.fill();
 ctx.shadowBlur=0;

 if(p.shield>0){
 ctx.strokeStyle="#ffff00";ctx.lineWidth=3;
 ctx.beginPath();ctx.arc(p.x,p.y,22,0,7);ctx.stroke();
 }

 gems=gems.filter(g=>{
 if(Math.hypot(p.x-g.x,p.y-g.y)<23){
 score+=10;sound(900);return false;
 }return true;
 });

 enemies.forEach(e=>{
 if(Math.hypot(p.x-e.x-11,p.y-e.y-11)<25&&p.shield<=0&&p.hit<=0){
 p.lives--;p.hit=90;p.x=100;p.y=250;sound(150);
 }
 });
 });

 ctx.fillStyle="white";ctx.font="18px Arial";
 ctx.fillText("SCORE: "+score+" | "+players.map((p,i)=>"P"+(i+1)+": "+p.lives+" lives").join(" | "),15,25);

 if(players.every(p=>p.lives<=0)){finish("GAME OVER!");return}
 if(gems.length===0){
 level++;
 if(level>3){finish("🏆 YOU WIN! SCORE: "+score);return}
 setup();
 }
 requestAnimationFrame(loop);
}

function finish(msg){
 playing=false;clearInterval(musicTimer);
 document.getElementById("end").innerHTML=
 "<h1>"+msg+"</h1><button onclick='start(mode)'>PLAY AGAIN</button><button onclick='location.reload()'>HOME</button>";
}
