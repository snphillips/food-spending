import React, { Component } from 'react';
import * as d3 from 'd3';
import data from './data/data.csv';
import Chart from './Chart';
import ChartHeader from './ChartHeader';

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
   }



  //  ==================================
  //  Get the data
  //  ==================================
  getData() {
    d3.csv(data)
    .then(function(data) {
      console.log(`data:`, data)
      // data is now whole data set
      // draw chart in here!
    }).catch(function(error){
      // handle error
    })
  }



   // **********************************
  // Drawing the Chart function
  // **********************************

   drawChart() {
    const svg = d3.select("svg")

    const margin = {top: 100, right: 100, bottom: 100, left: 100};
    const width = svg.attr('width')
    const height = svg.attr('height')

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

   }



  //  ==================================
  //  And finally, the render
  //  ==================================
  render() {
    return (
      <div className="App">
        <ChartHeader />
        <Chart />
      </div>
    );
  }
}
