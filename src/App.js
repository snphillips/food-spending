import React, { Component } from 'react';
import * as d3 from 'd3';
import _lodash from 'lodash';
import moment from 'moment';
// import data from './data/data.csv';
import dataAll from './data/dataAll.csv';
import Chart from './Chart';
import ChartHeader from './ChartHeader';
import Footer from './Footer';

export default class App extends Component {
    constructor(props) {
    super(props);

    this.state = {
      data: [],
    }

  //  ==================================
  //  "this" binding
  //  ==================================



  }

   // ********************************
   // Component Did Mount
   // ********************************
   componentDidMount(){
    this.getData()
    this.drawChart()
   }


    //  ==================================
    //  Get the data
    //  ==================================
    getData() {
      d3.csv(dataAll)
        .then((data) => {
          // 1) set state with data
          this.setState({data: data})
          // 2) raw data needs major manipulation
          this.valueStringToNumber()
          this.addFoodTypeKeyValue()
          // this.addFoodTypeKey()
          this.adjustDateValue()
          this.dailyToMonlyData()
          // console.log("this.state.data:", this.state.data)
          this.drawChart()
      }).catch(function(error){
      // handle error
      })
    }

    // ==================================
    // Turn value from string to number
    // ==================================
    valueStringToNumber() {
      this.state.data.forEach( (entry) => {
        entry.value = +entry.value;
      })
    }

    // ==================================
    // Change date from month/day/year to month/year
    // TODO: look into moment.js warning
    // ==================================
    adjustDateValue() {
      this.state.data.forEach( (entry) => {
        entry.date = moment(entry.date).format("MMM YY");
      })
    }

    // ==================================
    // Adding key:value for different types of food spending
    // groceries, dinner out, lunch out, snack out, coffee out
    // ==================================
    addFoodTypeKeyValue() {
       const newData =
      _lodash.map(this.state.data, (entry) => {
        let newKey = Object.assign({}, entry);

        if (entry.type === 'groceries') {
          newKey.groceries = entry.value
        } else if (entry.type === 'dinner out') {
          newKey.dinner = entry.value
        } else if (entry.type === 'lunch out') {
          newKey.lunch = entry.value
        } else if (entry.type === 'breakfast out') {
          newKey.breakfast = entry.value
        } else if (entry.type === 'coffee') {
          newKey.coffee = entry.value
        } else if (entry.type === 'snack out') {
          newKey.snack = entry.value
        }
        return newKey;
      })
      this.setState({data: newData})
     }

