(function(root){
const key='lifeline-preferences-v1';
// Three original compositions followed by continuous brown noise.
const tracks=[
 {id:'morning',name:'Солнечный вальс',color:'sage',beat:250,bar:6,wave:'triangle',chordWave:'sine',chordVolume:.014,melodyVolume:.045,chords:[[261.63,329.63,392],[220,261.63,349.23],[174.61,261.63,349.23],[196,293.66,392]],notes:[523.25,659.25,783.99,0,659.25,587.33,523.25,0,440,523.25,698.46,659.25,587.33,523.25,440,0,349.23,440,523.25,587.33,659.25,0,587.33,493.88]},
 {id:'rain',name:'Городская прогулка',color:'blue',beat:180,bar:8,wave:'square',chordWave:'triangle',chordVolume:.012,melodyVolume:.022,chords:[[293.66,369.99,440],[329.63,415.30,493.88],[246.94,293.66,369.99],[220,277.18,329.63]],notes:[587.33,0,739.99,880,0,739.99,587.33,493.88,659.25,830.61,0,987.77,830.61,0,659.25,0,493.88,587.33,739.99,0,587.33,493.88,440,0,554.37,659.25,0,880,659.25,554.37,440,0]},
 {id:'melancholy',name:'Тихая грусть',color:'lilac',beat:570,bar:8,wave:'triangle',chordWave:'sine',chordVolume:.014,melodyVolume:.035,chords:[[220,261.63,329.63],[174.61,220,261.63],[130.81,164.81,196],[164.81,207.65,246.94]],notes:[440,0,523.25,493.88,440,329.63,0,0,349.23,0,440,392,349.23,261.63,0,0,329.63,392,0,523.25,493.88,392,329.63,0,415.30,0,493.88,440,415.30,329.63,0,0]},
 {id:'brown',name:'Коричневый шум',color:'brown',noise:true}

];
let prefs={music:false,musicTrack:0,dark:false};try{const saved=JSON.parse(localStorage.getItem(key));if(saved){prefs.music=saved.music===true;prefs.dark=saved.dark===true;prefs.musicTrack=Number.isInteger(saved.musicTrack)&&saved.musicTrack>=0&&saved.musicTrack<tracks.length?saved.musicTrack:0;}}catch{}
let context=null,timer=null,voices=[],step=0,generation=0,noiseSource=null;
function persist(){try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}}
function applyTheme(){document.documentElement.dataset.theme=prefs.dark?'dark':'light';}
function stop(suspend=true){generation++;noiseSource=null;clearInterval(timer);timer=null;step=0;for(const voice of voices){try{voice.stop();voice.disconnect();}catch{}}voices=[];if(suspend&&context?.state==='running')return context.suspend();return Promise.resolve();}
async function start(){if(!prefs.music||document.hidden||timer||noiseSource)return;const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;const token=generation;try{if(!context)context=new Audio();await context.resume();if(token!==generation||!prefs.music||document.hidden||timer||noiseSource)return;
 const track=tracks[prefs.musicTrack];
 if(track.noise){
  const rate=context.sampleRate,length=rate*12,buffer=context.createBuffer(1,length,rate),data=buffer.getChannelData(0);let last=0,total=0;
  for(let i=0;i<length;i++){last=(last+.02*(Math.random()*2-1))/1.02;data[i]=last;total+=last;}
  const mean=total/length;let energy=0;for(let i=0;i<length;i++){data[i]-=mean;energy+=data[i]*data[i];}const scale=.12/Math.max(.001,Math.sqrt(energy/length));for(let i=0;i<length;i++)data[i]*=scale;
  // Blend the seam so the looping texture does not click.
  const fade=Math.floor(rate*.1);for(let i=0;i<fade;i++){const t=i/fade;data[length-fade+i]=data[length-fade+i]*(1-t)+data[i]*t;}
  const voice=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();voice.buffer=buffer;voice.loop=true;voice.loopStart=.1;voice.loopEnd=12;filter.type='highpass';filter.frequency.value=30;gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(.35,context.currentTime+.25);voice.connect(filter);filter.connect(gain);gain.connect(context.destination);voice.onended=()=>{voice.disconnect();filter.disconnect();gain.disconnect();voices=voices.filter(v=>v!==voice);if(noiseSource===voice)noiseSource=null;};voices.push(voice);noiseSource=voice;voice.start();return;
 }
 const beat=track.beat/1000;
 const note=(frequency,volume,attack,duration,wave='sine')=>{const now=context.currentTime,voice=context.createOscillator(),gain=context.createGain();voice.type=wave;voice.frequency.value=frequency;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+attack);gain.gain.linearRampToValueAtTime(volume*.4,now+Math.max(attack,duration*.45));gain.gain.linearRampToValueAtTime(0,now+duration);voice.connect(gain);gain.connect(context.destination);voices.push(voice);voice.onended=()=>{voice.disconnect();gain.disconnect();voices=voices.filter(v=>v!==voice);};voice.start(now);voice.stop(now+duration+.02);};
 const play=()=>{const chord=track.chords[Math.floor(step/track.bar)%track.chords.length];
  if(step%track.bar===0)for(const frequency of chord)note(frequency,track.chordVolume,track.id==='stars'?.4:.015,beat*(track.id==='stars'?7.8:track.bar*.75),track.chordWave);
  const melody=track.notes[step%track.notes.length];if(melody){note(melody,track.melodyVolume,.008,beat*(track.id==='stars'?3:1.25),track.wave);if(track.id==='stars')note(melody*2,.009,.005,beat*1.8);}
  if(track.id==='morning'&&step%6===0)note(chord[0]/2,.03,.01,beat*2,'triangle');
  if(track.id==='rain'){if(step%4===0)note(chord[0]/2,.035,.005,beat*1.6,'triangle');if(step%4===2)note(110,.016,.003,.065,'triangle');}
  step++;};play();timer=setInterval(play,track.beat);
 }catch{if(token===generation)await stop();}}
