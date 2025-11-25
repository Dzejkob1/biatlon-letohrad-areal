// ==============================================
// 🎨 KONFIGURACE VÝŠKOVÉHO GRAFU – UPRAVUJ SI SÁM
// ==============================================
const ELEVATION_CHART_CONFIG = {
  lineColor: "#1976d2",
  fillColor: "rgba(25,118,210,0.18)",
  lineWidth: 2,
  tension: 0.15,
  pointRadius: 2,

  title: "Výškový profil trati (m n. m. / km)",
  titleFontSize: 16,

  xAxisLabel: "Vzdálenost (km)",
  yAxisLabel: "Nadmořská výška (m)",

  xStep: 0.05,     // rozestup na ose X
  yStep: 5,       // rozestup na ose Y

  xTicksFontSize: 11,
  yTicksFontSize: 11,

  showGridX: true,
  showGridY: true
};


// 📍 Souřadnice Letohrad
const LETOHRAD_COORDS = [50.04229263166373, 16.515718020675035];
const INITIAL_ZOOM = 15;

// STAVOVÉ PROMĚNNÉ
let fullMapMode = false;
let originalMaxBounds = null;
let polygonLayers = [];
let layers = {};
let linearLayers = {}; // uložíme liniové vrstvy pro pozdější odstraňování/přidávání
let podkladLayer = null;
let podkladBounds = null;
let elevationChart = null;
let elevationMarker = null;
let currentProfilePoints = [];

// 🗺️ Inicializace mapy
const map = L.map('map').setView(LETOHRAD_COORDS, INITIAL_ZOOM);

// Podkladové dlaždice
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
const Ortofoto_CUZK = L.tileLayer.wms('https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/WMService.aspx?', {
  layers: 'GR_ORTFOTORGB',
  format: 'image/jpeg',
  version: '1.3.0',
  attribution: '&copy; ČÚZK'
});
CartoDB_Positron.addTo(map);

// --- Tlačítka
const resetBtn = document.getElementById("resetView");
const fullMapBtn = document.getElementById("fullMap");

