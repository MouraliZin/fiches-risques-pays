import { useState, useRef, useEffect } from "react";

const IC="#1B2F6E", IC2="#CC1B2A";
const RC={
  faible:{label:"Faible", bg:"#EAF3DE",color:"#3B6D11",border:"#97C459",dot:"#639922"},
  modere:{label:"Modéré",bg:"#FFF3CD",color:"#7A5100",border:"#F0AD00",dot:"#F0AD00"},
  eleve: {label:"Élevé", bg:"#FCEBEB",color:"#A32D2D",border:"#E24B4A",dot:"#E24B4A"},
};
const NC={eleve:{bg:"#FCEBEB",color:"#A32D2D"},modere:{bg:"#FFF3CD",color:"#7A5100"},faible:{bg:"#EAF3DE",color:"#3B6D11"}};
const ZC={rouge:{bg:"#FCEBEB",border:"#E24B4A",color:"#A32D2D",icon:"🔴"},orange:{bg:"#FFF3CD",border:"#F0AD00",color:"#7A5100",icon:"🟠"},jaune:{bg:"#FFFDE7",border:"#FAC775",color:"#7A5C00",icon:"🟡"}};

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

const FICHE_CM={
  version:1,lastUpdate:"20 Nov 2025",validUntil:"16 Jan 2026",
  derniereMinute:[
    {titre:"Choléra",texte:"Cas confirmé dans le Nord et l'Extrême-Nord (Mayo Oulo)."},
    {titre:"Terrorisme",texte:"Vigilance maximale. Occidentaux particulièrement ciblés dans l'Extrême-Nord."},
  ],
  securite:[
    {label:"Terrorisme – Enlèvements",niveau:"eleve",texte:"Risque élevé dans l'Extrême-Nord (Boko Haram) et zones anglophones. Occidentaux ciblés."},
    {label:"Risque routier",niveau:"modere",texte:"Routes dangereuses surtout axe Yaoundé-Douala. Nuit formellement déconseillée."},
    {label:"Piraterie maritime",niveau:"eleve",texte:"Navigation et mouillage interdits dans le golfe de Guinée."},
    {label:"Criminalité",niveau:"modere",texte:"Vols, agressions et coupeurs de route fréquents. Éviter déplacements nocturnes."},
    {label:"Troubles socioéconomiques",niveau:"faible",texte:"Manifestations possibles. Éviter rassemblements."},
    {label:"Risques naturels",niveau:"faible",texte:"Mont Cameroun actif, lacs volcaniques dangereux."},
  ],
  zonesVigilance:[
    {couleur:"rouge",nom:"Formellement déconseillées",zones:["Extrême-Nord (Boko Haram)","Nord (Mayo-Louti)","Frontières Nigéria, RCA, Tchad (30 km)","Nord-Ouest et Sud-Ouest","Kumba et Mamfe"]},
    {couleur:"orange",nom:"Déconseillées sauf raison impérative",zones:["Nord (hors Mayo-Louti) et Adamaoua","Sud-Ouest (hors zones rouges)","Ouest – zones frontalières"]},
    {couleur:"jaune",nom:"Vigilance renforcée",zones:["Littoral et Sud : visites en groupe","Adamaoua (Mayo-Banyo, Djérem)","Côte : interdiction plateformes pétrolières"]},
  ],
  sante:{
    vaccins:[
      {nom:"Fièvre jaune",statut:"Obligatoire",validite:"À vie"},
      {nom:"Hépatite A",statut:"Recommandé",validite:"À vie (après rappel)"},
      {nom:"Hépatite B",statut:"Recommandé",validite:"À vie"},
      {nom:"Typhoïde",statut:"Recommandé",validite:"3 ans"},
      {nom:"Méningite A,C,Y,W",statut:"Recommandé",validite:"3–5 ans"},
      {nom:"Rage",statut:"Selon séjour",validite:"3–5 ans"},
      {nom:"DTP",statut:"Rappel obligatoire",validite:"Tous les 10 ans"},
    ],
    risques:["Choléra (épidémie active)","Paludisme (très élevé toute l'année)","Dengue","MPOX","Méningite (nov.–juin)","Fièvre de Marburg","Fièvre typhoïde","HIV / IST"],
  },
  visa:"Visa obligatoire avant départ (e-Visa ou ambassade). Passeport valide 6 mois après séjour. Vaccin fièvre jaune exigé. Documents : billet aller-retour, réservation hébergement, lettre d'invitation et mission précisant le partenaire camerounais.",
  contacts:[
    {label:"Police secours",valeur:"17 / 117"},
    {label:"Gendarmerie",valeur:"13 / 113"},
    {label:"Sécurité Douala",valeur:"+237 2 33 43 65 72"},
    {label:"Hôpital Général Yaoundé",valeur:"+237 222 21 20 20"},
    {label:"Hôpital Laquintinie Douala",valeur:"+237 33 42 06 94"},
    {label:"Ambassade Tunisie – Yaoundé",valeur:"+237 222 20 33 68"},
  ],
  sources:[
    {label:"France Diplomatie",url:"https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/cameroun/"},
    {label:"Voyage.gc.ca",url:"https://voyage.gc.ca/voyager/avertissements"},
    {label:"MAE Tunisie",url:"https://www.diplomatie.gov.tn/"},
  ]
};

