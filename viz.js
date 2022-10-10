// 地圖前置準備
mapboxgl.accessToken =
  "pk.eyJ1IjoiYW5keTkxMDYxNCIsImEiOiJjbDkwZ3dxZ3QwM2hyM3JyemFia3piZTNlIn0.pYlujx_RTsHo86rpNG1HzA";

const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/andy910614/cl90g29qm000915pcnbav9d5v", // style URL
  center: [121.5052040216948, 25.04446044693477], // starting position [lng, lat]
  zoom: 16.3, // starting zoom
});
const geojsons = [
  "./data/西門町邊界.geojson",
  "./data/網格分區.geojson",
  "./data/發票_分區data.geojson",
];
const promises = [];
geojsons.forEach((url) => promises.push(d3.json(url)));

let transform = d3.geoTransform({ point: projectPoint });
let path = d3.geoPath().projection(transform);
let container = map.getCanvasContainer();
let mapSvg = d3
  .select(container)
  .append("svg")
  .attr("width", "100%")
  .attr("height", "2000")
  .style("position", "absolute")
  .style("z-index", 2);

// 長條圖前置準備
const csvs = ["./data/平日店家消長.csv", "./data/假日店家消長.csv"];
const width = chart.clientWidth;
const height = chart.clientHeight * 0.89;

let timeData = csvs[0];
let locationValue = "中山";
let svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
// .attr("transform", "translate(" + 0 + "," + 0 + ")");
chartGenerator(timeData, locationValue);

Promise.all(promises).then((data) => {
  console.log(data[0]);
  console.log(data[1]);
  console.log(data[2]);


  mapGenerator(data);

  const button = document.querySelector(".button");
  const btnCircle = document.querySelector("button-circle");

  button.addEventListener("click", () => {
    button.classList.toggle("button-weekend");
    if (button.classList.contains("button-weekend")) {
      chartGenerator(csvs[1], locationValue);
      mapGenerator(data);
    } else {
      chartGenerator(csvs[0], locationValue);
      mapGenerator(data);
    }
  });
});

function projectPoint(lon, lat) {
  var point = map.project(new mapboxgl.LngLat(lon, lat));
  this.stream.point(point.x, point.y);
}

function areaColor(d) {
  return d["分區"] === "紅區"
    ? "#ED6A5E"
    : d["分區"] === "灰區"
    ? "#DAD2DB"
    : d["分區"] === "紫區"
    ? "#57467B"
    : d["分區"] === "黃區"
    ? "#FFDF64"
    : d["分區"] === "綠區"
    ? "#70C1B3"
    : "#70C1B3";
}

function chartGenerator(csv, area) {
  d3.selectAll("svg > *").remove();
  d3.csv(csv).then((data) => {
    data.forEach((d) => {
      d["size_all2019"] = +d["size_all2019"];
      d["size_pos"] = +d["size_pos"];
      d["size_neg"] = 0 - +d["size_neg"];
      d["changes"] = +d["changes"];
    });

    let areaData = data.filter((d) => d["xm_dist"] === area);

    let x = d3.scaleLinear().range([0, 600]).domain([-70, 70]);
    let y = d3
      .scaleBand()
      // .padding(0.04)
      .range([0, height])
      .domain(areaData.map((d) => d["細項分類"]));

    let xChanges = d3.scaleLinear().range([0, 600]).domain([0, 70]);

    // AXIS
    svg
      .append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => {
        g.select(".domain").remove();
      });

    svg
      .append("g")
      .attr("class", "yAxis")
      .attr("transform", "translate(0," + -(y.bandwidth() / 3.5) + ")")
      .call(d3.axisRight(y).tickSize(0))
      .call((g) => {
        g.select(".domain").remove();
      });

    // RECTS
    svg
      .append("g")
      .attr("class", "positives")
      .selectAll("pRects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", "prect")
      .attr("data-name", (d) => d["細項分類"])
      .attr("x", function (d) {
        return x(0);
      })
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return x(d.size_pos) - x(0);
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "#e5e5e5")
      .style("opacity", 0.6);
    // .attr("transform", "translate(" + x(0) + ",0)")
    svg
      .append("g")
      .attr("class", "negatives")
      .selectAll("nRects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", "nrect")
      .attr("data-name", (d) => d["細項分類"])
      .attr("x", function (d) {
        return 600 - x(Math.abs(d.size_neg));
      })
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return x(Math.abs(d.size_neg)) - x(0);
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "#cccccc")
      .style("opacity", 0.6);

    svg
      .append("g")
      .attr("class", "changes")
      .selectAll("cRects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", "crect")
      .attr("data-name", (d) => d["細項分類"])
      .attr("x", (d) =>
        d.changes > 0
          ? xChanges(35)
          : xChanges(35) - xChanges(Math.abs(d.changes)) / 2
      )
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", (d) => {
        if (d.changes > 0) {
          return xChanges(d.changes) / 2;
        } else {
          return Math.abs(xChanges(d.changes) / 2);
        }
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "#ffdf64")
      .style("opacity", 0.8);

    // NUMBERS
    svg
      .append("g")
      .attr("class", "positive")
      .selectAll("number")
      .data(areaData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.size_pos) + 12;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 3.3;
      })
      .text((d) => `${d.size_pos}`)
      .style("text-anchor", "middle")
      .style("font-size", "10px");
    // .style('fill','white')

    svg
      .append("g")
      .attr("class", "negative")
      .selectAll("number")
      .data(areaData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.size_neg) - 12;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 3.3;
      })

      .text((d) => `${d.size_neg}`)
      .style("text-anchor", "middle")
      .style("font-size", "10px");
  });
}

