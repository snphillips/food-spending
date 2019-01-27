import React, { Component } from 'react';
import Header from './Header';
// import Footer from './Footer';

export default class Sidebar extends Component {
  render() {
    return (

      <aside className="sidebar">

          <Header/>

          <hr/>

          <svg
            id="legend-sidebar"
            width="120"
            height="120">
          </svg>

          <hr/>

          <h2 className="sidebar-section-header">Avg Food Spending</h2>
          <ul>
            <li>${this.props.yearlyAverageTotal} /year</li>
            <li>${this.props.monthlyAverageTotal} /month</li>
          </ul>

          <hr/>

          <h2 className="sidebar-section-header">Avg Monthly Breakdown</h2>
          <ul>
            <li>groceries: ${this.props.monthlyAverageGroceries}</li>
            <li>dinner out: ${this.props.monthlyAverageDinner}</li>
            <li>lunch out: ${this.props.monthlyAverageLunch}</li>
            <li>breakfast out: ${this.props.monthlyAverageBreakfast}</li>
            <li>snacks out: ${this.props.monthlyAverageSnack}</li>
            <li>coffee out: ${this.props.monthlyAverageCoffee}</li>
          </ul>

          <hr/>

      </aside>
    );
  }
}

          // <h2 className="sidebar-section-header">About</h2>
          // <p className="sidebar-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer scelerisque ex turpis,
          //  ac lacinia massa venenatis eu. Sed et ligula commodo, sollicitudin massa eu, sodales dolor.
          //  Sed imperdiet felis eget consequat blandit. Mauris id tortor eget sapien dapibus vulputate.
          //  Mauris tincidunt nec sapien eu elementum.</p>
