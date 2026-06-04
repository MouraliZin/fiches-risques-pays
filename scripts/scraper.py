import json, re, urllib.request, urllib.parse
from xml.etree import ElementTree as ET
from datetime import datetime
from pathlib import Path

# ── Correspondance ISO2 → slug France Diplomatie ─────────────────────────────
PAYS = {
    "DZ":"algerie","AO":"angola","BJ":"benin","BW":"botswana",
    "BF":"burkina-faso","BI":"burundi","CM":"cameroun","CV":"cap-vert",
    "CF":"republique-centrafricaine","KM":"comores","CG":"congo",
    "CD":"republique-democratique-du-congo","CI":"cote-d-ivoire",
    "DJ":"djibouti","EG":"egypte","ER":"erythree","SZ":"eswatini",
    "ET":"ethiopie","GA":"gabon","GM":"gambie","GH":"ghana",
    "GN":"guinee","GQ":"guinee-equatoriale","GW":"guinee-bissau",
    "KE":"kenya","LS":"lesotho","LR":"liberia","LY":"libye",
    "MG":"madagascar","MW":"malawi","ML":"mali","MA":"maroc",
    "MR":"mauritanie","MU":"maurice","MZ":"mozambique","NA":"namibie",
    "NE":"niger","NG":"nigeria","UG":"ouganda","RW":"rwanda",
    "ST":"sao-tome-et-principe","SN":"senegal","SL":"sierra-leone",
    "SO":"somalie","SD":"soudan","SS":"soudan-du-sud","TZ":"tanzanie",
    "TD":"tchad","TG":"togo","TN":"tunisie","ZA":"afrique-du-sud",
    "ZM":"zambie","ZW":"zimbabwe",
}

NAMES = {
    "DZ":"Algérie","AO":"Angola","BJ":"Bénin","BW":"Botswana","BF":"Burkina Faso",
    "BI":"Burundi","CM":"Cameroun","CV":"Cap-Vert","CF":"Centrafrique","KM":"Comores",
    "CG":"Congo","CD":"Congo RDC","CI":"Côte d'Ivoire","DJ":"Djibouti","EG":"Égypte",
    "ER":"Érythrée","SZ":"Eswatini","ET":"Éthiopie","GA":"Gabon","GM":"Gambie",
    "GH":"Ghana","GN":"Guinée","GQ":"Guinée Éq.","GW":"Guinée-Bissau","KE":"Kenya",
    "LS":"Lesotho","LR":"Libéria","LY":"Libye","MG":"Madagascar","MW":"Malawi",
    "ML":"Mali","MA":"Maroc","MR":"Mauritanie","MU":"Maurice","MZ":"Mozambique",
    "NA":"Namibie","NE":"Niger","NG":"Nigéria","UG":"Ouganda","RW":"Rwanda",
    "ST":"São Tomé","SN":"Sénégal","SL":"Sierra Leone","SO":"Somalie","SD":"Soudan",
    "SS":"Soudan du Sud","TZ":"Tanzanie","TD":"Tchad","TG":"Togo","TN":"Tunisie",
    "ZA":"Afrique du Sud","ZM":"Zambie","ZW":"Zimbabwe",
}

RISK_DEFAULT = {
    "DZ":"modere","AO":"modere","BJ":"modere","BW":"faible","BF":"eleve",
    "BI":"eleve","CM":"modere","CV":"faible","CF":"eleve","KM":"modere",
    "CG":"modere","CD":"eleve","CI":"modere","DJ":"modere","EG":"modere",
    "ER":"eleve","SZ":"modere","ET":"eleve","GA":"modere","GM":"modere",
    "GH":"faible","GN":"eleve","GQ":"modere","GW":"eleve","KE":"modere",
    "LS":"modere","LR":"modere","LY":"eleve","MG":"modere","MW":"modere",
    "ML":"eleve","MA":"faible","MR":"eleve","MU":"faible","MZ":"eleve",
    "NA":"faible","NE":"eleve","NG":"eleve","UG":"modere","RW":"faible",
    "ST":"faible","SN":"faible","SL":"modere","SO":"eleve","SD":"eleve",
    "SS":"eleve","TZ":"faible","TD":"eleve","TG":"modere","TN":"modere",
    "ZA":"modere","ZM":"faible","ZW":"modere",
}