function resetMusic(){prefs.music=false;prefs.musicTrack=0;persist();return stop();}
async function toggleMusic(){prefs.music=!prefs.music;persist();if(prefs.music)await start();else await stop();return prefs.music;}
async function cycleMusic(){const next=prefs.music?prefs.musicTrack+1:0;stop(false);if(next>=tracks.length)prefs.music=false;else{prefs.music=true;prefs.musicTrack=next;}persist();if(prefs.music)await start();else await stop();return {...prefs};}

async function playClick(){
 if(!prefs.music||document.hidden)return false;
 const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return false;
 const token=generation;
 try{if(!context)context=new Audio();await context.resume();if(token!==generation||!prefs.music||document.hidden)return false;
  const now=context.currentTime;
  for(const [frequency,volume,duration,type]of [[620,.045,.045,'triangle'],[170,.026,.035,'sine']]){
   const voice=context.createOscillator(),gain=context.createGain();voice.type=type;voice.frequency.value=frequency;
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.002);gain.gain.linearRampToValueAtTime(0,now+duration);
   voice.connect(gain);gain.connect(context.destination);voices.push(voice);
   voice.onended=()=>{voice.disconnect();gain.disconnect();voices=voices.filter(v=>v!==voice);};voice.start(now);voice.stop(now+duration+.005);
  }return true;
 }catch{return false;}
}

function toggleTheme(){prefs.dark=!prefs.dark;applyTheme();persist();return prefs.dark;}
applyTheme();document.addEventListener('pointerdown',()=>{if(prefs.music)start();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(prefs.music&&context)start();});
document.addEventListener('click',event=>{const button=event.target?.closest?.('.scene-player .player-action');if(button&&!button.disabled&&!button.closest('[inert]'))playClick();});
root.LifePreferences={get:()=>({...prefs}),tracks:()=>tracks.map(({id,name,color})=>({id,name,color})),toggleMusic,cycleMusic,resetMusic,toggleTheme,playClick,audioState:()=>context?.state||'idle'};
})(window);
