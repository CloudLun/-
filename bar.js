const files = ["./data/平日店家消長.csv", "./data/假日店家消長.csv"];
const chart = document.getElementById("chart");
const width = chart.clientWidth;
const height = chart.clientHeight * 0.91;

let svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("transform", "translate(" + 0 + "," + 3 + ")");

function colorFilter(d) {
  return d.changes > 0 ? "blue" : "orange";
}

// let area = document.getElementById("area");
// let time = document.getElementById("time");
let timeValue = "平日";
let areaValue = "中山";

chartGenerator(files[0], "中山");

// time.addEventListener("change", () => {
//   timeValue = time.value === "平日" ? files[0] : files[1];
//   chartGenerator(timeValue, areaValue);
// });

// area.addEventListener("change", () => {
//   let areaValue = area.value;
//   chartGenerator(timeValue, areaValue);
// });

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

    let xChanges = d3
      .scaleLinear()
      .range([0, 600])
      .domain([0, 70])

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
      .attr("transform", "translate(0," + -(y.bandwidth() / 2.8) + ")")
      .call(d3.axisRight(y).tickSize(0).tickPadding(5))
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
      .attr("class", function (d) {
        return "pBars";
      })
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
      .style("opacity", 0.5);
    // .attr("transform", "translate(" + x(0) + ",0)")

    svg
      .append("g")
      .attr("class", "negatives")
      .selectAll("nRects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "nBars";
      })
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
      .style("opacity", 0.5);

    svg
      .append("g")
      .attr("class", "changes")
      .selectAll("cRects")
      .data(areaData)
      .enter()
      .append("rect")
      .attr("class", (d) => "cBars")
      .attr("x", d => d.changes > 0 ? xChanges(35): xChanges(35) - xChanges(Math.abs(d.changes)))
      .attr("y", function (d) {
        return y(d["細項分類"]);
      })
      .attr("width", function (d) {
        return Math.abs(xChanges(d.changes) - xChanges(0));
      })
      .attr("height", y.bandwidth() / 2.8)
      .style("fill", "#ffe34c");

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
        return y(d["細項分類"]) + y.bandwidth() / 2.8;
      })
      .text((d) => `${d.size_pos}`)
      .style("text-anchor", "middle")
      .style('font-size', '12px')
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
        return y(d["細項分類"]) + y.bandwidth() / 2.8;
      })
      
      .text((d) => `${d.size_neg}`)
      .style("text-anchor", "middle")
      .style('font-size', '12px')
  });
}
