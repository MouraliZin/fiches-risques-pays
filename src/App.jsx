import { useState, useEffect } from "react";
import { LOGO_IDEA } from "./logoData.js";

/* ────────────────────────────────────────────────────────────────────────────
   FICHES RISQUES PAYS — IDEA Consult International
   Charte v3 : navy #012269 · blue #1f49b8 / #2f63e0 · rouge alerte #E1121A
   Space Grotesk (corps) + JetBrains Mono (technique)
   ──────────────────────────────────────────────────────────────────────────── */

// ── EMAILJS (chargé depuis CDN) ────────────────────────────────────────────
const EMAILJS_SERVICE  = "service_1nptrap";
const EMAILJS_TEMPLATE = "template_itawhcd";
const EMAILJS_KEY      = "RIR2Ybm-QbFnwJtMP";

// ── CHARTE VISUELLE v3 ──────────────────────────────────────────────────────
const C = {
  navy: "#012269", blue: "#1f49b8", blueLt: "#2f63e0", red: "#E1121A",
  bg: "#F5F7FB", card: "#FFFFFF", line: "#E4E8F1", ink: "#0E1726", inkSoft: "#5A6680",
  eleve:  { bg: "#FCEBEC", fg: "#A11722", dot: "#E1121A", bd: "#F3B7BC" },
  modere: { bg: "#FFF4DC", fg: "#7A5200", dot: "#F0A800", bd: "#F5D98A" },
  faible: { bg: "#E7F4E4", fg: "#2F6B1E", dot: "#5FA945", bd: "#BFE0B2" },
};
const RISK_LABEL = { eleve: "Risque élevé", modere: "Vigilance renforcée", faible: "Risque faible" };
const FONT_BODY = "'Space Grotesk', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const ALL_AFRICA=[
  {id:"DZ",name:"Algérie",      region:"Afrique du Nord",    risk:"modere",flag:"🇩🇿"},
  {id:"AO",name:"Angola",       region:"Afrique Australe",   risk:"modere",flag:"🇦🇴"},
  {id:"BJ",name:"Bénin",        region:"Afrique de l'Ouest", risk:"modere",flag:"🇧🇯"},
  {id:"BW",name:"Botswana",     region:"Afrique Australe",   risk:"faible",flag:"🇧🇼"},
  {id:"BF",name:"Burkina Faso", region:"Afrique de l'Ouest", risk:"eleve", flag:"🇧🇫"},
  {id:"BI",name:"Burundi",      region:"Afrique de l'Est",   risk:"eleve", flag:"🇧🇮"},
  {id:"CM",name:"Cameroun",     region:"Afrique Centrale",   risk:"modere",flag:"🇨🇲"},
  {id:"CV",name:"Cap-Vert",     region:"Afrique de l'Ouest", risk:"faible",flag:"🇨🇻"},
  {id:"CF",name:"Centrafrique", region:"Afrique Centrale",   risk:"eleve", flag:"🇨🇫"},
  {id:"KM",name:"Comores",      region:"Afrique de l'Est",   risk:"modere",flag:"🇰🇲"},
  {id:"CG",name:"Congo",        region:"Afrique Centrale",   risk:"modere",flag:"🇨🇬"},
  {id:"CD",name:"Congo RDC",    region:"Afrique Centrale",   risk:"eleve", flag:"🇨🇩"},
  {id:"CI",name:"Côte d'Ivoire",region:"Afrique de l'Ouest", risk:"modere",flag:"🇨🇮"},
  {id:"DJ",name:"Djibouti",     region:"Afrique de l'Est",   risk:"modere",flag:"🇩🇯"},
  {id:"EG",name:"Égypte",       region:"Afrique du Nord",    risk:"modere",flag:"🇪🇬"},
  {id:"ER",name:"Érythrée",     region:"Afrique de l'Est",   risk:"eleve", flag:"🇪🇷"},
  {id:"SZ",name:"Eswatini",     region:"Afrique Australe",   risk:"modere",flag:"🇸🇿"},
  {id:"ET",name:"Éthiopie",     region:"Afrique de l'Est",   risk:"eleve", flag:"🇪🇹"},
  {id:"GA",name:"Gabon",        region:"Afrique Centrale",   risk:"modere",flag:"🇬🇦"},
  {id:"GM",name:"Gambie",       region:"Afrique de l'Ouest", risk:"modere",flag:"🇬🇲"},
  {id:"GH",name:"Ghana",        region:"Afrique de l'Ouest", risk:"faible",flag:"🇬🇭"},
  {id:"GN",name:"Guinée",       region:"Afrique de l'Ouest", risk:"eleve", flag:"🇬🇳"},
  {id:"GQ",name:"Guinée Éq.",   region:"Afrique Centrale",   risk:"modere",flag:"🇬🇶"},
  {id:"GW",name:"Guinée-Bissau",region:"Afrique de l'Ouest", risk:"eleve", flag:"🇬🇼"},
  {id:"KE",name:"Kenya",        region:"Afrique de l'Est",   risk:"modere",flag:"🇰🇪"},
  {id:"LS",name:"Lesotho",      region:"Afrique Australe",   risk:"modere",flag:"🇱🇸"},
  {id:"LR",name:"Libéria",      region:"Afrique de l'Ouest", risk:"modere",flag:"🇱🇷"},
  {id:"LY",name:"Libye",        region:"Afrique du Nord",    risk:"eleve", flag:"🇱🇾"},
  {id:"MG",name:"Madagascar",   region:"Afrique de l'Est",   risk:"modere",flag:"🇲🇬"},
  {id:"MW",name:"Malawi",       region:"Afrique Australe",   risk:"modere",flag:"🇲🇼"},
  {id:"ML",name:"Mali",         region:"Afrique de l'Ouest", risk:"eleve", flag:"🇲🇱"},
  {id:"MA",name:"Maroc",        region:"Afrique du Nord",    risk:"faible",flag:"🇲🇦"},
  {id:"MR",name:"Mauritanie",   region:"Afrique de l'Ouest", risk:"eleve", flag:"🇲🇷"},
  {id:"MU",name:"Maurice",      region:"Afrique de l'Est",   risk:"faible",flag:"🇲🇺"},
  {id:"MZ",name:"Mozambique",   region:"Afrique Australe",   risk:"eleve", flag:"🇲🇿"},
  {id:"NA",name:"Namibie",      region:"Afrique Australe",   risk:"faible",flag:"🇳🇦"},
  {id:"NE",name:"Niger",        region:"Afrique de l'Ouest", risk:"eleve", flag:"🇳🇪"},
  {id:"NG",name:"Nigéria",      region:"Afrique de l'Ouest", risk:"eleve", flag:"🇳🇬"},
  {id:"UG",name:"Ouganda",      region:"Afrique de l'Est",   risk:"modere",flag:"🇺🇬"},
  {id:"RW",name:"Rwanda",       region:"Afrique de l'Est",   risk:"faible",flag:"🇷🇼"},
  {id:"ST",name:"São Tomé",     region:"Afrique Centrale",   risk:"faible",flag:"🇸🇹"},
  {id:"SN",name:"Sénégal",      region:"Afrique de l'Ouest", risk:"faible",flag:"🇸🇳"},
  {id:"SL",name:"Sierra Leone", region:"Afrique de l'Ouest", risk:"modere",flag:"🇸🇱"},
  {id:"SO",name:"Somalie",      region:"Afrique de l'Est",   risk:"eleve", flag:"🇸🇴"},
  {id:"SD",name:"Soudan",       region:"Afrique du Nord",    risk:"eleve", flag:"🇸🇩"},
  {id:"SS",name:"Soudan du Sud",region:"Afrique de l'Est",   risk:"eleve", flag:"🇸🇸"},
  {id:"TZ",name:"Tanzanie",     region:"Afrique de l'Est",   risk:"faible",flag:"🇹🇿"},
  {id:"TD",name:"Tchad",        region:"Afrique Centrale",   risk:"eleve", flag:"🇹🇩"},
  {id:"TG",name:"Togo",         region:"Afrique de l'Ouest", risk:"modere",flag:"🇹🇬"},
  {id:"TN",name:"Tunisie",      region:"Afrique du Nord",    risk:"modere",flag:"🇹🇳"},
  {id:"ZA",name:"Afrique du Sud",region:"Afrique Australe",  risk:"modere",flag:"🇿🇦"},
  {id:"ZM",name:"Zambie",       region:"Afrique Australe",   risk:"faible",flag:"🇿🇲"},
  {id:"ZW",name:"Zimbabwe",     region:"Afrique Australe",   risk:"modere",flag:"🇿🇼"},
].map((c,i)=>({...c,seq:i+1}));

