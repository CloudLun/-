// 地圖前置準備
mapboxgl.accessToken =
  "pk.eyJ1IjoiYW5keTkxMDYxNCIsImEiOiJjbDkwZ3dxZ3QwM2hyM3JyemFia3piZTNlIn0.pYlujx_RTsHo86rpNG1HzA";

const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/andy910614/cl90g29qm000915pcnbav9d5v", // style URL
  center: [121.5052040216948, 25.04446044693477], // starting position [lng, lat]
  zoom: 15.8, // starting zoom
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
  .attr("height", "100%")
  .style("position", "absolute")
  .style("z-index", 2);
let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", 100);

let blocks;
let block;
let circles;

// 長條圖前置準備
const csvs = ["./data/平日店家消長.csv", "./data/假日店家消長.csv"];
const width = chart.clientWidth;
const height = chart.clientHeight * 0.92;

let timeData = csvs[0];
let locationValue = "中山";
let svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
// .attr("transform", "translate(" + 0 + "," + 0 + ")");

let prect = document.querySelectorAll(".prect");
let nrect = document.querySelectorAll(".nrect");
let crect = document.querySelectorAll(".crect");
const button = document.querySelector(".button");
const select = document.querySelector("#location");
const square = document.querySelector(".c");

Promise.all(promises).then((data) => {
  mapGenerator(data);
  chartGenerator(timeData, locationValue);
});

button.addEventListener("click", () => {
  button.classList.toggle("button-weekend");
  if (button.classList.contains("button-weekend")) {
    timeData = csvs[1];
    chartGenerator(timeData, locationValue);
  } else {
    timeData = csvs[0];
    chartGenerator(timeData, locationValue);
  }
});

