mapboxgl.accessToken = process.env.MAPBOX_KEY;

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/irsidev/ck9op03tm1mwu1ilehmo42ozl",
  zoom: 1.5,
  center: [0, 20],
});

/* simple displaying of markers
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
  */
const colors = [
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f",
  "#a09fe6",
  "#edffc9",
];
const colorScale = d3
  .scaleOrdinal()
  .domain([
    "sugar",
    "vegatables",
    "potato",
    "cassava",
    "maize",
    "rice",
    "wheat",
    "fruits",
    "milk",
    "bananas",
    "tomato",
    "others",
  ])
  .range(colors);
const sugar = ["==", ["get", "Item"], "Sugar cane"];
const vegatables = ["==", ["get", "Item"], "Vegetables, Other"];
const potato = ["==", ["get", "Item"], "Potatoes and products"];
const cassava = ["==", ["get", "Item"], "Cassava and products"];
const maize = ["==", ["get", "Item"], "Maize and products"];
const rice = ["==", ["get", "Item"], "Rice and products"];
const wheat = ["==", ["get", "Item"], "Wheat and products"];
const fruits = ["==", ["get", "Item"], "Fruits, Other"];
const milk = ["==", ["get", "Item"], "Milk - Excluding Butter"];
const bananas = ["==", ["get", "Item"], "Bananas"];
const tomatoes = ["==", ["get", "Item"], "Tomatoes and products"];
const others = [
  "any",
  ["==", ["get", "Item"], "Plantains"],
  ["==", ["get", "Item"], "Barley and products"],
  ["==", ["get", "Item"], "Pineapples and products"],
  ["==", ["get", "Item"], "Coconuts - Incl Copra"],
  ["==", ["get", "Item"], "Sweet potatoes"],
  ["==", ["get", "Item"], "Sugar beet "],
  ["==", ["get", "Item"], "Oranges, Mandarines"],
  ["==", ["get", "Item"], "Yams"],
  ["==", ["get", "Item"], "Onions"],
];

