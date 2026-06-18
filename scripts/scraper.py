#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
#  FICHES RISQUES PAYS — IDEA Consult International
#  Scraper fusionné : voyage.gc.ca (Canada, structure) + diplomatie.gouv.fr
#  (France, zones de vigilance) → fiche adaptée au RESSORTISSANT TUNISIEN.
#
#  Sortie : public/data.json  +  cartes dans public/maps/{ISO}.jpg
#
#  Principes :
#   • Canada = source structurée (sections nettes, niveau de risque, carte fiable)
#   • France = vocabulaire des zones (formellement déconseillé / sauf raison
#     impérative / vigilance renforcée)
#   • Adaptation TN par RÈGLES DÉTERMINISTES (pas d'IA) : substitutions,
#     retrait des blocs occidentaux non pertinents, injection ambassade + visa.
#   • L'ALERTE LA PLUS IMPORTANTE est placée en tête (champ alertePrincipale).
#   • Versionnement conservé : V+1 uniquement si la date source a changé.
# ─────────────────────────────────────────────────────────────────────────────

import json, re, csv, io, urllib.request, urllib.parse
from xml.etree import ElementTree as ET
from datetime import datetime
from pathlib import Path

# ═════════════════════════════════════════════════════════════════════════════
#  TABLES DE RÉFÉRENCE
# ═════════════════════════════════════════════════════════════════════════════

# ── ISO2 → slug France Diplomatie ────────────────────────────────────────────
SLUG_FR = {
    "DZ":"algerie","AO":"angola","BJ":"benin","BW":"botswana","BF":"burkina-faso",
    "BI":"burundi","CM":"cameroun","CV":"cap-vert","CF":"republique-centrafricaine",
    "KM":"comores","CG":"congo","CD":"republique-democratique-du-congo",
    "CI":"cote-d-ivoire","DJ":"djibouti","EG":"egypte","ER":"erythree","SZ":"eswatini",
    "ET":"ethiopie","GA":"gabon","GM":"gambie","GH":"ghana","GN":"guinee",
    "GQ":"guinee-equatoriale","GW":"guinee-bissau","KE":"kenya","LS":"lesotho",
    "LR":"liberia","LY":"libye","MG":"madagascar","MW":"malawi","ML":"mali",
    "MA":"maroc","MR":"mauritanie","MU":"maurice","MZ":"mozambique","NA":"namibie",
    "NE":"niger","NG":"nigeria","UG":"ouganda","RW":"rwanda","ST":"sao-tome-et-principe",
    "SN":"senegal","SL":"sierra-leone","SO":"somalie","SD":"soudan","SS":"soudan-du-sud",
    "TZ":"tanzanie","TD":"tchad","TG":"togo","TN":"tunisie","ZA":"afrique-du-sud",
    "ZM":"zambie","ZW":"zimbabwe",
}