//POPUP POLYGONY
//hlavní budova
const polyCoords = [
  [50.042372563000072,16.515632354000047],
  [50.042444606000061,16.51596016700006],
  [50.042324953000048,16.516023570000073],
  [50.042307906000076,16.515946002000078],
  [50.042244893000031, 16.51597939100003],
  [50.042223030000059, 16.51587991100007],
  [50.042280540000036, 16.515849437000043],
  [50.042245524000066, 16.515690104000043],
  [50.042372563000072, 16.515632354000047]
];
//závodní kacelář
const polyCoords1 = [
  [50.04255243800003,16.516802178000034],
  [50.042622124000047,16.517014403000076],
  [50.042544987000042,16.517076480000071],
  [50.042478257000027,16.516859848000024],
  [50.04255243800003, 16.516802178000034],
];
//Buňky + kancelář
const polyCoords2 = [
  [50.04266892000004,16.515799209000022],
  [50.042602290000048,16.515870621000033],
  [50.042537750000065,16.515708066000059],
  [50.042611062000049,16.515642865000075],
  [50.04266892000004,16.515799209000022]
];
//Buňky + VIP
const polyCoords3 = [
   [ 50.043012043000033, 16.515836694000029], 
   [ 50.042970192000041, 16.515853724000067], 
   [ 50.042953127000033, 16.515860668000073], 
   [ 50.042855383000074, 16.515281507000054], 
   [ 50.042930948000048, 16.515252276000069], 
   [ 50.043028453000034, 16.515830017000042], 
   [ 50.043012043000033, 16.515836694000029]
];
//Střelnice
const polyCoords4 = [
  [ 50.043124930000033, 16.516206894000049 ], 
  [ 50.04331798700008 , 16.51681157400003,], 
  [ 50.042740625000079, 16.517259113000023 ], 
  [ 50.042546500000071, 16.516655269000069 ], 
  [ 50.043124930000033, 16.516206894000049 ]
];
//Posilovna
const polyCoords5 = [
  [50.042646189000038,16.516208050000046],
  [50.042554916000029,16.516283041000065],
  [50.042514636000078,16.516156183000078],
  [50.042607215000032,16.516085305000047],
  [50.042646189000038,16.516208050000046]
];
// Parkoviště
const polyCoords6 = [
  [ 50.042398004000063, 16.514712548000034 ], 
  [ 50.042424612000048, 16.514708239000072 ], 
  [ 50.042452425000079, 16.514703349000058 ], 
  [ 50.042486498414107, 16.514713148050141 ], 
  [ 50.042521592901757, 16.514718187480987 ], 
  [ 50.042557046882784, 16.514718372292268 ], 
  [ 50.042592192000029, 16.514713699000026 ], 
  [ 50.042730605000031, 16.514583149000032 ], 
  [ 50.04278273500006 , 16.514749456000061], 
  [ 50.042697517000079, 16.514866801000039 ], 
  [ 50.042458219000082, 16.515238196000041 ], 
  [ 50.042417628771467, 16.515173445749085 ], 
  [ 50.042382916512132, 16.515105363293856 ], 
  [ 50.042354353577103, 16.515034480853146 ], 
  [ 50.042332163250499, 16.514961352533984 ], 
  [ 50.042316519000053, 16.514886550000028 ], 
  [ 50.042303309770844, 16.514811912161342 ], 
  [ 50.04229597281676 , 16.514736470397015], 
  [ 50.042294553000033, 16.51466068600007 ], 
  [ 50.042391183000063, 16.514647855000078 ], 
  [ 50.042398004000063, 16.514712548000034 ]
];
//Tribuna
const polyCoords7 = [
  [ 50.043120120000026, 16.516191934000062 ], 
  [ 50.043111416000045, 16.516164859000071 ], 
  [ 50.043032934000053, 16.515944518000026 ], 
  [ 50.043046133000075, 16.515933873000051 ], 
  [ 50.04309736700003 , 16.515889400000049], 
  [ 50.043182384000033, 16.516134929000032 ], 
  [ 50.043120120000026, 16.516191934000062 ]
];
//Střelecké stavy
const polyCoords8 = [
  [  ]
];
//Přístřešek
const polyCoords9 = [
  [  ]
];


// Ubytovací marker ikona
const ubytovaniIcon = L.icon({
  iconUrl: 'ubytovani.png',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});
const UB_SOURADNICE = [50.04235, 16.51584];

const parkingIcon = L.icon({
  iconUrl: 'parking.png',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});
const PA_SOURADNICE = [50.04250, 16.51492];

const targetIcon = L.icon({
  iconUrl: 'target.png',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});
const TG_SOURADNICE = [50.04292, 16.51672];


// Přepínač podkladových vrstev – verze s obrázky
const baseMaps = {
  [`<div class="basemap-option"><img src="carto.png" class="basemap-thumb basemap-click" data-layer="osm"></div>`]: CartoDB_Positron,
  [`<div class="basemap-option"><img src="cuzk.png" class="basemap-thumb basemap-click" data-layer="cuzk"></div>`]: Ortofoto_CUZK
};

// layerControl vytvoříme hned
const layerControl = L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);

// Kliknutí na miniaturu podkladu
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("basemap-click")) {
    const layerKey = e.target.getAttribute("data-layer");
    const radios = document.querySelectorAll(".leaflet-control-layers-base .leaflet-control-layers-selector");
    radios.forEach(radio => {
      const label = radio.closest("label");
      if (!label) return;
      if (layerKey === "osm" && label.innerHTML.includes("OSM")) radio.click();
      if (layerKey === "cuzk" && label.innerHTML.includes("ČÚZK")) radio.click();
    });
  }
});

L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