function fmtRef(c,v){return `FRP-${String(c.seq).padStart(3,"0")}-${c.id}-V${v}`;}
function genCode(){return String(Math.floor(100000+Math.random()*900000));}

// Chargement EmailJS depuis CDN
if(typeof window!=="undefined"&&!window.emailjs){
  const s=document.createElement("script");
  s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  s.onload=()=>window.emailjs.init(EMAILJS_KEY);
  document.head.appendChild(s);
}

// ── VRAIES COORDONNÉES SVG AFRIQUE (projection Mercator simplifiée 500x580) ──
const COUNTRY_PATHS = {
  MA:"M 118 58 L 148 52 L 158 68 L 150 88 L 128 95 L 108 88 L 105 72 Z",
  DZ:"M 148 52 L 210 48 L 225 62 L 220 105 L 180 118 L 158 108 L 150 88 L 158 68 Z",
  TN:"M 210 48 L 228 44 L 235 58 L 228 75 L 215 75 L 210 62 Z",
  LY:"M 228 44 L 295 42 L 300 58 L 290 108 L 248 115 L 225 105 L 220 75 L 228 58 Z",
  EG:"M 295 42 L 338 40 L 345 55 L 340 95 L 310 100 L 295 88 L 290 62 Z",
  MR:"M 78 95 L 128 95 L 148 110 L 140 148 L 105 155 L 72 148 L 68 118 Z",
  ML:"M 148 88 L 220 82 L 228 115 L 205 148 L 168 155 L 140 148 L 148 110 L 140 95 Z",
  NE:"M 220 82 L 285 78 L 295 92 L 290 130 L 248 138 L 220 128 L 220 105 L 228 115 Z",
  SD:"M 295 88 L 345 88 L 358 105 L 355 158 L 318 162 L 295 148 L 288 128 L 290 100 Z",
  SN:"M 68 148 L 105 145 L 110 158 L 98 168 L 72 168 L 65 158 Z",
  GM:"M 78 155 L 105 152 L 108 160 L 78 162 Z",
  GW:"M 68 162 L 90 158 L 95 172 L 72 175 Z",
  GN:"M 88 168 L 118 162 L 128 175 L 122 192 L 98 195 L 85 182 Z",
  SL:"M 85 192 L 105 188 L 108 205 L 92 208 Z",
  LR:"M 98 195 L 125 190 L 130 208 L 112 218 L 95 210 Z",
  CI:"M 118 175 L 155 170 L 162 188 L 158 210 L 128 215 L 110 205 L 118 188 Z",
  GH:"M 155 168 L 178 165 L 182 185 L 178 212 L 155 215 L 148 195 L 155 178 Z",
  TG:"M 178 162 L 190 160 L 192 185 L 185 212 L 175 210 L 178 188 Z",
  BJ:"M 188 158 L 202 155 L 205 175 L 200 205 L 188 208 L 188 185 Z",
  NG:"M 200 118 L 245 115 L 258 128 L 255 165 L 228 175 L 202 172 L 198 148 L 200 130 Z",
  BF:"M 148 138 L 195 132 L 200 148 L 192 162 L 162 165 L 148 155 Z",
  CF:"M 248 138 L 300 132 L 312 148 L 308 172 L 275 180 L 248 175 L 240 158 L 245 142 Z",
  CM:"M 218 165 L 248 158 L 258 175 L 252 205 L 228 215 L 210 205 L 205 185 L 210 172 Z",
  TD:"M 245 105 L 295 100 L 305 115 L 298 148 L 268 152 L 245 142 L 242 122 Z",
  ER:"M 345 120 L 368 112 L 375 128 L 362 142 L 345 138 Z",
  ET:"M 340 135 L 375 125 L 395 138 L 392 168 L 365 178 L 338 168 L 335 150 Z",
  DJ:"M 375 128 L 390 125 L 392 138 L 378 140 Z",
  SO:"M 388 135 L 415 128 L 425 145 L 410 185 L 385 195 L 368 178 L 375 155 L 385 142 Z",
  SS:"M 298 155 L 338 150 L 345 168 L 338 192 L 308 195 L 290 178 L 292 162 Z",
  UG:"M 338 190 L 358 185 L 362 202 L 348 215 L 330 210 L 328 196 Z",
  KE:"M 358 162 L 390 158 L 398 175 L 390 210 L 362 218 L 348 205 L 348 185 L 358 172 Z",
  RW:"M 330 205 L 345 202 L 348 215 L 335 220 Z",
  BI:"M 328 215 L 345 212 L 348 228 L 332 232 Z",
  CD:"M 248 172 L 310 168 L 322 185 L 320 248 L 285 262 L 252 255 L 238 232 L 235 205 L 242 185 Z",
  CG:"M 228 210 L 255 205 L 265 222 L 258 248 L 232 252 L 220 235 L 222 218 Z",
  GA:"M 208 205 L 232 202 L 240 218 L 235 242 L 212 245 L 202 228 Z",
  GQ:"M 205 198 L 222 195 L 225 208 L 208 210 Z",
  ST:"M 198 218 L 205 215 L 206 224 L 198 225 Z",
  AO:"M 235 248 L 290 242 L 298 258 L 295 308 L 262 318 L 235 312 L 225 285 L 228 260 Z",
  ZM:"M 285 260 L 335 255 L 348 272 L 342 318 L 308 325 L 278 318 L 272 292 L 278 268 Z",
  MW:"M 340 268 L 358 262 L 365 278 L 358 308 L 342 312 L 335 295 Z",
  MZ:"M 342 272 L 370 265 L 382 285 L 378 345 L 348 355 L 325 338 L 318 308 L 325 282 Z",
  ZW:"M 285 312 L 322 308 L 328 328 L 315 348 L 285 348 L 275 330 Z",
  NA:"M 228 308 L 272 302 L 278 318 L 272 362 L 242 368 L 218 352 L 215 328 Z",
  BW:"M 268 318 L 308 315 L 318 332 L 308 360 L 278 362 L 265 345 Z",
  ZA:"M 215 348 L 315 342 L 328 362 L 318 405 L 278 418 L 238 412 L 212 388 L 210 365 Z",
  LS:"M 278 368 L 298 365 L 302 380 L 285 385 Z",
  SZ:"M 312 355 L 325 352 L 328 362 L 315 366 Z",
  TZ:"M 340 215 L 382 210 L 395 228 L 388 268 L 358 278 L 335 265 L 328 242 L 332 222 Z",
  MG:"M 398 268 L 418 258 L 428 278 L 422 332 L 402 342 L 388 325 L 385 295 L 390 272 Z",
  KM:"M 398 255 L 408 252 L 410 260 L 400 262 Z",
  MU:"M 430 318 L 438 315 L 440 325 L 432 328 Z",
};