# ── ISO2 → slug Canada (voyage.gc.ca/destinations/{slug}) ────────────────────
# Souvent identique au FR mais quelques différences (pas d'article, graphies).
SLUG_CA = {
    "DZ":"algerie","AO":"angola","BJ":"benin","BW":"botswana","BF":"burkina-faso",
    "BI":"burundi","CM":"cameroun","CV":"cap-vert","CF":"republique-centrafricaine",
    "KM":"comores","CG":"congo","CD":"republique-democratique-congo",
    "CI":"cote-divoire","DJ":"djibouti","EG":"egypte","ER":"erythree","SZ":"eswatini",
    "ET":"ethiopie","GA":"gabon","GM":"gambie","GH":"ghana","GN":"guinee",
    "GQ":"guinee-equatoriale","GW":"guinee-bissau","KE":"kenya","LS":"lesotho",
    "LR":"liberia","LY":"libye","MG":"madagascar","MW":"malawi","ML":"mali",
    "MA":"maroc","MR":"mauritanie","MU":"maurice","MZ":"mozambique","NA":"namibie",
    "NE":"niger","NG":"nigeria","UG":"ouganda","RW":"rwanda","ST":"sao-tome-et-principe",
    "SN":"senegal","SL":"sierra-leone","SO":"somalie","SD":"soudan","SS":"soudan-du-sud",
    "TZ":"tanzanie","TD":"tchad","TG":"togo","TN":"tunisie","ZA":"afrique-du-sud",
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

REGIONS = {
    "DZ":"Afrique du Nord","EG":"Afrique du Nord","LY":"Afrique du Nord",
    "MA":"Afrique du Nord","MR":"Afrique du Nord","TN":"Afrique du Nord",
    "BJ":"Afrique de l'Ouest","BF":"Afrique de l'Ouest","CV":"Afrique de l'Ouest",
    "CI":"Afrique de l'Ouest","GM":"Afrique de l'Ouest","GH":"Afrique de l'Ouest",
    "GN":"Afrique de l'Ouest","GW":"Afrique de l'Ouest","LR":"Afrique de l'Ouest",
    "ML":"Afrique de l'Ouest","NE":"Afrique de l'Ouest","NG":"Afrique de l'Ouest",
    "SN":"Afrique de l'Ouest","SL":"Afrique de l'Ouest","TG":"Afrique de l'Ouest",
    "CM":"Afrique Centrale","CF":"Afrique Centrale","CG":"Afrique Centrale",
    "CD":"Afrique Centrale","GA":"Afrique Centrale","GQ":"Afrique Centrale",
    "ST":"Afrique Centrale","TD":"Afrique Centrale","AO":"Afrique Centrale",
    "BI":"Afrique de l'Est","DJ":"Afrique de l'Est","ER":"Afrique de l'Est",
    "ET":"Afrique de l'Est","KE":"Afrique de l'Est","KM":"Afrique de l'Est",
    "MG":"Afrique de l'Est","MU":"Afrique de l'Est","RW":"Afrique de l'Est",
    "SC":"Afrique de l'Est","SO":"Afrique de l'Est","SS":"Afrique de l'Est",
    "SD":"Afrique de l'Est","TZ":"Afrique de l'Est","UG":"Afrique de l'Est",
    "BW":"Afrique Australe","LS":"Afrique Australe","MW":"Afrique Australe",
    "MZ":"Afrique Australe","NA":"Afrique Australe","SZ":"Afrique Australe",
    "ZA":"Afrique Australe","ZM":"Afrique Australe","ZW":"Afrique Australe",
}

RISK_DEFAULT = {
    "DZ":"modere","AO":"modere","BJ":"modere","BW":"faible","BF":"eleve","BI":"eleve",
    "CM":"modere","CV":"faible","CF":"eleve","KM":"modere","CG":"modere","CD":"eleve",
    "CI":"modere","DJ":"modere","EG":"modere","ER":"eleve","SZ":"modere","ET":"eleve",
    "GA":"modere","GM":"modere","GH":"faible","GN":"eleve","GQ":"modere","GW":"eleve",
    "KE":"modere","LS":"modere","LR":"modere","LY":"eleve","MG":"modere","MW":"modere",
    "ML":"eleve","MA":"faible","MR":"eleve","MU":"faible","MZ":"eleve","NA":"faible",
    "NE":"eleve","NG":"eleve","UG":"modere","RW":"faible","ST":"faible","SN":"faible",
    "SL":"modere","SO":"eleve","SD":"eleve","SS":"eleve","TZ":"faible","TD":"eleve",
    "TG":"modere","TN":"modere","ZA":"modere","ZM":"faible","ZW":"modere",
}

# ── Réseau diplomatique tunisien : ambassade de rattachement par pays ────────
# Codé en dur (évolue lentement, aucune source structurée fiable). À vérifier
# 1-2×/an sur econsulat.tn. "couvre" = pays rattachés à cette mission.
MISSIONS_TN = {
    "MA":{"ville":"Rabat","pays":"Maroc","tel":"+212 5 37 73 06 36","email":"at.rabat@diplomatie.gov.tn","couvre":["MA","MR"]},
    "DZ":{"ville":"Alger","pays":"Algérie","tel":"+213 21 60 13 88","email":"at.alger@diplomatie.gov.tn","couvre":["DZ"]},
    "LY":{"ville":"Tripoli","pays":"Libye","tel":"+218 21 333 33 92","email":"at.tripoli@diplomatie.gov.tn","couvre":["LY"]},
    "EG":{"ville":"Le Caire","pays":"Égypte","tel":"+20 2 2736 8962","email":"at.lecaire@diplomatie.gov.tn","couvre":["EG","SD","SS"]},
    "SN":{"ville":"Dakar","pays":"Sénégal","tel":"+221 33 823 47 47","email":"at.dakar@diplomatie.gov.tn","couvre":["SN","GM","GN","GW","CV","SL"]},
    "ML":{"ville":"Bamako","pays":"Mali","tel":"+223 20 22 60 50","email":"at.bamako@diplomatie.gov.tn","couvre":["ML","BF","NE"]},
    "CI":{"ville":"Abidjan","pays":"Côte d'Ivoire","tel":"+225 27 22 44 12 22","email":"at.abidjan@diplomatie.gov.tn","couvre":["CI","LR","TG"]},
    "NG":{"ville":"Abuja","pays":"Nigéria","tel":"+234 9 461 2000","email":"at.abuja@diplomatie.gov.tn","couvre":["NG","GH","BJ"]},
    "CM":{"ville":"Yaoundé","pays":"Cameroun","tel":"+237 222 21 03 31","email":"at.yaounde@diplomatie.gov.tn","couvre":["CM","GA","CG","CF","GQ","TD","CD","ST"]},
    "ET":{"ville":"Addis-Abeba","pays":"Éthiopie","tel":"+251 11 372 30 90","email":"at.addisabeba@diplomatie.gov.tn","couvre":["ET","DJ","MG","SC","KM","SO","ER","MU"]},
    "KE":{"ville":"Nairobi","pays":"Kenya","tel":"+254 20 271 00 67","email":"at.nairobi@diplomatie.gov.tn","couvre":["KE","UG","TZ","RW","BI"]},
    "ZA":{"ville":"Pretoria","pays":"Afrique du Sud","tel":"+27 12 342 6282","email":"at.pretoria@diplomatie.gov.tn","couvre":["ZA","NA","BW","ZW","MZ","ZM","LS","SZ","MW","AO"]},
}
RATTACHEMENT_TN = {}
for _k,_v in MISSIONS_TN.items():
    for _c in _v["couvre"]:
        RATTACHEMENT_TN[_c] = _k

MAE_TUNISIE = {
    "label":"MAE Tunisie — cellule de crise","tel":"+216 71 847 500",
    "urgence":"+216 98 317 530 / +216 92 998 087",
    "email":"email.dct@diplomatie.gov.tn","site":"https://www.diplomatie.gov.tn",
}

VISA_CSV_URL = ("https://raw.githubusercontent.com/ilyankou/"
                "passport-index-dataset/master/passport-index-tidy-iso2.csv")

# Numéros d'urgence locaux génériques (secours universels, par pays).
# Complète ce que le scraping ne fournit pas toujours. Source : indicatifs usuels.
URGENCES_LOCALES = {
    "MZ":[{"label":"Police","valeur":"119"},{"label":"Urgences médicales","valeur":"117"},{"label":"Pompiers","valeur":"198"}],
    "SN":[{"label":"Police","valeur":"17"},{"label":"SAMU","valeur":"1515"},{"label":"Pompiers","valeur":"18"}],
    # … complété au fil de l'eau ; sinon fallback générique ci-dessous
}
URGENCE_FALLBACK = [{"label":"Police / Secours","valeur":"Voir contacts locaux"}]

# ═════════════════════════════════════════════════════════════════════════════
#  UTILITAIRES RÉSEAU & TEXTE
# ═════════════════════════════════════════════════════════════════════════════

def fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept":"text/html,application/xhtml+xml","Accept-Language":"fr-FR,fr;q=0.9",
        })
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"    ⚠ {url[-55:]} → {e}")
        return None