# ─────────────────────────────────────────────────────────────────────────────
# RÉSEAU DIPLOMATIQUE TUNISIEN — ambassade/consulat de rattachement par pays
# ─────────────────────────────────────────────────────────────────────────────
# Codé en dur (et non scrappé) car le réseau diplomatique tunisien évolue très
# lentement et aucune source ne l'expose dans un format stable et fiable à
# scrapper pour les 54 pays. À vérifier 1-2x/an sur econsulat.tn.
# Quand un pays n'a pas de mission sur place, il est rattaché à l'ambassade
# régionale compétente (champ "couvre").
MISSIONS_TN = {
    "MA": {"ville":"Rabat","pays":"Maroc","tel":"+212 5 37 73 06 36","email":"at.rabat@diplomatie.gov.tn","couvre":["MA","MR"]},
    "DZ": {"ville":"Alger","pays":"Algérie","tel":"+213 21 60 13 88","email":"at.alger@diplomatie.gov.tn","couvre":["DZ"]},
    "LY": {"ville":"Tripoli","pays":"Libye","tel":"+218 21 333 33 92","email":"at.tripoli@diplomatie.gov.tn","couvre":["LY"]},
    "EG": {"ville":"Le Caire","pays":"Égypte","tel":"+20 2 2736 8962","email":"at.lecaire@diplomatie.gov.tn","couvre":["EG","SD","SS"]},
    "SN": {"ville":"Dakar","pays":"Sénégal","tel":"+221 33 823 47 47","email":"at.dakar@diplomatie.gov.tn","couvre":["SN","GM","GN","GW","CV","SL"]},
    "ML": {"ville":"Bamako","pays":"Mali","tel":"+223 20 22 60 50","email":"at.bamako@diplomatie.gov.tn","couvre":["ML","BF","NE"]},
    "CI": {"ville":"Abidjan","pays":"Côte d'Ivoire","tel":"+225 27 22 44 12 22","email":"at.abidjan@diplomatie.gov.tn","couvre":["CI","LR","TG"]},
    "NG": {"ville":"Abuja","pays":"Nigéria","tel":"+234 9 461 2000","email":"at.abuja@diplomatie.gov.tn","couvre":["NG","GH","BJ"]},
    "CM": {"ville":"Yaoundé","pays":"Cameroun","tel":"+237 222 21 03 31","email":"at.yaounde@diplomatie.gov.tn","couvre":["CM","GA","CG","CF","GQ","TD","CD","ST"]},
    "ET": {"ville":"Addis-Abeba","pays":"Éthiopie","tel":"+251 11 372 30 90","email":"at.addisabeba@diplomatie.gov.tn","couvre":["ET","DJ","MG","SC","KM","SO","ER","MU"]},
    "KE": {"ville":"Nairobi","pays":"Kenya","tel":"+254 20 271 00 67","email":"at.nairobi@diplomatie.gov.tn","couvre":["KE","UG","TZ","RW","BI"]},
    "ZA": {"ville":"Pretoria","pays":"Afrique du Sud","tel":"+27 12 342 6282","email":"at.pretoria@diplomatie.gov.tn","couvre":["ZA","NA","BW","ZW","MZ","ZM","LS","SZ","MW","AO"]},
}

# Table de rattachement pays → mission (dérivée des champs "couvre" ci-dessus).
RATTACHEMENT_TN = {}
for _mkey, _mval in MISSIONS_TN.items():
    for _c in _mval["couvre"]:
        RATTACHEMENT_TN[_c] = _mkey

# Cellule de crise / contact central du MAE tunisien (toujours utile).
MAE_TUNISIE = {
    "label"  : "MAE Tunisie — cellule de crise",
    "tel"    : "+216 71 847 500",
    "urgence": "+216 98 317 530 / +216 92 998 087",
    "email"  : "email.dct@diplomatie.gov.tn",
    "site"   : "https://www.diplomatie.gov.tn",
}

