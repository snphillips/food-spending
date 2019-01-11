import React, { Component } from 'react';
import * as d3 from 'd3';
import _lodash from 'lodash';
import moment from 'moment';
// import data from './data/data.csv';
import dataAll from './data/dataAll.csv';
// import sample from './data/Sample.js';
import Chart from './Chart';
// import RechartsChart from './RechartsChart'
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
          // 2) data needs major work
          this.valueStringToNumber()
          this.addFoodTypeKeyValue()
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
      // This returns the first unique entry, by date
       let uniqueDates = _lodash.uniqBy(this.state.data, (entry) => {
         return entry.date
       })

      // 2) Make an array of those unique dates
       uniqueDates = _lodash.map(uniqueDates, (entry) => {
        return entry.date
       })

      // 3) map over uniqueDates array to return the data we want
      const newData = _lodash.map(uniqueDates, (date) => {

          let uniqueDates = _lodash.filter(this.state.data, (entry) => {
            return entry.date === date
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
      // select created <svg> element in the HTML file with d3 select
      const svg = d3.select("svg")

      // define margins for some nice padding on the chart
      const margin = {top: 60, right: 60, bottom: 60, left: 60};
      const width = svg.attr('width');
      const height = svg.attr('height');
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const chart = svg.append("g")
                   .attr('transform', `translate(${margin.top}, ${margin.left})`);

    // ==================================
    // Layers for stacking
    // ==================================
     let keys = (["groceries", "dinner", "lunch", "breakfast", "snack", "coffee"])
     // not too sure what's going on here. I think it's saying, use all keys
     // except date.
     // let keys = Object.keys(this.state.data[0]).filter(k=>k!=="date");

     let stack = d3.stack()
                   .keys(keys)
                   .order(d3.stackOrderNone)
                   .offset(d3.stackOffsetNone);

    let layers = stack(this.state.data);
    console.log("layers", layers);



    // ==================================
    // ToolTip
    // ==================================
    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tool-tip");


    // ==================================
    // Colors!
    // ==================================
    let colorBars = d3.scaleOrdinal()
                      .domain(["groceries", "dinner", "lunch", "breakfast", "snack", "coffee"])
                      .range(["#E5FFDE","#18020C", "#634B66", "#9590A8", "#BBCBCB","#820933"]);

    // ==================================
    // Drawing the Scales & Axes
    // ==================================
      let yScale = d3.scaleLinear()
        // 1) Domain. the min and max value of domain(data)
        // 2) Range. the min and max value of range(the visualization)
        .range([innerHeight, 0])
        // .domain([0, d3.max(this.state.data, d => d.groceries + d.dinner + d.lunch + d.breakfast + d.snack + d.coffee)])
        // TODO: hard-coded for now, but eventually, put in the max value of food groups added up
        // .domain([0, 750])

        // Special layered bar chart stuff
        yScale.domain([0, 1.04 * d3.max(layers[layers.length - 1], d => d[1])]);

      let xScale = d3.scaleBand()
        .range([0, innerWidth])
        // .range([0, width])
        // map over the data, and display whatever is the date value
        // your version
        .domain(this.state.data.map (d => d.date))
        .padding(0.2)

      chart.append('g')
        .call(d3.axisLeft(yScale))

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
    // Drawing the Layers
    // ==================================

      let layer = chart.selectAll(".layer")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "layer")
        .style("fill", (d) => {return colorBars(d.key)})


      layer.selectAll("rect")
           .data(function(d) {
             return d;
            })
           .enter()
           .append("rect")
           .attr("class", "bar")
           .attr('x', (d) => xScale(d.data.date))
           .attr("y", function(d) {
             return yScale(d[1]);
           })
           .attr("height", function(d) {
             return yScale(d[0]) - yScale(d[1]);
           })
          .attr('width', (d) => xScale.bandwidth())


    // ==================================
    // Drawing the Bars
    // ==================================
     // chart.selectAll('rect')
     //  .data(this.state.data)
     //  .enter()
     //  .append('rect')
     //  .style("fill", (d) => {return colorBars(d.type)})
     //  .style("opacity", .7)
     //  .attr('x', (d) => xScale(d.date))
     //  .attr('y', (d) => yScale(d.groceries))
     //  // .attr("y", (d) => { return yScale(d[1]); })
     //  // .transition() // a slight delay, see duration()
     //  .attr('height', (d) => innerHeight - yScale(d.groceries))
     //  // .attr("height", (d) => { return yScale(d[0]) - yScale(d[1]); })
     //  // .duration(600)
     //  .attr('width', (d) => xScale.bandwidth())

    // ==================================
    // Mouseover: make transluscent
    // note: don't use an arrow function here
    // ==================================
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', .7)

        let line = chart.append('line')
             .attr('id', 'indicator-line')
             // the start and end points of width of line
             .attr('x1', 0)
             .attr('x2', innerWidth)
             // the start and end points of height line
             // this.y.animVal.value is the height of the element in
             // crazy svg world (rememver, svg's (0,0) is upper left.)
             .attr('y1', this.y.animVal.value)
             .attr('y2', this.y.animVal.value)
             .attr('stroke', 'red')
      })

    // ==================================
    // Mouseout: make opaque
    // note: don't use an arrow function for first function
    // ==================================
      .on("mouseout", function(d) {
         d3.select(this)
           .transition()
           .duration(300)
           .attr('opacity', 1)
        // removing the indicator line
         chart.selectAll('#indicator-line').remove()
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
                 ${d.key}</br>
                 <p>(comment/memory about food this month)</p>`)

      })


    // ==================================
    // Tool Tip - off
    // ==================================
      chart.on("mouseout", (d) => { tooltip.style("display", "none");})

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
    // Adding the Labels
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