// Panely (z-index)
map.createPane('interactivePolygonPane');
map.getPane('interactivePolygonPane').style.zIndex = 12000;
map.getPane('interactivePolygonPane').style.pointerEvents = 'auto';
map.createPane('podkladPane').style.zIndex = 200;
map.createPane('lesPane').style.zIndex = 300;
map.createPane('polygonPane').style.zIndex = 400;
map.createPane('markerPane').style.zIndex = 10000;
map.getPane('markerPane').style.pointerEvents = 'none';
map.createPane('trasyPane').style.zIndex = 9000;
map.getPane('trasyPane').style.pointerEvents = 'auto';
map.createPane('okruhPane').style.zIndex = 470;
map.createPane('silnicePane').style.zIndex = 460;
map.getPane('silnicePane').style.pointerEvents = 'none';
map.createPane('cestyPane').style.zIndex = 450;
map.getPane('cestyPane').style.pointerEvents = 'none';
map.createPane('cyklostezkaPane').style.zIndex = 440;
map.getPane('cyklostezkaPane').style.pointerEvents = 'none';
map.createPane('pesinyPane').style.zIndex = 430;
map.getPane('pesinyPane').style.pointerEvents = 'none';
map.createPane('podchodPane').style.zIndex = 420;
map.getPane('podchodPane').style.pointerEvents = 'none';
map.createPane('potokPane').style.zIndex = 410;
map.getPane('potokPane').style.pointerEvents = 'none';

// --- URL vrstev
const layerURLs = {
  komplet: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/komplet_oprava.geojson",
  horni: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/horni_kolo_oprava.geojson",
  dolni: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/dolni_kolo_oprava.geojson",
  nove: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/nove_kolo_oprava.geojson",
  kolo_1_5: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/kolo_1_5_oprava.geojson",    // <-- sem doplníš
  kolo_1_45: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/kolo_1_45_oprava.geojson",   // <-- sem doplníš
  podklad: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/poklad_oprava.geojson",
  tribuna: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/tribuna.geojson",
  budovy: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/budovy.geojson",
  strelnice: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/strelnice.geojson",
  strel_stavy: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/strel_stavy.geojson",
  parkoviste: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/parkoviste.geojson",
  nadrz: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/nadrz.geojson",
  les: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/les_oprava.geojson",
  pristresek: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/pristresek.geojson"
};

// --- URL profilů
const profileURLs = {
  komplet: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/komplet_profile.json",
  horni: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/horni_kolo.json",
  dolni: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/dolni_kolo.json",
  nove: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/nove_kolo.json",
  kolo_1_5: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/kolo_1_5.json",    // <-- sem doplníš
  kolo_1_45: "https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/elevation/kolo_1_45.json"    // <-- sem doplníš
};

// UTIL funkce
function haversineDistance(a, b) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const sinDlat = Math.sin(dLat/2), sinDlon = Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon),
    Math.sqrt(1 - (sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));
  return R * c;
}
function interpolateLatLng(a, b, t) {
  return L.latLng(a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t);
}
function computeCumulativeDistances(latlngs) {
  const cum = [0];
  for (let i = 1; i < latlngs.length; i++) {
    cum.push(cum[i - 1] + haversineDistance(latlngs[i - 1], latlngs[i]));
  }
  return cum;
}
function pointOnLineAtDistance(latlngs, cumDistances, targetDist) {
  if (targetDist <= 0) return latlngs[0];
  const total = cumDistances[cumDistances.length - 1];
  if (targetDist >= total) return latlngs[latlngs.length - 1];
  let i = 0;
  while (i < cumDistances.length && cumDistances[i] < targetDist) i++;
  const i1 = Math.max(0, i - 1);
  const i2 = i;
  const segStartDist = cumDistances[i1];
  const segLen = cumDistances[i2] - segStartDist;
  const t = segLen === 0 ? 0 : (targetDist - segStartDist) / segLen;
  return interpolateLatLng(latlngs[i1], latlngs[i2], t);
}