def clean(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = (t.replace("&amp;","&").replace("&nbsp;"," ").replace("&#039;","'")
           .replace("&rsquo;","'").replace("&laquo;","«").replace("&raquo;","»")
           .replace("&eacute;","é").replace("&egrave;","è").replace("&agrave;","à"))
    t = re.sub(r"&[a-z]+;", "", t)
    return re.sub(r"\s+", " ", t).strip()

def paras(html, min_len=40, max_len=500):
    """Phrases significatives depuis les <p> et <li>."""
    out = []
    for p in re.findall(r'<(?:p|li)[^>]*>(.*?)</(?:p|li)>', html or "", re.DOTALL|re.I):
        c = clean(p)
        if min_len <= len(c) <= max_len:
            out.append(c)
    return out

MOIS = {"janvier":1,"février":2,"fevrier":2,"mars":3,"avril":4,"mai":5,"juin":6,
        "juillet":7,"août":8,"aout":8,"septembre":9,"octobre":10,"novembre":11,"décembre":12,"decembre":12}

def date_fr(jour, mois_nom, annee):
    try:
        return datetime(int(annee), MOIS[mois_nom.lower()], int(jour))
    except Exception:
        return None

# ═════════════════════════════════════════════════════════════════════════════
#  SOURCE CANADA — voyage.gc.ca (structure principale)
# ═════════════════════════════════════════════════════════════════════════════

CA_BASE = "https://voyage.gc.ca/destinations/{slug}"
CA_MAP  = "https://www.international.gc.ca/tama-sgcv_images/maps-cartes/{iso}/mapfra.png"

# Niveau de risque Canada → niveau interne IDEA
CA_RISK = [
    ("évitez tout voyage",          "eleve"),
    ("evitez tout voyage",          "eleve"),
    ("évitez tout voyage non essentiel","modere"),
    ("grande prudence",             "modere"),
    ("mesures de sécurité normales","faible"),
    ("mesures de securite normales","faible"),
]

def ca_fetch(iso):
    """Récupère le HTML de la page Canada pour un pays."""
    slug = SLUG_CA.get(iso)
    if not slug:
        return None, None
    url = CA_BASE.format(slug=slug)
    return fetch(url), url

def ca_date(html):
    """Date de dernière mise à jour Canada : 'Date de la dernière mise à jour : 29 mai 2026'."""
    if not html: return None
    m = re.search(r"derni[èe]re mise à jour\s*:?\s*</?[^>]*>?\s*(\d{1,2})\s+([a-zA-Zûéèà]+)\s+(\d{4})", html, re.I)
    if m:
        return date_fr(m.group(1), m.group(2), m.group(3))
    return None

def ca_risk(html):
    """Détermine le niveau de risque global depuis la page Canada."""
    if not html: return None
    t = clean(html).lower()
    # On cherche la phrase chapeau du pays (la 1re occurrence forte)
    if "évitez tout voyage" in t and "non essentiel" not in t.split("évitez tout voyage")[0][-40:]:
        # présence d'un "évitez tout voyage" (zone rouge) → au moins modéré, souvent élevé
        if t.count("évitez tout voyage") >= 2:
            return "eleve"
    for needle, lvl in CA_RISK:
        if needle in t:
            return lvl
    return None

def ca_sections(html):
    """Extrait les sous-sections de sécurité Canada (h3 + paragraphes)."""
    if not html: return []
    # Isole le bloc Sécurité (entre <h2>Sécurité</h2> et le <h2> suivant)
    msec = re.search(r'<h2[^>]*>\s*Sécurité\s*</h2>(.*?)<h2', html, re.DOTALL|re.I)
    bloc = msec.group(1) if msec else html
    out = []
    # Chaque sous-section : <h3>Titre</h3> ... jusqu'au prochain h3
    parts = re.split(r'<h3[^>]*>(.*?)</h3>', bloc, flags=re.DOTALL|re.I)
    # parts = [avant, titre1, contenu1, titre2, contenu2, ...]
    for i in range(1, len(parts)-1, 2):
        titre = clean(parts[i])
        contenu = " ".join(paras(parts[i+1])[:3])
        if titre and contenu and len(contenu) > 40:
            out.append({"titre": titre, "texte": contenu})
    return out

# ═════════════════════════════════════════════════════════════════════════════
#  SOURCE FRANCE — diplomatie.gouv.fr (zones de vigilance + alertes RSS)
# ═════════════════════════════════════════════════════════════════════════════

def fr_urls(slug):
    base = f"https://www.diplomatie.gouv.fr/fr/information-par-pays/{slug}"
    return {
        "securite":f"{base}/conseils-aux-voyageurs-securite",
        "rss":f"https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/?xtor=RSS-2",
    }

def fr_rss(rss_url):
    """Renvoie (date_source, [alertes]) depuis le flux RSS France Diplomatie."""
    xml = fetch(rss_url)
    if not xml:
        return None, []
    alerts, date_src = [], None
    try:
        root = ET.fromstring(xml)
        # lastBuildDate
        lb = root.find(".//lastBuildDate")
        if lb is not None and lb.text:
            date_src = parse_rfc_date(lb.text)
        for item in root.findall(".//item")[:5]:
            titre = clean(item.findtext("title") or "")
            desc  = clean(item.findtext("description") or "")
            if titre:
                alerts.append({"titre": titre, "texte": desc[:300]})
    except Exception as e:
        print(f"    ⚠ RSS parse → {e}")
    return date_src, alerts

def parse_rfc_date(s):
    """Date RSS type 'Tue, 15 Apr 2026 10:00:00' → datetime."""
    m = re.search(r"(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})", s)
    if not m: return None
    en = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}
    try:
        return datetime(int(m.group(3)), en[m.group(2)], int(m.group(1)))
    except Exception:
        return None

