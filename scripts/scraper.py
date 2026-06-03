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

BASE_RSS  = "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/?xtor=RSS-2"
BASE_PAGE = "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/"

# ── Utilitaires ───────────────────────────────────────────────────────────────
def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"    ⚠ fetch error: {e}")
        return None

def clean(text):
    """Nettoie le HTML : supprime balises, normalise espaces."""
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_between(html, start_marker, end_marker):
    """Extrait le texte HTML entre deux marqueurs."""
    try:
        i = html.lower().find(start_marker.lower())
        if i == -1: return ""
        j = html.lower().find(end_marker.lower(), i + len(start_marker))
        if j == -1: return html[i:]
        return html[i:j]
    except:
        return ""

def extract_section(html, section_id):
    """Extrait une section par son id ou titre h2/h3."""
    pattern = rf'id="{section_id}"[^>]*>(.*?)(?=<h[23]|<section|$)'
    m = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
    return m.group(1) if m else ""

def list_items(html_block):
    """Extrait les items d'une liste <li> sous forme de texte."""
    items = re.findall(r"<li[^>]*>(.*?)</li>", html_block, re.DOTALL | re.IGNORECASE)
    return [clean(i) for i in items if clean(i)]

def para_items(html_block):
    """Extrait les paragraphes <p> sous forme de texte."""
    items = re.findall(r"<p[^>]*>(.*?)</p>", html_block, re.DOTALL | re.IGNORECASE)
    return [clean(i) for i in items if len(clean(i)) > 20]

# ── RSS : date source + alertes ───────────────────────────────────────────────
def parse_rss(slug):
    xml = fetch(BASE_RSS.format(slug=slug))
    if not xml:
        return None, []
    try:
        root = ET.fromstring(xml)
        updated = root.find(".//lastBuildDate") or root.find(".//pubDate")
        source_date = None
        if updated is not None and updated.text:
            try:
                dt = datetime.strptime(updated.text.strip()[:25], "%a, %d %b %Y %H:%M:%S")
                source_date = dt.strftime("%d %b %Y")
            except:
                source_date = updated.text.strip()[:20]
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

# ── Scraping HTML complet ─────────────────────────────────────────────────────
def scrape_securite(html):
    """Extrait les risques sécuritaires."""
    securite = []
    # Cherche la section sécurité
    sec_block = extract_between(html, 'class="fr-accordion__title">Sécurité', '</section>')
    if not sec_block:
        sec_block = extract_between(html, '>Sécurité<', '</section>')

    # Risques courants avec leurs niveaux
    risk_patterns = [
        (r'terroris\w+', "eleve"),
        (r'enl[èe]vement', "eleve"),
        (r'piraterie', "eleve"),
        (r'criminalit[eé]', "modere"),
        (r'risque routier', "modere"),
        (r'manifestation', "faible"),
        (r'risque naturel', "faible"),
        (r'trouble[s]? socio', "faible"),
    ]

    # Cherche les h3/h4 dans la section sécurité pour extraire chaque sous-thème
    themes = re.findall(
        r'<h[34][^>]*>(.*?)</h[34]>(.*?)(?=<h[34]|</section|</div>\s*</div>)',
        sec_block or html[html.lower().find('écurité'):html.lower().find('écurité')+8000],
        re.DOTALL | re.IGNORECASE
    )

    seen = set()
    for title_html, body_html in themes[:10]:
        title = clean(title_html)
        body  = clean(body_html)
        if not title or len(title) > 80 or title in seen:
            continue
        seen.add(title)
        # Détermine le niveau
        niveau = "modere"
        title_low = title.lower()
        body_low  = body.lower()
        if any(k in title_low or k in body_low for k in ["terroris","enlèvement","piraterie","élevé","rouge"]):
            niveau = "eleve"
        elif any(k in title_low or k in body_low for k in ["faible","normal","bas","réduit"]):
            niveau = "faible"
        if body:
            securite.append({"label": title, "niveau": niveau, "texte": body[:300]})

    # Fallback si rien trouvé
    if not securite:
        for keyword, niveau in risk_patterns:
            m = re.search(rf'(.{{0,30}}{keyword}.{{0,200}})', html, re.IGNORECASE | re.DOTALL)
            if m:
                texte = clean(m.group(1))
                if len(texte) > 30:
                    securite.append({"label": keyword.capitalize(), "niveau": niveau, "texte": texte[:250]})

    return securite[:8]

