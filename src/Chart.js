import React, { Component } from 'react';



export default class Chart extends Component {
  render() {
    return (

      <div className="chart-container">
        <svg id="chart"
             viewBox=" 0 0 900 500"
             width="900"
             height="500">
        </svg>
      </div>

    );
  }
}