// --- AREÁLOVÝ / CELOMAPOVÝ REŽIM ----------------------------------
// Funkce pro aktivaci "areál" režimu (výchozí)
function activateAreaMode() {
  fullMapMode = false;

if (podkladBounds) {

    // hranice areálu, panning se musí držet uvnitř
    originalMaxBounds = podkladBounds.pad(0.0);
    map.setMaxBounds(originalMaxBounds);

    // zoom, který přesně zobrazí podklad
    const boundsZoom = map.getBoundsZoom(originalMaxBounds, true);

    // chceme start na boundsZoom - 1 (víc oddálený)
    const startZoom = boundsZoom - 0.1;

    // uživatel smí zoomovat jen DOVNITŘ → minZoom = startZoom
    // uživatel NESMÍ zoomovat ven → minZoom = startZoom
    map.setMinZoom(startZoom);

    // maximální přiblížení necháme volné (neomezené)
    map.setMaxZoom(20);

    // nastavíme výchozí zoom
    map.setZoom(startZoom);

    // vycentrování na celý areál
    map.fitBounds(originalMaxBounds);
}

  // skryt control pokud existuje
  const ctrlEl = document.querySelector(".leaflet-control-layers");
  if (ctrlEl) ctrlEl.style.display = "none";

  // obnov polygonové vrstvy
  polygonLayers.forEach(l => { if (l && !map.hasLayer(l)) map.addLayer(l); });

  // obnovíme i liniové vrstvy, které jsme mohli v fullMap odstranit (kromě tras, které jsou ovládány checkboxes)
  const restoreNames = ['potok','silnice','cesty','cyklostezka','podchod','pesiny'];
  restoreNames.forEach(n => {
    if (linearLayers[n] && !map.hasLayer(linearLayers[n])) map.addLayer(linearLayers[n]);
  });

  // obnov podklad pokud není
  if (podkladLayer && !map.hasLayer(podkladLayer)) map.addLayer(podkladLayer);
}

// Funkce pro aktivaci "full map" režimu
function activateFullMapMode() {
  fullMapMode = true;

  // zrušíme bounds -> volný pohyb
  map.setMaxBounds(null);
  map.setMinZoom(0);

  // zobraz control pokud existuje
  const ctrlEl = document.querySelector(".leaflet-control-layers");
  if (ctrlEl) ctrlEl.style.display = "block";

  // odstranit polygony
  polygonLayers.forEach(l => { if (l && map.hasLayer(l)) map.removeLayer(l); });

  // odstranit podklad
  if (podkladLayer && map.hasLayer(podkladLayer)) map.removeLayer(podkladLayer);

  // odstraníme jmenované liniové vrstvy (pokud existují)
  const toRemove = ['potok','silnice','cesty','cyklostezka','podchod','pesiny'];
  toRemove.forEach(name => {
    if (linearLayers[name] && map.hasLayer(linearLayers[name])) {
      map.removeLayer(linearLayers[name]);
    }
  });

  // ponecháme okruh (linearLayers.okruh) a trasy (ovládají se checkboxes)
}

// --- Funkce pro návrat na areál (tl. Zpět na areál)
function resetMapView() {
  if (!podkladBounds) return;
  map.setView(podkladBounds.getCenter(), 17);
}

// --- Načtení podkladu
fetch(layerURLs.podklad)
  .then(res => res.json())
  .then(data => {
    podkladLayer = L.geoJSON(data, {
      style: { color: '#7f7f7f', weight: 0, fillColor: '#F6F9FC', fillOpacity: 1 },
      pane: 'podkladPane'
    }).addTo(map);
    podkladBounds = podkladLayer.getBounds();
    resetMapView();
    // po načtení podkladu aktivujeme areál režim (výchozí)
    activateAreaMode();
  })
  .catch(err => console.warn("Chyba načtení podkladu:", err));