  // ==================================
  // The source data is daily, but we
  // want monthly totals.
  // Therefore, data needs to be collapsed.
  // ==================================
     dailyToMonlyData() {
      // 1) Get all the unique dates
      // This returns the first unique entry, by date. Helpful, but
      // not what we need.
       let uniqueDates = _lodash.uniqBy(this.state.data, (entry) => {
         return entry.date
       })

      // 2) Make an array of those unique dates only
       uniqueDates = _lodash.map(uniqueDates, (entry) => {
        return entry.date
       })

      // 3) map over uniqueDates array to return the data we want
      const newData = _lodash.map(uniqueDates, (date) => {

          let uniqueDates = _lodash.filter(this.state.data, (entry) => {
            return entry.date === date
          })

         let spendingType = _lodash.filter(this.state.data, (entry) => {
            return entry.type
          })

          // sum the groceries according to every unique date
          let groceries = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.groceries
          })
          // sum the dinner spending according to every unique date
          let dinner = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.dinner
          })

          let lunch = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.lunch
          })

          let breakfast = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.breakfast
          })

          let snack = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.snack
          })

          let coffee = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.coffee
          })

       return {
         date: date,
         groceries: groceries,
         dinner: dinner,
         lunch: lunch,
         breakfast: breakfast,
         snack: snack,
         coffee: coffee,
       }
      })
       this.setState({data: newData})
       console.log("newData:", newData)
     }




  // **********************************
  // Drawing the Chart function
  // **********************************

    // ==================================
    // Setting the Stage
    // ==================================
     drawChart() {
      // select the <svg> element in the HTML file with d3 select
      const svg = d3.select("svg")

      // define margins for some nice padding on the chart
      const margin = {top: 40, right: 60, bottom: 60, left: 60};
      const width = svg.attr('width')
      const height = svg.attr('height')
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      // drawing the chart on the screen
      const chart = svg.append("g")
                   .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const colors = ["#bf8b85","#5D5F71", "#634b66", "#9590a8", "#bbcbcb","#820933"]
      const spendingType = ["groceries", "dinner", "lunch", "breakfast", "snack", "coffee"]

    // ==================================
    // Layers for stacking
    // see spendingType near top of drawChart
    // ==================================
     let stack = d3.stack()
                   .keys(spendingType)
                   // put the largest series on bottom.
                   .order(d3.stackOrderDescending)


    // Moving forward, d3 is using layers, as the data
    let layers = stack(this.state.data);
    console.log("layers:", layers);



    // ==================================
    // ToolTip
    // ==================================
    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tool-tip");

    // ==================================
    // Colors!
    // See colors & spendingType variables at top of drawChart
    // ==================================
    let colorBars = d3.scaleOrdinal()
                      .domain(spendingType)
                      .range(colors)

    // ==================================
    // Drawing the Scales & Axies
    // ==================================
      let yScale = d3.scaleLinear()
        // 1) Domain. the min and max value of domain(data)
        // 2) Range. the min and max value of range(the visualization)
        .range([innerHeight, 0])
        // Special layered bar chart stuff
        // a) set lowest point at 0
        // b) the 1.03 gives us a *tiny* bit pf space on top of the
        // highest value.
        .domain([0, 1.03 * d3.max(layers[layers.length - 1], d => d[1])]);

      let xScale = d3.scaleBand()
        .range([0, innerWidth])
        .domain(this.state.data.map (d => d.date))
        .padding(0.1)

      // drawing the left scale
      chart.append('g')
        .call(d3.axisLeft(yScale))

      // drawing the bottom scale
      chart.append('g')
       .attr(`transform`, `translate(0, ${innerHeight})`)
       .call(d3.axisBottom(xScale))
       // angling the labels 45 degrees
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".95em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    // ==================================
    // Drawing the Gridlines
    // ==================================
    chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft().scale(yScale)
                         .tickSize(-innerWidth, 0, 0)
                         .tickFormat('')
                         .ticks(40)
      )

    // ==================================
    // Drawing the Layers/Bars
    // ==================================
      let layer = chart.selectAll(".layer")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "layer")
        .style("fill", (d) => {return colorBars(d.key)})
        // .attr("id", (d) => {return colorBars(d.key)})

      layer.selectAll("rect")
       .data((d) => { return d })
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr('x', (d) => xScale(d.data.date))
       .attr("y", (d) => {
         return yScale(d[1]);
       })
       .attr("height", function(d) {
         return yScale(d[0]) - yScale(d[1]);
       })
      .attr('width', (d) => xScale.bandwidth())


    // ==================================
    // Mouseover: make transluscent
    // note: don't use an arrow function here
    // ==================================
      .on("mouseover", function(d) {
        console.log("bar hover", this)
        d3.select(this)
          .transition()
          .duration(300)
          .attr("stroke","red").attr("stroke-width",0.5)
          .attr('opacity', .8)
      })

    // ==================================
    // Mouseout: make opaque
    // note: don't use an arrow function for first function
    // ==================================
      .on("mouseout", function(d) {
         d3.select(this)
           .transition()
           .duration(300)
           .attr("stroke","red").attr("stroke-width",0)
           .attr('opacity', 1)

      })

    // ==================================
    // Tool Tip
    // ==================================
      .on("mousemove", (d) => {
        tooltip.style("left", d3.event.pageX + 15 + "px")
               .style("top", d3.event.pageY - 60 + "px")
               .style("display", "inline-block")
               .html(`
                 ${d.data.date}</br>
                 $${d[1] - d[0]}</br>
                 <p>(comment/memory about food this month)</p>`)

      })

                 // element.name ${element.name}</br>

    // ==================================
    // Tool Tip - off
    // ==================================
      chart.on("mouseout", (d) => { tooltip.style("display", "none");})


    // ==================================
    // Adding the left side label
    // (no label on bottom...too obvious)
    // ==================================
    // left side label
      svg.append('text')
         // adjust up and down
         .attr('x', -(innerHeight / 1.5) )
         // adjust side to side
         .attr('y', 12 )
         .attr('transform', 'rotate(-90)')
         .attr('text-anchor', 'middle')
         .text('US dollars adjusted for inflation')


    // ==================================
    // Legend
    // ==================================
      let legend = svg.selectAll(".legend")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, index) => {
          // return "translate(30," + i * 19 + ")";
          return "translate(" +index * 90 + ", 0)";
        });

      // the tiny color swatches
      legend.append("rect")
        .attr("x", 0)
        // .attr("x", innerWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, index) => {
          return colors.slice()[index];
        });

      legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, index) {
          switch (index) {
            case 0: return spendingType[0];
            case 1: return spendingType[1];
            case 2: return spendingType[2];
            case 3: return spendingType[3];
            case 4: return spendingType[4];
            case 5: return spendingType[5];
          }
        });







    }









  //  ==================================
  //  And finally, the render
  //  ==================================
  render() {
    return (
      <div className="App">
        <ChartHeader />
        <Chart />
        <Footer />
      </div>
    );
  }
}
        // <RechartsChart />
