const margin = { top: 30, right: 30, bottom: 30, left: 30 },
  heatWidth = 450 - margin.left - margin.right,
  heatHeight = 111- margin.top - margin.bottom;

const data = [
  "./data/熱力圖數據_人流分區差異_假日.csv",
  "./data/熱力圖數據_人流分區差異_平日.csv",
  "./data/熱力圖_分區_比西門町_假日.csv",
  "./data/熱力圖_分區_比西門町_平日.csv",
];

let weekHeatSvg = d3
  .select("#week")
  .append("svg")
  .attr("width", heatWidth + margin.left + margin.right)
  .attr("height", heatHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let weekendHeatSvg = d3
  .select("#weekend")
  .append("svg")
  .attr("width", heatWidth + margin.left + margin.right)
  .attr("height", heatHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let weekendYearHeatSvg = d3
  .select("#weekendyear")
  .append("svg")
  .attr("width", heatWidth + margin.left + margin.right)
  .attr("height", heatHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let weekYearHeatSvg = d3
  .select("#weekyear")
  .append("svg")
  .attr("width", heatWidth + margin.left + margin.right)
  .attr("height", heatHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let x = d3
  .scaleBand()
  .range([0, heatWidth])
  .domain(["相對全台北", "相對四大商圈", "相對全西門町"])
  .padding(0.05);

let yearx = d3
  .scaleBand()
  .range([0, heatWidth])
  .domain([
    "2020年底-2019年底",
    "2021年底-2020年底",
    "2022年中-2021年底",
    "2021年底-2019年底",
  ])
  .padding(0.05);

let y = d3
  .scaleBand()
  .range([heatHeight, 0])
  .domain(["灰區", "紅區", "紫區", "綠區", "黃區"])
  .padding(0.05);

heatmapGenerator(data[0], weekendHeatSvg, x);
heatmapGenerator(data[1], weekHeatSvg, x);
heatmapGenerator(data[2], weekendYearHeatSvg, yearx);
heatmapGenerator(data[3], weekYearHeatSvg, yearx);

function heatmapGenerator(csv, svg, xScale) {
  d3.csv(csv).then((data) => {
    data.forEach((d) => {
      d["值"] = +d["值"];
    });

    svg
      .append("g")
      .style("font-size", 10)
      .attr("transform", "translate(0," + heatHeight + ")")
      .call(d3.axisBottom(xScale).tickSize(0))
      .select(".domain")
      .remove();

    svg
      .append("g")
      .style("font-size", 10)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain")
      .remove();

    let colorFilter = d3
      .scaleQuantize()
      .domain([-15, 35])
      .range([
        "#a54a41",
        "#ed6a5e",
        "#f2968e",
        "#f7c3be",
        "#c5e6e0",
        "#9ad3c9",
        "#70c1b3",
        "#4e877d",
      ]);

    svg
      .selectAll()
      .data(data, function (d) {
        return d["差異"] + ":" + d["分區"];
      })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return xScale(d["差異"]);
      })
      .attr("y", function (d) {
        return y(d["分區"]);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return colorFilter(d["值"]);
      });

    svg
      .selectAll("values")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d["差異"])+ xScale.bandwidth()/2)
      .attr('y', d => y(d['分區']) + y.bandwidth()/1.2)
      .text((d) => `${d['值']}`)
      .attr('fill', 'white')
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("font-weight", 500)

  });
}