map.on("load", () => {
  map.addSource("foodData", {
    //foodData.js geojson format
    type: "geojson",
    data: foodData,
    cluster: true,
    clusterRadius: 100,
    clusterProperties: {
      //we sum here on each value of cluster
      sugar: ["+", ["case", sugar, ["get", "Value"], 0]],
      vegatables: ["+", ["case", vegatables, ["get", "Value"], 0]],
      cassava: ["+", ["case", cassava, ["get", "Value"], 0]],
      maize: ["+", ["case", maize, ["get", "Value"], 0]],
      wheat: ["+", ["case", wheat, ["get", "Value"], 0]],
      rice: ["+", ["case", rice, ["get", "Value"], 0]],
      potato: ["+", ["case", potato, ["get", "Value"], 0]],
      fruits: ["+", ["case", fruits, ["get", "Value"], 0]],
      milk: ["+", ["case", milk, ["get", "Value"], 0]],
      bananas: ["+", ["case", bananas, ["get", "Value"], 0]],
      tomatoes: ["+", ["case", tomatoes, ["get", "Value"], 0]],
      others: ["+", ["case", others, ["get", "Value"], 0]],
    },
  });
  map.addLayer({
    id: "foodData_individual",
    type: "circle",
    source: "foodData",
    filter: ["!=", ["get", "cluster"], true],
    paint: {
      "circle-color": [
        "case",
        vegatables,
        colorScale("vegatables"),
        sugar,
        colorScale("sugar"),
        cassava,
        colorScale("cassava"),
        maize,
        colorScale("maize"),
        wheat,
        colorScale("wheat"),
        potato,
        colorScale("potato"),
        rice,
        colorScale("rice"),
        fruits,
        colorScale("fruits"),
        milk,
        colorScale("milk"),
        bananas,
        colorScale("bananas"),
        tomatoes,
        colorScale("tomatoes"),
        others,

        colorScale("others"),
        "#ffed6f",
      ],
      "circle-radius": 5,
    },
  });
  map.addLayer({
    id: "foodData-out",
    type: "circle",
    source: "foodData",
    filter: ["!=", ["get", "cluster"], true],
    paint: {
      "circle-stroke-color": [
        "case",
        sugar,
        colorScale("sugar"),
        vegatables,
        colorScale("vegatables"),
        potato,
        colorScale("potato"),
        cassava,
        colorScale("cassava"),
        maize,
        colorScale("maize"),
        wheat,
        colorScale("wheat"),
        rice,
        colorScale("rice"),
        fruits,
        colorScale("fruits"),
        milk,
        colorScale("milk"),
        bananas,
        colorScale("bananas"),
        tomatoes,
        colorScale("tomatoes"),
        others,
        colorScale("others"),
        "#ffed6f",
      ],
      "circle-stroke-width": 2,
      "circle-radius": 10,
      "circle-color": "rgba(0, 0, 0, 0)",
    },
  });

  let markers = {};
  let markersOnScreen = {};
  let point_counts = [];
  let totals;

  const getPointCount = (features) => {
    features.forEach((f) => {
      if (f.properties.cluster) {
        point_counts.push(
          f.properties.sugar +
            f.properties.vegatables +
            f.properties.potato +
            f.properties.cassava +
            f.properties.maize +
            f.properties.wheat +
            f.properties.rice +
            f.properties.fruits +
            f.properties.milk +
            f.properties.bananas +
            f.properties.tomatoes +
            f.properties.others
        );
      }
    });

    return point_counts;
  };
  const updateMarkers = () => {
    document.getElementById("sidebar-overlay").innerHTML = "";
    let newMarkers = {};
    const features = map.querySourceFeatures("foodData");
    totals = getPointCount(features);
    features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates;
      const props = feature.properties;

      if (!props.cluster) {
        return;
      }

      const id = props.cluster_id;

      let marker = markers[id];
      if (!marker) {
        const el = createDonutChart(props, totals);
        marker = markers[id] = new mapboxgl.Marker({
          element: el,
        }).setLngLat(coordinates);
      }

      newMarkers[id] = marker;

      if (!markersOnScreen[id]) {
        marker.addTo(map);
      }
    });

    for (id in markersOnScreen) {
      if (!newMarkers[id]) {
        markersOnScreen[id].remove();
      }
    }
    markersOnScreen = newMarkers;
  };

  const createDonutChart = (props, totals) => {
    const div = document.createElement("div");
    const data = [
      { type: "sugar", count: props.sugar },
      { type: "vegatables", count: props.vegatables },
      { type: "potato", count: props.potato },
      { type: "cassava", count: props.cassava },
      { type: "maize(corn)", count: props.maize },
      { type: "wheat", count: props.wheat },
      { type: "rice", count: props.rice },
      { type: "fruits", count: props.fruits },
      { type: "milk", count: props.milk },
      { type: "bananas", count: props.bananas },
      { type: "tomatoes", count: props.tomatoes },
      { type: "others", count: props.others },
    ];
    const thickness = 10;
    const scale = d3
      .scaleLinear()
      .domain([d3.min(totals), d3.max(totals)])
      .range([500, d3.max(totals)]);

    const radius = Math.sqrt(scale(props.point_count));
    const circleRadius = radius - thickness;

    const svg = d3
      .select(div)
      .append("svg")
      .attr("class", "pie")
      .attr("width", radius * 2)
      .attr("height", radius * 2);

    const g = svg
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);

    const arc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    const pie = d3
      .pie()
      .value((d) => d.count)
      .sort(null);

    const path = g
      .selectAll("path")
      .data(pie(data.sort((x, y) => d3.ascending(y.count, x.count))))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.type));

    const circle = g
      .append("circle")
      .attr("r", circleRadius)
      .attr("fill", "rgba(0, 0, 0, 0.7)")
      .attr("class", "center-circle");

    const text = g
      .append("text")
      .attr("class", "total")
      .text(
        props.sugar +
          props.vegatables +
          props.potato +
          props.cassava +
          props.maize +
          props.wheat +
          props.rice +
          props.fruits +
          props.bananas +
          props.tomatoes +
          props.milk +
          props.others
      )
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "white");

    const infoEl = createTable(props);

    svg.on("click", () => {
      d3.selectAll(".center-circle").attr("fill", "rgba(0, 0, 0, 0.7)");
      circle.attr("fill", "rgb(71, 79, 102)");
      document.getElementById("sidebar-overlay").innerHTML = "";
      document.getElementById("sidebar-overlay").append(infoEl);
    });

    return div;
  };

  const createTable = (props) => {
    const getPerc = (count) => {
      return count / props.point_count;
    };

    const data = [
      { type: "sugar", perc: props.sugar },
      { type: "vegatables", perc: props.vegatables },
      { type: "potato", perc: props.potato },
      { type: "cassava", perc: props.cassava },
      { type: "maize(corn)", perc: props.maize },
      { type: "wheat", perc: props.wheat },
      { type: "rice", perc: props.rice },
      { type: "fruits", perc: props.fruits },
      { type: "milk", perc: props.milk },
      { type: "bananas", perc: props.bananas },
      { type: "tomatoes", perc: props.tomatoes },
      {
        type:
          "others (Plantains,Barley, Pineapples, Coconuts, Sweet potatoes, Sugar beet, Oranges, Yams, Onions)",
        perc: props.others,
      },
    ];
    const columns = ["type", "perc"];
    const div = document.createElement("div");
    const table = d3.select(div).append("table").attr("class", "table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead
      .append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
      .style("text-align", (d) => `center`)
      .text((d) => {
        let colName = d === "perc" ? "In 1000 tonnes" : "Items";
        return colName;
      });
    // console.log(data);

    const rows = tbody
      .selectAll("tr")
      .data(
        data.filter((i) => i.perc).sort((x, y) => d3.descending(x.perc, y.perc))
      )
      .enter()
      .append("tr")
      .style("border-left", (d) => `20px solid ${colorScale(d.type)}`);
    // console.log(rows);
    const cells = rows
      .selectAll("td")
      .data((row) => {
        return columns.map((column) => {
          let val =
            column === "perc" ? d3.format(",.2r")(row[column]) : row[column];
          return { column: column, value: val };
        });
      })
      .enter()
      .append("td")
      .text((d) => d.value)
      .style("text-transform", "capitalize");

    return div;
  };

  map.on("data", (e) => {
    if (e.sourceId !== "foodData" || !e.isSourceLoaded) return;
    map.on("move", updateMarkers);
    map.on("moveend", updateMarkers);
    updateMarkers();
  });
});
