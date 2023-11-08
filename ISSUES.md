### Major Bugs

1. [x] Logout on click dashboard map bug
2. [ ] Fix Dashboard ui-settings command / control flow
3. [ ] Barham AGC does not have a location
4. [ ] Plot detail modal shifting bug

### Optimizations

1. [ ] avg-dashboard -> get rid of control logs
2. [ ] IIFE fn. `LeafletMaps` is a bad name in `../maps-controller.js`
3. [x] Server-side cluster polygon construction

### Major Features

1. [ ] signup/logout/forgot password functionality in the frontend
2. [ ] ci/cd build pipeline / gihub actions
3. [ ] JWT expiry refresh mechanism
4. [ ] cluster feature sidebar redesign
5. [ ] world geojson polygon mask (https://datahub.io/search?q=nigeria+geojson)
6. [ ] Implement window controls
7. [ ] trace un-expected end of JSON input error when API download fails
8. [ ] Add geo. pol. labels
9. [ ] Reset cluster map view
10. [ ] HTML label for current dashboard map tile
11. [ ] clusters search
12. [ ] update landing page mapbox in realtime
13. [ ] sidebar pagenation
14. [ ] show cluster plot detailed coords when plot card is expanded

### Other Features

1. [ ] Legacy cluster that were unable to form polygons dont have cluster props (markup-generators.js - 135)
2. [ ] Build out AGC Insights
3. [ ] How to format cluster area by the '000 for cluster result/record in dashboard.pug markup?
4. [ ] update `_GenerateClusterRecordMarkup` fn. with correct markup from dashboard.pug for cluster result item markup
5. [ ] format cluster basemap polygon BBOX distances by '000
6. [ ] seperate `_downloadAndSaveParcelizedClusters` to `_downloadParcelizedClusters()` & `_downloadParcelizedClustersMetadata()`
7. [ ] Simplify the interface for `APP_STATE.returnCachedDBCollection(collectionName)`; expand "data" object in the return
8. [ ] Cache + render other POIs on basemap

### Manual Pre-deploy checklist

```bash
auth-controller.js -> disable secure cookie
dashboard.pug -> switch scripts
landing.pug -> enable fullscreen
dashboard.js -> enable fullscreen
xxx ui-controller.js -> disable \_isValidGeoJSON check
```

If you're not sure about your server's public IP address, run the command below to print it to the standard output:

```bash
curl -4 icanhazip.com
```