# ─────────────────────────────────────────────────────────────────────────────
# VISA — dataset open-source passport-index (passeport tunisien TN → pays)
# ─────────────────────────────────────────────────────────────────────────────
# Source : https://github.com/ilyankou/passport-index-dataset (licence MIT)
# Donne, pour le passeport TN, le statut d'entrée vers chaque pays.
VISA_CSV_URL = (
    "https://raw.githubusercontent.com/ilyankou/"
    "passport-index-dataset/master/passport-index-tidy-iso2.csv"
)

# URLs par section (nouvelle structure du site)
def urls(slug):
    base = f"https://www.diplomatie.gouv.fr/fr/information-par-pays/{slug}"
    return {
        "securite" : f"{base}/conseils-aux-voyageurs-securite",
        "sante"    : f"{base}/conseils-aux-voyageurs-sante",
        "visa"     : f"{base}/conseils-aux-voyageurs-entree-sejour",
        "contacts" : f"{base}/conseils-aux-voyageurs-contacts-utiles",
        "rss"      : f"https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/?xtor=RSS-2",
        "main"     : f"https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/",
    }

# ── Fetch ─────────────────────────────────────────────────────────────────────
def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "fr-FR,fr;q=0.9",
        })
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"    ⚠ {url[-50:]} → {e}")
        return None

