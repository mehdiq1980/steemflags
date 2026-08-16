const KEY='steemflags.state.v2';
const defaults={sf:0,energy:3,lastEnergyDay:null};
export function loadState(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
export function saveState(state){localStorage.setItem(KEY,JSON.stringify(state))}
export function resetState(){localStorage.removeItem(KEY);return {...defaults}}
export function refreshDailyEnergy(state){const day=new Date().toISOString().slice(0,10);if(state.lastEnergyDay!==day){state.energy=3;state.lastEnergyDay=day;saveState(state)}return state}