def fr_zones(html):
    """Extrait les zones de vigilance (rouge/orange/jaune) depuis la page sécurité FR."""
    if not html: return []
    t = clean(html)
    zones = []
    # Rouge : formellement déconseillé
    for m in re.finditer(r"formellement déconseillé[^.]*?(?:de se rendre|dans)([^.]{5,120})", t, re.I):
        zones.append({"couleur":"rouge","nom":clean(m.group(1)).strip(" ,;:"),"desc":"Formellement déconseillé"})
    # Orange : déconseillé sauf raison impérative
    for m in re.finditer(r"déconseillé[^.]*?sauf raison impérative[^.]*?(?:dans|de se rendre)?([^.]{5,120})", t, re.I):
        zones.append({"couleur":"orange","nom":clean(m.group(1)).strip(" ,;:"),"desc":"Déconseillé sauf raison impérative"})
    # Dédoublonnage simple + limite
    seen, out = set(), []
    for z in zones:
        key = z["nom"][:40].lower()
        if z["nom"] and key not in seen:
            seen.add(key); out.append(z)
    # Mention "reste du pays en vigilance renforcée"
    if re.search(r"reste du pays.*vigilance renforcée", t, re.I) or out:
        out.append({"couleur":"jaune","nom":"Reste du pays","desc":"Vigilance renforcée"})
    return out[:6]

