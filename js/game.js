import { COUNTRIES } from '../data/countries.js';
const shuffle=items=>[...items].sort(()=>Math.random()-.5);
const SAVE_PREFIX='steemflagsGameState_';
const userKey=()=>{try{const s=JSON.parse(localStorage.getItem('steemFlagsAuthSession')||'null');return s?.username||localStorage.getItem('steemflags.username')||null}catch{return localStorage.getItem('steemflags.username')||null}};
export class FlagGame{
 constructor(onUpdate,totalQuestions=20){this.onUpdate=onUpdate;this.totalQuestions=totalQuestions;this.reset()}
 reset(){this.questionNumber=0;this.score=0;this.current=null;this.used=new Set();this.answered=false;this.completed=false}
 isComplete(){return this.completed}
 hasProgress(){return this.questionNumber>0&&!this.completed&&!!this.current}
 serialize(){return{questionNumber:this.questionNumber,score:this.score,current:this.current,used:[...this.used],answered:this.answered,completed:this.completed,totalQuestions:this.totalQuestions}}
 save(username=userKey()){if(!username||!this.hasProgress())return;try{localStorage.setItem(`${SAVE_PREFIX}${String(username).trim().toLowerCase()}`,JSON.stringify(this.serialize()))}catch(e){console.warn('Unable to save game progress',e)}}
 load(username=userKey()){if(!username)return null;try{const raw=localStorage.getItem(`${SAVE_PREFIX}${String(username).trim().toLowerCase()}`);return raw?JSON.parse(raw):null}catch{return null}}
 clearSaved(username=userKey()){if(username)try{localStorage.removeItem(`${SAVE_PREFIX}${String(username).trim().toLowerCase()}`)}catch{}}
 restore(snapshot){if(!snapshot||!snapshot.current||snapshot.completed)return false;this.questionNumber=Number(snapshot.questionNumber)||0;this.score=Number(snapshot.score)||0;this.current=snapshot.current;this.used=new Set(Array.isArray(snapshot.used)?snapshot.used:[]);this.completed=false;this.answered=Boolean(snapshot.answered);return this.hasProgress()}
 next(){if(this.isComplete()||(this.current&&!this.answered))return;let pool=COUNTRIES.filter(([name])=>!this.used.has(name));if(pool.length<4){this.used.clear();pool=COUNTRIES}const country=pool[Math.floor(Math.random()*pool.length)];this.used.add(country[0]);const wrong=shuffle(COUNTRIES.filter(([name])=>name!==country[0])).slice(0,3);this.current={country,options:shuffle([country,...wrong])};this.questionNumber+=1;this.answered=false;this.save();this.onUpdate(this.current,this.score,this.questionNumber)}
 answer(name){if(!this.current||this.answered||this.completed)return null;this.answered=true;const correct=name===this.current.country[0];this.score+=correct?1:-1;if(this.questionNumber>=this.totalQuestions)this.completed=true;this.save();if(this.completed)this.clearSaved();return{correct,answer:this.current.country[0],score:this.score,complete:this.completed}}
}