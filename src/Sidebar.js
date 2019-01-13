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

        <p className="sidebar-text">Visualizing how much money I've spent on food over the past five years.</p>
        <p className="sidebar-text">On average, I spent (insert) on food per month.</p>

      </aside>
    );
  }
}