def scrape_zones(html):
    """Extrait les zones de vigilance (rouge/orange/jaune)."""
    zones = []
    couleurs = {
        "rouge":  {"mots": ["formellement déconseillé","zone rouge","interdit"], "nom": "Formellement déconseillées"},
        "orange": {"mots": ["déconseillé sauf","zone orange","impérative"],      "nom": "Déconseillées sauf raison impérative"},
        "jaune":  {"mots": ["vigilance renforcée","zone jaune","particulière"],   "nom": "Vigilance renforcée"},
    }
    for couleur, cfg in couleurs.items():
        for mot in cfg["mots"]:
            idx = html.lower().find(mot.lower())
            if idx == -1:
                continue
            # Remonte pour trouver le bloc parent
            block_start = max(0, idx - 200)
            block_end   = min(len(html), idx + 1500)
            block = html[block_start:block_end]
            items = list_items(block)
            if not items:
                # Essaye avec les paragraphes
                items = para_items(block)
            items = [i for i in items if 10 < len(i) < 200][:6]
            if items:
                zones.append({"couleur": couleur, "nom": cfg["nom"], "zones": items})
                break  # une seule fois par couleur
    return zones

def scrape_vaccins(html):
    """Extrait le tableau des vaccinations."""
    vaccins = []
    # Cherche la section vaccinations
    vacc_block = extract_between(html, 'accination', '</table>')
    if not vacc_block:
        vacc_block = extract_between(html, 'Vaccin', '</table>')

    # Cherche les lignes du tableau
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', vacc_block or html, re.DOTALL | re.IGNORECASE)
    for row in rows[:15]:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL | re.IGNORECASE)
        cells = [clean(c) for c in cells if clean(c)]
        if len(cells) >= 2 and len(cells[0]) > 2 and len(cells[0]) < 60:
            nom     = cells[0]
            validite= cells[1] if len(cells) > 1 else "—"
            statut  = cells[2] if len(cells) > 2 else "Recommandé"
            # Détermine le statut
            if any(k in (nom+statut).lower() for k in ["obligatoire","exigé","requis"]):
                statut_norm = "Obligatoire"
            elif any(k in statut.lower() for k in ["rappel"]):
                statut_norm = "Rappel obligatoire"
            else:
                statut_norm = "Recommandé"
            vaccins.append({"nom": nom, "validite": validite[:60], "statut": statut_norm})

    # Fallback : cherche les vaccins mentionnés dans le texte
    if not vaccins:
        vacc_names = ["Fièvre jaune","Hépatite A","Hépatite B","Typhoïde",
                      "Méningite","Rage","DTP","Paludisme","Poliomyélite"]
        for nom in vacc_names:
            if nom.lower() in html.lower():
                obligatoire = "obligatoire" in html[html.lower().find(nom.lower()):html.lower().find(nom.lower())+200].lower()
                vaccins.append({
                    "nom": nom,
                    "validite": "Voir médecin",
                    "statut": "Obligatoire" if obligatoire else "Recommandé"
                })
    return vaccins[:10]

def scrape_risques_sante(html):
    """Extrait les risques sanitaires."""
    risques = []
    maladies = [
        "choléra","paludisme","dengue","fièvre jaune","typhoïde","méningite",
        "hépatite","rage","mpox","monkeypox","chikungunya","fièvre de marburg",
        "ébola","poliomyélite","rougeole","hiv","sida","grippe aviaire",
        "leishmaniose","bilharziose","trypanosomiase"
    ]
    for m in maladies:
        if m in html.lower():
            # Cherche une phrase de contexte
            idx = html.lower().find(m)
            snippet = clean(html[max(0,idx-30):idx+200])
            if len(snippet) > 20:
                risques.append(snippet[:200])
            else:
                risques.append(m.capitalize())
    return risques[:10]

def scrape_visa(html):
    """Extrait les informations visa/entrée."""
    # Cherche la section visa
    visa_block = extract_between(html, '>Entrée / Séjour<', '</section>')
    if not visa_block:
        visa_block = extract_between(html, '>Visa<', '</section>')
    if not visa_block:
        visa_block = extract_between(html, 'visa', '</section>')

    paras = para_items(visa_block or html)
    visa_paras = [p for p in paras if any(k in p.lower() for k in
        ["visa","passeport","entrée","séjour","vaccin","frontière","ambassade"])]

    if visa_paras:
        return " ".join(visa_paras[:3])[:600]

    # Fallback : recherche directe
    m = re.search(r'(visa[^.]{20,300}\.)', html, re.IGNORECASE | re.DOTALL)
    if m:
        return clean(m.group(1))[:400]
    return "Consulter l'ambassade pour les conditions d'entrée en vigueur."

