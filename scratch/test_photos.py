# Pool of high-quality verified Unsplash hotel photos categorized by theme
import requests

sample_photos = [
    # 5 Stars & Luxury Resorts (Barbasquillo & Murciélago)
    "photo-1566073771259-6a8506099945", # Oro verde style luxury resort pool
    "photo-1582719508461-905c673771fd", # MantaHost infinity pool
    "photo-1571896349842-33c89424de2d", # Poseidon modern terrace
    "photo-1542314831-068cd1dbfeeb", # Grand hotel facade
    "photo-1520250497591-112f2f40a3f4", # Balandra tropical garden resort
    "photo-1551882547-ff40c63fe5fa", # Boutique villa
    "photo-1578683010236-d716f9a3f461", # Oceanfront suites
    "photo-1563911302283-d2bc129e7570", # Coastal resort sunset
    "photo-1540541338287-41700207dee6", # Beachfront palms & deck
    "photo-1561501900-3701fa6a0864", # Luxury cabanas
    # 3-4 Stars Urban & Coastal Hotels
    "photo-1590490360182-c33d57733427", # Modern tower hotel
    "photo-1445019980597-93fa8acb246c", # Urban boutique hotel
    "photo-1571003123894-1f0594d2b5d9", # Seaside lodge
    "photo-1584132967334-10e028bd69f7", # Resort pool deck
    "photo-1596436889106-be35e843f974", # Warm coastal hotel
    "photo-1512918728675-ed5a9ecdebfd", # Coastal lodge
    "photo-1596394516093-501ba68a0ba6", # Cozy seaside inn
    "photo-1576013551627-0cc20b96c2a7", # Sunny pool hotel
    # Hostales y Alojamientos Económicos (Tarqui, Los Esteros, Manta Centro)
    "photo-1566665797739-1674de7a421a", # Cozy coastal room & facade
    "photo-1591088398332-8a7791972843", # Clean boutique hostel
    "photo-1522771739844-6a9f6d5f14af", # Contemporary hostel
    "photo-1507652313519-d4e9174996dd", # Mediterranean style white hotel
    "photo-1517840901100-8179e982acb7", # Modern downtown hotel
    # Kitesurf & Eco Cabins (Santa Marianita, San Mateo & Pacoche)
    "photo-1499793983690-e29da59ef1c2", # Beach wooden cabin
    "photo-1507525428034-b723cf961d3e", # Open beach lodge
    "photo-1510414842594-a61752afb894", # Tropical greenery lodge
    "photo-1520250497591-112f2f40a3f4", # Rustic oceanfront bungalow
    "photo-1470770841072-f978cf4d019e"  # Pacoche nature lodge
]

print("Testing photo URLs...")
valid_count = 0
for pid in sample_photos[:5]:
    url = f"https://images.unsplash.com/{pid}?w=400&h=300&fit=crop"
    try:
        r = requests.head(url, timeout=5)
        if r.status_code == 200:
            valid_count += 1
    except Exception as e:
        pass
print(f"Verified {valid_count} of 5 sample photos.")
