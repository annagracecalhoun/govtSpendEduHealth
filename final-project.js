var interpolators = [
    // These are from d3-scale.
    "Viridis",
    "Inferno",
    "Magma",
    "Plasma",
    "Warm",
    "Cool",
    "Rainbow",
    "CubehelixDefault",
    // These are from d3-scale-chromatic
    "Blues",
    "Greens",
    "Greys",
    "Oranges",
    "Purples",
    "Reds",
    "BuGn",
    "BuPu",
    "GnBu",
    "OrRd",
    "PuBuGn",
    "PuBu",
    "PuRd",
    "RdPu",
    "YlGnBu",
    "YlGn",
    "YlOrBr",
    "YlOrRd"
  ];

function getOffset(element)
{
    var bound = element.getBoundingClientRect();
    var html = document.documentElement;

    return {
        top: bound.top + window.pageYOffset - html.clientTop,
        left: bound.left + window.pageXOffset - html.clientLeft
    };
}

d3.csv('/eduShareSpend.csv').then((data) => {
    
    data.map((d) => {
        d.Year = +d.Year;
        d.govtExpend = +d.govtExpend;
        d.privateShare = +d.privateShare;
        d.primaryEnrollment = +d.primaryEnrollment;
    });

    /* https://observablehq.com/@stanfordvis/making-d3-charts-interactive */
    
    const margin = {top:80, right:90, left:70, bottom:120}; 
    
    const outerHeight = 600;
    const outerWidth = 800;
    
    const innerHeight = outerHeight - margin.top - margin.bottom; 
    
    
    const largeEdu = d3.select("#eduAttach").append("svg")
                    .attr("id", "edu-main")
                    .attr("height", outerHeight)
                    .attr("width", outerWidth)
                    //.style("border", "1px solid black")
                    .style("background-color", 'white');
    
    const innerWidth = outerWidth - margin.left - margin.right;   
  
    const allYearsArray = data.map(d=>d.Year); 
    let allYearsSet = new Set(allYearsArray); 
    const uniqueYears = Array.from(allYearsSet); 
    
    const innerEdu = largeEdu.append("g"); 
    const legendEdu = largeEdu.append("g"); 
    const sliderEduLabel = largeEdu.append("g"); 
    
    const playEdu = d3.select('#eduPlay')
                        .style("position", "absolute")
                        .style("left", getOffset(document.getElementById('edu-main')).left + 8 + "px")
                    .style("top", getOffset(document.getElementById('edu-main')).top + 527 + "px"); 
    
    const pauseEdu = d3.select('#eduPause')
                        .style("display", 'none')
                        .style("position", "absolute")
                        .style("left", getOffset(document.getElementById('edu-main')).left + 3 + "px")
                    .style("top", getOffset(document.getElementById('edu-main')).top + 527 + "px"); 
    
    
    console.log(getOffset(document.getElementById('edu-main')).left);
    
    const sliderEdu = d3.select("#sliderEdu")
                    .attr("min", d3.min(uniqueYears))
                    .attr("max", d3.max(uniqueYears))
                    .style("position", "absolute")
                    .style("left", getOffset(document.getElementById('edu-main')).left + 80 + "px")
                    .style("top", getOffset(document.getElementById('edu-main')).top + 530 + "px")
    
    
    legendEdu.attr("transform", "translate("+(innerWidth+margin.left)+","+(innerHeight/.9)+")");
    sliderEduLabel.attr("transform", "translate(90, 570)")
    
    const sliderLegend = sliderEduLabel.append("text")
                            .text(d3.min(uniqueYears))
                            .attr("class", "sliderLegend");
    
    
    innerEdu.attr("transform", "translate(" +margin.left+","+margin.top+")"); 
    
    let primaryMax = d3.max(data, d=>d.primaryEnrollment)
    let expendMax = d3.max(data, d=>d.govtExpend)
    let popMax = d3.max(data, d=>d.pop)
    let maxPrivate = d3.max(data, d=>d.privateShare)
    console.log("Max expenditure: " + expendMax);
    
    const yScale = d3.scaleLinear()
                .domain([0, primaryMax]) //Map FROM this to...
                .range([innerHeight, 0]);
                        
    const xScale = d3.scaleLinear()
                .domain([0, expendMax])
                .range([0, innerWidth]);
    
    const legScale = d3.scaleLinear()
                .domain([0, maxPrivate])
                .range([140, 0]);
    
    const rScale = d3.scaleSqrt()
                .domain([0, popMax])
                .range([0, 6]); 
    
    const colorScale = d3.scaleSequential(d3.interpolateBuGn).domain([0, maxPrivate]); 
    // https://bl.ocks.org/pstuffa/d5934843ee3a7d2cc8406de64e6e4ea5
    
    years = d3.extent(data, d => d.Year);
    console.log(years);
    dataInitial = data.filter(d => d.Year === years[0]);
    console.log(dataInitial); 
    
    
    const xAxis = d3.axisBottom().scale(xScale); 
    const yAxis = d3.axisLeft().scale(yScale); 
    const legAxis = d3.axisLeft().scale(legScale); 
    
    const x = innerEdu.append("g").call(xAxis); 
    const y = innerEdu.append("g").call(yAxis); 
    x.attr("transform", "translate(0,"+innerHeight+")"); 
    
    const tooltip = d3.select("body").append("div")
                    .attr("id", "eduToolTip")
                    .style("border", "1px solid black")
                    .style("position", "absolute")
                    .style("padding", "10px")
                    .style("background-border", "white")
                    .style("background-color", 'white')
                    .style("opacity", 0); 
   
    let countryName = tooltip.append("div")
                        .text("Country name: "); 
    let countryNameSpan = countryName.append("span").style("font-weight", 600); 
    
    let govtExpendT = tooltip.append("div").text("Government expenditure: ").style("background-border", "white");
    let govtExpendTSpan = govtExpendT.append("span").style("font-weight", 600); 
    
    let primEnroll = tooltip.append("div").text("Primary school enrollment: "); 
    let primEnrollSpan = primEnroll.append("span").style("font-weight", 600); 
    
    let privShareT = tooltip.append("div")
                            .text("Private school share: "); 
    let privShareTSpan = privShareT.append("span").style('font-weight', 600); 
    
    const drawEdu = (dataset) => {
        
        // Year Label 
         d3.selectAll(".eduYrLabel").remove()
           const yrLabel = innerEdu.append("text")
                .attr("class", "eduYrLabel")
                .text(dataset[0].Year)
                .style("text-anchor", "middle")
                .attr("transform", `translate(100, ${innerHeight - 90})`)
                .attr("dy", "1em")
                .attr('fill', '#ccc')
                .attr('font-family', 'Helvetica Neue, Arial')
                .attr('font-weight', 500)
                .attr('font-size', 80)
                .style('fill-opacity', .75); 
        
         let eduBubs = innerEdu.selectAll(".eduBub")
            .data(dataset, d => d.Entity)
            .join(enter => enter.append("circle")
                .sort((a, b) => d3.descending(a.pop, b.pop))
                .attr("class", "eduBub")
                .style('fill-opacity', .75)
                  .attr("stroke", "LightGrey")
                .attr('fill', d=> colorScale(d.privateShare))
                .attr("cx", d => xScale(d.govtExpend))
                .attr("cy", d => yScale(d.primaryEnrollment))
                .attr('r', d =>rScale(d.pop))
                .transition().duration(500)
                .selection(), 
             update => update.transition().duration(500)
                .attr('fill', d=> colorScale(d.privateShare))
                  .attr('stroke', 'LightGrey')
                 .attr("cx", d => xScale(d.govtExpend))
                 .attr("cy", d => yScale(d.primaryEnrollment))
                 .attr('r', d =>rScale(d.pop))
                 .selection(), 
            exit => exit.transition().duration(500)
                        .attr("r", 0)
                        .remove())
         
    
    eduBubs.on("mouseover", function(){
        let thisData = d3.select(this).data()[0]
        countryNameSpan.text(thisData.Entity)
        tooltip.style("opacity", 1)
        govtExpendTSpan.text(thisData.govtExpend.toFixed(2) + "%")
        primEnrollSpan.text(thisData.primaryEnrollment.toFixed(2) + "%")
        privShareTSpan.text(thisData.privateShare.toFixed(2) + "%")
    })
    
    eduBubs.on("mouseout", function(){
        tooltip.style("opacity", 0)
    })
    
     eduBubs.on("mousemove", function(event) {
            tooltip.style("left", d3.pointer(event)[0] + getOffset(document.getElementById('edu-main')).left + 5 +'px')
                    .style("top", d3.pointer(event)[1]+ getOffset(document.getElementById('edu-main')).top -45 + "px")
                    .style("pointer-events", "none")
        })
    }
    

    // Axis text label 
    const xLabel = innerEdu.append("text")
        .text("Government Expenditure on Education")
        .style("text-anchor", "middle")
        .attr("transform", `translate(${innerWidth/2}, ${innerHeight+margin.bottom/2})`)
        .attr("dy", "1em")
        .attr("class", "xaxisLabel")
        .style("fill", "black"); 
    
    const yLabel = innerEdu.append("text")
        .text("Total Enrollment in Primary Education")
        .attr("transform", "rotate(-90) translate("+-innerHeight/2+"," + -margin.left+")")
        .attr("class", "yaxisLabel")
        .attr("dy", "1.1em")
        .style("fill", "black")
        .style("text-anchor", "middle"); 
    
    // Color Legend 
   const colorLeg = legendEdu.selectAll(".legBars")
        .data(d3.range(110), function(d) { return d; })
        .enter().append("rect")
        .attr("class", "legBars")
        .attr("x", function(d, i) { return i; })
        .attr("transform", "rotate(-90)")
        .attr("height", margin.right/2)
        .attr("width", margin.right/2.6)
        .style("fill", function(d, i ) { return colorScale(d); })
        .style("border", "1px solid black");
    
   
     const legTicks = legendEdu.append("g").call(legAxis); 
     legTicks.attr("transform", "translate(" + -10 +"," + -142 +")"); 
    
    const legLabel = legendEdu.append("text")
                    .text("Private Primary Enrollment")
                    .attr("transform", "rotate(-90) translate(2, -40)") 
                    .attr("class", "legendLabel")
                    .attr("font-size", 12)
                    .attr("font-weight", 600);
         
    
    drawEdu(dataInitial); 
    
    d3.select("#sliderEdu").on("change", function() {
        selectedYear = this.value
        yearData = data.filter(d => d.Year == selectedYear)
        drawEdu(yearData)
        sliderLegend.text(selectedYear)
              })
    
    
    var myTimer;
    playEdu.on("click", function() {
        playEdu.style("display", "none");
        pauseEdu.style("display", "block");
        clearInterval(myTimer);
        myTimer = setInterval(function() {
        var toMove = d3.select("#sliderEdu");
        var t = (+toMove.property("value") + 1)  % (+toMove.property("max") + 1); 
        if (t == 0) { t = +toMove.property("min"); }
        toMove.property("value", t);
        selectedYear = toMove.property("value")
        yearData = data.filter(d => d.Year == selectedYear)
        drawEdu(yearData)
        sliderLegend.text(selectedYear)
        }, 500); 
    }); 

    
     pauseEdu.on("click", function() {
        pauseEdu.style("display", "none");
        playEdu.style("display", "block");
        clearInterval(myTimer); 
    })

})