def scrape_contacts(html, country_name):
    """Extrait les contacts utiles : urgences et hôpitaux."""
    contacts = []
    # Cherche la section contacts/urgences
    cont_block = extract_between(html, '>Contacts<', '</section>')
    if not cont_block:
        cont_block = extract_between(html, '>Urgence<', '</section>')

    # Cherche les numéros de téléphone
    phones = re.findall(
        r'([A-Za-zÀ-ÿ\s\-/]{5,50})[:\s]+(\+?[\d\s\-\.]{6,20})',
        cont_block or html
    )
    seen = set()
    for label, number in phones[:8]:
        label = label.strip().strip(':').strip()
        number = number.strip()
        if label and number and label not in seen and len(label) < 60:
            contacts.append({"label": label, "valeur": number})
            seen.add(label)

    # Toujours ajouter l'ambassade de Tunisie si pas présente
    if not any("tunisie" in c["label"].lower() or "ambassade" in c["label"].lower() for c in contacts):
        contacts.append({
            "label": f"Ambassade de Tunisie — {country_name}",
            "valeur": "Consulter le MAE Tunisien"
        })
    return contacts[:8]

def detect_risk(html):
    """Détecte le niveau de risque global."""
    t = html.lower()
    rouge  = t.count("formellement déconseillé") + t.count("zone rouge")
    orange = t.count("déconseillé sauf")          + t.count("zone orange")
    if rouge >= 2:             return "eleve"
    if rouge >= 1 or orange >= 2: return "modere"
    return "faible"

# ── Scraping complet d'un pays ────────────────────────────────────────────────
def scrape_country(iso, slug, existing, country_name):
    print(f"  [{iso}] {slug}...")

    source_date, alerts = parse_rss(slug)
    html = fetch(BASE_PAGE.format(slug=slug)) or ""

    risk     = detect_risk(html) if html else RISK_DEFAULT.get(iso, "modere")
    securite = scrape_securite(html)   if html else []
    zones    = scrape_zones(html)      if html else []
    vaccins  = scrape_vaccins(html)    if html else []
    risques  = scrape_risques_sante(html) if html else []
    visa     = scrape_visa(html)       if html else "—"
    contacts = scrape_contacts(html, country_name) if html else []

    # ── Logique versionnement ─────────────────────────────────────────────────
    prev_source_date   = existing.get("sourceDateStr")
    prev_version       = existing.get("version", 1)
    prev_internal_date = existing.get("dateMAJInterne")

    if source_date and source_date != prev_source_date:
        changed           = True
        new_version       = prev_version + 1
        new_internal_date = datetime.now().strftime("%d %b %Y")
        print(f"    ✅ Changement : {prev_source_date} → {source_date} (V{prev_version}→V{new_version})")
    else:
        changed           = False
        new_version       = prev_version
        new_internal_date = prev_internal_date or datetime.now().strftime("%d %b %Y")
        print(f"    ⏸  Inchangé (V{new_version})")

    return {
        "iso"            : iso,
        "sourceDateStr"  : source_date or prev_source_date or "—",
        "dateMAJInterne" : new_internal_date,
        "risk"           : risk,
        "version"        : new_version,
        "derniereMinute" : alerts,
        "securite"       : securite,
        "zonesVigilance" : zones,
        "sante"          : {"vaccins": vaccins, "risques": risques},
        "visa"           : visa,
        "contacts"       : contacts,
        "source"         : BASE_PAGE.format(slug=slug),
        "scrapedAt"      : datetime.now().isoformat(),
    }, changed

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n🚀 Scraping complet démarré — {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")

    data_path = Path("public/data.json")
    existing_data = {}
    if data_path.exists():
        try:
            with open(data_path, encoding="utf-8") as f:
                existing_data = json.load(f).get("countries", {})
        except:
            pass

    # Noms français pour les contacts
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

    results      = {}
    changed_count = 0

    for iso, slug in PAYS.items():
        try:
            data, changed = scrape_country(iso, slug, existing_data.get(iso, {}), NAMES.get(iso, iso))
            results[iso]  = data
            if changed:
                changed_count += 1
        except Exception as e:
            print(f"    ❌ Erreur {iso}: {e}")
            results[iso] = existing_data.get(iso, {"iso": iso, "risk": RISK_DEFAULT.get(iso,"modere"), "version":1})

    output = {
        "generatedAt" : datetime.now().isoformat(),
        "totalChanged": changed_count,
        "countries"   : results,
    }

    data_path.parent.mkdir(parents=True, exist_ok=True)
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Terminé — {len(results)} pays · {changed_count} mis à jour")
    print(f"📁 public/data.json sauvegardé\n")

if __name__ == "__main__":
    main()