# ── Nettoyage ─────────────────────────────────────────────────────────────────
def clean(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = re.sub(r"&amp;","&", t)
    t = re.sub(r"&nbsp;"," ", t)
    t = re.sub(r"&[a-z]+;","", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def sentences(html, min_len=40, max_len=400):
    """Extrait les phrases significatives d'un bloc HTML."""
    paras = re.findall(r'<(?:p|li)[^>]*>(.*?)</(?:p|li)>', html, re.DOTALL|re.IGNORECASE)
    result = []
    for p in paras:
        c = clean(p)
        if min_len <= len(c) <= max_len:
            result.append(c)
    return result

# ── RSS : date + alertes ──────────────────────────────────────────────────────
def parse_rss(rss_url):
    xml = fetch(rss_url)
    if not xml:
        return None, []
    try:
        root = ET.fromstring(xml)
        upd = root.find(".//lastBuildDate") or root.find(".//pubDate")
        source_date = None
        if upd is not None and upd.text:
            try:
                dt = datetime.strptime(upd.text.strip()[:25], "%a, %d %b %Y %H:%M:%S")
                source_date = dt.strftime("%d %b %Y")
            except:
                source_date = upd.text.strip()[:20]
        alerts = []
        for item in root.findall(".//item")[:3]:
            t = item.find("title")
            d = item.find("description")
            if t is not None and t.text and len(t.text.strip()) > 5:
                alerts.append({
                    "titre": t.text.strip(),
                    "texte": clean(d.text or "")[:300] if d is not None else ""
                })
        return source_date, alerts
    except:
        return None, []

# ── Date sur la page principale ───────────────────────────────────────────────
def parse_main_date(html):
    """Extrait 'Date de mise à jour le : JJ mois AAAA' depuis la page principale."""
    if not html:
        return None
    patterns = [
        r'mise à jour le\s*[:\s]*(\d{1,2}[/\s]\w+[/\s]\d{4})',
        r'mise à jour le\s*[:\s]*(\d{2}/\d{2}/\d{4})',
        r'actualis[ée] le\s*[:\s]*(\d{2}/\d{2}/\d{4})',
        r'(\d{2}/\d{2}/\d{4})',
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            raw = m.group(1).strip()
            # Convertit DD/MM/YYYY → DD Mon YYYY
            try:
                dt = datetime.strptime(raw, "%d/%m/%Y")
                return dt.strftime("%d %b %Y")
            except:
                return raw
    return None

# ── SÉCURITÉ ──────────────────────────────────────────────────────────────────
def scrape_securite(html):
    if not html:
        return []
    securite = []

    # Cherche les blocs h2/h3 + contenu
    blocks = re.findall(
        r'<h[23][^>]*>(.*?)</h[23]>(.*?)(?=<h[23]|<footer|<aside)',
        html, re.DOTALL|re.IGNORECASE
    )

    NIVEAU_KEYS = {
        "eleve" : ["terroris","enlèvement","piraterie","élevé","rouge","interdit","formellement"],
        "modere": ["criminalité","routier","moderé","modéré","prudence","vigilance","vol","agression"],
        "faible": ["faible","normal","réduit","stable","calme"],
    }

    seen = set()
    for title_html, body_html in blocks:
        title = clean(title_html)
        if not title or len(title) > 100 or title in seen:
            continue
        # Filtre les titres non pertinents
        if any(k in title.lower() for k in ["menu","navigation","pied","header","footer","recherche","inscription"]):
            continue
        seen.add(title)
        body_text = " ".join(sentences(body_html, min_len=20))[:400]
        if not body_text:
            body_text = clean(body_html)[:400]
        if len(body_text) < 20:
            continue
        # Détermine le niveau
        combined = (title + body_text).lower()
        niveau = "modere"
        for niv, keys in NIVEAU_KEYS.items():
            if any(k in combined for k in keys):
                niveau = niv
                break
        securite.append({"label": title, "niveau": niveau, "texte": body_text})

    # Fallback : extrait des paragraphes significatifs
    if not securite:
        paras = sentences(html, min_len=60)
        for p in paras[:6]:
            niveau = "modere"
            pl = p.lower()
            if any(k in pl for k in ["formellement","terroris","enlèvement","interdit"]):
                niveau = "eleve"
            elif any(k in pl for k in ["faible","stable"]):
                niveau = "faible"
            securite.append({"label": "Information sécurité", "niveau": niveau, "texte": p})

    return securite[:8]

# ── ZONES DE VIGILANCE ────────────────────────────────────────────────────────
def scrape_zones(html):
    if not html:
        return []
    zones = []
    configs = [
        ("rouge",  "Formellement déconseillées",        ["formellement déconseillé","zone rouge"]),
        ("orange", "Déconseillées sauf raison impérative",["déconseillé sauf","zone orange","raison impérative"]),
        ("jaune",  "Vigilance renforcée",                ["vigilance renforcée","zone jaune","particulière attention"]),
    ]
    html_low = html.lower()
    for couleur, nom, markers in configs:
        for marker in markers:
            idx = html_low.find(marker)
            if idx == -1:
                continue
            # Extrait le bloc autour du marqueur
            block = html[max(0, idx-100):min(len(html), idx+2000)]
            # Cherche les listes dans ce bloc
            items = []
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', block, re.DOTALL|re.IGNORECASE)
            for li in li_items[:8]:
                c = clean(li)
                if 10 < len(c) < 200:
                    items.append(c)
            # Si pas de liste, prend les phrases du bloc
            if not items:
                for s in sentences(block, min_len=20, max_len=200):
                    items.append(s)
                    if len(items) >= 5:
                        break
            if items:
                zones.append({"couleur": couleur, "nom": nom, "zones": items[:6]})
                break
    return zones

# ── SANTÉ ─────────────────────────────────────────────────────────────────────
def scrape_sante(html):
    if not html:
        return {"vaccins": [], "risques": []}

    # ── Vaccins ──
    vaccins = []
    VACC_LIST = [
        ("Fièvre jaune",    ["fièvre jaune","yellow fever"]),
        ("Hépatite A",      ["hépatite a"]),
        ("Hépatite B",      ["hépatite b"]),
        ("Typhoïde",        ["typhoïde","typhoid"]),
        ("Méningite",       ["méningite"]),
        ("Rage",            ["rage","rabies"]),
        ("DTP",             ["diphtérie","tétanos","poliomyélite","dtp"]),
        ("Paludisme",       ["paludisme","malaria"]),
        ("Rougeole",        ["rougeole"]),
        ("Choléra",         ["choléra"]),
        ("Mpox",            ["mpox","monkeypox"]),
    ]
    html_low = html.lower()
    for nom, keys in VACC_LIST:
        for key in keys:
            if key in html_low:
                idx = html_low.find(key)
                snippet = html[max(0,idx-50):min(len(html),idx+300)]
                snippet_low = snippet.lower()
                if any(k in snippet_low for k in ["obligatoire","exigé","requis","centre agréé"]):
                    statut = "Obligatoire"
                elif any(k in snippet_low for k in ["rappel"]):
                    statut = "Rappel obligatoire"
                else:
                    statut = "Recommandé"
                vaccins.append({"nom": nom, "validite": "Voir médecin", "statut": statut})
                break

    # ── Risques sanitaires ──
    risques = []
    MALADIES = [
        "choléra","paludisme","dengue","fièvre jaune","typhoïde","méningite",
        "hépatite","rage","mpox","monkeypox","chikungunya","fièvre de marburg",
        "ébola","poliomyélite","rougeole","hiv","sida","grippe aviaire",
        "leishmaniose","bilharziose","trypanosomiase","fièvre typhoïde"
    ]
    for maladie in MALADIES:
        if maladie in html_low:
            idx = html_low.find(maladie)
            snippet = clean(html[max(0,idx):min(len(html),idx+250)])
            if len(snippet) > 20:
                risques.append(snippet[:200])
            else:
                risques.append(maladie.capitalize())

    return {"vaccins": vaccins[:10], "risques": list(dict.fromkeys(risques))[:10]}

# ── VISA : dataset passeport tunisien (chargé 1x) ──────────────────────────────
def load_visas_tn(timeout=30):
    """Télécharge le dataset passport-index et renvoie {ISO2_dest: {...}} pour TN.
    Renvoie {} si échec → le scraper conservera alors l'ancienne valeur visa."""
    try:
        req = urllib.request.Request(VISA_CSV_URL, headers={
            "User-Agent": "Mozilla/5.0 (IDEA Consult Fiches Risques)"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            contenu = r.read().decode("utf-8")
    except Exception as e:
        print(f"  ⚠ Dataset visa indisponible → {e}")
        return {}

    import csv, io
    out = {}
    for row in csv.DictReader(io.StringIO(contenu)):
        if (row.get("Passport","").strip().upper() != "TN"):
            continue
        dest = row.get("Destination","").strip().upper()
        code = (row.get("Code","") or "").strip()
        info = _interpret_visa_code(code)
        if info and dest:
            out[dest] = info
    print(f"  ✓ Visa passeport TN : {len(out)} destinations chargées")
    return out

def _interpret_visa_code(code):
    """Traduit un code du dataset en {statut, categorie, duree, texte} (FR)."""
    if code in ("-1", ""):
        return None
    if code.isdigit():
        j = int(code)
        return {"statut":"Sans visa","categorie":"exempte","duree":f"{j} jours",
                "texte":(f"Ressortissants tunisiens : séjour sans visa jusqu'à {j} jours. "
                         f"Passeport en cours de validité requis.")}
    table = {
        "visa free":{"statut":"Sans visa","categorie":"exempte","duree":"Non précisée",
            "texte":"Ressortissants tunisiens exemptés de visa. Vérifier la durée autorisée auprès de la représentation du pays."},
        "VOA":{"statut":"Visa à l'arrivée","categorie":"arrivee","duree":"Variable",
            "texte":"Visa délivré à l'arrivée (frontière/aéroport) pour les ressortissants tunisiens. Prévoir frais en espèces et photos d'identité."},
        "ETA":{"statut":"e-Visa / autorisation en ligne","categorie":"evisa","duree":"Variable",
            "texte":"Autorisation électronique ou e-visa à obtenir EN LIGNE avant le départ. Anticiper le délai de traitement."},
        "VR":{"statut":"Visa obligatoire","categorie":"obligatoire","duree":"Selon visa",
            "texte":"Visa obligatoire à obtenir AVANT le départ auprès de l'ambassade/consulat du pays de destination. Délai à anticiper."},
    }
    return table.get(code, {"statut":code,"categorie":"inconnu","duree":"",
            "texte":f"Condition d'entrée : {code}. Vérifier auprès de la représentation du pays."})

# ── AMBASSADE DE TUNISIE de rattachement ───────────────────────────────────────
def ambassade_tn(iso):
    """Renvoie la représentation tunisienne compétente pour `iso`
    (sur place ou de rattachement), avec un libellé prêt pour App.jsx."""
    iso = (iso or "").upper()
    mkey = RATTACHEMENT_TN.get(iso)
    if mkey and mkey in MISSIONS_TN:
        m = MISSIONS_TN[mkey]
        sur_place = (mkey == iso)
        if sur_place:
            label = f"Ambassade de Tunisie — {m['ville']}"
        else:
            label = f"Ambassade de Tunisie — {m['ville']} ({m['pays']}, rattachement)"
        return {"label": label, "valeur": m["tel"], "email": m["email"],
                "ville": m["ville"], "pays_mission": m["pays"], "sur_place": sur_place}
    # repli : MAE à Tunis
    return {"label":"MAE Tunisie (aucune mission régionale)","valeur":MAE_TUNISIE["tel"],
            "email":MAE_TUNISIE["email"],"ville":"Tunis","pays_mission":"Tunisie","sur_place":False}

# ── CARTE des zones de vigilance : téléchargement local (contourne le CORS) ─────
def download_carte(iso, html_securite, base_url, timeout=15):
    """Repère l'image carte dans la page sécurité, la télécharge dans
    public/maps/{ISO}.jpg et renvoie '/maps/{ISO}.jpg'. None si échec."""
    if not iso or not html_securite:
        return None
    indices = ("carte","vigilance","zones","conseille","deconseille","map","_cle","/img/")
    cands = []
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', html_securite, re.I):
        src = m.group(1)
        score = sum(1 for ind in indices if ind in src.lower())
        if score == 0 and not re.search(r'\.(jpg|jpeg|png)(\?|$)', src, re.I):
            continue
        cands.append((score, urllib.parse.urljoin(base_url, src)))
    cands.sort(key=lambda t: t[0], reverse=True)
    if not cands:
        return None

    Path("public/maps").mkdir(parents=True, exist_ok=True)
    dest = Path("public/maps") / f"{iso}.jpg"
    for _, url in cands[:5]:
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": base_url})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            if len(data) < 5000:   # rejette icônes/puces
                continue
            dest.write_bytes(data)
            print(f"    🗺  carte {iso} enregistrée ({len(data)} o)")
            return f"/maps/{iso}.jpg"
        except Exception:
            continue
    return None

# ── VISA ──────────────────────────────────────────────────────────────────────
def scrape_visa(html):
    if not html:
        return "Consulter l'ambassade pour les conditions d'entrée en vigueur."
    relevant = []
    for s in sentences(html, min_len=40, max_len=500):
        if any(k in s.lower() for k in ["visa","passeport","entrée","séjour","vaccin","frontière","ambassade","ressortissant"]):
            relevant.append(s)
        if len(relevant) >= 4:
            break
    return " ".join(relevant)[:700] if relevant else "Consulter l'ambassade pour les conditions d'entrée en vigueur."

# ── CONTACTS ─────────────────────────────────────────────────────────────────
def scrape_contacts(html, country_name, iso):
    """Contacts locaux génériques (police, SAMU, pompiers…) scrappés,
    PUIS ambassade de Tunisie de rattachement + cellule de crise MAE."""
    contacts = []
    if html:
        blocks = re.findall(
            r'([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\(\)\-/\.]{4,58})\s*[:\–\-]\s*(\+?[\d][\d\s\.\-]{6,18})',
            html
        )
        seen_nums = set()
        for label, num in blocks[:10]:
            label = label.strip().rstrip(':–- ')
            num   = num.strip()
            if len(label) < 4 or any(k in label.lower() for k in ["http","www","@","class","style","div"]):
                continue
            if num not in seen_nums and len(num) >= 6:
                contacts.append({"label": label, "valeur": num})
                seen_nums.add(num)

    # Ambassade de Tunisie compétente (sur place ou rattachement régional)
    amb = ambassade_tn(iso)
    contacts.append({"label": amb["label"], "valeur": amb["valeur"]})
    # Cellule de crise du MAE tunisien (numéro d'urgence)
    contacts.append({"label": MAE_TUNISIE["label"], "valeur": MAE_TUNISIE["urgence"]})

    return contacts[:10]

# ── VERSIONNEMENT ─────────────────────────────────────────────────────────────
def compute_version(source_date, existing):
    prev_source = existing.get("sourceDateStr")
    prev_ver    = existing.get("version", 1)
    prev_int    = existing.get("dateMAJInterne")
    if source_date and source_date != prev_source:
        return prev_ver + 1, datetime.now().strftime("%d %b %Y"), True
    return prev_ver, prev_int or datetime.now().strftime("%d %b %Y"), False

# ── SCRAPING COMPLET D'UN PAYS ────────────────────────────────────────────────
def scrape_country(iso, slug, existing, visas_tn):
    u = urls(slug)
    name = NAMES.get(iso, iso)
    print(f"  [{iso}] {name}...")

    # 1. RSS → date source + alertes
    source_date, alerts = parse_rss(u["rss"])

    # 2. Page principale → date si RSS vide
    if not source_date:
        main_html   = fetch(u["main"])
        source_date = parse_main_date(main_html)

    # 3. Pages spécialisées
    html_sec  = fetch(u["securite"])
    html_san  = fetch(u["sante"])
    html_visa = fetch(u["visa"])
    html_con  = fetch(u["contacts"])

    # 4. Contenu
    risk     = RISK_DEFAULT.get(iso, "modere")
    if html_sec:
        t = html_sec.lower()
        rouge  = t.count("formellement déconseillé") + t.count("zone rouge")
        orange = t.count("déconseillé sauf")          + t.count("zone orange")
        if rouge >= 2:               risk = "eleve"
        elif rouge >= 1 or orange >= 2: risk = "modere"
        else:                           risk = "faible"

    securite = scrape_securite(html_sec)
    zones    = scrape_zones(html_sec)
    sante    = scrape_sante(html_san)
    contacts = scrape_contacts(html_con, name, iso)

    # 4b. VISA — perspective ressortissant tunisien (dataset) + détail FD.
    #     visaDetail : statut structuré (passeport TN). visa : texte affiché.
    detail = visas_tn.get(iso)
    contexte_fd = scrape_visa(html_visa)   # complément documentaire France Diplomatie
    if detail:
        visa = detail["texte"]
        if contexte_fd and "Consulter l'ambassade" not in contexte_fd:
            visa = f"{detail['texte']}\n\nContexte (France Diplomatie) : {contexte_fd}"
        visa_detail = detail
    else:
        # pas de donnée dataset → on garde l'ancienne valeur si elle existe
        visa = existing.get("visa") or contexte_fd
        visa_detail = existing.get("visaDetail")

    # 4c. CARTE zones de vigilance — téléchargée localement (contourne CORS)
    carte = download_carte(iso, html_sec, u["securite"]) or existing.get("carteVigilance")

    # 5. Versionnement
    new_ver, new_int_date, changed = compute_version(source_date, existing)
    if changed:
        print(f"    ✅ Changement : {existing.get('sourceDateStr')} → {source_date} (V{existing.get('version',1)}→V{new_ver})")
    else:
        print(f"    ⏸  Inchangé (V{new_ver})")

    return {
        "iso"            : iso,
        "sourceDateStr"  : source_date or existing.get("sourceDateStr","—"),
        "dateMAJInterne" : new_int_date,
        "risk"           : risk,
        "version"        : new_ver,
        "derniereMinute" : alerts,
        "securite"       : securite,
        "zonesVigilance" : zones,
        "sante"          : sante,
        "visa"           : visa,
        "visaDetail"     : visa_detail,
        "contacts"       : contacts,
        "carteVigilance" : carte,
        "source"         : u["main"],
        "scrapedAt"      : datetime.now().isoformat(),
    }, changed

# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n🚀 Scraping démarré — {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")

    data_path = Path("public/data.json")
    existing_data = {}
    if data_path.exists():
        try:
            with open(data_path, encoding="utf-8") as f:
                existing_data = json.load(f).get("countries", {})
        except:
            pass

    results, changed_count = {}, 0
    visas_tn = load_visas_tn()   # dataset passeport TN, chargé une seule fois
    for iso, slug in PAYS.items():
        try:
            data, changed = scrape_country(iso, slug, existing_data.get(iso, {}), visas_tn)
            results[iso]  = data
            if changed: changed_count += 1
        except Exception as e:
            print(f"    ❌ Erreur {iso}: {e}")
            results[iso] = existing_data.get(iso, {
                "iso": iso, "risk": RISK_DEFAULT.get(iso,"modere"), "version": 1
            })

    data_path.parent.mkdir(parents=True, exist_ok=True)
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump({"generatedAt": datetime.now().isoformat(), "totalChanged": changed_count, "countries": results},
                  f, ensure_ascii=False, indent=2)

    print(f"\n✅ Terminé — {len(results)} pays · {changed_count} changements détectés")

if __name__ == "__main__":
    main()
