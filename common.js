import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {firebaseConfig} from "./config.js";
import {getAuth,onAuthStateChanged,signOut,sendEmailVerification} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);

export const DEV_EMAILS=['enoe.pro@gmail.com','enoe.theone@gmail.com','emile.glinche.49@gmail.com'];
export const AVATARS=[['♞','#c9974a'],['♛','#7fa072'],['♜','#5c84b0'],['♝','#b6584a'],['♚','#9c72b0'],['♟','#3fa79c']];
export const BOT_LEVELS=['','Très facile','Débutant','Facile','Moyen','Fort','Hardcore'];

export const $=id=>document.getElementById(id);
export const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const tcName=g=>g.tc_base>=3600?'1 heure':g.tc_base===60?'Bullet 1 min':g.tc_base===180?'Blitz 3+2':(g.tc_base/60)+' minutes';
export const fbErr=e=>({'auth/invalid-credential':'Email ou mot de passe incorrect.','auth/email-already-in-use':'Cet email a déjà un compte.','auth/weak-password':'Mot de passe trop court (6 caractères minimum).','auth/invalid-email':'Email invalide.','auth/requires-recent-login':'Reconnecte-toi puis réessaie, pour des raisons de sécurité.'}[e.code]||e.message);

export function avEl(i,dev){
  const e=document.createElement('span');
  if(dev){e.style.setProperty('--av','linear-gradient(155deg,#e8c869,#a9791f)');e.textContent='🏵️';return e}
  const[p,c]=AVATARS[i]||AVATARS[0];e.style.setProperty('--av',c);e.textContent=p;return e;
}

// Identifiants de période, pour les classements mensuel et hebdomadaire (semaine ISO)
export function monthKey(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
export function weekKey(d=new Date()){
  const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-day+3);
  const firstThu=new Date(Date.UTC(t.getUTCFullYear(),0,4));
  const wk=1+Math.round(((t-firstThu)/86400000-3+((firstThu.getUTCDay()+6)%7))/7);
  return t.getUTCFullYear()+'-S'+String(wk).padStart(2,'0');
}

export function qrImg(data,size=200){
  const img=document.createElement('img');
  img.src=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  img.width=size;img.height=size;img.alt='QR code';img.style.background='#fff';img.style.borderRadius='8px';img.style.padding='6px';
  return img;
}

const PIECE_FR={N:'Cavalier',B:'Fou',R:'Tour',Q:'Dame',K:'Roi'};
export function frMove(san){
  const mate=san.includes('#'),check=!mate&&san.includes('+');
  const s=san.replace(/[+#]/,'');
  if(s==='O-O'||s==='O-O-O')
    return (s==='O-O'?'Petit roque':'Grand roque')+(mate?' — échec et mat !':check?' — échec':'');
  let piece='Pion',rest=s;
  if(/^[NBRQK]/.test(s)){piece=PIECE_FR[s[0]];rest=s.slice(1)}
  let promo='';
  const pm=rest.match(/=([NBRQ])$/);
  if(pm){promo=' puis promu en '+PIECE_FR[pm[1]].toLowerCase();rest=rest.slice(0,pm.index)}
  const capture=rest.includes('x');
  rest=rest.replace('x','');
  const dest=rest.slice(-2);
  return piece+(capture?' prend en ':' en ')+dest+promo+(mate?' — échec et mat !':check?' — échec':'');
}

const profs={};
export function ensureProfile(u,name){
  return profs[u.uid]||(profs[u.uid]=(async()=>{
    const r=doc(db,'users',u.uid),s=await getDoc(r);
    const isDev=DEV_EMAILS.includes((u.email||'').toLowerCase());
    if(s.exists()){
      const d=s.data(),patch={};
      if(isDev&&!d.dev)patch.dev=true;
      if(u.email&&d.email!==u.email)patch.email=u.email;
      if(Object.keys(patch).length){try{await updateDoc(r,patch)}catch(e){}Object.assign(d,patch)}
      return d;
    }
    const nm=name||u.displayName||u.email.split('@')[0];
    for(let i=0;i<40;i++){
      const code=String(Math.floor(Math.random()*10000)).padStart(4,'0');
      try{await setDoc(doc(db,'codes',code),{uid:u.uid})}catch(e){continue}   // refusé si le code existe déjà
      const p={name:nm,code,email:u.email||'',wins:0,losses:0,draws:0,played:0,
        weekKey:weekKey(),weekWins:0,weekPlayed:0,monthKey:monthKey(),monthWins:0,monthPlayed:0,
        avatar:0,dev:isDev,bio:'',deleted:false};
      await setDoc(r,p);
      const isPasswordAccount=u.providerData.some(pr=>pr.providerId==='password');
      if(isPasswordAccount&&u.email)sendEmailVerification(u).catch(()=>{});   // email saisi à la main : on confirme
      return p;
    }
    throw new Error('plus de code libre');
  })());
}

let presenceTimer=null;
export function startPresence(uid){
  const beat=()=>updateDoc(doc(db,'users',uid),{lastSeen:Date.now()}).catch(()=>{});
  beat();presenceTimer=setInterval(beat,25000);
}
export function stopPresence(){if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}}

// En-tête commun à toutes les pages : pseudo, avatar, déconnexion, garde-fou (compte banni, page réservée aux devs)
export function initAuthGuard({devOnly=false,isLoginPage=false,onLoggedOut,onReady}={}){
  onAuthStateChanged(auth,async u=>{
    stopPresence();
    if(!u){
      if(isLoginPage){if(onLoggedOut)onLoggedOut()}else location.href='index.html';
      return;
    }
    let p;
    try{p=await ensureProfile(u)}catch(e){alert('Erreur de profil : '+e.message);return}
    if(p.banned){alert('Ton compte a été banni.');await signOut(auth);return}
    if(devOnly&&!p.dev){location.href='index.html';return}
    const me={id:u.uid,name:p.name,code:p.code,avatar:p.avatar||0,dev:!!p.dev,bio:p.bio||'',fbUser:u};
    startPresence(me.id);
    if($('whoname')){
      $('whoname').textContent=me.name+(me.dev?' 🏵️':'');
      $('avbtn').innerHTML='';$('avbtn').appendChild(avEl(me.avatar,me.dev));
      $('avbtn').onclick=()=>location.href='profile.html';
      $('out').onclick=()=>signOut(auth);
      $('who').hidden=false;
      if($('admintab'))$('admintab').hidden=!me.dev;
    }
    onReady(me,p);
  });
}
