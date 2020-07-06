import "https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.js";
import config from "./config.js";

mapboxgl.accessToken = config.mapbox_key;

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/irsidev/ck9op03tm1mwu1ilehmo42ozl",
  zoom: 1.5,
  center: [0, 20],
});

fetch("/data_countries.json")
  .then((response) => response.json())
  .then((data) => {
    // console.log(data.features);
    data.features.forEach((country) => {
      let coordinate = country.geometry.coordinates;
      new mapboxgl.Marker({
        color: "red",
      })
        .setLngLat([coordinate[0], coordinate[1]])
        .setPopup(new mapboxgl.Popup().setHTML("<h1>Hello World!</h1>"))
        .addTo(map);
    });
  });
