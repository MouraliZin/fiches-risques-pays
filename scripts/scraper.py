import json, re, urllib.request
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
def scrape_contacts(html, country_name):
    if not html:
        return [{"label": f"Ambassade de Tunisie — {country_name}", "valeur": "Consulter le MAE Tunisien"}]
    contacts = []
    # Cherche les patterns "Libellé : +XXX XX XX XX"
    patterns = [
        r'([A-Za-zÀ-ÿ\s\(\)\-/\.]{5,60})[:\s]+(\+?[\d\s\.\-]{7,20})',
        r'(?:Tél|Tel|Téléphone)[.\s:]*(\+?[\d\s\.\-]{7,20})',
    ]
    seen_nums = set()
    # Cherche aussi les labels avant les numéros
    blocks = re.findall(
        r'([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\(\)\-/\.]{4,58})\s*[:\–\-]\s*(\+?[\d][\d\s\.\-]{6,18})',
        html
    )
    for label, num in blocks[:10]:
        label = label.strip().rstrip(':–- ')
        num   = num.strip()
        # Filtre les faux positifs
        if len(label) < 4 or any(k in label.lower() for k in ["http","www","@","class","style","div"]):
            continue
        if num not in seen_nums and len(num) >= 6:
            contacts.append({"label": label, "valeur": num})
            seen_nums.add(num)

    # Ambassade de Tunisie toujours présente
    if not any("tunisie" in c["label"].lower() for c in contacts):
        contacts.append({"label": f"Ambassade de Tunisie — {country_name}", "valeur": "Consulter diplomatie.gov.tn"})

    return contacts[:8]

# ── VERSIONNEMENT ─────────────────────────────────────────────────────────────
def compute_version(source_date, existing):
    prev_source = existing.get("sourceDateStr")
    prev_ver    = existing.get("version", 1)
    prev_int    = existing.get("dateMAJInterne")
    if source_date and source_date != prev_source:
        return prev_ver + 1, datetime.now().strftime("%d %b %Y"), True
    return prev_ver, prev_int or datetime.now().strftime("%d %b %Y"), False

# ── SCRAPING COMPLET D'UN PAYS ────────────────────────────────────────────────
def scrape_country(iso, slug, existing):
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
    visa     = scrape_visa(html_visa)
    contacts = scrape_contacts(html_con, name)

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
        "contacts"       : contacts,
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
    for iso, slug in PAYS.items():
        try:
            data, changed = scrape_country(iso, slug, existing_data.get(iso, {}))
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
