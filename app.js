// mapboxgl.accessToken =
//   "pk.eyJ1IjoiY2xvdWRsdW4iLCJhIjoiY2w4NmgxjQ1MHFsOTNub2V5ZjNma3NnYyJ9.S2Uvtteen0hNKEXuwbuVGA";

// const map = new mapboxgl.Map({
//   container: "map", // container ID
//   // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//   style: "mapbox://styles/cloudlun/cl2eq8ceb000a15o06rah6zx5", // style URL
//   center: [121.522, 25.045], // starting position [lng, lat]
//   zoom: 13, // starting zoom
// });

// let transform = d3.geoTransform({ point: projectPoint });
// let path = d3.geoPath().projection(transform);

// function projectPoint(lon, lat) {
//   var point = map.project(new mapboxgl.LngLat(lon, lat));
//   this.stream.point(point.x, point.y);
// }

// function polygonColor(d) {
//   return d > 100 ? "red" : d > 10 ? "orange" : d > 5 ? "yellow" : "salmon";
// }

// function polygonSize(d) {
//   return d > 100 ? "red" : d > 10 ? "orange" : d > 5 ? "yellow" : "salmon";
// }

// let container = map.getCanvasContainer();
// let svg = d3
//   .select(container)
//   .append("svg")
//   .attr("width", "100%")
//   .attr("height", "2000")
//   .style("position", "absolute")
//   .style("z-index", 2);

// // let data = [[121.506846, 25.0422]];

// d3.json("./data/point_avg20220608.geojson").then((data) => {

//   console.log(data)

//   let coordinates = []

//   data.features.forEach( d => coordinates.push( d.geometry.coordinates))

//   console.log(coordinates)

//   // let points = svg
//   //   .selectAll("points")
//   //   .data(data.features)
//   //   .enter()
//   //   .append("circle")
//   //   .attr('cx', d => d.geometry.coordinates[0])
//   //   .attr('cy', d => d.geometry.coordinates[1])
//   //   .attr('r', '10px')
//   //   .attr("fill", d => polygonColor(d.properties.日平均_全天))
//   //   .attr("fill-opacity", 0.4);

//     let points = svg
//     .selectAll("points")
//     .data(data.features)
//     .enter()
//     .append("path")
//     // .attr('stroke', 'white')
//     // .attr('fill', 'white')
//     .attr("fill", d => polygonColor(d.properties.日平均_全天))
//     .attr("fill-opacity", 0.3);

//   function render() {
//     points.attr('d', path)
//   }

//   render();
//   map.on("viewreset", render);
//   map.on("move", render);
//   map.on("moveend", render);
// });

const width = window.innerWidth;
const height = 800;

const files = ["./data/平日店家消長.csv", "./data/假日店家消長.csv"];

let svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("transform", "translate(" + 20 + "," + 40 + ")");

function colorFilter(d) {
  return d.changes > 0 ? "blue" : "orange";
}

let area = document.getElementById("area");
let time = document.getElementById("time");
let timeValue = "平日";
let areaValue = "中山";

chartGenerator(files[0], "中山");

time.addEventListener("change", () => {
  timeValue = time.value === "平日" ? files[0] : files[1];
  chartGenerator(timeValue, areaValue);
});

area.addEventListener("change", () => {
  let areaValue = area.value;
  chartGenerator(timeValue, areaValue);
});

function chartGenerator(csv, area) {
  d3.selectAll("svg > *").remove();
  d3.csv(csv).then((data) => {
    data.forEach((d) => {
      d["size_all2019"] = +d["size_all2019"];
      d["size_pos"] = +d["size_pos"];
      d["size_neg"] = 0 - +d["size_neg"];
      d["changes"] = +d["changes"];
    });

    console.log(data[0]["size_neg"]);

    areaData = data.filter((d) => d["xm_dist"] === area);

    let x = d3.scaleLinear().range([0, 600]).domain(
      [-70, 70]
      // d3.extent(areaData, function (d) {
      //   return d.size_pos;
      // })
    );

    let x1 = d3.scaleLinear().range([200, 400]).domain([70,0]);
    console.log(x(0));
    console.log(x(-70))

    let y = d3
      .scaleBand()
      // .padding(0.04)
      .range([0, height])
      .domain(areaData.map((d) => d["細項分類"]));

    // AXIS
    // svg
    //   .append("g")
    //   .attr("class", "xAxis")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x).tickSize(0))
    //   .call((g) => {
    //     g.select(".domain").remove();
    //   });



    svg
      .append("g")
      .attr("class", "yAxis")
      .attr("transform", "translate(" + x(0) + ",0)")
      .call(d3.axisRight(y).tickSize(0).tickPadding(5));
    // .call((g) => {
    //   g.select(".domain").remove();
    // });

    // svg
    //   .append("g")
    //   .attr("class", "yAxis")
    //   .attr("transform", "translate(" + x1(0) + ",0)")
    //   .call(d3.axisRight(y).tickSize(0).tickPadding(5));

    svg
      .append("g")
      .attr("class", "positive-bars")
      .selectAll("Prects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "Pbar";
      })
      .attr("x", function (d) {
        return x(0);
      })
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return x(d.size_pos)-300;
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "blue")
      // .attr("transform", "translate(" + x(0) + ",0)")

    svg
      .append("g")
      .attr("class", "negative-bars")
      .selectAll("Nrects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "Nbar";
      })
      .attr("x", function (d) {
        return  600 - x(Math.abs((d.size_neg)))
      })
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return x(Math.abs((d.size_neg)))-300;
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "orange")

    svg
      .append("g")
      .attr("class", "positive")
      .selectAll("number")
      .data(areaData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.size_pos) + 15;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 2.8;
      })
      .text((d) => `${d.size_pos}`)
      .style("text-anchor", "middle")
      // .style('fill','white')

    svg
      .append("g")
      .attr("class", "negative")
      .selectAll("number")
      .data(areaData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.size_neg) - 15;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 2.8;
      })
      .text((d) => `${d.size_neg}`)
      .style("text-anchor", "middle");
  });
}
