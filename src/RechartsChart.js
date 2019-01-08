import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import data from './data/data.csv';



export default class RechartsChart extends Component {
  render() {






    return (

      <BarChart width={800} height={500} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="valueInflation" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="date" fill="#8884d8" />
      </BarChart>

    );
  }
}
      // <svg viewBox="0 0 900 2400"
      //      width="700"
      //      height="400">
      // </svg>