function fmtRef(c,v){return `FRP-${String(c.seq).padStart(3,"0")}-${c.id}-V${v}`;}
function genCode(){return String(Math.floor(100000+Math.random()*900000));}

const IDEALogo=({h=34,white=false})=>{
  const c=white?"#fff":IC, r=white?"#ff7070":IC2;
  return(<svg height={h} viewBox="0 0 420 155" xmlns="http://www.w3.org/2000/svg">
    <polygon points="30,4 30,62 70,33" fill={r}/>
    <rect x="30" y="4" width="8" height="58" fill={c}/>
    <text x="44" y="64" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="64" fill={c}>IDEA</text>
    <text x="30" y="106" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="44" fill={c}>CONSULT</text>
    <text x="35" y="128" fontFamily="Arial,sans-serif" fontSize="17" letterSpacing="5" fill={c}>INTERNATIONAL</text>
  </svg>);
};

// ── VRAIES COORDONNÉES SVG AFRIQUE (projection Mercator simplifiée 500x580) ──
// Chaque pays = centroïde approximatif pour le label/click
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
    const c=genCode();setSent(c);setShown(c);
    setTimeout(()=>{setLoading(false);setStep("code");},1200);
  };
  const verify=()=>{ code===sent?onLogin(email):setErr("Code incorrect."); };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${IC} 0%,#152558 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1rem"}}>
      <div style={{marginBottom:"2.5rem",textAlign:"center"}}>
        <IDEALogo h={56} white/>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:10,letterSpacing:3,textTransform:"uppercase"}}>Fiches Risques Pays · Afrique</p>
      </div>
      <div style={{background:"white",borderRadius:16,padding:"2rem",width:"100%",maxWidth:400,boxShadow:"0 24px 80px rgba(0,0,0,0.4)"}}>
        {step==="email"?(
          <>
            <p style={{fontWeight:700,fontSize:17,color:IC,margin:"0 0 6px"}}>Accès sécurisé</p>
            <p style={{fontSize:13,color:"#777",margin:"0 0 1.5rem",lineHeight:1.6}}>Saisissez votre adresse email professionnelle.</p>
            <label style={{fontSize:10,color:"#aaa",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Adresse email</label>
            <input type="email" placeholder="prenom.nom@ideaconsult.com.tn" value={email}
              onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&sendCode()}
              style={{width:"100%",padding:"11px 13px",borderRadius:8,border:`1.5px solid ${err?"#E24B4A":"#e0e0e0"}`,fontSize:14,boxSizing:"border-box",outline:"none",color:"#111"}}/>
            {err&&<p style={{color:"#E24B4A",fontSize:12,margin:"6px 0 0"}}>{err}</p>}
            <button onClick={sendCode} disabled={loading||!email} style={{marginTop:"1rem",width:"100%",padding:"12px",borderRadius:8,border:"none",background:loading||!email?"#ccc":IC,color:"white",fontWeight:700,fontSize:14,cursor:loading||!email?"not-allowed":"pointer"}}>
              {loading?"Envoi…":"Recevoir le code →"}
            </button>
          </>
        ):(
          <>
            <button onClick={()=>{setStep("email");setCode("");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:12,padding:"0 0 1rem"}}>← Modifier l'email</button>
            <p style={{fontWeight:700,fontSize:17,color:IC,margin:"0 0 6px"}}>Code de vérification</p>
            <p style={{fontSize:13,color:"#777",margin:"0 0 1rem"}}>Envoyé à <strong style={{color:IC}}>{email}</strong></p>
            <div style={{background:"#EAF3DE",border:"1px solid #97C459",borderRadius:8,padding:"10px 14px",marginBottom:"1rem",textAlign:"center"}}>
              <p style={{margin:0,fontSize:10,color:"#3B6D11",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Démo — code simulé</p>
              <p style={{margin:0,fontSize:28,fontWeight:800,letterSpacing:8,color:IC,fontFamily:"monospace"}}>{shown}</p>
            </div>
            <input type="text" maxLength={6} placeholder="·  ·  ·  ·  ·  ·" value={code}
              onChange={e=>{setCode(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&verify()}
              style={{width:"100%",padding:"13px",borderRadius:8,border:`1.5px solid ${err?"#E24B4A":"#e0e0e0"}`,fontSize:24,textAlign:"center",letterSpacing:8,boxSizing:"border-box",outline:"none",color:"#111",fontWeight:800,fontFamily:"monospace"}}/>
            {err&&<p style={{color:"#E24B4A",fontSize:12,margin:"6px 0 0"}}>{err}</p>}
            <button onClick={verify} disabled={code.length<6} style={{marginTop:"1rem",width:"100%",padding:"12px",borderRadius:8,border:"none",background:code.length<6?"#ccc":IC,color:"white",fontWeight:700,fontSize:14,cursor:code.length<6?"not-allowed":"pointer"}}>Accéder →</button>
          </>
        )}
      </div>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:"1.5rem"}}>© 2026 IDEA Consult International · Usage interne</p>
    </div>
  );
}

// ── CARTE AFRIQUE ─────────────────────────────────────────────────────────────
function AfricaMap({onSelect}){
  const [hov,setHov]=useState(null);
  const [tip,setTip]=useState(null);
  const [search,setSearch]=useState("");
  const [filterRisk,setFilterRisk]=useState("tous");

  const filtered=ALL_AFRICA.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase());
    const mr=filterRisk==="tous"||c.risk===filterRisk;
    return ms&&mr;
  });
  const filteredIds=new Set(filtered.map(c=>c.id));
  const stats={faible:ALL_AFRICA.filter(c=>c.risk==="faible").length,modere:ALL_AFRICA.filter(c=>c.risk==="modere").length,eleve:ALL_AFRICA.filter(c=>c.risk==="eleve").length};

  const getC=id=>ALL_AFRICA.find(c=>c.id===id);

  return(
    <div style={{display:"flex",height:"100%",gap:0}}>
      {/* Panneau gauche */}
      <div style={{width:260,flexShrink:0,borderRight:`1px solid #e8e8e8`,display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #f0f0f0"}}>
          <input placeholder="🔍  Rechercher un pays…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e0e0e0",fontSize:13,boxSizing:"border-box",outline:"none",color:"#333"}}/>
          <div style={{display:"flex",gap:4,marginTop:8}}>
            {[{k:"tous",l:"Tous"},{k:"eleve",l:"Élevé"},{k:"modere",l:"Modéré"},{k:"faible",l:"Faible"}].map(b=>(
              <button key={b.k} onClick={()=>setFilterRisk(b.k)}
                style={{flex:1,padding:"4px 2px",borderRadius:6,border:`1px solid ${filterRisk===b.k?(b.k==="tous"?"#1B2F6E":RC[b.k]?.border||"#1B2F6E"):"#e8e8e8"}`,background:filterRisk===b.k?(b.k==="tous"?"#F0F3FA":RC[b.k]?.bg||"#F0F3FA"):"white",cursor:"pointer",fontSize:10,fontWeight:filterRisk===b.k?700:400,color:filterRisk===b.k?(b.k==="tous"?IC:RC[b.k]?.color||IC):"#888"}}>
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
                  const rc=RC[c.risk];
                  const isHov=hov===c.id;
                  return(
                    <div key={c.id} onClick={()=>onSelect(c)}
                      onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px",cursor:"pointer",background:isHov?"#F7F9FF":"white",borderBottom:"1px solid #fafafa",transition:"background 0.1s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:16}}>{c.flag}</span>
                        <span style={{fontSize:12,fontWeight:isHov?600:400,color:isHov?IC:"#333"}}>{c.name}</span>
                      </div>
                      <span style={{width:7,height:7,borderRadius:"50%",background:rc.dot,flexShrink:0}}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Légende */}
        <div style={{padding:"10px 14px",borderTop:"1px solid #f0f0f0",background:"#FAFAFA"}}>
          {[["eleve","Élevé",stats.eleve],["modere","Modéré",stats.modere],["faible","Faible",stats.faible]].map(([k,l,n])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{width:10,height:10,borderRadius:2,background:RC[k].dot,flexShrink:0}}/>
              <span style={{fontSize:11,color:"#555"}}>Risque {l}</span>
              <span style={{fontSize:11,color:"#bbb",marginLeft:"auto"}}>{n} pays</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carte SVG */}
      <div style={{flex:1,position:"relative",background:"#DCEEFF",overflow:"hidden"}}>
        {tip&&hov&&(()=>{
          const c=getC(hov); if(!c)return null;
          const rc=RC[c.risk];
          return(
            <div style={{position:"absolute",left:Math.min(tip.x+14,380),top:Math.max(tip.y-50,8),zIndex:20,background:"white",borderRadius:10,padding:"10px 14px",boxShadow:"0 6px 24px rgba(0,0,0,0.15)",border:`1.5px solid ${rc.border}`,pointerEvents:"none",minWidth:150}}>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:IC}}>{c.flag} {c.name}</p>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:rc.dot}}/>
                <span style={{fontSize:12,color:rc.color,fontWeight:600}}>Risque {rc.label}</span>
              </div>
              <p style={{margin:"4px 0 0",fontSize:10,color:"#aaa"}}>{c.region}</p>
              {c.id==="CM"&&<p style={{margin:"3px 0 0",fontSize:10,color:"#3B6D11",fontWeight:600}}>✓ Fiche disponible</p>}
              <p style={{margin:"4px 0 0",fontSize:10,color:IC,fontWeight:600}}>Cliquez pour voir la fiche →</p>
            </div>
          );
        })()}

        <svg viewBox="80 40 380 400" style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid meet">
          {/* Fond océan */}
          <rect x="0" y="0" width="600" height="500" fill="#DCEEFF"/>

          {ALL_AFRICA.map(c=>{
            const path=COUNTRY_PATHS[c.id];
            if(!path)return null;
            const rc=RC[c.risk];
            const isHov=hov===c.id;
            const isFiltered=filteredIds.has(c.id);
            const fill=isHov?rc.dot:isFiltered?rc.bg:IC;
            const stroke=isHov?rc.color:"white";
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
                  <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize="5.5" fill={isHov?"white":IC} fontWeight="600" style={{pointerEvents:"none",userSelect:"none"}}>{c.id}</text>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{position:"absolute",bottom:12,right:12,background:"rgba(27,47,110,0.85)",borderRadius:20,padding:"5px 14px"}}>
          <p style={{margin:0,fontSize:11,color:"white"}}>Survolez · Cliquez pour la fiche</p>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT PDF ────────────────────────────────────────────────────────────────
function exportPDF(country,fiche,v){
  const ref=fmtRef(country,v);
  const rc=RC[country.risk];
  const today=new Date().toLocaleDateString("fr-FR");
  const vaccHTML=fiche.sante.vaccins.map(v=>`<tr><td>${v.nom}</td><td>${v.validite}</td><td><span class="badge ${v.statut.includes("Oblig")?"badge-red":v.statut.includes("appel")?"badge-orange":"badge-green"}">${v.statut}</span></td></tr>`).join("");
  const secHTML=fiche.securite.map(s=>`<div class="sec-item ${s.niveau}"><div class="sec-head"><span class="sec-label">${s.label}</span><span class="sec-badge ${s.niveau}">${s.niveau==="eleve"?"Élevé":s.niveau==="modere"?"Modéré":"Faible"}</span></div><p>${s.texte}</p></div>`).join("");
  const zoneHTML=fiche.zonesVigilance.map(z=>`<div class="zone ${z.couleur}"><strong>${z.couleur==="rouge"?"🔴":z.couleur==="orange"?"🟠":"🟡"} ${z.nom}</strong><ul>${z.zones.map(i=>`<li>${i}</li>`).join("")}</ul></div>`).join("");
  const ctHTML=fiche.contacts.map(c=>`<tr><td class="ct-label">${c.label}</td><td class="ct-val">${c.valeur}</td></tr>`).join("");
  const risqHTML=fiche.sante.risques.map(r=>`<li>${r}</li>`).join("");

  const w=window.open("","_blank");
  if(!w)return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>Fiche Risque Pays — ${country.name}</title>
  <style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}
  body{background:#fff;color:#222}
  .page{width:210mm;min-height:297mm;padding:14mm 12mm;margin:0 auto;background:white;font-size:11px}
  /* HEADER */
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1B2F6E;padding-bottom:10px;margin-bottom:10px}
  .header-right{text-align:right}
  .ref-table td{padding:1px 6px;font-size:10px;color:#555}
  .ref-table td:last-child{font-weight:700;color:#1B2F6E;font-family:monospace}
  .badge-title{display:inline-block;background:#1B2F6E;color:white;padding:5px 12px;border-radius:5px;font-size:12px;font-weight:700;margin-bottom:6px}
  /* PAYS */
  .country-bar{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .country-flag{font-size:28px}
  .country-name{font-size:20px;font-weight:900;color:#1B2F6E}
  .country-region{font-size:10px;color:#888;margin-top:2px}
  .risk-pill{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700}
  /* META */
  .meta{background:#F0F3FA;border-radius:6px;padding:7px 12px;display:flex;gap:20px;margin-bottom:10px;align-items:center}
  .meta-item p:first-child{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:1px}
  .meta-item p:last-child{font-size:11px;font-weight:700;color:#1B2F6E}
  /* ALERTE */
  .alert{background:#FFF3CD;border-left:4px solid #CC1B2A;border-radius:4px;padding:7px 10px;margin-bottom:8px}
  .alert strong{color:#7A3B00;font-size:11px}
  .alert p{color:#7A3B00;font-size:10px;margin-top:2px;line-height:1.5}
  /* 2 COLONNES */
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  /* SÉCURITÉ */
  h2{font-size:12px;font-weight:700;color:#1B2F6E;border-bottom:2px solid #1B2F6E;padding-bottom:4px;margin:10px 0 7px}
  h3{font-size:11px;font-weight:700;color:#1B2F6E;margin:8px 0 5px}
  .sec-item{border-radius:4px;padding:6px 9px;margin-bottom:6px;border-left:3px solid}
  .sec-item.eleve{background:#FCEBEB;border-color:#E24B4A}.sec-item.modere{background:#FFF3CD;border-color:#F0AD00}.sec-item.faible{background:#EAF3DE;border-color:#97C459}
  .sec-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
  .sec-label{font-weight:700;font-size:10px;color:#222}
  .sec-badge{font-size:9px;padding:1px 7px;border-radius:10px;font-weight:700}
  .sec-badge.eleve{background:#FCEBEB;color:#A32D2D}.sec-badge.modere{background:#FFF3CD;color:#7A5100}.sec-badge.faible{background:#EAF3DE;color:#3B6D11}
  .sec-item p{font-size:10px;color:#555;line-height:1.5}
  /* ZONES */
  .zone{border-radius:4px;padding:6px 10px;margin-bottom:5px;border-left:3px solid}
  .zone.rouge{background:#FCEBEB;border-color:#E24B4A;color:#A32D2D}.zone.orange{background:#FFF3CD;border-color:#F0AD00;color:#7A5100}.zone.jaune{background:#FFFDE7;border-color:#FAC775;color:#7A5C00}
  .zone strong{font-size:10px;display:block;margin-bottom:3px}
  .zone ul{padding-left:12px}.zone li{font-size:9px;margin-bottom:2px;line-height:1.4}
  /* VACCINS */
  table.vaccins{width:100%;border-collapse:collapse}
  table.vaccins th{background:#1B2F6E;color:white;padding:5px 7px;font-size:10px;text-align:left}
  table.vaccins td{padding:4px 7px;font-size:10px;border-bottom:1px solid #f0f0f0}
  .badge{padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700}
  .badge-red{background:#FCEBEB;color:#A32D2D}.badge-orange{background:#FFF3CD;color:#7A5100}.badge-green{background:#EAF3DE;color:#3B6D11}
  /* RISQUES */
  .risques{list-style:none;padding:0}
  .risques li{font-size:10px;padding:4px 8px;border-bottom:1px solid #f5f5f5;color:#444}
  .risques li::before{content:"● ";color:#CC1B2A;font-size:8px;margin-right:4px}
  /* VISA */
  .visa-box{background:#F9F9FB;border:1px solid #e8e8e8;border-radius:4px;padding:8px 10px;font-size:10px;line-height:1.7;color:#444;margin-bottom:6px}
  .visa-note{background:#FFF3CD;border:1px solid #F0AD00;border-radius:4px;padding:6px 10px;font-size:9px;color:#7A5100}
  /* CONTACTS */
  table.contacts{width:100%;border-collapse:collapse}
  .ct-label{font-size:10px;color:#888;padding:5px 7px;border-bottom:1px solid #f0f0f0}
  .ct-val{font-size:11px;font-weight:700;color:#1B2F6E;padding:5px 7px;border-bottom:1px solid #f0f0f0;text-align:right}
  /* FOOTER */
  .footer{margin-top:14px;padding-top:7px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:8px;color:#bbb}
  @media print{body{padding:0}.page{padding:10mm 8mm}@page{size:A4;margin:0}}
  </style></head><body><div class="page">

  <div class="header">
    <div>
      <svg height="38" viewBox="0 0 420 155" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,4 30,62 70,33" fill="#CC1B2A"/>
        <rect x="30" y="4" width="8" height="58" fill="#1B2F6E"/>
        <text x="44" y="64" font-family="Arial Black,sans-serif" font-weight="900" font-size="64" fill="#1B2F6E">IDEA</text>
        <text x="30" y="106" font-family="Arial Black,sans-serif" font-weight="900" font-size="44" fill="#1B2F6E">CONSULT</text>
        <text x="35" y="128" font-family="Arial,sans-serif" font-size="17" letter-spacing="5" fill="#1B2F6E">INTERNATIONAL</text>
      </svg>
      <p style="font-size:9px;color:#aaa;margin-top:3px;letter-spacing:1px">Bureau d'études pluridisciplinaire · Groupe STUDI</p>
    </div>
    <div class="header-right">
      <div class="badge-title">FICHE RISQUE PAYS</div>
      <table class="ref-table"><tbody>
        <tr><td>Réf :</td><td>${ref}</td></tr>
        <tr><td>Rév :</td><td>${v}</td></tr>
        <tr><td>Page :</td><td>1 / 1</td></tr>
      </tbody></table>
      <div style="margin-top:6px"><span class="risk-pill" style="background:${rc.bg};color:${rc.color};border:1px solid ${rc.border}">${rc.label}</span></div>
    </div>
  </div>

  <div class="country-bar">
    <span class="country-flag">${country.flag}</span>
    <div>
      <div class="country-name">${country.name.toUpperCase()}</div>
      <div class="country-region">${country.region}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><p>Dernière mise à jour</p><p>${fiche.lastUpdate}</p></div>
    <div class="meta-item"><p>Information valide le</p><p>${fiche.validUntil}</p></div>
    <div class="meta-item"><p>Référence</p><p style="font-family:monospace">${ref}</p></div>
    <div class="meta-item" style="margin-left:auto"><p>Généré le</p><p>${today}</p></div>
  </div>

  ${fiche.derniereMinute.map(a=>`<div class="alert"><strong>⚠️ Dernière minute — ${a.titre}</strong><p>${a.texte}</p></div>`).join("")}

  <div class="cols">
    <div>
      <h2>Sécurité</h2>${secHTML}
      <h2>Zones de vigilance</h2>${zoneHTML}
    </div>
    <div>
      <h2>Santé — Vaccinations</h2>
      <table class="vaccins"><thead><tr><th>Vaccin</th><th>Validité</th><th>Statut</th></tr></thead><tbody>${vaccHTML}</tbody></table>
      <h3>Risques sanitaires</h3><ul class="risques">${risqHTML}</ul>
      <h2>Visa &amp; Entrée</h2>
      <div class="visa-box">${fiche.visa}</div>
      <div class="visa-note">ℹ️ Vérifier auprès de l'ambassade avant chaque départ.</div>
      <h2>Contacts utiles</h2>
      <table class="contacts"><tbody>${ctHTML}</tbody></table>
    </div>
  </div>

  <div class="footer">
    <p>Sources : diplomatie.gouv.fr · voyage.gc.ca · diplomatie.gov.tn</p>
    <p>IDEA Consult International © ${new Date().getFullYear()} — Document confidentiel, usage interne exclusif</p>
  </div>

  </div><script>window.onload=()=>window.print();</script></body></html>`);
  w.document.close();
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [auth,setAuth]=useState(null);
  const [view,setView]=useState("map");
  const [sel,setSel]=useState(null);
  const [tab,setTab]=useState("securite");
  const [versions,setVersions]=useState(Object.fromEntries(ALL_AFRICA.map(c=>[c.id,1])));
  const [updating,setUpdating]=useState(false);
  const [updated,setUpdated]=useState(null);
  const [imgErr,setImgErr]=useState(false);

  if(!auth)return <LoginPage onLogin={e=>setAuth(e)}/>;

  const doUpdate=id=>{
    setUpdating(true);
    setTimeout(()=>{
      setVersions(v=>({...v,[id]:(v[id]||1)+1}));
      setUpdated(id);setUpdating(false);
      setTimeout(()=>setUpdated(null),3000);
    },1600);
  };

  const openFiche=c=>{setSel(c);setView("fiche");setTab("securite");setImgErr(false);};

  if(view==="fiche"&&sel){
    const fiche=sel.id==="CM"?FICHE_CM:null;
    const rc=RC[sel.risk];
    const v=versions[sel.id]||1;
    const ref=fmtRef(sel,v);
    const isUp=updated===sel.id;

    return(
      <div style={{minHeight:"100vh",background:"#F4F6FB"}}>
        <header style={{background:"white",borderBottom:`3px solid ${IC}`,padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:10,gap:8,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setView("map")} style={{background:"none",border:"none",cursor:"pointer",color:"#888",fontSize:13,padding:0,display:"flex",alignItems:"center",gap:4}}>← Carte</button>
            <div style={{width:1,height:20,background:"#e0e0e0"}}/>
            <IDEALogo h={28}/>
            <div style={{width:1,height:20,background:"#e0e0e0"}}/>
            <span style={{fontSize:14,fontWeight:700,color:IC}}>{sel.flag} {sel.name}</span>
            <span style={{padding:"3px 10px",borderRadius:20,background:rc.bg,color:rc.color,fontSize:11,fontWeight:700,border:`1px solid ${rc.border}`}}>{rc.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,color:"#ccc",fontFamily:"monospace"}}>{ref}</span>
            {fiche&&<button onClick={()=>exportPDF(sel,fiche,v)} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${IC}`,background:"#F0F3FA",cursor:"pointer",fontSize:12,color:IC,fontWeight:700}}>⬇ PDF</button>}
            <button onClick={()=>doUpdate(sel.id)} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${isUp?"#97C459":"#ddd"}`,background:isUp?"#EAF3DE":"#f5f5f5",cursor:"pointer",fontSize:12,color:isUp?"#3B6D11":"#666",fontWeight:600}}>
              {updating?"⟳ …":isUp?"✓ À jour":"⟳ Actualiser"}
            </button>
            <button onClick={()=>setAuth(null)} style={{padding:"6px 10px",borderRadius:7,border:"1px solid #eee",background:"#fafafa",cursor:"pointer",fontSize:11,color:"#bbb"}}>⎋</button>
          </div>
        </header>

        <div style={{maxWidth:740,margin:"0 auto",padding:"1.5rem 1rem"}}>
          <div style={{background:"white",border:"1px solid #e8e8e8",borderLeft:`4px solid ${IC}`,borderRadius:10,padding:"10px 16px",marginBottom:"1rem",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {[["Référence",ref,true],["Mise à jour",fiche?.lastUpdate||"—",false],["Valide jusqu'au",fiche?.validUntil||"—",false],["Version",`V${v}`,true]].map(([l,val,mono],i)=>(
                <div key={i}><p style={{margin:0,fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:1}}>{l}</p><p style={{margin:0,fontWeight:700,fontSize:12,color:IC,fontFamily:mono?"monospace":"inherit"}}>{val}</p></div>
              ))}
            </div>
            {fiche&&<div style={{display:"flex",gap:5}}>{fiche.sources.map((s,i)=><a key={i} href={s.url} style={{padding:"3px 8px",borderRadius:5,background:"#F0F3FA",border:"1px solid #d0d8ef",fontSize:10,color:IC,textDecoration:"none"}}>{s.label} ↗</a>)}</div>}
          </div>

          {fiche&&fiche.derniereMinute.map((a,i)=>(
            <div key={i} style={{background:"#FFF3CD",border:"1px solid #F0AD00",borderLeft:`4px solid ${IC2}`,borderRadius:10,padding:"10px 16px",marginBottom:"0.75rem",display:"flex",gap:10}}>
              <span>⚠️</span>
              <div><p style={{margin:"0 0 3px",fontWeight:700,color:"#7A3B00",fontSize:13}}>Dernière minute — {a.titre}</p><p style={{margin:0,fontSize:12,color:"#7A3B00",lineHeight:1.5}}>{a.texte}</p></div>
            </div>
          ))}

          {fiche&&(
            <>
              <div style={{display:"flex",marginBottom:"1.25rem",background:"white",borderRadius:10,border:"1px solid #e0e0e0",overflow:"hidden"}}>
                {[{id:"securite",label:"🛡️ Sécurité"},{id:"carte",label:"🗺️ Carte"},{id:"sante",label:"💉 Santé"},{id:"visa",label:"📄 Visa"},{id:"contacts",label:"📞 Contacts"}].map((t,i,arr)=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:`3px solid ${tab===t.id?IC:"transparent"}`,background:tab===t.id?"#F0F3FA":"white",cursor:"pointer",fontSize:11,color:tab===t.id?IC:"#888",fontWeight:tab===t.id?700:400,borderRight:i<arr.length-1?"1px solid #eee":"none"}}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab==="securite"&&<div style={{display:"grid",gap:10}}>{fiche.securite.map((item,i)=>{const nc=NC[item.niveau];return(<div key={i} style={{background:"white",border:"1px solid #e8e8e8",borderLeft:`4px solid ${nc.color}`,borderRadius:10,padding:"12px 16px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700,fontSize:13}}>{item.label}</span><span style={{fontSize:11,padding:"2px 10px",borderRadius:20,background:nc.bg,color:nc.color,fontWeight:700}}>{item.niveau==="eleve"?"Élevé":item.niveau==="modere"?"Modéré":"Faible"}</span></div><p style={{margin:0,fontSize:12,color:"#555",lineHeight:1.6}}>{item.texte}</p></div>);})}</div>}
              {tab==="carte"&&<div><div style={{background:"white",border:"1px solid #e8e8e8",borderRadius:12,overflow:"hidden",marginBottom:"1rem"}}><div style={{padding:"10px 16px",background:IC,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:700,fontSize:13,color:"white"}}>Zones de vigilance — {sel.name}</span><a href={fiche.sources[0].url} style={{fontSize:11,color:"rgba(255,255,255,0.6)",textDecoration:"none"}}>Source ↗</a></div>{!imgErr?<img src="https://www.diplomatie.gouv.fr/IMG/png/cameroun_cle8fca15.png" alt="carte" onError={()=>setImgErr(true)} style={{width:"100%",display:"block",maxHeight:400,objectFit:"contain",background:"#f5f5f5"}}/>:<div style={{padding:"2rem",textAlign:"center",background:"#f8f8f8"}}><p style={{color:"#888",fontSize:13,margin:"0 0 12px"}}>Carte non chargeable (restriction CORS du site source).</p><a href={fiche.sources[0].url} style={{padding:"9px 18px",background:IC,color:"white",borderRadius:8,textDecoration:"none",fontSize:13,fontWeight:700}}>Voir sur France Diplomatie ↗</a></div>}</div><div style={{display:"grid",gap:8}}>{fiche.zonesVigilance.map((z,i)=>{const zc=ZC[z.couleur];return(<div key={i} style={{background:zc.bg,border:`1px solid ${zc.border}`,borderLeft:`4px solid ${zc.border}`,borderRadius:10,padding:"12px 16px"}}><p style={{margin:"0 0 8px",fontWeight:700,fontSize:13,color:zc.color}}>{zc.icon} {z.nom}</p><ul style={{margin:0,padding:"0 0 0 14px"}}>{z.zones.map((item,j)=><li key={j} style={{fontSize:12,color:zc.color,marginBottom:4,lineHeight:1.5}}>{item}</li>)}</ul></div>);})}</div></div>}
              {tab==="sante"&&<div><p style={{fontSize:9,fontWeight:700,color:"#bbb",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Vaccinations</p><div style={{background:"white",border:"1px solid #e8e8e8",borderRadius:10,overflow:"hidden",marginBottom:"1rem"}}>{fiche.sante.vaccins.map((v,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:i<fiche.sante.vaccins.length-1?"1px solid #f5f5f5":"none"}}><span style={{fontSize:13,fontWeight:500}}>{v.nom}</span><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:"#bbb"}}>{v.validite}</span><span style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:v.statut.includes("Oblig")?"#FCEBEB":v.statut.includes("appel")?"#FFF3CD":"#EAF3DE",color:v.statut.includes("Oblig")?"#A32D2D":v.statut.includes("appel")?"#7A5100":"#3B6D11",fontWeight:700}}>{v.statut}</span></div></div>))}</div><p style={{fontSize:9,fontWeight:700,color:"#bbb",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Risques sanitaires</p><div style={{display:"grid",gap:5}}>{fiche.sante.risques.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:"white",border:"1px solid #e8e8e8",borderRadius:8,fontSize:12,color:"#333"}}><span style={{color:IC2,fontSize:7,flexShrink:0}}>●</span>{r}</div>))}</div></div>}
              {tab==="visa"&&<div style={{background:"white",border:"1px solid #e8e8e8",borderLeft:`4px solid ${IC}`,borderRadius:12,padding:"1.25rem"}}><p style={{margin:0,fontSize:13,lineHeight:1.9,color:"#333"}}>{fiche.visa}</p><div style={{marginTop:"1rem",padding:"10px 14px",background:"#FFF3CD",border:"1px solid #F0AD00",borderRadius:8,fontSize:12,color:"#7A5100"}}>ℹ️ Informations indicatives. Vérifier auprès de l'ambassade avant chaque départ.</div></div>}
              {tab==="contacts"&&<div style={{background:"white",border:"1px solid #e8e8e8",borderRadius:12,overflow:"hidden"}}>{fiche.contacts.map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",borderBottom:i<fiche.contacts.length-1?"1px solid #f5f5f5":"none",alignItems:"center"}}><span style={{fontSize:12,color:"#888"}}>{c.label}</span><span style={{fontSize:13,fontWeight:700,color:IC}}>{c.valeur}</span></div>))}</div>}
            </>
          )}
          {!fiche&&<div style={{background:"white",border:"1px solid #e8e8e8",borderRadius:12,padding:"3rem",textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>{sel.flag}</div><p style={{fontWeight:700,fontSize:16,margin:"0 0 8px",color:IC}}>{sel.name}</p><p style={{color:"#aaa",fontSize:13}}>Fiche détaillée non encore disponible. Le scraping automatique alimentera cette fiche.</p></div>}
        </div>
      </div>
    );
  }

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      <header style={{background:"white",borderBottom:`3px solid ${IC}`,padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexShrink:0,zIndex:10}}>
        <IDEALogo h={30}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:IC,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:10}}>{auth[0].toUpperCase()}</div>
          <span style={{fontSize:12,color:"#666",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{auth}</span>
          <button onClick={()=>setAuth(null)} style={{padding:"5px 9px",borderRadius:6,border:"1px solid #e8e8e8",background:"#fafafa",cursor:"pointer",fontSize:11,color:"#bbb"}}>⎋</button>
        </div>
      </header>
      <div style={{flex:1,overflow:"hidden"}}>
        <AfricaMap onSelect={openFiche}/>
      </div>
    </div>
  );
}
