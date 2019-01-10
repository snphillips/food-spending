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
    this.parseDate()
   }

  // Parse the date
  // TODO: get this to work
   parseDate() {
    d3.timeParse("%m-%d-%Y")
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



          console.log("this.state.data:", this.state.data)
          this.drawChart()
      }).catch(function(error){
      // handle error
      })
    }


    // ==================================
    // Turn value into useable number
    // ==================================
    valueStringToNumber() {
      this.state.data.forEach( (entry) => {
        entry.value = +entry.value;
      })
    }

    // ==================================
    // Turn date from days into month-year
    // ==================================
    adjustDateValue() {
      this.state.data.forEach( (entry) => {
        // entry.date = entry.date.replace( /,.*\//, '' );
        entry.date = moment(entry.date).format("MMM YY");

    //     return entry
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
  // The source data is daily, but we're
  // only interested in monthly totals. So, the
  // data needs to be collapsed.
  // ==================================
  // dailyToMonlyData() {
  //   // 1) let's find all the unique months (so we can later add their monthly totals)
  //   let allMonths = _lodash.uniqBy(this.state.data, (item)=>{
  //     return item.date
  //   })

  //   // 2) map over the allMonths to return some information we'll need, and
  //   // the sum of all spending categories per month
  //    allMonths = _lodash.map(allMonths, (item)=>{
  //     return item.boroughDistrict
  //   })

  //   const newData = _lodash.map(allMonths, (boroughDistrict)=>{

  //       const allMonths = _lodash.filter(this.state.data, (item)=>{
  //         return item.boroughDistrict === boroughDistrict
  //       })

  //       const borough = _lodash.filter(this.state.data, (item)=>{
  //         return item.borough === borough
  //       })

  //       const cd_name = _lodash.filter(this.state.data, (item)=>{
  //         return item.cd_name === cd_name
  //       })

  //       const refusetonscollected = _lodash.sumBy(allMonths, (item)=>{
  //         return item.refusetonscollected
  //       })

  //       const papertonscollected = _lodash.sumBy(allMonths, (item)=>{
  //         return item.papertonscollected
  //       })


  //     return {
  //       // date: date,
  //       borough: allMonths[0].borough,
  //       cd_name: allMonths[0].cd_name,
  //       _2010_population: allMonths[0]._2010_population,
  //       refusetonscollected: refusetonscollected,
  //       papertonscollected: papertonscollected,
  //       }
  //   })
  //   // console.log("data after collapsing 12 months:", newData)
  //   this.setState({data: newData})
  // }









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
      // const width = 800;
      // const height = 500;
      // put back at end when you want to go responsive
      const width = svg.attr('width');
      const height = svg.attr('height');
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const chart = svg.append("g")
                   // .attr('transform', `translate(${innerWidth}, ${innerHeight})`);
                   // .attr('transform', `translate(${innerHeight}, ${innerWidth})`);
                   .attr('transform', `translate(${margin.top}, ${margin.left})`);

    // ==================================
    // ToolTip
    // ==================================
    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tool-tip");

    // ==================================
    // Drawing the Scales & Axes
    // ==================================
      let yScale = d3.scaleLinear()
        // 1) Domain. the min and max value of domain(data)
        // 2) Range. the min and max value of range(the visualization)
        .range([innerHeight, 0])
        .domain([0, d3.max(this.state.data, d => d.value)])

      chart.append('g')
        .call(d3.axisLeft(yScale))


      let xScale = d3.scaleBand()
        .range([0, innerWidth])
        // .range([0, width])
        // map over the data, and display whatever is the date value
        // your version
        .domain(this.state.data.map (d => d.date))
        .padding(0.2)


     chart.append('g')
      .attr(`transform`, `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      // angling the labels 45 degrees
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      // .attr("dy", ".35em")
      .attr("dy", ".95em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");


    // ==================================
    // Drawing the Bars
    // ==================================
     chart.selectAll('rect')
      .data(this.state.data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.date))
      .attr('y', (d) => yScale(d.value))
      // .transition() // a slight delay, see duration()
      .attr('height', (d) => innerHeight - yScale(d.value))
      // .duration(600)
      .attr('width', (d) => xScale.bandwidth())

    // ==================================
    // Mouseover: make transluscent
    // note: don't use an arrow function here
    // ==================================
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', .5)

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
    // Tool Tip - on
    // ==================================
      .on("mousemove", (d) => {
        tooltip.style("left", d3.event.pageX + 15 + "px")
               .style("top", d3.event.pageY - 60 + "px")
               .style("display", "inline-block")
               .html(`${d.date}</br>
                 ${d.value}</br>
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
