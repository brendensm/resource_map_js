const MICHIGAN_CENTER = [-84.506836, 44.182205];
const MICHIGAN_ZOOM = 6;

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
    center: MICHIGAN_CENTER,
    zoom: MICHIGAN_ZOOM
});

let michiganCounties = {};

async function loadGeoJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        return null;
    }
}

function zoomToCounty() {
    const selectedCounty = document.getElementById('countySelect').value;
    if (selectedCounty && michiganCounties[selectedCounty]) {
        map.flyTo({
            center: michiganCounties[selectedCounty],
            zoom: 9
        });
    }
}

function resetView() {
    map.flyTo({
        center: MICHIGAN_CENTER,
        zoom: MICHIGAN_ZOOM
    });
}

function updateDataset() {
    const selectedDataset = document.getElementById('dataSelect').value;
    let url;

    if (selectedDataset === 'Narcan') {
        url = 'https://brendensm.github.io/resource_map_js/data/narcan_directory.geojson';
        circleColor = '#e41a1c';
    } else if (selectedDataset === 'Pharmacy') {
        url = 'https://brendensm.github.io/resource_map_js/data/pharm.geojson'; 
         circleColor = '#377eb8';
    } else if (selectedDataset == 'SSP') {
        url = 'https://brendensm.github.io/resource_map_js/data/ssp.geojson';
        circleColor = '#4daf4a';
    } else {
        console.error('Invalid dataset selected');
        return;
    }
    
    
    

    loadGeoJSON(url).then(data => {
      
        if (data) {
            if (map.getSource('points')) {
                map.getSource('points').setData(data);
            } else {
                map.addSource('points', {
                    type: 'geojson',
                    data: data
                });

                // Add layers here (same as in the original code)
                map.addLayer({
                    id: 'points-outline',
                    type: 'circle',
                    source: 'points',
                    paint: {
                        'circle-radius': 7,
                        'circle-color': '#121212',
                        'circle-opacity': 0.8
                    }
                });

                map.addLayer({
                    id: 'points',
                    type: 'circle',
                    source: 'points',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': circleColor
                    }
                });

                // Add popup and mouse events here (same as in the original code)
                map.on('click', 'points', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const name = e.features[0].properties.name;

                    new maplibregl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(name)
                        .addTo(map);
                });

                map.on('mouseenter', 'points', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'points', () => {
                    map.getCanvas().style.cursor = '';
                });
            }
            
            map.setPaintProperty('points', 'circle-color', circleColor);
            
        } else {
            console.error('Failed to load point data');
        }
    });
}

function toggleControls() {
const controlsContainer = document.getElementById('controls');
    controlsContainer.classList.toggle('collapsed');
}


map.on('load', async function () {
    // Load county centroids
    const countyData = await loadGeoJSON('https://brendensm.github.io/resource_map_js/data/mi_counties.geojson');

    if (countyData) {
        countyData.features.forEach(feature => {
            michiganCounties[feature.properties.name] = feature.geometry.coordinates;
        });
        
        // Populate dropdown
        const select = document.getElementById('countySelect');
        for (let county in michiganCounties) {
            let option = document.createElement('option');
            option.value = county;
            option.textContent = county;
            select.appendChild(option);
        }
    } else {
        console.error('Failed to load county data');
    }

    // Initialize with the default dataset (Narcan)
    updateDataset();

    // Add event listener for dataset selection
    document.getElementById('dataSelect').addEventListener('change', updateDataset);
    
    document.getElementById('toggleControls').addEventListener('click', toggleControls);
});