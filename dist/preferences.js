(function(root){
const key='lifeline-preferences-v1';
// Original quiet themes. No external recordings, tracking or requests.
const tracks=[
 {id:'morning',name:'Тихое утро',color:'sage',beat:600,chords:[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]],notes:[523.25,0,659.25,587.33,523.25,0,392,0,440,0,523.25,659.25,587.33,0,523.25,0]},
 {id:'rain',name:'После дождя',color:'blue',beat:720,chords:[[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,196,246.94]],notes:[440,0,523.25,0,659.25,587.33,523.25,0,349.23,0,440,523.25,493.88,0,392,0]},
 {id:'stars',name:'Звёздный вечер',color:'lilac',beat:800,chords:[[196,246.94,293.66],[164.81,196,246.94],[130.81,164.81,196],[146.83,185,220]],notes:[587.33,0,493.88,0,392,440,493.88,0,329.63,0,392,0,440,0,293.66,0]}
];
let prefs={music:false,musicTrack:0,dark:false};try{const saved=JSON.parse(localStorage.getItem(key));if(saved){prefs.music=saved.music===true;prefs.dark=saved.dark===true;prefs.musicTrack=Number.isInteger(saved.musicTrack)&&saved.musicTrack>=0&&saved.musicTrack<tracks.length?saved.musicTrack:0;}}catch{}
let context=null,timer=null,voices=[],step=0,generation=0;
function persist(){try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}}
function applyTheme(){document.documentElement.dataset.theme=prefs.dark?'dark':'light';}
function stop(){generation++;clearInterval(timer);timer=null;step=0;for(const voice of voices){try{voice.stop();voice.disconnect();}catch{}}voices=[];if(context?.state==='running')context.suspend();}
async function start(){if(!prefs.music||document.hidden||timer)return;const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;const token=generation;try{if(!context)context=new Audio();await context.resume();if(token!==generation||!prefs.music||document.hidden||timer)return;
 const track=tracks[prefs.musicTrack],beat=track.beat/1000;
 const note=(frequency,volume,attack,duration)=>{const now=context.currentTime,voice=context.createOscillator(),gain=context.createGain();voice.type='sine';voice.frequency.value=frequency;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+attack);gain.gain.linearRampToValueAtTime(volume*.55,now+duration*.6);gain.gain.linearRampToValueAtTime(0,now+duration);voice.connect(gain);gain.connect(context.destination);voices.push(voice);voice.onended=()=>{voice.disconnect();gain.disconnect();voices=voices.filter(v=>v!==voice);};voice.start(now);voice.stop(now+duration+.02);};
 const play=()=>{if(step%8===0)for(const frequency of track.chords[Math.floor(step/8)%track.chords.length])note(frequency,.005,.5,beat*7.7);const melody=track.notes[step%track.notes.length];if(melody)note(melody,.009,.015,beat*1.6);step++;};play();timer=setInterval(play,track.beat);
 }catch{if(token===generation)stop();}}
async function toggleMusic(){prefs.music=!prefs.music;persist();if(prefs.music)await start();else stop();return prefs.music;}
async function cycleMusic(){const next=prefs.music?prefs.musicTrack+1:0;stop();if(next>=tracks.length)prefs.music=false;else{prefs.music=true;prefs.musicTrack=next;}persist();if(prefs.music)await start();return {...prefs};}
function toggleTheme(){prefs.dark=!prefs.dark;applyTheme();persist();return prefs.dark;}
applyTheme();document.addEventListener('pointerdown',()=>{if(prefs.music)start();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(prefs.music&&context)start();});
root.LifePreferences={get:()=>({...prefs}),tracks:()=>tracks.map(({id,name,color})=>({id,name,color})),toggleMusic,cycleMusic,toggleTheme,audioState:()=>context?.state||'idle'};
})(window);
