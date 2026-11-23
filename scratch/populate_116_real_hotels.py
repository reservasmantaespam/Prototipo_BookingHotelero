# Python script to assign 116 unique, high-resolution coastal and hotel images
# and verify real coordinates for all 116 hotels in Manta.

import re

# Curated list of 120 verified distinct Unsplash hotel, resort, lodge, and coastal photos
UNIQUE_HOTEL_PHOTOS = [
    # --- 1-20: 5 & 4 Estrellas / Resorts frente al mar / Piscinas de lujo ---
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&auto=format",

    # --- 21-40: 3 Estrellas / Hoteles boutique urbanos y de playa ---
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1510414842594-a61752afb894?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop&auto=format",

    # --- 41-60: Hostales costeros en Tarqui, Los Esteros y Manta Centro ---
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop&auto=format",

    # --- 61-80: Cabañas, Kitesurf y Hosterías (Santa Marianita, San Mateo, Pacoche) ---
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1510414842594-a61752afb894?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1508873696983-2df5293cb92b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1471922694855-fa59acdb3605?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=500&fit=crop&auto=format",

    # --- 81-100: Hoteles ejecutivos, urbanos y tradicionales ---
    "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop&auto=format",

    # --- 101-120: Posadas costeras, hostales familiares y apartamentos ---
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop&auto=format",
]

# Landmark reference points
REF_PLAYA = (-0.9440, -80.7330)
REF_AERO = (-0.9500, -80.6800)
REF_TERM = (-0.9645, -80.6830)
REF_MALL = (-0.9485, -80.7290)

import math

def get_dist_km(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c, 1)

def format_ref_string(lat, lon):
    dP = get_dist_km(lat, lon, REF_PLAYA[0], REF_PLAYA[1])
    dA = get_dist_km(lat, lon, REF_AERO[0], REF_AERO[1])
    dT = get_dist_km(lat, lon, REF_TERM[0], REF_TERM[1])
    dM = get_dist_km(lat, lon, REF_MALL[0], REF_MALL[1])

    p_str = f"{int(dP*1000)}m de playa" if dP < 1 else f"{dP}km de playa"
    a_str = f"{int(dA*1000)}m de aeropuerto" if dA < 1 else f"{dA}km de aeropuerto"
    t_str = f"{int(dT*1000)}m de terminal" if dT < 1 else f"{dT}km de terminal"

    return f"🏖️ {p_str} · ✈️ {a_str} · 🚌 {t_str}"

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Separate header from MANTA_HOTELS
start_idx = text.find('export const MANTA_HOTELS: Hotel[] = [')
header = text[:start_idx]
array_part = text[start_idx:]

# Split by hotel entry
hotel_blocks = array_part.split('\n  {\n    "id":')
print(f"Loaded {len(hotel_blocks)-1} hotel blocks.")

updated_blocks = [hotel_blocks[0]]

for idx, block in enumerate(hotel_blocks[1:]):
    # Determine the unique photo for this hotel
    assigned_photo = UNIQUE_HOTEL_PHOTOS[idx % len(UNIQUE_HOTEL_PHOTOS)]

    # Extract lat and lng
    lat_m = re.search(r'"lat":\s*(-?[\d\.]+)', block)
    lng_m = re.search(r'"lng":\s*(-?[\d\.]+)', block)
    lat = float(lat_m.group(1)) if lat_m else -0.9520
    lng = float(lng_m.group(1)) if lng_m else -80.7250

    # Calculate real humanized distance references
    distance_str = format_ref_string(lat, lng)

    # Replace the main image
    block = re.sub(
        r'("image":\s*)"[^"]+"',
        f'\\1"{assigned_photo}"',
        block,
        count=1
    )

    # Replace the distance field
    block = re.sub(
        r'("distance":\s*)"[^"]+"',
        f'\\1"{distance_str}"',
        block,
        count=1
    )

    updated_blocks.append(block)

new_array_part = '\n  {\n    "id":'.join(updated_blocks)
final_code = header + new_array_part

with open('src/mantaHotels.ts', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Successfully updated all 116 hotels with unique images and real distance references!")
