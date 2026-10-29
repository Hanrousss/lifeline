(function(root){
const key='lifeline-preferences-v1';let prefs={music:false,dark:false};try{const saved=JSON.parse(localStorage.getItem(key));if(saved){prefs.music=saved.music===true;prefs.dark=saved.dark===true;}}catch{}
let context=null,timer=null,voices=[],step=0;
function persist(){try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}}
function applyTheme(){document.documentElement.dataset.theme=prefs.dark?'dark':'light';}
function stop(){clearInterval(timer);timer=null;for(const voice of voices){try{voice.stop();voice.disconnect();}catch{}}voices=[];if(context?.state==='running')context.suspend();}
async function start(){if(!prefs.music||document.hidden||timer)return;const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;try{if(!context)context=new Audio();await context.resume();if(!prefs.music||document.hidden||timer)return;const chords=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];const play=()=>{const now=context.currentTime;for(const frequency of chords[step++%chords.length]){const voice=context.createOscillator(),gain=context.createGain();voice.type='sine';voice.frequency.value=frequency;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.008,now+.7);gain.gain.linearRampToValueAtTime(.005,now+3.6);gain.gain.linearRampToValueAtTime(0,now+4.7);voice.connect(gain);gain.connect(context.destination);voices.push(voice);voice.onended=()=>{voice.disconnect();gain.disconnect();voices=voices.filter(v=>v!==voice);};voice.start(now);voice.stop(now+4.8);}};play();timer=setInterval(play,4800);}catch{stop();}}
async function toggleMusic(){prefs.music=!prefs.music;persist();if(prefs.music)await start();else stop();return prefs.music;}
function toggleTheme(){prefs.dark=!prefs.dark;applyTheme();persist();return prefs.dark;}
applyTheme();document.addEventListener('pointerdown',()=>{if(prefs.music)start();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(prefs.music&&context)start();});
root.LifePreferences={get:()=>({...prefs}),toggleMusic,toggleTheme,audioState:()=>context?.state||'idle'};
})(window);