# ═════════════════════════════════════════════════════════════════════════════
#  ENRICHISSEMENT TUNISIEN
# ═════════════════════════════════════════════════════════════════════════════

def load_visas_tn(timeout=30):
    """Dataset passport-index → {ISO2: {statut,categorie,duree,texte}} pour passeport TN."""
    try:
        req = urllib.request.Request(VISA_CSV_URL, headers={"User-Agent":"Mozilla/5.0 (IDEA Consult)"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read().decode("utf-8")
    except Exception as e:
        print(f"  ⚠ Dataset visa indisponible → {e}")
        return {}
    out = {}
    for row in csv.DictReader(io.StringIO(data)):
        if row.get("Passport","").strip().upper() != "TN":
            continue
        dest = row.get("Destination","").strip().upper()
        info = _visa_code(row.get("Code","").strip())
        if info and dest:
            out[dest] = info
    print(f"  ✓ Visa passeport TN : {len(out)} destinations")
    return out

def _visa_code(code):
    if code in ("-1",""): return None
    if code.isdigit():
        j=int(code)
        return {"statut":"Sans visa","categorie":"exempte","duree":f"{j} jours",
                "texte":f"Ressortissants tunisiens : séjour sans visa jusqu'à {j} jours. Passeport en cours de validité requis."}
    table={
        "visa free":{"statut":"Sans visa","categorie":"exempte","duree":"Non précisée",
            "texte":"Ressortissants tunisiens exemptés de visa. Vérifier la durée autorisée auprès de la représentation du pays."},
        "VOA":{"statut":"Visa à l'arrivée","categorie":"arrivee","duree":"Variable",
            "texte":"Visa délivré à l'arrivée (frontière/aéroport) pour les ressortissants tunisiens. Prévoir frais en espèces et photos."},
        "ETA":{"statut":"e-Visa / autorisation en ligne","categorie":"evisa","duree":"Variable",
            "texte":"Autorisation électronique ou e-visa à obtenir EN LIGNE avant le départ. Anticiper le délai."},
        "VR":{"statut":"Visa obligatoire","categorie":"obligatoire","duree":"Selon visa",
            "texte":"Visa obligatoire à obtenir AVANT le départ auprès de l'ambassade/consulat du pays de destination. Délai à anticiper."},
    }
    return table.get(code, {"statut":code,"categorie":"inconnu","duree":"",
            "texte":f"Condition d'entrée : {code}. Vérifier auprès de la représentation du pays."})

def ambassade_tn(iso):
    """Représentation tunisienne compétente (sur place ou rattachement)."""
    iso=(iso or "").upper()
    mk=RATTACHEMENT_TN.get(iso)
    if mk and mk in MISSIONS_TN:
        m=MISSIONS_TN[mk]; sur_place=(mk==iso)
        label=(f"Ambassade de Tunisie — {m['ville']}" if sur_place
               else f"Ambassade de Tunisie — {m['ville']} ({m['pays']}, rattachement)")
        return {"label":label,"tel":m["tel"],"email":m["email"],"ville":m["ville"],
                "pays_mission":m["pays"],"sur_place":sur_place}
    return {"label":"MAE Tunisie (aucune mission régionale)","tel":MAE_TUNISIE["tel"],
            "email":MAE_TUNISIE["email"],"ville":"Tunis","pays_mission":"Tunisie","sur_place":False}

def download_carte(iso, timeout=20):
    """Télécharge la carte Canada {ISO}/mapfra.png dans public/maps/{ISO}.jpg."""
    iso=(iso or "").upper()
    url=CA_MAP.format(iso=iso)
    try:
        req=urllib.request.Request(url, headers={
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer":CA_BASE.format(slug=SLUG_CA.get(iso,""))})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data=r.read()
        if len(data) < 3000:
            return None
        Path("public/maps").mkdir(parents=True, exist_ok=True)
        (Path("public/maps")/f"{iso}.jpg").write_bytes(data)
        print(f"    🗺  carte {iso} ({len(data)} o)")
        return f"/maps/{iso}.jpg"
    except Exception as e:
        print(f"    ⚠ carte {iso} → {e}")
        return None

# ═════════════════════════════════════════════════════════════════════════════
#  RÈGLES D'ADAPTATION TUNISIENNE (déterministes, vérifiables)
# ═════════════════════════════════════════════════════════════════════════════

# Sections Canada à RETIRER (calibrées pour un public occidental, non pertinentes
# ou au cadrage inadapté pour un ressortissant tunisien).
SECTIONS_A_RETIRER = [
    "2slgbtqi", "lgbt", "orientation sexuelle", "identité de genre",
    "identifiant de genre", "genre « x »", "double citoyenneté canad",
]

# Substitutions nationales (occidental → tunisien / neutre).
SUBSTITUTIONS = [
    (r"\bressortissants?\s+canadiens?\b", "ressortissants tunisiens"),
    (r"\bcanadiens?\s+et\s+canadiennes?\b", "ressortissants tunisiens"),
    (r"\bles\s+canadiens?\b", "les ressortissants tunisiens"),
    (r"\bcanadiens?\b", "ressortissants tunisiens"),
    (r"\ble\s+gouvernement\s+du\s+canada\b", "le ministère tunisien des Affaires étrangères"),
    (r"\bgouvernement\s+du\s+canada\b", "ministère tunisien des Affaires étrangères"),
    (r"\bressortissants?\s+français\b", "ressortissants tunisiens"),
    (r"\bau\s+canada\b", "en Tunisie"),
    (r"\bhaut-commissariat\s+du\s+canada\b", "ambassade de Tunisie compétente"),
    (r"\bambassade\s+du\s+canada\b", "ambassade de Tunisie compétente"),
    (r"\bambassade\s+de\s+france\b", "ambassade de Tunisie compétente"),
]

# Note de profil ajoutée sur les sections de ciblage criminel/enlèvement.
NOTE_PROFIL_TN = (" Note profil tunisien : le ciblage « étranger occidental aisé » "
                  "est moins direct, mais le risque général demeure — restez discret "
                  "sur les signes de richesse.")

def adapter_texte(texte):
    """Applique les substitutions nationales à un texte."""
    t = texte
    for pat, repl in SUBSTITUTIONS:
        t = re.sub(pat, repl, t, flags=re.I)
    # Nettoyage d'éventuelles répétitions créées
    t = re.sub(r"(ressortissants tunisiens)(\s+\1)+", r"\1", t, flags=re.I)
    return t

def section_pertinente(titre):
    """False si la section doit être retirée pour un public tunisien."""
    tl = titre.lower()
    return not any(k in tl for k in SECTIONS_A_RETIRER)

def adapter_securite(sections_ca):
    """Transforme les sections Canada en sections adaptées TN."""
    out = []
    for s in sections_ca:
        if not section_pertinente(s["titre"]):
            continue
        texte = adapter_texte(s["texte"])
        # Ajout de la note profil sur enlèvements / criminalité de ciblage
        if re.search(r"enlèvement|rançon|cible", s["titre"]+s["texte"], re.I):
            texte += NOTE_PROFIL_TN
        # Niveau heuristique selon mots-clés
        tl = (s["titre"]+s["texte"]).lower()
        if re.search(r"terroris|enlèvement|attaque|insurrection|formellement déconseillé", tl):
            niveau = "eleve"
        elif re.search(r"crime|vol|manifestation|prudence|routier", tl):
            niveau = "modere"
        else:
            niveau = "faible"
        out.append({"cat": s["titre"], "niveau": niveau, "texte": texte})
    return out

def construire_angle_tn(iso, visa_info, amb):
    """Les 3 points-clés du bandeau d'adaptation tunisienne."""
    pts = []
    if amb["sur_place"]:
        pts.append(f"Ambassade de Tunisie sur place à {amb['ville']}.")
    else:
        pts.append(f"Aucune ambassade de Tunisie sur place : rattachement à {amb['ville']} ({amb['pays_mission']}).")
    if visa_info:
        pts.append(f"Passeport tunisien : {visa_info['statut'].lower()}.")
    pts.append("Profil de risque criminel adapté : ciblage « occidental » moins direct, vigilance générale maintenue.")
    return pts

def choisir_alerte_principale(alertes_rss, zones, sections_tn):
    """Sélectionne l'événement le plus important à mettre EN TÊTE.
    Priorité : alerte RSS récente > zone rouge > section sécurité 'eleve'."""
    # 1. Une alerte RSS explicite prime (c'est la "dernière minute" réelle)
    if alertes_rss:
        a = alertes_rss[0]
        return {"niveau":"eleve","titre":a["titre"],"texte":adapter_texte(a["texte"]),
                "date":datetime.now().strftime("%d %b %Y")}, alertes_rss[1:]
    # 2. Sinon, une zone rouge devient l'alerte principale
    rouge = next((z for z in zones if z["couleur"]=="rouge"), None)
    if rouge:
        return {"niveau":"eleve","titre":f"{rouge['nom']} : {rouge['desc'].lower()}",
                "texte":"Zone à risque majeur identifiée par les sources officielles. Déplacement à proscrire dans cette zone.",
                "date":datetime.now().strftime("%d %b %Y")}, []
    # 3. Sinon, la section sécurité la plus grave
    grave = next((s for s in sections_tn if s["niveau"]=="eleve"), None)
    if grave:
        return {"niveau":"modere","titre":grave["cat"],
                "texte":grave["texte"][:200],"date":datetime.now().strftime("%d %b %Y")}, []
    # 4. Aucun danger saillant → message rassurant (l'absence est une info)
    return {"niveau":"faible","titre":"Aucune alerte majeure en cours",
            "texte":"Aucun événement de sécurité majeur signalé récemment par les sources officielles. Vigilance habituelle recommandée.",
            "date":datetime.now().strftime("%d %b %Y")}, []

# ═════════════════════════════════════════════════════════════════════════════
#  VERSIONNEMENT
# ═════════════════════════════════════════════════════════════════════════════

def compute_version(source_date, existing):
    """V+1 uniquement si la date source a changé. Renvoie (version, date_interne, changed)."""
    src_str = source_date.strftime("%d %b %Y") if source_date else existing.get("sourceDateStr")
    old_ver = existing.get("version", 1)
    old_src = existing.get("sourceDateStr")
    today = datetime.now().strftime("%d %b %Y")
    if old_src and src_str and old_src != src_str:
        return old_ver+1, today, True            # vrai changement
    if not existing:
        return 1, today, True                    # première fois
    return old_ver, existing.get("dateMAJInterne", today), False

# ═════════════════════════════════════════════════════════════════════════════
#  ORCHESTRATION PAR PAYS
# ═════════════════════════════════════════════════════════════════════════════

def scrape_country(iso, existing, visas_tn):
    name = NAMES.get(iso, iso)
    print(f"  [{iso}] {name}")

    # 1. CANADA — structure principale
    html_ca, url_ca = ca_fetch(iso)
    sections_ca = ca_sections(html_ca)
    risk_ca     = ca_risk(html_ca)
    date_ca     = ca_date(html_ca)

    # 2. FRANCE — zones de vigilance + alertes RSS
    slug_fr = SLUG_FR.get(iso)
    zones, alertes_rss, date_fr_src = [], [], None
    if slug_fr:
        u = fr_urls(slug_fr)
        html_fr_sec = fetch(u["securite"])
        zones = fr_zones(html_fr_sec)
        date_fr_src, alertes_rss = fr_rss(u["rss"])

    # 3. Niveau de risque : Canada prioritaire, sinon défaut
    risk = risk_ca or RISK_DEFAULT.get(iso, "modere")

    # 4. Date source : la plus récente entre Canada et France
    source_date = max([d for d in [date_ca, date_fr_src] if d], default=None)

    # 5. ADAPTATION TUNISIENNE
    securite_tn = adapter_securite(sections_ca)
    visa_info   = visas_tn.get(iso)
    amb         = ambassade_tn(iso)
    angle_tn    = construire_angle_tn(iso, visa_info, amb)

    # 6. ALERTE PRINCIPALE EN TÊTE
    alerte_principale, autres_alertes = choisir_alerte_principale(alertes_rss, zones, securite_tn)

    # 7. CARTE (téléchargée localement)
    carte = download_carte(iso) or existing.get("carteVigilance")

    # 8. CONTACTS : urgences locales + ambassade TN + MAE
    locaux = URGENCES_LOCALES.get(iso, URGENCE_FALLBACK)
    contacts = {
        "locaux": locaux,
        "ambassadeTN": amb,
        "mae": {"label": MAE_TUNISIE["label"], "tel": MAE_TUNISIE["urgence"]},
    }

    # 9. VISA (texte adapté TN)
    visa = visa_info["texte"] if visa_info else existing.get("visa","Conditions à vérifier auprès de la représentation du pays.")

    # 10. VERSIONNEMENT
    version, date_interne, changed = compute_version(source_date, existing)
    src_str = source_date.strftime("%d %b %Y") if source_date else existing.get("sourceDateStr","—")
    print(f"      risk={risk} · {len(securite_tn)} sections · {len(zones)} zones · V{version}{' ✅' if changed else ''}")

    return {
        "iso": iso, "name": name, "region": REGIONS.get(iso,""),
        "risk": risk, "version": version,
        "ref": f"FRP-{list(SLUG_FR).index(iso)+1:03d}-{iso}-V{version}",
        "sourceDateStr": src_str, "dateMAJInterne": date_interne,
        "sources": ["voyage.gc.ca","diplomatie.gouv.fr"],
        "alertePrincipale": alerte_principale,
        "autresAlertes": autres_alertes,
        "angleTN": angle_tn,
        "securite": securite_tn,
        "zonesVigilance": zones,
        "visa": visa,
        "visaDetail": visa_info,
        "contacts": contacts,
        "carteVigilance": carte,
        "scrapedAt": datetime.now().isoformat(),
    }, changed

# ═════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    print("═"*60)
    print("  Scraping Fiches Risques Pays — Canada + France → TN")
    print("═"*60)

    # Charger l'existant (pour le versionnement)
    out_path = Path("public/data.json")
    existing_data = {}
    if out_path.exists():
        try:
            existing_data = json.loads(out_path.read_text()).get("countries", {})
        except Exception:
            pass

    visas_tn = load_visas_tn()       # une seule fois
    results, changed_count = {}, 0

    for iso in SLUG_FR:
        try:
            data, changed = scrape_country(iso, existing_data.get(iso, {}), visas_tn)
            results[iso] = data
            if changed:
                changed_count += 1
        except Exception as e:
            print(f"  ✗ {iso} → {e}")
            if iso in existing_data:
                results[iso] = existing_data[iso]   # conserver l'ancien

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps({
        "generatedAt": datetime.now().isoformat(),
        "totalChanged": changed_count,
        "countries": results,
    }, ensure_ascii=False, indent=2))

    print("═"*60)
    print(f"  ✓ {len(results)} pays · {changed_count} changement(s) · → {out_path}")
    print("═"*60)

if __name__ == "__main__":
    main()