select.addEventListener("change", (event) => {
  target = event.target.value;
  // console.log(target)
  console.log(target);
  square.style.backgroundColor = barColor(target);
  locationValue = target;
  chartGenerator(timeData, locationValue);
  for (let i = 0; i < block.length; i++) {
    if (target === "紅區") {
      block[i].id === "紅區"
        ? block[i].classList.add("opacity")
        : block[i].classList.remove("opacity");
    }
    if (target === "紫區") {
      block[i].id === "紫區"
        ? block[i].classList.add("opacity")
        : block[i].classList.remove("opacity");
    }
    if (target === "灰區") {
      block[i].id === "灰區"
        ? block[i].classList.add("opacity")
        : block[i].classList.remove("opacity");
    }
    if (target === "綠區") {
      block[i].id === "綠區" || block[i].id === "黃綠區"
        ? block[i].classList.add("opacity")
        : block[i].classList.remove("opacity");
    }
    if (target === "黃區") {
      block[i].id === "黃區"
        ? block[i].classList.add("opacity")
        : block[i].classList.remove("opacity");
      if (block[i].id === "黃綠區") {
        block[i].classList.add("opacity");
        block[i].attributes["fill"]["nodeValue"] = "#FFDF64";
      }
    }
  }
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

function barColor(d) {
  return d === "紅區"
    ? "#ED6A5E"
    : d === "灰區"
    ? "#191919"
    : d === "紫區"
    ? "#57467B"
    : d === "黃區"
    ? "#FFDF64"
    : d === "綠區"
    ? "#70C1B3"
    : "#FFDF64";
}

function chartGenerator(csv, area) {
  svg.selectAll("*").remove();
  d3.csv(csv).then((data) => {
    data.forEach((d) => {
      d["size_all2019"] = +d["size_all2019"];
      d["size_pos"] = +d["size_pos"];
      d["size_neg"] = 0 - +d["size_neg"];
      d["changes"] = +d["changes"];
    });

    let areaData = data.filter((d) => d["xm_dist"] === area);

    let x = d3.scaleLinear().range([0, 500]).domain([-70, 70]);
    let y = d3
      .scaleBand()
      // .padding(0.04)
      .range([0, height])
      .domain(areaData.map((d) => d["細項分類"]));

    let xChanges = d3.scaleLinear().range([0, 500]).domain([0, 70]);

    // let vertical = svg
    //   .append("line")
    //   .attr("x1", x(0))
    //   .attr("x2", x(0))
    //   .attr("y1", y(areaData[areaData.length-1]["細項分類"]))
    //   .attr("y2", 0)
    //   .style("stroke", "#2d2d2d")
    //   .style("stroke-width", "0.2px")
    //   .style("opacity", 1)

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
      .style("font-size", "8px")
      .attr("transform", "translate(-3," + -(y.bandwidth() / 30) + ")")
      .call(d3.axisRight(y).tickSize(0))
      .call((g) => {
        g.select(".domain").remove();
      });

    // RECTS
    svg
      .append("g")
      .attr("class", "positives")
      .selectAll("pRects")
      .exit()
      .remove()
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
      .attr("height", y.bandwidth())
      .style("fill", "#e5e5e5")
      .style("stroke", "white")
      .style("opacity", 0.6);
    // .attr("transform", "translate(" + x(0) + ",0)")
    svg
      .append("g")
      .attr("class", "negatives")
      .selectAll("nRects")
      .exit()
      .remove()
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", "nrect")
      .attr("data-name", (d) => d["細項分類"])
      .attr("x", function (d) {
        return 500 - x(Math.abs(d.size_neg));
      })
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return x(Math.abs(d.size_neg)) - x(0);
      })
      .attr("height", y.bandwidth())
      .style("fill", "#cccccc")
      .style("stroke", "white")
      .style("opacity", 0.6);

    svg
      .append("g")
      .attr("class", "changes")
      .selectAll("cRects")
      .exit()
      .remove()
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", "crect")
      .attr("data-name", (d) => d["細項分類"])
      .attr("data-area", (d) => d["xm_dist"])
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
      .attr("height", y.bandwidth())
      .style("fill", (d) => barColor(d["xm_dist"]))
      .style("stroke", "white")
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
        return x(d.size_pos) + 6;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 1.7;
      })
      .text((d) => `${d.size_pos}`)
      .style("text-anchor", "middle")
      .style("font-size", "8px");
    // .style('fill','white')

    svg
      .append("g")
      .attr("class", "negative")
      .selectAll("number")
      .data(areaData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.size_neg) - 7;
      })
      .attr("y", function (d) {
        return y(d["細項分類"]) + y.bandwidth() / 1.7;
      })

      .text((d) => `${d.size_neg}`)
      .style("text-anchor", "middle")
      .style("font-size", "8px");

    prect = document.querySelectorAll(".prect");
    nrect = document.querySelectorAll(".nrect");
    crect = document.querySelectorAll(".crect");
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
    .attr("stroke", "#ffe34c")
    .style("stroke-dasharray", "4, 4");

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
        tooltip
          .html(content)
          .style("visibility", "visible")
          .style("font-size", "10px");
      })
      .on("mousemove", (e, d) => {
        tooltip
          .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
          .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");
      })
      .on("mouseout", (e, d) => {
        tooltip.style("visibility", "hidden");
      });
  }

  render();
  map.on("viewreset", render);
  map.on("move", render);
  map.on("moveend", render);

  blocks = document.querySelector(".blocks");
  block = document.querySelectorAll(".block");
  circles = document.querySelector(".circles");

  blocks.addEventListener("click", (event) => {
    let target = event.target;
    for (let i = 0; i < block.length; i++) {
      if (target.id === "紅區") {
        block[i].id === "紅區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        select.value = target.id;
        square.style.backgroundColor = barColor(target.id);
        locationValue = target.id;
      }
      if (target.id === "紫區") {
        block[i].id === "紫區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        select.value = target.id;
        square.style.backgroundColor = barColor(target.id);
        locationValue = target.id;
      }
      if (target.id === "灰區") {
        block[i].id === "灰區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        select.value = target.id;
        square.style.backgroundColor = barColor(target.id);
        locationValue = target.id;
      }
      if (target.id === "綠區") {
        block[i].id === "綠區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        select.value = target.id;
        square.style.backgroundColor = barColor(target.id);
        locationValue = target.id;
        if (block[i].id === "黃綠區") {
          block[i].classList.add("opacity");
          block[i].attributes["fill"]["nodeValue"] = "#70C1B3";
        }
      }
      if (target.id === "黃區") {
        block[i].id === "黃區"
          ? block[i].classList.add("opacity")
          : block[i].classList.remove("opacity");
        select.value = target.id;
        square.style.backgroundColor = barColor(target.id);
        locationValue = target.id;
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
          select.value = "綠區";
          square.style.backgroundColor = barColor("綠區");
          locationValue = "綠區";
        }
      }
    }
    chartGenerator(timeData, locationValue);
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
    prect[i].attributes["style"][
      "nodeValue"
    ] = `fill: #e5e5e5;stroke: white; opacity: .6;`;
    nrect[i].attributes["style"][
      "nodeValue"
    ] = `fill: #cccccc;stroke: white; opacity: .6;`;
    crect[i].attributes["style"]["nodeValue"] = `fill: ${barColor(
      crect[i].attributes[2]["nodeValue"]
    )}; stroke: white; opacity: 1;`;
    if (prect[i]["attributes"][1]["nodeValue"] !== target[0]) {
      prect[i].attributes["style"][
        "nodeValue"
      ] = `fill: #e5e5e5;stroke: white; opacity: .15;`;
      nrect[i].attributes["style"][
        "nodeValue"
      ] = `fill: #cccccc;stroke: white; opacity: .15;`;
      crect[i].attributes["style"]["nodeValue"] = `fill: ${barColor(
        crect[i].attributes[2]["nodeValue"]
      )}; stroke: white; opacity: .15;`;
    }
  }
}

function circleHoverOffHandler(prect, nrect, crect) {
  for (let i = 0; i < prect.length; i++) {
    prect[i].attributes["style"][
      "nodeValue"
    ] = `fill: #e5e5e5;stroke: white; opacity: .6;`;
    nrect[i].attributes["style"][
      "nodeValue"
    ] = `fill: #cccccc;stroke: white; opacity: .6;`;
    crect[i].attributes["style"]["nodeValue"] = `fill: ${barColor(
      crect[i].attributes[2]["nodeValue"]
    )}; stroke: white; opacity: 1;`;
  }
}