const COUNTRY_LABELS = {
  MA:{x:128,y:76},DZ:{x:182,y:82},TN:{x:220,y:60},LY:{x:258,y:76},EG:{x:315,y:70},
  MR:{x:102,y:128},ML:{x:178,y:122},NE:{x:252,y:108},SD:{x:318,y:122},
  SN:{x:85,y:158},GM:{x:88,y:158},GW:{x:78,y:168},GN:{x:105,y:180},
  SL:{x:95,y:200},LR:{x:112,y:205},CI:{x:138,y:195},GH:{x:165,y:192},
  TG:{x:182,y:188},BJ:{x:194,y:182},NG:{x:225,y:148},BF:{x:172,y:150},
  CF:{x:275,y:158},CM:{x:230,y:188},TD:{x:268,y:128},
  ER:{x:358,y:130},ET:{x:365,y:152},DJ:{x:385,y:133},SO:{x:400,y:162},
  SS:{x:315,y:172},UG:{x:342,y:200},KE:{x:372,y:188},
  RW:{x:338,y:212},BI:{x:335,y:222},
  CD:{x:278,y:218},CG:{x:242,y:228},GA:{x:218,y:225},GQ:{x:212,y:204},ST:{x:200,y:220},
  AO:{x:260,y:280},ZM:{x:308,y:290},MW:{x:350,y:288},MZ:{x:352,y:312},
  ZW:{x:302,y:330},NA:{x:248,y:338},BW:{x:288,y:340},ZA:{x:268,y:380},
  LS:{x:288,y:375},SZ:{x:318,y:360},
  TZ:{x:362,y:248},MG:{x:408,y:302},KM:{x:402,y:258},MU:{x:434,y:320},
};

/* ────────────────────────────────────────────────────────────────────────────
   NORMALISATION DES DONNÉES SCRAPÉES
   Le scraper v3 (alertePrincipale, angleTN, contacts en objet, visaDetail) est
   écrit mais pas encore déployé sur le pipeline réel : /data.json en production
   utilise encore l'ancien schéma plat. Ces fonctions permettent à la fiche de
   fonctionner correctement avec les DEUX formats, sans jamais inventer de
   contenu sécuritaire — uniquement réorganiser ou choisir parmi les données
   déjà présentes.
   ──────────────────────────────────────────────────────────────────────────── */

// Contacts : ancien format = tableau plat ; nouveau format = objet {locaux,ambassadeTN,mae}
function normalizeContacts(raw){
  if(!raw) return {locaux:[],ambassadeTN:null,mae:null};
  if(Array.isArray(raw)){
    const locaux=[]; let ambassadeTN=null, mae=null;
    raw.forEach(c=>{
      const lbl=c.label||"";
      if(/^Ambassade de Tunisie/i.test(lbl)) ambassadeTN={label:lbl,tel:c.valeur,pays:null,email:null};
      else if(/^MAE Tunisie/i.test(lbl)) mae={label:lbl,tel:c.valeur};
      else locaux.push({label:lbl,valeur:c.valeur});
    });
    return {locaux,ambassadeTN,mae};
  }
  return {locaux:raw.locaux||[], ambassadeTN:raw.ambassadeTN||null, mae:raw.mae||null};
}

// Alerte principale : utilisée directement si fournie par le scraper v3, sinon
// reconstruite via la même cascade déterministe à 4 niveaux que le serveur
// (scraper.py / choisir_alerte_principale), uniquement à partir de champs déjà
// présents dans les données réelles (derniereMinute, zonesVigilance, securite).
function choisirAlertePrincipale(live){
  if(!live) return null;
  if(live.alertePrincipale) return live.alertePrincipale;
  if(Array.isArray(live.derniereMinute)&&live.derniereMinute.length>0){
    const a=live.derniereMinute[0];
    return {niveau:"eleve",titre:a.titre||"Alerte",texte:a.texte||"",date:live.sourceDateStr||null};
  }
  if(Array.isArray(live.zonesVigilance)){
    const rouge=live.zonesVigilance.find(z=>z.couleur==="rouge");
    if(rouge){
      const detail=Array.isArray(rouge.zones)?rouge.zones.join(", "):(rouge.desc||"");
      return {niveau:"eleve",titre:rouge.nom||"Zone formellement déconseillée",texte:`Zone(s) concernée(s) : ${detail}.`,date:live.sourceDateStr||null};
    }
  }
  if(Array.isArray(live.securite)){
    const item=live.securite.find(s=>s.niveau==="eleve");
    if(item){
      const cat=item.cat||item.label||"Sécurité";
      return {niveau:"modere",titre:cat,texte:(item.texte||"").slice(0,200),date:live.sourceDateStr||null};
    }
  }
  return {niveau:"faible",titre:"Aucune alerte majeure en cours",texte:"Aucun événement de sécurité majeur signalé récemment par les sources officielles. Vigilance habituelle recommandée.",date:null};
}

// Visa : utilise visaDetail s'il existe (futur schéma v3) ; sinon estimation
// déterministe par mots-clés sur le texte libre déjà présent (champ visa),
// clairement signalée comme estimation côté UI.
function normalizeVisaDetail(live){
  if(live.visaDetail) return {...live.visaDetail, estimation:false};
  const txt=(live.visa||"").toLowerCase();
  let categorie="inconnu", statut="Statut visa à vérifier";
  if(/sans visa|exempt|dispense/.test(txt)){categorie="exempte";statut="Sans visa";}
  else if(/à l'arrivée|a l'arrivee|arrivée|voa/.test(txt)){categorie="arrivee";statut="Visa à l'arrivée";}
  else if(/e-visa|evisa|en ligne|électronique/.test(txt)){categorie="evisa";statut="e-Visa / autorisation en ligne";}
  else if(/obligatoire|avant le départ|avant départ/.test(txt)){categorie="obligatoire";statut="Visa obligatoire";}
  return {statut,categorie,texte:live.visa||"Information non disponible.",estimation:true};
}

// Assemble la fiche normalisée à partir des données scrapées (live), en gérant
// la coexistence de l'ancien et du nouveau schéma. Retourne null si aucune
// donnée exploitable n'existe pour ce pays.
function buildFiche(live){
  if(!live) return null;
  const hasContent=(live.securite&&live.securite.length)||(live.zonesVigilance&&live.zonesVigilance.length)||live.visa||(live.contacts&&(Array.isArray(live.contacts)?live.contacts.length:true));
  if(!hasContent) return null;
  const autresAlertes=Array.isArray(live.derniereMinute)&&live.derniereMinute.length>1
    ? live.derniereMinute.slice(1).map(a=>({niveau:"modere",titre:a.titre,texte:a.texte}))
    : [];
  return {
    version: live.version||1,
    sourceDateStr: live.sourceDateStr||"—",
    dateMAJInterne: live.dateMAJInterne||"—",
    alertePrincipale: choisirAlertePrincipale(live),
    autresAlertes,
    angleTN: Array.isArray(live.angleTN)&&live.angleTN.length>0 ? live.angleTN : null,
    securite: live.securite||[],
    zonesVigilance: live.zonesVigilance||[],
    sante: live.sante||{vaccins:[],risques:[]},
    visa: live.visa||"—",
    visaDetail: normalizeVisaDetail(live),
    contacts: normalizeContacts(live.contacts),
    carteVigilance: live.carteVigilance||null,
    sources: Array.isArray(live.sources)&&live.sources.length>0 ? live.sources : null,
    sourceUrl: live.source||null,
  };
}