function mapGenerator(data) {
  // 西門邊界
  let boundary = mapSvg
    .append("g")
    .attr("class", "boundary")
    .selectAll("boundary")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#ffe34c");

  // 網格分區
  let areas = mapSvg
    .append("g")
    .attr("class", "blocks")
    .selectAll("areas")
    .data(data[1].features)
    .enter()
    .append("path")
    .attr("fill", (d) => areaColor(d.properties))
    .attr("class", "block")
    .attr("id", (d) => d.properties["分區"])
    .attr("opacity", "0.4");

  // 分區資料
  let points = mapSvg
    .append("g")
    .attr("class", "circles")
    .selectAll("points")
    .data(data[2].features)
    .enter()
    .append("path")
    .attr("class", (d) => d.properties["細項分類"])
    .attr("fill", "white")
    .attr("opacity", "0.5");

  function render() {
    boundary.attr("d", path);
    areas.attr("d", path);
    points
      .attr("d", path)
      .on("mouseover", (e, d) => {
        content = `
        <div class='annotations'>
        <p>商家名稱: ${d.properties["商家名稱"]}</p>
        <p>細項: ${d.properties["細項"]}</p>
        <p>細項分類: ${d.properties["細項分類"]}</p>
        </div>
        `;
        tooltip.html(content).style("visibility", "visible");
      })
      .on("mousemove", (e, d) => {
        tooltip
          .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
          .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");
      })
      .on("mouseout", (e, d) => {
        tooltip.style("visibility", "hidden");
      });

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", 100);
  }

  render();
  map.on("viewreset", render);
  map.on("move", render);
  map.on("moveend", render);

  const blocks = document.querySelector(".blocks");
  const block = document.querySelectorAll(".block");
  const circles = document.querySelector(".circles");
  const prect = document.querySelectorAll(".prect");
  const nrect = document.querySelectorAll(".nrect");
  const crect = document.querySelectorAll(".crect");

  blocks.addEventListener("click", (event) => {
    let target = event.target;
    for (let i = 0; i < block.length; i++) {
      if (target.id === "紅區") {
        block[i].id === "紅區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
      }
      if (target.id === "紫區") {
        block[i].id === "紫區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
      }
      if (target.id === "灰區") {
        block[i].id === "灰區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
      }
      if (target.id === "綠區") {
        block[i].id === "綠區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        if (block[i].id === "黃綠區") {
          block[i].classList.add("opacity");
          block[i].attributes["fill"]["nodeValue"] = "#70C1B3";
        }
      }
      if (target.id === "黃區") {
        block[i].id === "黃區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        if (block[i].id === "黃綠區") {
          block[i].classList.add("opacity");
          block[i].attributes["fill"]["nodeValue"] = "#FFDF64";
        }
      }
      if (target.id === "黃綠區") {
        block[i].id === "綠區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        if (block[i].id === "黃綠區") {
          block[i].classList.add("opacity");
          block[i].attributes["fill"]["nodeValue"] = "#70C1B3";
        }
      }
    }
  });
  circles.addEventListener("mouseover", (event) => {
    target = event.target.classList;
    circleHoverOnHandler(prect, nrect, crect, target);
  });
  circles.addEventListener("mouseout", () => {
    circleHoverOffHandler(prect, nrect, crect);
  });
}

function circleHoverOnHandler(prect, nrect, crect, target) {
  for (let i = 0; i < prect.length; i++) {
    prect[i].attributes[6]["nodeValue"] = "fill: #e5e5e5; opacity: .6;";
    nrect[i].attributes[6]["nodeValue"] = "fill: #cccccc; opacity: .6;";
    crect[i].attributes[6]["nodeValue"] = "fill: #ffdf64; opacity: 1;";
    if (prect[i]["attributes"][1]["nodeValue"] !== target[0]) {
      prect[i].attributes[6]["nodeValue"] = "fill: #e5e5e5; opacity: .15;";
      nrect[i].attributes[6]["nodeValue"] = "fill: #cccccc; opacity: .15;";
      crect[i].attributes[6]["nodeValue"] = "fill: #ffdf64; opacity: .15;";
    }
  }
}

function circleHoverOffHandler(prect, nrect, crect) {
  for (let i = 0; i < prect.length; i++) {
    prect[i].attributes[6]["nodeValue"] = "fill: #e5e5e5; opacity: .6;";
    nrect[i].attributes[6]["nodeValue"] = "fill: #cccccc; opacity: .6;";
    crect[i].attributes[6]["nodeValue"] = "fill: #ffdf64; opacity: 1;";
  }
}
