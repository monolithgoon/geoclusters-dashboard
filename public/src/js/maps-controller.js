`use strict`

function initMaps() {
   const baseMap = L.map("agv_base_map", { zoomSnap: 0.01 })
      .setView([59.0043, 7.4430], 7.5);

   const parcelizationMap = L.map("parcelization_map", {
      zoomSnap: 0.01,
      // layers: [mapboxTileLayer],
      center: [5.704, 5.9339],
      zoom: 6,
      zoomControl: false
   });

   L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: `pk.eyJ1IjoiYnBhY2h1Y2EiLCJhIjoiY2lxbGNwaXdmMDAweGZxbmg5OGx2YWo5aSJ9.zda7KLJF3TH84UU6OhW16w`
   })
      .addTo(baseMap)
      // .addTo(parcelizationMap)
      // .setZIndex(-99);

   const token = `pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
   const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}@2x?access_token=${token}`;
   const mapboxAttrib = 'Map data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors. Tiles from <a href="https://www.mapbox.com">Mapbox</a>.';
   const mapboxTileLayer = new L.TileLayer(mapboxUrl, {
      attribution: mapboxAttrib,
      tileSize: 512,
      zoomOffset: -1
   }).addTo(parcelizationMap);
}

export {initMaps};