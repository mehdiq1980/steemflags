import {COUNTRIES} from '../data/countries.js';

export class FlagGame{
 constructor(onUpdate){this.onUpdate=onUpdate;this.index=0;this.score=0;this.current=null}
 shuffle(a){return [...a].sort(()=>Math.random()-.5)}
 next(){const country=COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)];const wrong=this.shuffle(COUNTRIES.filter(c=>c[0]!==country[0])).slice(0,3);this.current={country,options:this.shuffle([country,...wrong])};this.onUpdate(this.current,this.score,this.index+1)}
 answer(name){if(!this.current)return null;const correct=name===this.current.country[0];this.score+=correct?1:-1;this.score=Math.max(0,this.score);const result={correct,answer:this.current.country[0],score:this.score};this.index++;return result}
}
