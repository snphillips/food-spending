import React, { Component } from 'react';
import Header from './Header';
// import Footer from './Footer';

export default class Sidebar extends Component {
  render() {
    return (

      <aside className="sidebar">
        <Header/>

          <svg
            id="legend-sidebar"
            width="120"
            height="120">
          </svg>

        <p className="sidebar-text">Average Food Spending:</p>

        <ul>
          <li>${this.props.yearlyAverageTotal} /year</li>
          <li>${this.props.monthlyAverageTotal} /month</li>
        </ul>

        <p className="sidebar-text">Average Monthly Breakdown:</p>
          <ul>
            <li>groceries:</li>
            <li>dinner out:</li>
            <li>lunch out:</li>
            <li>breakfast out:</li>
            <li>snacks out:</li>
            <li>coffee out:</li>
          </ul>

      </aside>
    );
  }
}
        // <p className="sidebar-text">Visualizing how much money I've spent on food over the past five years.</p>
