import React, { Component } from 'react';


export default class Footer extends Component {
  render() {
    return (

      <footer>
        <span><a className="footer-website-link" href="https://sarahphillipsdev.surge.sh">by Sarah Phillips</a></span>
        <span><a className="footer-github-link" href="https://github.com/snphillips/Food-Spending"><i className="fab fa-github"></i></a></span>
      </footer>
    );
  }
}
