with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update SearchBar declaration
searchbar_old = '''function SearchBar({
  params,
  onChange,
  onSearch,
  variant = "hero",
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  variant?: "hero" | "sticky";
}) {'''

searchbar_new = '''function SearchBar({
  params,
  onChange,
  onSearch,
  variant = "hero",
  onSelectHotel,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  variant?: "hero" | "sticky";
  onSelectHotel?: (h: Hotel) => void;
}) {'''

# 2. Update SearchBar's MantaMapModal
map_searchbar_old = '''      <MantaMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectDestination={handleSelectDestination}
        hotels={HOTELS}
      />'''

map_searchbar_new = '''      <MantaMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectDestination={handleSelectDestination}
        onSelectHotel={h => {
          setIsMapModalOpen(false);
          if (onSelectHotel) onSelectHotel(h);
          else handleSelectDestination(h.name);
        }}
        hotels={HOTELS}
      />'''

# 3. Update ResultsView's SearchBar and MantaMapModal
results_search_old = '''<SearchBar params={params} onChange={onChange} onSearch={onSearch} variant="sticky" />'''
results_search_new = '''<SearchBar params={params} onChange={onChange} onSearch={onSearch} variant="sticky" onSelectHotel={onSelect} />'''

results_map_old = '''          <MantaMapModal
            isOpen={showResultsMap}
            onClose={() => setShowResultsMap(false)}
            onSelectDestination={dest => {
              setShowResultsMap(false);
              onChange({ ...params, destination: dest });
            }}
            hotels={results}
          />'''

results_map_new = '''          <MantaMapModal
            isOpen={showResultsMap}
            onClose={() => setShowResultsMap(false)}
            onSelectDestination={dest => {
              setShowResultsMap(false);
              onChange({ ...params, destination: dest });
            }}
            onSelectHotel={h => {
              setShowResultsMap(false);
              onSelect(h);
            }}
            hotels={results}
          />'''

# 4. Update HomePage definition
homepage_old = '''function HomePage({
  params,
  onChange,
  onSearch,
  theme,
  onToggleTheme,
  onOpenConsult,
  onOpenAbout,
  onOpenLegal,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenConsult?: () => void;
  onOpenAbout?: () => void;
  onOpenLegal?: () => void;
}) {'''

homepage_new = '''function HomePage({
  params,
  onChange,
  onSearch,
  onSelectHotel,
  theme,
  onToggleTheme,
  onOpenConsult,
  onOpenAbout,
  onOpenLegal,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  onSelectHotel?: (h: Hotel) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenConsult?: () => void;
  onOpenAbout?: () => void;
  onOpenLegal?: () => void;
}) {'''

# 5. Inside HomePage: SearchBar & MantaMapModal
home_searchbar_old = '''<div className="max-w-4xl mx-auto"><SearchBar params={params} onChange={onChange} onSearch={onSearch} /></div>'''
home_searchbar_new = '''<div className="max-w-4xl mx-auto"><SearchBar params={params} onChange={onChange} onSearch={onSearch} onSelectHotel={onSelectHotel} /></div>'''

home_map_old = '''      {/* ─── Modal de Mapa Geográfico Real ─── */}
      <MantaMapModal
        isOpen={isHomeMapOpen}
        onClose={() => setIsHomeMapOpen(false)}
        onSelectDestination={dest => {
          onChange({ ...params, destination: dest });
          onSearch();
        }}
        hotels={HOTELS}
      />'''

home_map_new = '''      {/* ─── Modal de Mapa Geográfico Real ─── */}
      <MantaMapModal
        isOpen={isHomeMapOpen}
        onClose={() => setIsHomeMapOpen(false)}
        onSelectDestination={dest => {
          onChange({ ...params, destination: dest });
          onSearch();
        }}
        onSelectHotel={h => {
          setIsHomeMapOpen(false);
          if (onSelectHotel) onSelectHotel(h);
        }}
        hotels={HOTELS}
      />'''

# 6. GuestPage root passing onSelectHotel to HomePage
root_homepage_old = '''      {view === "home" && (
        <HomePage
          params={params}
          onChange={setParams}
          onSearch={handleSearch}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenConsult={() => setShowConsultModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenLegal={() => setShowLegalModal(true)}
        />
      )}'''

root_homepage_new = '''      {view === "home" && (
        <HomePage
          params={params}
          onChange={setParams}
          onSearch={handleSearch}
          onSelectHotel={handleSelectHotel}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenConsult={() => setShowConsultModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenLegal={() => setShowLegalModal(true)}
        />
      )}'''

def do_replace(source, old_s, new_s):
    if old_s in source:
        return source.replace(old_s, new_s, 1)
    old_crlf = old_s.replace('\n', '\r\n')
    new_crlf = new_s.replace('\n', '\r\n')
    if old_crlf in source:
        return source.replace(old_crlf, new_crlf, 1)
    old_lf = old_s.replace('\r\n', '\n')
    new_lf = new_s.replace('\r\n', '\n')
    if old_lf in source:
        return source.replace(old_lf, new_lf, 1)
    raise ValueError(f"Could not find block:\n{old_s[:60]}...")

text = do_replace(text, searchbar_old, searchbar_new)
text = do_replace(text, map_searchbar_old, map_searchbar_new)
text = do_replace(text, results_search_old, results_search_new)
text = do_replace(text, results_map_old, results_map_new)
text = do_replace(text, homepage_old, homepage_new)
text = do_replace(text, home_searchbar_old, home_searchbar_new)
text = do_replace(text, home_map_old, home_map_new)
text = do_replace(text, root_homepage_old, root_homepage_new)

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("GuestPage.tsx successfully updated with onSelectHotel bindings!")