// ── PETITS COMPOSANTS PARTAGÉS ──────────────────────────────────────────────
function RiskDot({level,size=9}){
  const t=C[level]||C.faible;
  return <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:t.dot,flexShrink:0}}/>;
}
function ZoneRow({z}){
  const map={rouge:"eleve",orange:"modere",jaune:"faible"};
  const lvl=map[z.couleur]||"faible";
  const t=C[lvl];
  const detail=Array.isArray(z.zones)?z.zones.join(" · "):(z.desc||"");
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 14px",background:t.bg,border:`1px solid ${t.bd}`,borderLeft:`3px solid ${t.dot}`,borderRadius:8,marginBottom:8}}>
      <div style={{marginTop:3}}><RiskDot level={lvl}/></div>
      <div>
        <div style={{fontWeight:600,fontSize:13.5,color:C.ink}}>{z.nom}</div>
        {detail&&<div style={{fontSize:12,color:t.fg,fontFamily:FONT_MONO,marginTop:2}}>{detail}</div>}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({onLogin}){
  const [step,setStep]=useState("email");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [sent,setSent]=useState("");
  const [shown,setShown]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const sendCode=()=>{
    if(!email.endsWith("@ideaconsult.com.tn")){setErr("Seules les adresses @ideaconsult.com.tn sont autorisées.");return;}
    setLoading(true);setErr("");
    const c=genCode();setSent(c);
    if(typeof window.emailjs!=="undefined"){
      window.emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {to_email:email, code:c},
        EMAILJS_KEY
      ).then(()=>{
        setShown("");
        setLoading(false);setStep("code");
      }).catch(()=>{
        setShown(c);
        setLoading(false);setStep("code");
      });
    } else {
      setShown(c);
      setTimeout(()=>{setLoading(false);setStep("code");},1200);
    }
  };
  const verify=()=>{ code===sent?onLogin(email):setErr("Code incorrect."); };

  return(
    <div style={{minHeight:"100vh",fontFamily:FONT_BODY,background:`linear-gradient(160deg,${C.navy} 0%,#061a4a 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1rem"}}>
      <div style={{marginBottom:"2.5rem",textAlign:"center"}}>
        <img src={LOGO_IDEA} alt="IDEA Consult International" style={{height:52,filter:"brightness(0) invert(1)"}}/>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:14,letterSpacing:3,textTransform:"uppercase"}}>Fiches Risques Pays · Afrique</p>
      </div>
      <div style={{background:"white",borderRadius:16,padding:"2rem",width:"100%",maxWidth:400,boxShadow:"0 24px 80px rgba(0,0,0,0.4)"}}>
        {step==="email"?(
          <>
            <p style={{fontWeight:700,fontSize:17,color:C.navy,margin:"0 0 6px"}}>Accès sécurisé</p>
            <p style={{fontSize:13,color:C.inkSoft,margin:"0 0 1.5rem",lineHeight:1.6}}>Saisissez votre adresse email professionnelle.</p>
            <label style={{fontSize:10,color:"#aaa",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Adresse email</label>
            <input type="email" placeholder="prenom.nom@ideaconsult.com.tn" value={email}
              onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&sendCode()}
              style={{width:"100%",padding:"11px 13px",borderRadius:8,border:`1.5px solid ${err?C.red:"#e0e0e0"}`,fontSize:14,boxSizing:"border-box",outline:"none",color:"#111",fontFamily:FONT_BODY}}/>
            {err&&<p style={{color:C.red,fontSize:12,margin:"6px 0 0"}}>{err}</p>}
            <button onClick={sendCode} disabled={loading||!email} style={{marginTop:"1rem",width:"100%",padding:"12px",borderRadius:8,border:"none",background:loading||!email?"#ccc":C.blue,color:"white",fontWeight:700,fontSize:14,cursor:loading||!email?"not-allowed":"pointer",fontFamily:FONT_BODY}}>
              {loading?"Envoi…":"Recevoir le code →"}
            </button>
          </>
        ):(
          <>
            <button onClick={()=>{setStep("email");setCode("");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:12,padding:"0 0 1rem",fontFamily:FONT_BODY}}>← Modifier l'email</button>
            <p style={{fontWeight:700,fontSize:17,color:C.navy,margin:"0 0 6px"}}>Code de vérification</p>
            <p style={{fontSize:13,color:C.inkSoft,margin:"0 0 1rem"}}>Envoyé à <strong style={{color:C.navy}}>{email}</strong></p>
            {shown&&(
              <div style={{background:C.faible.bg,border:`1px solid ${C.faible.bd}`,borderRadius:8,padding:"10px 14px",marginBottom:"1rem",textAlign:"center"}}>
                <p style={{margin:0,fontSize:10,color:C.faible.fg,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Démo — code simulé (EmailJS non actif ici)</p>
                <p style={{margin:0,fontSize:28,fontWeight:800,letterSpacing:8,color:C.navy,fontFamily:FONT_MONO}}>{shown}</p>
              </div>
            )}
            {!shown&&step==="code"&&(
              <div style={{background:"#EEF2FC",border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",marginBottom:"1rem",textAlign:"center"}}>
                <p style={{margin:0,fontSize:12,color:C.navy}}>✉️ Code envoyé sur <strong>{email}</strong></p>
                <p style={{margin:0,fontSize:11,color:"#888",marginTop:4}}>Vérifiez votre boîte de réception.</p>
              </div>
            )}
            <input type="text" maxLength={6} placeholder="·  ·  ·  ·  ·  ·" value={code}
              onChange={e=>{setCode(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&verify()}
              style={{width:"100%",padding:"13px",borderRadius:8,border:`1.5px solid ${err?C.red:"#e0e0e0"}`,fontSize:24,textAlign:"center",letterSpacing:8,boxSizing:"border-box",outline:"none",color:"#111",fontWeight:800,fontFamily:FONT_MONO}}/>
            {err&&<p style={{color:C.red,fontSize:12,margin:"6px 0 0"}}>{err}</p>}
            <button onClick={verify} disabled={code.length<6} style={{marginTop:"1rem",width:"100%",padding:"12px",borderRadius:8,border:"none",background:code.length<6?"#ccc":C.blue,color:"white",fontWeight:700,fontSize:14,cursor:code.length<6?"not-allowed":"pointer",fontFamily:FONT_BODY}}>Accéder →</button>
          </>
        )}
      </div>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:"1.5rem",fontFamily:FONT_MONO}}>© 2026 IDEA Consult International · Usage interne</p>
    </div>
  );
}

// ── CARTE AFRIQUE ─────────────────────────────────────────────────────────────
function AfricaMap({onSelect,countries}){
  const [hov,setHov]=useState(null);
  const [tip,setTip]=useState(null);
  const [search,setSearch]=useState("");
  const [filterRisk,setFilterRisk]=useState("tous");
  const list=countries||ALL_AFRICA;

  const filtered=list.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase());
    const mr=filterRisk==="tous"||c.risk===filterRisk;
    return ms&&mr;
  });
  const filteredIds=new Set(filtered.map(c=>c.id));
  const stats={faible:list.filter(c=>c.risk==="faible").length,modere:list.filter(c=>c.risk==="modere").length,eleve:list.filter(c=>c.risk==="eleve").length};
  const getC=id=>list.find(c=>c.id===id);

  return(
    <div style={{display:"flex",height:"100%",gap:0,fontFamily:FONT_BODY}}>
      <div style={{width:260,flexShrink:0,borderRight:`1px solid ${C.line}`,display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.line}`}}>
          <input placeholder="🔍  Rechercher un pays…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.line}`,fontSize:13,boxSizing:"border-box",outline:"none",color:"#333",fontFamily:FONT_BODY}}/>
          <div style={{display:"flex",gap:4,marginTop:8}}>
            {[{k:"tous",l:"Tous"},{k:"eleve",l:"Élevé"},{k:"modere",l:"Modéré"},{k:"faible",l:"Faible"}].map(b=>(
              <button key={b.k} onClick={()=>setFilterRisk(b.k)}
                style={{flex:1,padding:"4px 2px",borderRadius:6,border:`1px solid ${filterRisk===b.k?(b.k==="tous"?C.navy:C[b.k]?.dot||C.navy):C.line}`,background:filterRisk===b.k?(b.k==="tous"?"#EEF2FC":C[b.k]?.bg||"#EEF2FC"):"white",cursor:"pointer",fontSize:10,fontWeight:filterRisk===b.k?700:400,color:filterRisk===b.k?(b.k==="tous"?C.navy:C[b.k]?.fg||C.navy):"#888",fontFamily:FONT_BODY}}>
                {b.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {filtered.length===0&&<p style={{textAlign:"center",color:"#ccc",fontSize:12,padding:"2rem 1rem"}}>Aucun résultat</p>}
          {["Afrique du Nord","Afrique de l'Ouest","Afrique Centrale","Afrique de l'Est","Afrique Australe"].map(reg=>{
            const list=filtered.filter(c=>c.region===reg);
            if(!list.length)return null;
            return(
              <div key={reg}>
                <p style={{margin:0,padding:"6px 14px 3px",fontSize:9,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid #f5f5f5"}}>{reg}</p>
                {list.map(c=>{
                  const rc=C[c.risk];
                  const isHov=hov===c.id;
                  return(
                    <div key={c.id} onClick={()=>onSelect(c)}
                      onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px",cursor:"pointer",background:isHov?"#F7F9FF":"white",borderBottom:"1px solid #fafafa",transition:"background 0.1s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:16}}>{c.flag}</span>
                        <span style={{fontSize:12,fontWeight:isHov?600:400,color:isHov?C.navy:"#333"}}>{c.name}</span>
                      </div>
                      <RiskDot level={c.risk}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.line}`,background:"#FAFAFA"}}>
          {[["eleve","Élevé",stats.eleve],["modere","Modéré",stats.modere],["faible","Faible",stats.faible]].map(([k,l,n])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{width:10,height:10,borderRadius:2,background:C[k].dot,flexShrink:0}}/>
              <span style={{fontSize:11,color:"#555"}}>Risque {l}</span>
              <span style={{fontSize:11,color:"#bbb",marginLeft:"auto"}}>{n} pays</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,position:"relative",background:"#DCEEFF",overflow:"hidden"}}>
        {tip&&hov&&(()=>{
          const c=getC(hov); if(!c)return null;
          const rc=C[c.risk];
          return(
            <div style={{position:"absolute",left:Math.min(tip.x+14,380),top:Math.max(tip.y-50,8),zIndex:20,background:"white",borderRadius:10,padding:"10px 14px",boxShadow:"0 6px 24px rgba(0,0,0,0.15)",border:`1.5px solid ${rc.bd}`,pointerEvents:"none",minWidth:150}}>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:C.navy}}>{c.flag} {c.name}</p>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
                <RiskDot level={c.risk}/>
                <span style={{fontSize:12,color:rc.fg,fontWeight:600}}>{RISK_LABEL[c.risk]}</span>
              </div>
              <p style={{margin:"4px 0 0",fontSize:10,color:"#aaa"}}>{c.region}</p>
              <p style={{margin:"4px 0 0",fontSize:10,color:C.navy,fontWeight:600}}>Cliquez pour voir la fiche →</p>
            </div>
          );
        })()}

        <svg viewBox="80 40 380 400" style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="600" height="500" fill="#DCEEFF"/>
          {list.map(c=>{
            const path=COUNTRY_PATHS[c.id];
            if(!path)return null;
            const rc=C[c.risk];
            const isHov=hov===c.id;
            const isFiltered=filteredIds.has(c.id);
            const fill=isHov?rc.dot:isFiltered?rc.bg:C.navy;
            const stroke=isHov?rc.fg:"white";
            const op=isFiltered?1:0.25;
            const lbl=COUNTRY_LABELS[c.id];
            return(
              <g key={c.id}
                onMouseEnter={e=>{setHov(c.id);setTip({x:e.nativeEvent.offsetX,y:e.nativeEvent.offsetY});}}
                onMouseLeave={()=>{setHov(null);setTip(null);}}
                onClick={()=>onSelect(c)}
                style={{cursor:"pointer"}}>
                <path d={path} fill={fill} stroke={stroke} strokeWidth={isHov?1.2:0.6} opacity={op} style={{transition:"fill 0.15s,opacity 0.15s"}}/>
                {lbl&&isFiltered&&!isHov&&(
                  <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize="5.5" fill={isHov?"white":C.navy} fontWeight="600" style={{pointerEvents:"none",userSelect:"none"}}>{c.id}</text>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{position:"absolute",bottom:12,right:12,background:"rgba(1,34,105,0.85)",borderRadius:20,padding:"5px 14px"}}>
          <p style={{margin:0,fontSize:11,color:"white"}}>Survolez · Cliquez pour la fiche</p>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT PDF ────────────────────────────────────────────────────────────────
function genererPDF(country,fiche,ref,v){
  const rl=C[country.risk];
  const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const zoneColor={rouge:C.eleve,orange:C.modere,jaune:C.faible};
  const today=new Date().toLocaleDateString("fr-FR");

  const secHTML=fiche.securite.map(s=>{
    const t=C[s.niveau]||C.faible;
    const cat=s.cat||s.label||"Sécurité";
    return `<div class="sec" style="--dc:${t.dot};--bgc:${t.bg}"><div class="t"><span class="dot" style="background:${t.dot}"></span>${esc(cat)}</div><p>${esc(s.texte)}</p></div>`;
  }).join("");

  const zoneHTML=fiche.zonesVigilance.map(z=>{
    const t=zoneColor[z.couleur]||C.faible;
    const detail=Array.isArray(z.zones)?z.zones.join(" · "):(z.desc||"");
    return `<div class="zone" style="background:${t.bg};border:1px solid ${t.bd};border-left:3px solid ${t.dot}"><div><div class="zn">${esc(z.nom)}</div>${detail?`<div class="zd mono" style="color:${t.fg}">${esc(detail)}</div>`:""}</div></div>`;
  }).join("");

  const vacHTML=(fiche.sante.vaccins||[]).map(v2=>`<div class="vac"><b>${esc(v2.nom)}</b><span class="mono" style="color:${C.inkSoft}">${esc(v2.statut)}${v2.validite?" · "+esc(v2.validite):""}</span></div>`).join("");
  const risqHTML=(fiche.sante.risques||[]).map(r=>`<span>${esc(r)}</span>`).join("");

  const locauxHTML=fiche.contacts.locaux.map(c=>`<div class="cbox"><div class="n mono">${esc(c.valeur)}</div><div class="l">${esc(c.label)}</div></div>`).join("");
  const ambBlock=fiche.contacts.ambassadeTN?`
    <div class="amb">
      <div class="tag mono">▸ Secours ressortissants tunisiens</div>
      <div class="nm">${esc(fiche.contacts.ambassadeTN.label)}</div>
      <div class="mono" style="font-size:9.5px">${fiche.contacts.ambassadeTN.tel?`☎ ${esc(fiche.contacts.ambassadeTN.tel)}`:""}${fiche.contacts.ambassadeTN.email?` · ✉ ${esc(fiche.contacts.ambassadeTN.email)}`:""}</div>
      ${fiche.contacts.mae?`<div class="mono" style="font-size:9px;margin-top:5px;color:#C4D2F0">${esc(fiche.contacts.mae.label)} · ${esc(fiche.contacts.mae.tel)}</div>`:""}
    </div>`:"";

  const alertHTML=`<div class="alert">
    <span class="tag mono">● Dernière minute${fiche.alertePrincipale.date?` · ${esc(fiche.alertePrincipale.date)}`:""}</span>
    <h2>${esc(fiche.alertePrincipale.titre)}</h2>
    <p style="font-size:10px;color:${C.inkSoft}">${esc(fiche.alertePrincipale.texte)}</p>
  </div>`;

  const tnHTML=fiche.angleTN?`<div class="tn">
    <div class="tag mono">▸ Fiche adaptée au profil tunisien</div>
    <ul>${fiche.angleTN.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
  </div>`:"";

  const sourcesTxt=fiche.sources?fiche.sources.join(" + ") : (fiche.sourceUrl?"diplomatie.gouv.fr":"—");

  const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>${esc(ref)} — ${esc(country.name)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  @page{size:A4;margin:14mm 12mm;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Space Grotesk',sans-serif;color:${C.ink};font-size:10.5px;line-height:1.45;}
  .mono{font-family:'JetBrains Mono',monospace;}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${C.navy};padding-bottom:10px;margin-bottom:12px;}
  .head img{height:42px;}
  .ref{font-size:9px;color:${C.inkSoft};letter-spacing:.5px;margin-top:3px;}
  h1{font-size:22px;color:${C.navy};font-weight:700;}
  .badge{display:inline-flex;align-items:center;gap:6px;background:${rl.bg};color:${rl.fg};border:1px solid ${rl.bd};padding:5px 11px;border-radius:20px;font-weight:600;font-size:11px;}
  .dot{width:8px;height:8px;border-radius:50%;display:inline-block;}
  .alert{border:1px solid ${C.eleve.bd};border-left:5px solid ${C.red};background:${C.eleve.bg};border-radius:8px;padding:11px 14px;margin-bottom:12px;}
  .alert .tag{font-size:8.5px;font-weight:600;letter-spacing:1px;color:${C.red};text-transform:uppercase;}
  .alert h2{font-size:13px;color:${C.navy};margin:4px 0 3px;}
  .tn{background:#EEF2FC;border:1px solid ${C.line};border-radius:8px;padding:10px 13px;margin-bottom:13px;}
  .tn .tag{font-size:8.5px;font-weight:600;letter-spacing:.8px;color:${C.blue};text-transform:uppercase;margin-bottom:5px;}
  .tn li{list-style:none;padding-left:13px;position:relative;margin-bottom:3px;font-size:10px;}
  .tn li:before{content:"—";position:absolute;left:0;color:${C.blueLt};font-weight:700;}
  .cols{display:flex;gap:14px;}
  .col{flex:1;}
  h3{font-size:11px;color:${C.navy};font-weight:600;margin:12px 0 6px;border-bottom:1px solid ${C.line};padding-bottom:3px;}
  .sec{border-left:3px solid var(--dc);background:var(--bgc);border-radius:6px;padding:8px 11px;margin-bottom:7px;}
  .sec .t{font-weight:600;font-size:11px;color:${C.navy};margin-bottom:2px;display:flex;align-items:center;gap:6px;}
  .sec p{font-size:9.5px;color:${C.ink};}
  .zone{display:flex;gap:8px;align-items:flex-start;padding:7px 10px;border-radius:6px;margin-bottom:5px;}
  .zone .zn{font-weight:600;font-size:10px;}
  .zone .zd{font-size:8.5px;}
  .vac{display:flex;justify-content:space-between;border:1px solid ${C.line};border-radius:5px;padding:6px 10px;margin-bottom:4px;font-size:9.5px;}
  .chips span{display:inline-block;background:${C.modere.bg};color:${C.modere.fg};border:1px solid ${C.modere.bd};border-radius:12px;padding:2px 9px;font-size:9px;margin:0 4px 4px 0;}
  .contacts{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
  .cbox{flex:1;min-width:70px;text-align:center;border:1px solid ${C.line};border-radius:7px;padding:8px 4px;}
  .cbox .n{font-size:15px;font-weight:600;color:${C.navy};}
  .cbox .l{font-size:8.5px;color:${C.inkSoft};}
  .amb{background:${C.navy};color:#fff;border-radius:8px;padding:10px 13px;margin-top:8px;}
  .amb .tag{font-size:8px;letter-spacing:1px;color:#9DB2E8;text-transform:uppercase;}
  .amb .nm{font-weight:600;font-size:11px;margin:3px 0;}
  .foot{margin-top:14px;border-top:1px solid ${C.line};padding-top:7px;font-size:8px;color:${C.inkSoft};display:flex;justify-content:space-between;}
</style></head><body>
  <div class="head">
    <div>
      <h1>${esc(country.name)}</h1>
      <div class="ref mono">${esc(ref)} · ${esc(country.region)} · sources ${esc(sourcesTxt)}</div>
      <div class="ref mono">Source ${esc(fiche.sourceDateStr)} · Interne ${esc(fiche.dateMAJInterne)}</div>
    </div>
    <div style="text-align:right">
      <img src="${LOGO_IDEA}" alt="IDEA Consult"/>
      <div style="margin-top:8px"><span class="badge"><span class="dot" style="background:${rl.dot}"></span>${RISK_LABEL[country.risk]}</span></div>
    </div>
  </div>

  ${alertHTML}
  ${tnHTML}

  <div class="cols">
    <div class="col">
      <h3>Sécurité</h3>
      ${secHTML}
      <h3>Visa — ${esc(fiche.visaDetail.statut)}</h3>
      <p style="font-size:9.5px">${esc(fiche.visa)}</p>
    </div>
    <div class="col">
      <h3>Zones de vigilance</h3>
      ${zoneHTML}
      <h3>Santé</h3>
      ${vacHTML}
      <div class="chips" style="margin-top:6px">${risqHTML}</div>
      <h3>Contacts</h3>
      <div class="contacts">${locauxHTML}</div>
      ${ambBlock}
    </div>
  </div>

  <div class="foot mono">
    <span>Copyright © 2026 IDEACONSULT International · Fiches Risques Pays</span>
    <span>Document généré le ${today} · usage interne · V${v}</span>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},400);};</script>
</body></html>`;

  const w=window.open("","_blank");
  if(!w){alert("Veuillez autoriser les fenêtres pop-up pour générer le PDF.");return;}
  w.document.write(html);
  w.document.close();
}

// ── CORPS DE FICHE (alerte + bandeau TN + onglets) ──────────────────────────────
function FicheBody({fiche,sel,tab,setTab,tabs,imgErr,setImgErr}){
  const al=fiche.alertePrincipale;
  const alC=C[al.niveau]||C.faible;
  return(
    <>
      <div style={{background:C.card,border:`1px solid ${C.line}`,borderLeft:`5px solid ${alC.dot}`,borderRadius:10,padding:"16px 18px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:5,background:alC.bg,color:alC.fg,border:`1px solid ${alC.bd}`,borderRadius:999,padding:"3px 9px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4}}>● Dernière minute</span>
          {al.date&&<span style={{fontFamily:FONT_MONO,fontSize:11,color:C.inkSoft}}>{al.date}</span>}
        </div>
        <p style={{margin:"0 0 4px",fontWeight:700,fontSize:15,color:C.navy}}>{al.titre}</p>
        <p style={{margin:0,fontSize:13.5,color:C.ink,lineHeight:1.5}}>{al.texte}</p>
        {fiche.autresAlertes&&fiche.autresAlertes.length>0&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px dashed ${C.line}`,display:"flex",flexDirection:"column",gap:6}}>
            {fiche.autresAlertes.map((a,i)=>(
              <p key={i} style={{margin:0,fontSize:12.5,color:C.inkSoft}}><strong style={{color:C.navy}}>{a.titre} — </strong>{a.texte}</p>
            ))}
          </div>
        )}
      </div>

      {fiche.angleTN&&(
        <div style={{background:"#EEF3FF",border:`1px solid ${C.blueLt}`,borderRadius:10,padding:"14px 16px",marginBottom:18,display:"flex",gap:10}}>
          <span style={{color:C.blue,fontWeight:700}}>▸</span>
          <div>
            <p style={{margin:"0 0 6px",fontWeight:700,fontSize:13,color:C.navy}}>Fiche adaptée au profil tunisien</p>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {fiche.angleTN.map((t,i)=>(
                <p key={i} style={{margin:0,fontSize:13,color:C.ink,lineHeight:1.5}}>— {t}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:4,borderBottom:`1px solid ${C.line}`,marginBottom:18,flexWrap:"wrap"}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontFamily:FONT_BODY,fontSize:13,fontWeight:tab===id?700:500,color:tab===id?C.navy:C.inkSoft,borderBottom:tab===id?`2.5px solid ${C.blue}`:"2.5px solid transparent"}}>{label}</button>
        ))}
      </div>

      {tab==="securite"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(fiche.securite&&fiche.securite.length>0)?fiche.securite.map((s,i)=>{
            const niv=s.niveau||"modere"; const sc=C[niv]||C.modere;
            return(
              <div key={i} style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <RiskDot level={niv} size={10}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:3}}>
                    <p style={{margin:0,fontWeight:700,fontSize:13,color:C.navy}}>{s.cat||s.label}</p>
                    <span style={{fontSize:10.5,fontWeight:700,color:sc.fg,background:sc.bg,border:`1px solid ${sc.bd}`,borderRadius:999,padding:"2px 8px",whiteSpace:"nowrap"}}>{RISK_LABEL[niv]}</span>
                  </div>
                  <p style={{margin:0,fontSize:13,color:C.ink,lineHeight:1.5}}>{s.texte||s.desc}</p>
                </div>
              </div>
            );
          }):<p style={{color:C.inkSoft,fontSize:13}}>Aucune information de sécurité détaillée disponible pour le moment.</p>}
        </div>
      )}

      {tab==="zones"&&(
        <div>
          {fiche.carteVigilance&&!imgErr&&(
            <img src={fiche.carteVigilance} alt="Carte de vigilance" onError={()=>setImgErr(true)} style={{width:"100%",borderRadius:10,border:`1px solid ${C.line}`,marginBottom:14}}/>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(fiche.zonesVigilance&&fiche.zonesVigilance.length>0)?fiche.zonesVigilance.map((z,i)=><ZoneRow key={i} z={z}/>):<p style={{color:C.inkSoft,fontSize:13}}>Aucune zone de vigilance signalée.</p>}
          </div>
        </div>
      )}

      {tab==="sante"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:0.5}}>Vaccinations</p>
            {(fiche.sante.vaccins&&fiche.sante.vaccins.length>0)?(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {fiche.sante.vaccins.map((vc,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 12px",display:"flex",justifyContent:"space-between",gap:10}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{vc.nom}</span>
                    <span style={{fontFamily:FONT_MONO,fontSize:12,color:C.inkSoft}}>{vc.statut}{vc.validite?` · ${vc.validite}`:""}</span>
                  </div>
                ))}
              </div>
            ):<p style={{color:C.inkSoft,fontSize:13}}>Aucune information vaccinale disponible.</p>}
          </div>
          {fiche.sante.risques&&fiche.sante.risques.length>0&&(
            <div>
              <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:0.5}}>Risques sanitaires</p>
              <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:10,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                {fiche.sante.risques.map((r,i)=>(
                  <p key={i} style={{margin:0,fontSize:13,color:C.ink,lineHeight:1.5}}>{r}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="visa"&&(
        <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 16px"}}>
          {fiche.visaDetail?(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,fontSize:14,color:C.navy}}>{fiche.visaDetail.statut}</span>
                {fiche.visaDetail.estimation&&<span style={{fontSize:10.5,fontWeight:700,color:C.modere.fg,background:C.modere.bg,border:`1px solid ${C.modere.bd}`,borderRadius:999,padding:"2px 8px"}}>estimation</span>}
              </div>
              <p style={{margin:0,fontSize:13,color:C.ink,lineHeight:1.5}}>{fiche.visaDetail.texte}</p>
              {fiche.visaDetail.estimation&&<p style={{margin:"10px 0 0",fontSize:11.5,color:C.inkSoft,fontStyle:"italic"}}>Statut estimé à partir du texte source (passeport tunisien) — à confirmer auprès des autorités consulaires avant tout déplacement.</p>}
            </>
          ):<p style={{color:C.inkSoft,fontSize:13}}>Aucune information visa disponible pour le moment.</p>}
        </div>
      )}

      {tab==="contacts"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:0.5}}>Urgences locales</p>
            {(fiche.contacts.locaux&&fiche.contacts.locaux.length>0)?(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {fiche.contacts.locaux.map((ct,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10}}>
                    <span style={{fontSize:13,color:C.ink}}>{ct.label}</span>
                    <span style={{fontFamily:FONT_MONO,fontSize:13,fontWeight:600,color:C.navy}}>{ct.valeur}</span>
                  </div>
                ))}
              </div>
            ):<p style={{color:C.inkSoft,fontSize:13}}>Aucun contact local disponible.</p>}
          </div>
          {fiche.contacts.ambassadeTN&&(
            <div>
              <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:0.5}}>Ambassade de Tunisie de rattachement</p>
              <div style={{background:C.bg,border:`1px solid ${C.blueLt}`,borderRadius:8,padding:"10px 12px"}}>
                <p style={{margin:0,fontSize:13,color:C.ink}}>{fiche.contacts.ambassadeTN.label}</p>
                <p style={{margin:"3px 0 0",fontFamily:FONT_MONO,fontSize:13,fontWeight:600,color:C.navy}}>{fiche.contacts.ambassadeTN.tel}</p>
                {fiche.contacts.ambassadeTN.email&&<p style={{margin:"2px 0 0",fontFamily:FONT_MONO,fontSize:12,color:C.inkSoft}}>{fiche.contacts.ambassadeTN.email}</p>}
              </div>
            </div>
          )}
          {fiche.contacts.mae&&(
            <div>
              <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:0.5}}>Cellule de crise MAE Tunisie</p>
              <div style={{background:C.bg,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 12px"}}>
                <p style={{margin:0,fontSize:13,color:C.ink}}>{fiche.contacts.mae.label}</p>
                <p style={{margin:"3px 0 0",fontFamily:FONT_MONO,fontSize:13,fontWeight:600,color:C.navy}}>{fiche.contacts.mae.tel}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [auth,setAuth]=useState(null);
  const [view,setView]=useState("map");
  const [sel,setSel]=useState(null);
  const [tab,setTab]=useState("securite");
  const [versions]=useState(Object.fromEntries(ALL_AFRICA.map(c=>[c.id,1])));
  const [updating,setUpdating]=useState(false);
  const [updated,setUpdated]=useState(null);
  const [imgErr,setImgErr]=useState(false);
  const [liveData,setLiveData]=useState({});
  const [dataLoaded,setDataLoaded]=useState(false);

  // Chargement de public/data.json au démarrage
  useEffect(()=>{
    fetch("/data.json")
      .then(r=>r.json())
      .then(json=>{
        if(json.countries) setLiveData(json.countries);
        setDataLoaded(true);
      })
      .catch(()=>setDataLoaded(true)); // fallback silencieux si fichier absent
  },[]);

  // Fusionne les données statiques avec les données scrapées (risque réellement
  // répercuté sur la carte — corrige un défaut où ce risque mis à jour n'était
  // jamais transmis à AfricaMap dans l'ancienne version)
  const countries = ALL_AFRICA.map(c=>{
    const live=liveData[c.id];
    if(!live) return c;
    return {...c, risk: live.risk||c.risk};
  });

  if(!auth) return <LoginPage onLogin={e=>setAuth(e)}/>;

  if(!dataLoaded) return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:FONT_BODY}}>
      <img src={LOGO_IDEA} alt="IDEA Consult International" style={{height:48,filter:"brightness(0) invert(1)"}}/>
      <p style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Chargement des données en cours…</p>
    </div>
  );

  const doUpdate=id=>{
    // L'actualisation ne fait que relancer le scraper (simulé ici)
    setUpdating(true);
    setTimeout(()=>{
      setUpdated(id);setUpdating(false);
      setTimeout(()=>setUpdated(null),3000);
    },1600);
  };

  const openFiche=c=>{setSel(c);setView("fiche");setTab("securite");setImgErr(false);};

  if(view==="fiche"&&sel){
    const live=liveData[sel.id];
    const fiche=buildFiche(live);
    const rl=C[sel.risk];
    const v=fiche?.version||versions[sel.id]||1;
    const ref=fmtRef(sel,v);
    const isUp=updated===sel.id;
    const tabs=[["securite","Sécurité"],["zones","Zones & carte"],["sante","Santé"],["visa","Visa"],["contacts","Contacts"]];

    return(
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.ink}}>
        <header style={{background:C.navy,color:"#fff",padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>setView("map")} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.6)",fontSize:13,padding:0,fontFamily:FONT_BODY}}>← Carte</button>
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.2)"}}/>
            <img src={LOGO_IDEA} alt="IDEA Consult International" style={{height:30,filter:"brightness(0) invert(1)"}}/>
            <div style={{borderLeft:"1px solid rgba(255,255,255,.25)",paddingLeft:14}}>
              <div style={{fontFamily:FONT_MONO,fontSize:10.5,letterSpacing:1,color:"#9DB2E8"}}>{ref} · {sel.region.toUpperCase()}</div>
              <div style={{fontSize:17,fontWeight:700,letterSpacing:-0.3}}>{sel.flag} {sel.name}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:rl.bg,color:rl.fg,border:`1px solid ${rl.bd}`,padding:"6px 12px",borderRadius:999,fontWeight:600,fontSize:12}}>
              <RiskDot level={sel.risk} size={8}/> {RISK_LABEL[sel.risk]}
            </div>
            {fiche&&<button onClick={()=>genererPDF(sel,fiche,ref,v)} style={{fontFamily:FONT_BODY,fontWeight:600,fontSize:12.5,color:"#fff",background:C.blue,border:`1px solid ${C.blueLt}`,padding:"7px 14px",borderRadius:8,cursor:"pointer"}}>⬇ PDF</button>}
            <button onClick={()=>doUpdate(sel.id)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.25)",background:isUp?"rgba(95,169,69,0.25)":"rgba(255,255,255,0.08)",cursor:"pointer",fontSize:12,color:"#fff",fontWeight:600,fontFamily:FONT_BODY}}>
              {updating?"⟳ …":isUp?"✓ À jour":"⟳ Actualiser"}
            </button>
            <button onClick={()=>setAuth(null)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",cursor:"pointer",fontSize:11,color:"rgba(255,255,255,0.5)"}}>⎋</button>
          </div>
        </header>

        <div style={{maxWidth:920,margin:"0 auto",padding:"20px 20px 60px"}}>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {[["Référence",ref,true],["Source",fiche?.sourceDateStr||"—",false],["MAJ interne",fiche?.dateMAJInterne||"—",false],["Version",`V${v}`,true]].map(([l,val,mono],i)=>(
                <div key={i}><p style={{margin:0,fontSize:9,color:"#9aa",textTransform:"uppercase",letterSpacing:1}}>{l}</p><p style={{margin:0,fontWeight:700,fontSize:12,color:C.navy,fontFamily:mono?FONT_MONO:"inherit"}}>{val}</p></div>
              ))}
            </div>
          </div>

          {fiche?(
            <FicheBody fiche={fiche} sel={sel} tab={tab} setTab={setTab} tabs={tabs} imgErr={imgErr} setImgErr={setImgErr}/>
          ):(
            <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:12,padding:"3rem",textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:12}}>{sel.flag}</div>
              <p style={{fontWeight:700,fontSize:16,margin:"0 0 8px",color:C.navy}}>{sel.name}</p>
              <p style={{color:C.inkSoft,fontSize:13}}>Fiche détaillée non encore disponible. Le scraping automatique alimentera cette fiche.</p>
            </div>
          )}

          <div style={{fontFamily:FONT_MONO,textAlign:"center",fontSize:11,color:C.inkSoft,marginTop:20}}>Copyright © 2026 IDEACONSULT International · Fiches Risques Pays</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",fontFamily:FONT_BODY}}>
      <header style={{background:C.navy,borderBottom:`3px solid ${C.blue}`,padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexShrink:0,zIndex:10}}>
        <img src={LOGO_IDEA} alt="IDEA Consult International" style={{height:28,filter:"brightness(0) invert(1)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:10}}>{auth[0].toUpperCase()}</div>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{auth}</span>
          <button onClick={()=>setAuth(null)} style={{padding:"5px 9px",borderRadius:6,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",cursor:"pointer",fontSize:11,color:"rgba(255,255,255,0.6)"}}>⎋</button>
        </div>
      </header>
      <div style={{flex:1,overflow:"hidden"}}>
        <AfricaMap onSelect={openFiche} countries={countries}/>
      </div>
    </div>
  );
}