d3.csv('/healthSpend.csv').then((data) => {
    console.log(data)
    
    data.map((d) => {
        d.Year = +d.Year;
        d.hSpendPerCap = +d.hSpendPerCap;
        d.pop = +d.pop;
        d.pocketHExp = +d.pocketHExp;
        d.lifeExp = +d.lifeExp;
    });
    
    const margin = {top:80, right:90, left:70, bottom:120}; 
    
    const outerHeight = 600;
    const outerWidth = 800;
    
    const innerHeight = outerHeight - margin.top - margin.bottom; 
    const innerWidth = outerWidth - margin.left - margin.right;   
    
    
    const largeHealth = d3.select("#healthAttach").append("svg")
                    .attr("id", "health-main")
                    .attr("height", outerHeight)
                    .attr("width", outerWidth)
                    //.style("border", "1px solid black")
                    .style("background-color", 'white');
    
    const innerHealth = largeHealth.append("g"); 
    const legendHealth = largeHealth.append("g"); 
    
     const sliderHealthLabel = largeHealth.append("g"); 
    
    legendHealth.attr("transform", "translate("+(innerWidth+margin.left)+","+(innerHeight/.9)+")");
    
    innerHealth.attr("transform", "translate(" +margin.left+","+margin.top+")"); 
    sliderHealthLabel.attr("transform", "translate(90, 570)")
    
     const allYearsArray = data.map(d=>d.Year); 
    let allYearsSet = new Set(allYearsArray); 
    const uniqueYears = Array.from(allYearsSet); 
    
     const sliderHealth = d3.select("#sliderHealth")
                    .attr("min", d3.min(uniqueYears))
                    .attr("max", d3.max(uniqueYears))
                    .style("position", "absolute")
                    .style("left", getOffset(document.getElementById('health-main')).left + 80 + "px")
                    .style("top", getOffset(document.getElementById('health-main')).top + 530 + "px")
     
    const playHealth = d3.select('#healthPlay')
                        .style("position", "absolute")
                        .style("left", getOffset(document.getElementById('health-main')).left + 8 + "px")
                    .style("top", getOffset(document.getElementById('health-main')).top + 527 + "px"); 
    
    const pauseHealth = d3.select('#healthPause')
                        .style("display", 'none')
                        .style("position", "absolute")
                        .style("left", getOffset(document.getElementById('health-main')).left + 3 + "px")
                    .style("top", getOffset(document.getElementById('health-main')).top + 527 + "px"); 
    
     
     const sliderLegend = sliderHealthLabel.append("text")
                        .text(d3.min(uniqueYears))
                        .attr("class", "sliderLegend")
    
    let lifeExpMax = d3.max(data, d=>d.lifeExp)
    let expendMax = d3.max(data, d=>d.hSpendPerCap)
    let popMax = d3.max(data, d=>d.pop)
    let maxPocketExp = d3.max(data, d=>d.pocketHExp)
    
    const yScale = d3.scaleLinear()
                .domain([0, lifeExpMax]) //Map FROM this to...
                .range([innerHeight, 0]);
                        
    const xScale = d3.scaleLinear()
                .domain([0, expendMax])
                .range([0, innerWidth]);
    
     const legScale = d3.scaleLinear()
                .domain([0, maxPocketExp])
                .range([140, 0]);
    
    const rScale = d3.scaleSqrt()
                .domain([0, popMax])
                .range([0, 33]);
    const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, maxPocketExp]); 
    // https://bl.ocks.org/pstuffa/d5934843ee3a7d2cc8406de64e6e4ea5
    
    years = d3.extent(data, d => d.Year);
    console.log(years);
    dataInitial = data.filter(d => d.Year === years[0]);
    
    const xAxis = d3.axisBottom().scale(xScale); 
    const yAxis = d3.axisLeft().scale(yScale); 
    const legAxis = d3.axisLeft().scale(legScale); 
    
    const x = innerHealth.append("g").call(xAxis); 
    const y = innerHealth.append("g").call(yAxis); 
    x.attr("transform", "translate(0,"+innerHeight+")"); 
    
     const tooltip2 = d3.select("body").append("div")
                    .attr("id", "healthToolTip")
                    .style("border", "1px solid black")
                    .style("position", "absolute")
                    .style("padding", "10px")
                    .style("background-color", "white")
                    .style("opacity", 0); 
   
    let countryName2 = tooltip2.append("div")
                        .text("Country name: "); 
    let countryNameSpan2 = countryName2.append("span").style("font-weight", 600); 
    
    let govtExpendT = tooltip2.append("div").text("Total expenditure on health per capita: ").style("background-border", "white");
    let govtExpendTSpan = govtExpendT.append("span").style("font-weight", 600); 
    
    let lifeExpectT = tooltip2.append("div").text("Life expectancy: "); 
    let lifeExpectTSpan = lifeExpectT.append("span").style("font-weight", 600); 
    
    let pocketExpendT = tooltip2.append("div")
                            .text("Out of pocket spending on health: "); 
    let pocketExpendTSpan = pocketExpendT.append("span").style('font-weight', 600); 
    
    
     const drawHealth = (dataset) => {
         
          // Year Label 
           d3.selectAll(".healthYrLabel").remove()
    const yrLabel = innerHealth.append("text")
        .attr("class", "healthYrLabel")
        .text(dataset[0].Year)
        .style("text-anchor", "middle")
        .attr("transform", `translate(100, ${innerHeight - 90})`)
        .attr("dy", "1em")
        .attr('fill', '#ccc')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 500)
        .attr('font-size', 80)
        .style('fill-opacity', .75); 
          
    let healthBubs = innerHealth.selectAll(".healthBub")
                    .data(dataset, d => d.Entity)
                    .join(enter => enter.append("circle")
                        .sort((a, b) => d3.descending(a.pop, b.pop))
                        .attr("class", "healthBub")
                        .attr("stroke", "LightGrey")
                        .style('fill-opacity', .75)
                        .attr('fill', d=> colorScale(d.pocketHExp))
                        .attr("cx", d => xScale(d.hSpendPerCap))
                        .attr("cy", d => yScale(d.lifeExp))
                        .attr('r', d =>rScale(d.pop))
                        .transition().duration(500)
                          .selection(), 
                  update => update.transition().duration(500)
                        .attr("stroke", "LightGrey")
                        .style('fill-opacity', .75)
                        .attr('fill', d=> colorScale(d.pocketHExp))
                        .attr("cx", d => xScale(d.hSpendPerCap))
                        .attr("cy", d => yScale(d.lifeExp))
                        .attr('r', d =>rScale(d.pop))
                        .selection(), 
                  exit => exit.transition().duration(500)
                                .attr("r", 0)
                                .remove())
         
         
    healthBubs.on("mouseover", function(){
        let thisData = d3.select(this).data()[0]
        console.log(thisData)
        countryNameSpan2.text(thisData.Entity)
        tooltip2.style("opacity", 1)
        console.log(thisData.Entity)
        govtExpendTSpan.text("$" + thisData.hSpendPerCap.toFixed(2))
        lifeExpectTSpan.text(thisData.lifeExp.toFixed(2) + " years")
        pocketExpendTSpan.text(thisData.pocketHExp.toFixed(2) + "%")
    })
    
    healthBubs.on("mouseout", function(){
        tooltip2.style("opacity", 0)
    })
    
   healthBubs.on("mousemove", function(event) {
       console.log(d3.pointer(event))
            tooltip2.style("left", d3.pointer(event)[0] + getOffset(document.getElementById('health-main')).left + 5 +'px')
                    .style("top", d3.pointer(event)[1]+ getOffset(document.getElementById('health-main')).top - 45 + "px")
                    .style("pointer-events", "none")
        }) 
         
     }
     
     drawHealth(dataInitial); 
     
     // Axis text label 
    const xLabel = innerHealth.append("text")
        .text("Total Health Expenditure per Capita")
        .style("text-anchor", "middle")
        .attr("transform", `translate(${innerWidth/2}, ${innerHeight+margin.bottom/2})`)
        .attr("dy", "1em")
        .attr("class", "xaxisLabel")
        .style("fill", "black"); 
    
    const yLabel = innerHealth.append("text")
        .text("Life Expectancy")
        .attr("transform", "rotate(-90) translate("+-innerHeight/2+"," + -margin.left+")")
        .attr("class", "yaxisLabel")
        .attr("dy", "1.1em")
        .style("fill", "black")
        .style("text-anchor", "middle"); 
    
     const colorLeg = legendHealth.selectAll(".legBarsHealth")
        .data(d3.range(110), function(d) { return d; })
        .enter().append("rect")
        .attr("class", "legBarsHealth")
        .attr("x", function(d, i) { return i; })
        .attr("transform", "rotate(-90)")
        .attr("height", margin.right/2)
        .attr("width", margin.right/2.8)
        .style("fill", function(d, i ) { return colorScale(d); })
        .style("border", "1px solid black");
   
     const legTicks = legendHealth.append("g").call(legAxis); 
     legTicks.attr("transform", "translate(" + -10 +"," + -142 +")"); 
    
    const legLabel = legendHealth.append("text")
                    .text("Out of Pocket Expenditures")
                    .attr("transform", "rotate(-90) translate(2, -40)") 
                    .attr("class", "legendLabel")
                    .style("fill", "black")
                    .attr("font-size", 12)
                    .attr("font-weight", 600);
    
       d3.select("#sliderHealth").on("change", function() {
        selectedYear = this.value
        yearData = data.filter(d => d.Year == selectedYear)
        drawHealth(yearData)
        sliderLegend.text(selectedYear)
              })
    
    var myTimer;     
    playHealth.on("click", function() {
        playHealth.style("display", "none");
        pauseHealth.style("display", "block");
        clearInterval(myTimer)
    })
    
     pauseHealth.on("click", function() {
        pauseHealth.style("display", "none");
        playHealth.style("display", "block");
        clearInterval(myTimer)
    })

      var myTimer;
    playHealth.on("click", function() {
        playHealth.style("display", "none");
        pauseHealth.style("display", "block");
        clearInterval(myTimer);
        myTimer = setInterval(function() {
        var toMove = d3.select("#sliderHealth");
        var t = (+toMove.property("value") + 1)  % (+toMove.property("max") + 1); 
        if (t == 0) { t = +toMove.property("min"); }
        toMove.property("value", t);
        selectedYear = toMove.property("value")
        yearData = data.filter(d => d.Year == selectedYear)
        drawHealth(yearData)
        sliderLegend.text(selectedYear)
        }, 500); 
    }); 

    
     pauseHealth.on("click", function() {
        pauseHealth.style("display", "none");
        playHealth.style("display", "block");
        clearInterval(myTimer); 
    })

    
});
