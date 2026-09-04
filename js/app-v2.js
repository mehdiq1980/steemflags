import { FlagGame } from './game.js';
import { applyLanguage, getLanguage, t, setLanguage } from './i18n.js';
import { verifyPostingKey } from './steem-auth.js?v=20260904-login-fix-08';
import { saveGameResult } from './reward.js';
import { loadMenu } from './menu.js';

const API_BASE='https://steemflags.mehdiq.workers.dev';
const SESSION_KEY='steemFlagsAuthSession';
const REWARD_STATE_KEY='steemFlagsPendingRewards';
const $=id=>document.getElementById(id);
function pageUrl(path){return new URL(path,document.baseURI).href}
async function loadComponent(){const response=await fetch(pageUrl('./components/app-shell.html?v=20260904-component-fix-05'),{cache:'no-store'});if(!response.ok)throw Error(`Unable to load component: ${response.status}`);return response.text()}
async function loadAssetBar(){const mount=$('assetBarMount');if(!mount)return;const response=await fetch(pageUrl('./components/asset-bar.html?v=20260904-component-fix-05'),{cache:'no-store'});if(!response.ok)throw Error(`Unable to load asset bar: ${response.status}`);mount.innerHTML=await response.text()}
async function fetchAccount(username){const response=await fetch(`${API_BASE}/api/account?username=${encodeURIComponent(username)}`,{cache:'no-store'});if(!response.ok)throw Error(`ACCOUNT_API_${response.status}`);const data=await response.json();if(!data?.success||!data.account)throw Error('ACCOUNT_API_INVALID');return data.account}
async function fetchSteemBalance(username){const body=JSON.stringify({jsonrpc:'2.0',id:1,method:'condenser_api.get_accounts',params:[[username]]});try{const response=await fetch(`${API_BASE}/api/steem-rpc`,{method:'POST',headers:{'Content-Type':'application/json'},body,cache:'no-store'});if(!response.ok)return null;const data=await response.json(),balance=data?.result?.[0]?.balance;if(typeof balance==='string'&&/\d/.test(balance))return balance.replace(/\s*STEEM\s*$/i,'').trim()}catch{}return null}
function readSession(){try{const session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return session?.username||null}catch{return null}}
function writeSession(username){localStorage.setItem(SESSION_KEY,JSON.stringify({username}))}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function savedKey(username){return username?`steemFlagsGameState_${String(username).trim().toLowerCase()}`:null}
function getSavedGame(username){try{const key=savedKey(username);const raw=key?localStorage.getItem(key):null;return raw?JSON.parse(raw):null}catch{return null}}