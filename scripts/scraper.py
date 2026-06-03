import json, re, urllib.request, urllib.error
from xml.etree import ElementTree as ET
from datetime import datetime

# ── Correspondance ISO2 → nom français ───────────────────────────────────────
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

# ── Niveau de risque par défaut (mis à jour manuellement si besoin) ───────────
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

BASE_RSS = "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/?xtor=RSS-2"
BASE_PAGE = "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/{slug}/"

def fetch_url(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ⚠ Erreur fetch {url}: {e}")
        return None

def parse_rss(slug):
    """Récupère le titre et la date depuis le flux RSS."""
    url = BASE_RSS.format(slug=slug)
    xml = fetch_url(url)
    if not xml:
        return None, None
    try:
        root = ET.fromstring(xml)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        # Cherche la date de mise à jour
        updated = root.find(".//lastBuildDate")
        date_str = updated.text.strip() if updated is not None and updated.text else None
        # Formater la date
        if date_str:
            try:
                dt = datetime.strptime(date_str[:25], "%a, %d %b %Y %H:%M:%S")
                date_str = dt.strftime("%d %b %Y")
            except:
                pass
        # Récupère les items (alertes dernière minute)
        items = root.findall(".//item")
        alerts = []
        for item in items[:3]:
            title_el = item.find("title")
            desc_el  = item.find("description")
            if title_el is not None and title_el.text:
                t = title_el.text.strip()
                d = re.sub(r"<[^>]+>", "", desc_el.text or "").strip()[:300] if desc_el is not None else ""
                alerts.append({"titre": t, "texte": d})
        return date_str, alerts
    except Exception as e:
        print(f"  ⚠ Erreur parse RSS: {e}")
        return None, None

def detect_risk_from_text(text):
    """Détecte le niveau de risque à partir du texte de la page."""
    text_lower = text.lower()
    rouge_count = text_lower.count("formellement déconseillé") + text_lower.count("zone rouge")
    orange_count = text_lower.count("déconseillé sauf") + text_lower.count("zone orange")
    if rouge_count >= 2:
        return "eleve"
    elif rouge_count >= 1 or orange_count >= 2:
        return "modere"
    else:
        return "faible"

def scrape_country(iso, slug):
    print(f"  Scraping {iso} ({slug})...")
    date_str, alerts = parse_rss(slug)

    # Tente aussi de récupérer le niveau de risque depuis la page principale
    risk = RISK_DEFAULT.get(iso, "modere")
    page = fetch_url(BASE_PAGE.format(slug=slug))
    if page:
        detected = detect_risk_from_text(page)
        risk = detected

    return {
        "iso": iso,
        "lastUpdate": date_str or datetime.now().strftime("%d %b %Y"),
        "risk": risk,
        "derniereMinute": alerts or [],
        "source": BASE_PAGE.format(slug=slug),
        "scrapedAt": datetime.now().isoformat(),
    }

def main():
    print(f"🚀 Démarrage du scraping — {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    results = {}
    for iso, slug in PAYS.items():
        data = scrape_country(iso, slug)
        results[iso] = data

    # Sauvegarde dans public/data.json
    output = {
        "generatedAt": datetime.now().isoformat(),
        "countries": results,
    }
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ Terminé — {len(results)} pays traités")
    print(f"📁 Fichier public/data.json mis à jour")

if __name__ == "__main__":
    main()
