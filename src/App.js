import React, { Component } from 'react';
import * as d3 from 'd3';
import data from './data/data.csv';
import sample from './data/Sample.js';
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
      d3.csv(data)
        .then((data) => {
        data.forEach( (d) => {
          // TODO: parse date properly
          // d.date = this.parseDate(d.date);
          d.value = +d.value;
          d.valueInflation = +d.valueInflation

          d.groceries = +d.groceries;
          d.groceriesInflation = +d.groceriesInflation;
          d.dinner = +d.dinner;
          d.dinnerInflation = +d.dinnerInflation;
          d.lunch = +d.lunch;
          d.lunchInflation = +d.lunchInflation;
          d.breakfast = +d.breakfast;
          d.breakfastInflation = +d.breakfastInflation;
          d.snack = +d.snack;
          d.snackInflation = +d.snackInflation;
          d.coffee = +d.coffee;
          d.coffeeInflation = +d.coffeeInflation;
        })
        console.log(`data:`, data)
        this.setState({data: data})
        console.log("this.state.data:", this.state.data)
        console.log("hihi", this.state.data[0].valueInflation)
        this.drawChart()
      }).catch(function(error){
      // handle error
      })
    }


    // ==================================
    // Setting the Stage
    // ==================================


    // ==================================
    // ToolTip!
    // ==================================


    // ==================================
    //
    // ==================================


    // ==================================
    // Drawing the Axes (left, top, bottom)
    // ==================================


  // **********************************
  // Drawing the Chart function
  // **********************************

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
    // Drawing the Scales & Axes
    // ==================================
      let yScale = d3.scaleLinear()
        // 1) Domain. the min and max value of domain(data)
        // 2) Range. the min and max value of range(the visualization)
        .range([innerHeight, 0])
        // your version
        .domain([0, d3.max(this.state.data, d => d.valueInflation)])
        // .domain([0, 100])

      chart.append('g')
        .call(d3.axisLeft(yScale))


      let xScale = d3.scaleBand()
        .range([0, innerWidth])
        // .range([0, width])
        // map over the data, and display whatever is the date value
        // your version
        .domain(this.state.data.map (d => d.date))
        // .domain(sample.map (s => s.language))
        .padding(0.2)

     chart.append('g')
      .attr(`transform`, `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))

    // ==================================
    // Drawing the Bars
    // ==================================
     chart.selectAll('rect')
      .data(this.state.data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.date))
      .attr('y', (d) => yScale(d.valueInflation))
      .transition() // a slight delay, see duration()
      .attr('height', (d) => innerHeight - yScale(d.valueInflation))
      .duration(600)
      .attr('width', (d) => xScale.bandwidth())








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