// --- Polygonové vrstvy (uložíme do polygonLayers)
const polygonLayerList = {
  tribuna: { url: layerURLs.tribuna, style: { fillColor: '#9dc7ea', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  budovy: { url: layerURLs.budovy, style: { fillColor: '#7d94c3', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  strelnice: { url: layerURLs.strelnice, style: { fillColor: '#9d93c1ff', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  strel_stavy: { url: layerURLs.strel_stavy, style: { fillColor: '#3d6690', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  parkoviste: { url: layerURLs.parkoviste, style: { fillColor: '#449cf4ff', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  nadrz: { url: layerURLs.nadrz, style: { fillColor: '#9fc4e2c6', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  les: { url: layerURLs.les, style: { fillColor: '#ddf0deb5', fillOpacity: 0.6, color: '#a4a4a4', weight:0 } },
  pristresek: { url: layerURLs.pristresek, style: { fillColor: '#d3ddf2f7', fillOpacity: 1, color: '#a4a4a4', weight:0 } }
};

Object.entries(polygonLayerList).forEach(([key, cfg]) => {
  if (!cfg.url) return;
  fetch(cfg.url)
    .then(r => r.json())
    .then(j => {
      try {
        const layer = L.geoJSON(j, {
          style: cfg.style,
          pane: key === 'les' ? 'lesPane' : 'polygonPane'
        }).addTo(map);
        polygonLayers.push(layer);
      } catch (err) {
        console.warn("Chyba při přidávání polygonu", key, err);
      }
    })
    .catch(err => console.warn("Chyba načtení polygonu", key, err));
});

// --- Liniové vrstvy (ostatní) - uložíme reference do linearLayers
const lineLayerList = {
  okruh:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/okruh.geojson",style:{color:'#318DC1',weight:3},pane:'okruhPane'},
  silnice:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/silnice_oprava.geojson",style:{color:'#a9a8a6ad',weight:4},pane:'silnicePane'},
  cesty:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/cesty_oprava.geojson",style:{color:'#d5d5d5ff', lineCap: 'square',weight:3},pane:'cestyPane'},
  cyklostezka:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/cyklostezka_oprava.geojson",style:{color:'#ad97b0c4',dashArray: '7, 7',opacity: 0.3,weight:2},pane:'cyklostezkaPane'},
  pesiny:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/pesiny.geojson",style:{color:'#dfdfe5ff',weight:2},pane:'pesinyPane'},
  podchod:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/podchod.geojson",style:{color:'#6d6d6bff',weight:4,opacity: 0.6},pane:'podchodPane'},
  potok:{url:"https://raw.githubusercontent.com/Dzejkob1/biathlon-letohrad-interactive--map/main/data/layers/potok_oprava.geojson",style:{color:'#9fc4e2ca',weight:2},pane:'potokPane'}
};

Object.entries(lineLayerList).forEach(([name, cfg]) => {
  if (!cfg.url) return;
  fetch(cfg.url)
    .then(r => r.json())
    .then(j => {
      try {
        const l = L.geoJSON(j, { style: cfg.style, pane: cfg.pane }).addTo(map);
        linearLayers[name] = l; // uložíme referenci
      } catch (err) {
        console.warn("Chyba při přidání liniové vrstvy", name, err);
      }
    })
    .catch(err => console.warn("Chyba načtení liniové vrstvy", name, err));
});

// --- Checkbox vrstvy
function loadCheckboxLayers() {
  const checkboxConfigs = [
    { id: 'komplet', key: 'komplet', url: layerURLs.komplet, style: { color: '#6A3414', weight: 5 } },
    { id: 'hornikolo', key: 'horni', url: layerURLs.horni, style: { color: '#8BBD41', weight: 5 } },
    { id: 'dolnikolo', key: 'dolni', url: layerURLs.dolni, style: { color: '#EE3823', weight: 5 } },
    { id: 'novekolo', key: 'nove', url: layerURLs.nove, style: { color: '#6a1b9a', weight: 5 } },
    { id: 'kolo_1_5', key: 'kolo_1_5', url: layerURLs.kolo_1_5, style: { color: '#0D65AA', weight: 5 } },
    { id: 'kolo_1_45', key: 'kolo_1_45', url: layerURLs.kolo_1_45, style: { color: '#F4DD2A', weight: 5 } }
  ];

  // --- načtení vrstev stejným způsobem jako u stávajících
  const loadPromises = checkboxConfigs.map(cfg => {
    if (!cfg.url) {
      console.warn("No URL for", cfg.key);
      return Promise.resolve(null);
    }
    return fetch(cfg.url)
      .then(r => r.json())
      .then(j => {
        const layer = L.geoJSON(j, { style: cfg.style, pane: 'trasyPane' });
        const geom = j.features && j.features[0] && j.features[0].geometry;
        let baseCoords = [];
        if (geom) {
          if (geom.type === "LineString") baseCoords = geom.coordinates;
          else if (geom.type === "MultiLineString") baseCoords = geom.coordinates[0];
        }
        layer.latlngs = baseCoords.map(c => L.latLng(c[1], c[0]));
        layers[cfg.key] = layer;
        cfg._layer = layer;
        return cfg;
      })
      .catch(err => {
        console.warn("Chyba načtení trasy", cfg.key, err);
        return cfg;
      });
  });

  Promise.all(loadPromises).then(loaded => {
    loaded.forEach(cfg => {
      if (!cfg) return;
      const checkbox = document.getElementById(cfg.id);
      if (!checkbox) return;
      checkbox.addEventListener("change", e => {
        const layer = layers[cfg.key];
        if (!layer) {
          console.warn("Vrstva pro", cfg.key, "není dostupná.");
          e.target.checked = false;
          return;
        }
        if (e.target.checked) {
          // vypnout ostatní trasy
          Object.keys(layers).forEach(k => {
            if (k !== cfg.key && layers[k] && map.hasLayer(layers[k])) {
              map.removeLayer(layers[k]);
              const otherCheckbox = document.querySelector(`#${getCheckboxIdByKey(k)}`);
              if (otherCheckbox) otherCheckbox.checked = false;
            }
          });
          // přidat aktuální
          layer.addTo(map);
          // načti profil pro tuto trasu
          loadGenericProfile(cfg.key, profileURLs[cfg.key], layer);
        } else {
          if (map.hasLayer(layer)) map.removeLayer(layer);
          hideElevationChart();
        }
      });
    });
  });
}

// --- Rozšíření getCheckboxIdByKey
function getCheckboxIdByKey(key) {
  if (key === 'komplet') return 'komplet';
  if (key === 'horni') return 'hornikolo';
  if (key === 'dolni') return 'dolnikolo';
  if (key === 'nove') return 'novekolo';
  if (key === 'kolo_1_5') return 'kolo_1_5';
  if (key === 'kolo_1_45') return 'kolo_1_45';
  return null;
}

loadCheckboxLayers();

// --- Načtení profilu pro komplet (kompatibilita)
function loadElevationProfileAndMapToLine(geoLayer) {
  const profileURL = profileURLs.komplet;
  fetch(profileURL)
    .then(r => r.json())
    .then(profile => {
      const latlngs = geoLayer.latlngs;
      if (!latlngs || latlngs.length < 2) {
        showElevationChart(profile, geoLayer, []);
        return;
      }
      const cum = computeCumulativeDistances(latlngs);
      currentProfilePoints = profile.map(p => pointOnLineAtDistance(latlngs, cum, p.FIRST_DIST));
      showElevationChart(profile, geoLayer, currentProfilePoints);
    })
    .catch(err => console.warn("Chyba načtení profilu komplet:", err));
}

// --- Univerzální načítání profilu pro všechna kola ---
function loadGenericProfile(key, url, geoLayer) {
  if (!url) {
    console.warn("Chybí URL profilu pro", key);
    return;
  }
  fetch(url)
    .then(r => r.json())
    .then(profile => {
      const latlngs = geoLayer.latlngs;
      if (!latlngs || latlngs.length < 2) {
        showElevationChart(profile, geoLayer, []);
        return;
      }
      const cum = computeCumulativeDistances(latlngs);
      const mappedPoints = profile.map(p => pointOnLineAtDistance(latlngs, cum, p.FIRST_DIST));
      currentProfilePoints = mappedPoints;
      showElevationChart(profile, geoLayer, mappedPoints);
    })
    .catch(err => console.warn("Chyba načtení profilu", key, err));
}

// --- Graf výškového profilu ---
function showElevationChart(profileData, geoLayer, mappedPoints = []) {
  const ctx = document.getElementById("elevationChart").getContext("2d");
  document.getElementById("profileContainer").classList.add('show');
  document.getElementById("profileContainer").style.display = "block";

  // --- Převod STRING → NUMBER ---
  const distance = profileData.map(p => Number(p.FIRST_DIST) / 1000); // v km
  const elevation = profileData.map(p => Number(p.FIRST_Z));

  const maxDist = Math.max(...distance);
  const minDist = 0;

  // --- Adaptivní krok osy X podle délky trati ---
  let xStep;
  if (maxDist > 3) xStep = 0.5;
  else if (maxDist > 2) xStep = 0.25;
  else if (maxDist > 1) xStep = 0.2;
  else xStep = 0.1;

  if (elevationChart) elevationChart.destroy();

  elevationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: distance,
      datasets: [{
        label: 'Výškový profil',
        data: elevation,
        borderColor: ELEVATION_CHART_CONFIG.lineColor,
        backgroundColor: ELEVATION_CHART_CONFIG.fillColor,
        borderWidth: ELEVATION_CHART_CONFIG.lineWidth,
        tension: ELEVATION_CHART_CONFIG.tension,
        pointRadius: ELEVATION_CHART_CONFIG.pointRadius,
        fill: true
      }]
    },

    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(1)} m`
          }
        },
        title: {
          display: true,
          text: ELEVATION_CHART_CONFIG.title,
          font: { size: ELEVATION_CHART_CONFIG.titleFontSize }
        }
      },

      scales: {
        x: {
          type: 'linear',
          min: minDist,
          max: maxDist,
          title: { display: true, text: ELEVATION_CHART_CONFIG.xAxisLabel },
          ticks: { stepSize: xStep, callback: v => v.toFixed(2) },
          grid: { display: ELEVATION_CHART_CONFIG.showGridX }
        },
        y: {
          title: { display: true, text: ELEVATION_CHART_CONFIG.yAxisLabel },
          ticks: {
            stepSize: ELEVATION_CHART_CONFIG.yStep,
            callback: v => v.toFixed(1),
            font: { size: ELEVATION_CHART_CONFIG.yTicksFontSize }
          },
          grid: { display: ELEVATION_CHART_CONFIG.showGridY }
        }
      },

      interaction: { mode: 'index', intersect: false },

      onHover: (event, elements) => {
        if (!elements.length) return;
        const index = elements[0].index;
        if (mappedPoints?.length) {
          updateMapMarkerByLatLng(mappedPoints[Math.min(index, mappedPoints.length - 1)]);
        } else if (geoLayer?.latlngs) {
          updateMapMarkerByLatLng(geoLayer.latlngs[Math.min(index, geoLayer.latlngs.length - 1)]);
        }
      }
    }
  });
}

// --- marker aktualizace podle latlngu
function updateMapMarkerByLatLng(latlng) {
  if (!latlng) return;
  if (!elevationMarker) {
    elevationMarker = L.circleMarker(latlng, {
      radius: 6,
      color: '#993468ff',
      fillColor: '#f90081ff',
      fillOpacity: 1,
      pane: 'markerPane'
    }).addTo(map);
  } else {
    elevationMarker.setLatLng(latlng);
  }
}

// --- Skrytí profilu ---
function hideElevationChart() {
  document.getElementById("profileContainer").classList.remove('show');
  document.getElementById("profileContainer").style.display = "none";
  if (elevationMarker) {
    map.removeLayer(elevationMarker);
    elevationMarker = null;
  }
  if (elevationChart) {
    elevationChart.destroy();
    elevationChart = null;
  }
  currentProfilePoints = [];
}

//POPUP POLYGONY do mapy

function createInteractivePolygon(coords, popupHtml) {
  const originalStyle = {
    color: '#035d57ff', 
    opacity: 0.1,     // původní barva obrysu
    weight: 1.2,             // původní tloušťka
    fillColor: '#609de8ff',
    fillOpacity: 0.03
  };

 const poly = L.polygon(coords, {
  ...originalStyle,
  pane: 'interactivePolygonPane',
  interactive: true   // ← toto je klíčové pro popupy u transparentních polygonů
}).addTo(map);

  // Hover efekt
  poly.on("mouseover", function () {
    this.setStyle({
      fillOpacity: 0.8,
      color: '#3a83e9ff',
      weight: 2
    });
  });

  poly.on("mouseout", function () {
    this.setStyle(originalStyle); // ← vrátí původní styl
  });
map.createPane('popupAboveAll');
map.getPane('popupAboveAll').style.zIndex = 13000;
map.getPane('popupAboveAll').style.pointerEvents = 'auto';
  // Popup
poly.bindPopup(popupHtml, { className: 'top-popup', pane: 'popupAboveAll' });

  return poly;
}

const transparentPolygon  = createInteractivePolygon(polyCoords,  "<h2>Ubytování + zázemí</h2>");
const transparentPolygon1 = createInteractivePolygon(polyCoords1, "<h2>Závodní kancelář</h2>");
const transparentPolygon2 = createInteractivePolygon(polyCoords2, "<h2>Buňky pro závodníky + kancelář</h2>");
const transparentPolygon3 = createInteractivePolygon(polyCoords3, "<h2>Buňky pro závodníky</h2>");
const transparentPolygon4 = createInteractivePolygon(polyCoords4, "<h2>Střelnice</h2>");
const transparentPolygon5 = createInteractivePolygon(polyCoords5, "<h2>Posilovna</h2>");
const transparentPolygon6 = createInteractivePolygon(polyCoords6, "<h2>Parkoviště</h2>");
const transparentPolygon7 = createInteractivePolygon(polyCoords7, "<h2>Tribuna</h2><p>");
const transparentPolygon8 = createInteractivePolygon(polyCoords8, "<h2>Tribuna</h2><p>Popis této zóny.</p>");
const transparentPolygon9 = createInteractivePolygon(polyCoords9, "<h2>Tribuna</h2><p>Popis této zóny.</p>");


// --- Marker 
L.marker(UB_SOURADNICE, { icon: ubytovaniIcon, pane: 'markerPane' })
  .addTo(map)
  .bindPopup("<h2>Ubytování</h2><p>Zde doplníš popis.</p>");

// --- Marker 
L.marker(PA_SOURADNICE, { icon: parkingIcon, pane: 'markerPane' })
  .addTo(map)
  .bindPopup("<h2>Parkoviště</h2><p>Zde doplníš popis.</p>");

// --- Marker 
L.marker(TG_SOURADNICE, { icon: targetIcon, pane: 'markerPane' })
  .addTo(map)
  .bindPopup("<h2>Srřelnice</h2>");

// Pole souřadnic pro více šipek
const markersData = [
  { coords: [50.04198, 16.51735], popup: 'Marker 1', angle: 0 },
  { coords: [50.04154, 16.51455], popup: 'Marker 2', angle: 183 },
  { coords: [50.04191, 16.51505], popup: 'Marker 3', angle: 180 },
  { coords: [50.04280, 16.51615], popup: 'Marker 4', angle: 65 },
  { coords: [50.04175, 16.51674], popup: 'Marker 4', angle: 288 }
];

const svgMarker = L.icon({
  iconUrl: 'arrow.svg',
  iconSize: [16, 16],
  iconAnchor: [16, 16]
});

markersData.forEach(marker => {
  L.marker(marker.coords, { 
      icon: svgMarker, 
      rotationAngle: marker.angle,  // plugin umožní otočení
      rotationOrigin: 'center bottom' // špička šipky ukazuje na souřadnice
  }).addTo(map)
    .bindPopup(marker.popup);
});

// --- tlačítka: zajistíme existenci
if (resetBtn) resetBtn.addEventListener('click', () => { activateAreaMode(); resetMapView(); });
if (fullMapBtn) fullMapBtn.addEventListener('click', () => { activateFullMapMode(); });

