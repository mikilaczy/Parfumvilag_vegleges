
import xml.etree.ElementTree as ET  # XML feldolgozáshoz
import mysql.connector             # MySQL adatbázis kapcsolathoz

# Konfigurációs beállítások
# Az XML fájl elérési útja
xml_file_path = "Feed\\Notino_hu-NotinoHU_google_all-shopping.xml"

# Adatbázis kapcsolati adatok
db_config = {
    "host": "127.0.0.1",
    "port": 3307,
    "user": "root",  
    "password": "",  
    "database": "parfumvilag"
}

# Adatbázis kapcsolat létrehozása és kurzor inicializálása
connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

# Függvény a szöveges adatok (pl. márka, parfüm név) tisztítására SQL kompatibilitás érdekében
def clean_name(name):
    if name is None:
        return "Unknown Name"
    # Visszaper (\) karakterek eltávolítása
    cleaned_name = name.replace("\\", "")
    # Perjel (/) karakterek cseréje kötőjelre (-)
    cleaned_name = cleaned_name.replace("/", "-")
    # Aposztrófok (') escape-elése SQL-hez ('')
    cleaned_name = cleaned_name.replace("'", "''")
    return cleaned_name

# Függvény az illatjegyek kinyerésére a termékleírásból és azok adatbázisba illesztésére
def process_notes(perfume_id, product_highlight):
    if product_highlight is None:
        return # Nincs feldolgozandó adat

    # Az illatjegyeket tartalmazó rész kinyerése a szövegből
    notes_section = ""
    if "Az illat fajtája:" in product_highlight:
        notes_section = product_highlight.split("Az illat fajtája:")[-1].strip()
        # Nem releváns részek eltávolítása a jegyek listájából
        for part in ["Intenzitás:", "Market type:","Fenntarthatóság:","Csomagolás:","Konzisztencia:","újratölthető kivitel","Hatóanyag:","Hajkiegészítő típusa:","Bőrtípus:" ]:
            if part in notes_section:
                notes_section = notes_section.split(part)[0].strip()

    # Illatjegyek listájának létrehozása vessző mentén
    notes_list = [note.strip() for note in notes_section.split(",") if note.strip()]

    # Illatjegyek feldolgozása: ellenőrzés, beszúrás, kapcsolás a parfümhöz
    for note_name in notes_list:
        # Illatjegy létezésének ellenőrzése a 'notes' táblában
        cursor.execute("SELECT id FROM notes WHERE name = %s", (note_name,))
        note_result = cursor.fetchone()
        if note_result:
            note_id = note_result[0] # Meglévő jegy ID-ja
        else:
            # Új illatjegy beszúrása a 'notes' táblába
            cursor.execute("INSERT INTO notes (name, type) VALUES (%s, 'unknown')", (note_name,))
            note_id = cursor.lastrowid # Az új jegy ID-ja

        # Kapcsolat létrehozása a parfüm és az illatjegy között a 'perfume_notes' táblában
        cursor.execute("""
            INSERT INTO perfume_notes (perfume_id, note_id)
            VALUES (%s, %s)
        """, (perfume_id, note_id))

# XML fájl beolvasása és feldolgozása
tree = ET.parse(xml_file_path)
root = tree.getroot()

# Végigiterálás az XML 'entry' elemein és adatok feldolgozása
for entry in root.findall("entry"):
    # Szűrés: Csak a parfüm kategóriájú termékek feldolgozása
    google_product_category_name = entry.find("google_product_category_name").text
    if google_product_category_name is None or "Perfume & Cologne" not in google_product_category_name:
        continue # Ugrás a következő elemre, ha nem parfüm

    # Szűrés: Szappanok kihagyása (a cseh 'Mýdla' szó alapján)
    product_type = entry.find("product_type")
    if product_type is not None and "Mýdla" in product_type.text:
        continue # Ugrás a következő elemre, ha szappan

    # Adatok kinyerése az XML elemből, hiányzó adatok esetén alapértelmezett értékekkel
    title = entry.find("title").text if entry.find("title") is not None else "Unknown Title"
    brand_name = entry.find("brand").text if entry.find("brand") is not None else "Unknown Brand"
    description = entry.find("description").text if entry.find("description") is not None else "No description available"
    image_url = entry.find("image_link").text if entry.find("image_link") is not None else "No image URL"
    price = float(entry.find("price").text.split()[0]) if entry.find("price") is not None else 0.0
    gender = entry.find("gender").text if entry.find("gender") is not None else "unisex"
    size = entry.find("size").text if entry.find("size") is not None else "Unknown Size" # Méret egyelőre nincs felhasználva
    link = entry.find("link").text if entry.find("link") is not None else "No link available"
    product_highlight = entry.find("product_highlight").text if entry.find("product_highlight") is not None else None

    # Márkanév, cím és leírás tisztítása a 'clean_name' függvénnyel
    cleaned_brand_name = clean_name(brand_name)
    cleaned_title = clean_name(title)
    cleaned_description = clean_name(description)

    # Parfüm típusának meghatározása a 'product_type' alapján (cseh nyelvű kategóriákból)
    if product_type is not None:
        if "Toaletní vody" in product_type.text:
            perfume_type = "Eau de Toilette"
        elif "Parfémované vody" in product_type.text:
            perfume_type = "Eau de Parfum"
        elif "Kolínské vody" in product_type.text:
            perfume_type = "Eau de Cologne"
        else:
            perfume_type = "Unknown Type" # Ha nem ismert a típus
    else:
        perfume_type = "Unknown Type" # Ha nincs 'product_type' megadva

    # Márka kezelése: Lekérdezés vagy új márka beszúrása a 'brands' táblába
    cursor.execute("SELECT id FROM brands WHERE name = %s", (cleaned_brand_name,))
    brand_result = cursor.fetchone()
    if brand_result:
        brand_id = brand_result[0] # Meglévő márka ID-ja
    else:
        # Új márka beszúrása
        cursor.execute("INSERT INTO brands (name) VALUES (%s)", (cleaned_brand_name,))
        brand_id = cursor.lastrowid # Az új márka ID-ja

    # Parfüm adatainak beszúrása a 'perfumes' táblába
    cursor.execute("""
        INSERT INTO perfumes (name, brand_id, gender, type, description, image_url)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        cleaned_title,
        brand_id,
        gender.lower() if gender else None, # Nem kisbetűsítése
        perfume_type,
        cleaned_description,
        image_url
    ))
    perfume_id = cursor.lastrowid # Az újonnan beszúrt parfüm ID-ja

    # Bolti ár és elérhetőség hozzáadása a 'stores' táblához (Notino specifikusan)
    cursor.execute("""
        INSERT INTO stores (perfume_id, store_name, price, currency, url)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        perfume_id,
        "Notino",
        price,
        "HUF", # Pénznem
        link
    ))

    # Illatjegyek feldolgozása és adatbázisba írása a 'process_notes' függvénnyel
    process_notes(perfume_id, product_highlight)

# Adatbázis módosításainak véglegesítése
connection.commit()
# Kurzor és adatbázis kapcsolat bezárása
cursor.close()
connection.close()

# Sikeres futás jelzése a felhasználónak
print("Adatok sikeresen felvéve az adatbázisba!")

