import React, { Component } from 'react';
import * as d3 from 'd3';
import _lodash from 'lodash';
import moment from 'moment';
import data from './data/data.csv';
import comments from './data/comments.csv';
import Chart from './Chart';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default class App extends Component {
    constructor(props) {
    super(props);

    this.state = {
      data: [],
      commentData: [],
      yearlyAverageTotal: '',
      monthlyAverageTotal: '',
      monthlyAverageGroceries: '',
      monthlyAverageDinner: '',
      monthlyAverageLunch: '',
      monthlyAverageBreakfast: '',
      monthlyAverageSnack: '',
      monthlyAverageCoffee: '',
      totalMonthlySpendingThisMonth: '',
      averagePercentHigerOrLower: '',
      higherOrLower: '',
    }

  //  ==================================
  //  "this" binding
  //  ==================================

  }

   // ********************************
   // Component Did Mount
   // ********************************
   componentDidMount(){
    this.getCommentData()
    this.getData()
    this.drawChart()
   }


    //  ==================================
    //  Get the data
    //  ==================================
    getData() {
      d3.csv(data)
        .then((data) => {
          // 1) set state with data
          this.setState({data: data})
          // 2) raw data needs major manipulation
          this.valueStringToNumber()
          this.adjustDateValue()
          this.adjustForInflation()
          this.calculateTotalAverages()
          this.addFoodTypeKeyValue()
          this.dailyToMonlyData()
          this.turnUndefinedInto0()
          this.addFoodMemoryToData()
          this.calculateBreakdownAverages()
          // 3) draw the chart
          console.log("this.state.data:", this.state.data)
          this.drawChart()

      }).catch(function(error){
      // handle error
      })
    }

    //  ==================================
    //  Get comment data
    //  ==================================
    getCommentData() {
      d3.csv(comments)
        .then((comments) => {
          // 1) set state with comments data
          this.setState({commentData: comments})
          console.log("commentData", this.state.commentData)
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

    calculateTotalAverages() {
      let yearlyAverageTotal = (_lodash.sumBy(this.state.data, (d) => {
        return d.value
      }) / 5).toFixed(2)

      let monthlyAverageTotal = (_lodash.sumBy(this.state.data, (d) => {
        return d.value
      }) / 60).toFixed(2)

      this.setState({
        yearlyAverageTotal: yearlyAverageTotal,
        monthlyAverageTotal:  monthlyAverageTotal,
      })

      console.log("yearlyAverageTotal", this.state.yearlyAverageTotal)
      console.log("monthlyAverageTotal", this.state.monthlyAverageTotal)
    }

    calculateBreakdownAverages() {

      let monthlyAverageGroceries = (_lodash.sumBy(this.state.data, (d) => {
        return d.groceries
      }) /5 /12) .toFixed(2)

      let monthlyAverageDinner = (_lodash.sumBy(this.state.data, (d) => {
        return d.dinner
      }) /5 /12).toFixed(2)

      let monthlyAverageLunch = (_lodash.sumBy(this.state.data, (d) => {
        return d.lunch
      }) /5 /12).toFixed(2)

      let monthlyAverageBreakfast = (_lodash.sumBy(this.state.data, (d) => {
        return d.breakfast
      }) /5 /12).toFixed(2)

      let monthlyAverageSnack = (_lodash.sumBy(this.state.data, (d) => {
        return d.snack
      }) /5 /12).toFixed(2)

      let monthlyAverageCoffee = (_lodash.sumBy(this.state.data, (d) => {
        return d.coffee
      }) /5 /12).toFixed(2)

      this.setState({
        monthlyAverageGroceries: monthlyAverageGroceries,
        monthlyAverageDinner: monthlyAverageDinner,
        monthlyAverageLunch: monthlyAverageLunch,
        monthlyAverageBreakfast: monthlyAverageBreakfast,
        monthlyAverageSnack: monthlyAverageSnack,
        monthlyAverageCoffee: monthlyAverageCoffee,
      })
    }

    // ==================================
    // Change date from month/day/year to month/year
    // TODO: look into moment.js warning
    // ==================================
    adjustDateValue() {
      this.state.data.forEach( (entry) => {
        entry.date = moment(entry.date).format("MMM YYYY");
      })

      this.state.commentData.forEach( (entry) => {
        entry.date = moment(entry.date).format("MMM YYYY");
      })
    }

    // ==================================
    // Adjust numbers for inflation
    // ==================================
    adjustForInflation() {
      this.state.data.forEach( (entry) => {

        // For each entry, if a date contains a certain year,
        // adjust the value of spending, accounting for inflation
        if (entry.date.includes('14')) {
          entry.value = (entry.value * 1.065)
        } else if (entry.date.includes('15')) {
          entry.value = (entry.value * 1.063)
        } else if (entry.date.includes('16')) {
          entry.value = (entry.value * 1.05)
        } else if (entry.date.includes('17')) {
          entry.value = (entry.value * 1.028)
        }
      })
    }

    turnUndefinedInto0() {
      this.state.data.forEach( (entry) => {
        // if an entry doesn't exist, it gets a value of NaN.
        // We can't have that, so we must turn those NaNs into 0
        if (entry.groceries == null) { entry.groceries = 0}
        if (entry.dinner == null) { entry.dinner = 0}
        if (entry.lunch == null) { entry.lunch = 0}
        if (entry.breakfast == null) { entry.breakfast = 0}
        if (entry.snack == null) { entry.snack = 0}
        if (entry.coffee == null) { entry.coffee = 0}
        return entry
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
        } else if (entry.type === 'coffee out') {
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
      // This returns the first unique entry, by date. Helpful, but
      // not what we need....so move onto step 2)
       let uniqueDates = _lodash.uniqBy(this.state.data, (entry) => {
         return entry.date
       })

      // 2) Make an array of those unique dates only
       uniqueDates = _lodash.map(uniqueDates, (entry) => {
        return entry.date
       })

      // 3) Map over uniqueDates array to return the data we want
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
          // sum the lunch spending according to every unique date
          let lunch = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.lunch
          })
          // sum the breakfast spending according to every unique date
          let breakfast = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.breakfast
          })
          // sum the snack spending according to every unique date
          let snack = _lodash.sumBy(uniqueDates, (entry) => {
            return entry.snack
          })
          // sum the coffee spending according to every unique date
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
     }


   // ==================================
   // Getting the memory from one dataset
   // and adding it to the main dataset
   // ==================================
  addFoodMemoryToData() {
    this.state.data.forEach( (entry) => {

    // filter() creates new array with all elements that pass a "test"
      let tempResult = this.state.commentData.filter( (memoryEntry) => {

        // In this case, the "test" is, are both dates the same?
        const result = (entry.date === memoryEntry.date);
        return result
      })
        // Yes? cool. Then for the current entry we're on, give it a key of comment,
        // and assign it the value of the comment in our tempResult.
        // Now put that result into entry, and move onto the next one
        entry.comment = tempResult[0].comment
    });
  }





  // **********************************
  // Drawing the Chart function
  // **********************************

    // ==================================
    // Setting the Stage
    // ==================================
     drawChart() {
      // select the <svg> element in the HTML file with d3 select
      const svg = d3.select("#chart")
      const sidebarSVG = d3.select("#legend-sidebar")

      // define margins for some nice padding on the chart
      const margin = {top: 40, right: 50, bottom: 45, left: 70};
      const width = svg.attr('width')
      const height = svg.attr('height')
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      // drawing the chart on the screen
      const chart = svg.append("g")
                   .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // const colors = ["#6F75AA","#F79F79", "#AA3E98", "#E3F09B", "#70a5a3","#E85D75"]
      const colors = ["#6F75AA","#F79F79", "#E3F09B", "#AA3E98", "#70a5a3","#E85D75"]
      const spendingType = ["groceries", "dinner", "lunch", "snack", "breakfast", "coffee"]

    // ==================================
    // Layers for stacking
    // see spendingType near top of drawChart
    // ==================================
     let stack = d3.stack()
                   .keys(spendingType)
                   // put the largest series on bottom.
                   .order(d3.stackOrderDescending)


    // Moving forward, d3 is using "layers" as the data
    let layers = stack(this.state.data);
    console.log("layers:", layers);

    // ==================================
    // ToolTip
    // ==================================
    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tool-tip");

    // ==================================
    // Colors
    // See colors & spendingType variables close to the top of drawChart
    // ==================================
    let colorBars = d3.scaleOrdinal()
                      .domain(spendingType)
                      .range(colors)

    // ==================================
    // Drawing the Scales & Axies
    // ==================================
      let yScale = d3.scaleLinear()
        // 1) Domain. the min and max value of domain(data)
        // 2) Range. the min and max value of range(the visualization)
        .range([innerHeight, 0])
        // Special layered bar chart stuff
        // a) set lowest point at 0
        // b) the 1.03 gives us a *tiny* bit pf space on top of the
        // highest value.
        .domain([0, 1.03 * d3.max(layers[layers.length - 1], d => d[1])]);

      let xScale = d3.scaleBand()
        .range([0, innerWidth])
        .domain(this.state.data.map (d => d.date))
        .padding(0.1)

      // drawing the left scale
      chart.append('g')
        .call(d3.axisLeft(yScale))

      // drawing the bottom scale
      chart.append('g')
       .attr(`transform`, `translate(0, ${innerHeight})`)
       .call(d3.axisBottom(xScale))
       // angling the labels 45 degrees
        .selectAll("text")
        .attr("class", "x-scale")
        .attr("y", 0)
        .attr("x", 9)
        // .attr("dy", "1.5em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

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
    // Drawing the Layers/Bars
    // ==================================
      let layer = chart.selectAll(".layer")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "layer")
        .style("fill", (d) => {return colorBars(d.key)})

      layer.selectAll("rect")
       .data((d) => { return d })
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr('x', (d) => xScale(d.data.date))
       .attr("y", (d) => {
        // This is stacked bar chart stuff
        // if you look at the data, you'll see what d[0] & d[1] refer to
         return yScale(d[1]);
       })
       .attr("height", function(d) {
         return yScale(d[0]) - yScale(d[1]);
       })
      .attr('width', (d) => xScale.bandwidth())

    // ==================================
    // Mouseover: make transluscent
    // note: don't use an arrow function here
    // ==================================
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("stroke","white").attr("stroke-width",0.5)
          .attr('opacity', .6)
      })

    // ==================================
    // Mouseout: make opaque
    // note: don't use an arrow function for first function
    // ==================================
      .on("mouseout", function(d) {
         d3.select(this)
           .transition()
           .duration(300)
           .attr("stroke","white").attr("stroke-width",0)
           .attr('opacity', 1)

      })

    // ==================================
    // Tool Tip
    // ==================================
      .on("mousemove", (d) => {

        // figuring out THIS month's total spending
        let totalMonthlySpendingThisMonth = (d.data.groceries + d.data.dinner + d.data.lunch
          + d.data.breakfast + d.data.snack + d.data.coffee).toFixed(2)
        this.setState({totalMonthlySpendingThisMonth: totalMonthlySpendingThisMonth})

        // Figuring out the percent that this month's spending is higher or lower than average
        // Math.abs makes negative numbers positive
        let averagePercentHigerOrLower = Math.abs(
          ((this.state.totalMonthlySpendingThisMonth - this.state.monthlyAverageTotal)/
          this.state.monthlyAverageTotal * 100).toFixed(0)
        )
        this.setState({averagePercentHigerOrLower: averagePercentHigerOrLower})

        // This changes the wording of the tooltip language
        if (this.state.totalMonthlySpendingThisMonth > this.state.monthlyAverageTotal) {
          this.setState({higherOrLower:'higher than'})
          console.log(this.state.higherOrLower)

        } else if (this.state.totalMonthlySpendingThisMonth < this.state.monthlyAverageTotal) {
          this.setState({higherOrLower:'lower than'})
          console.log(this.state.higherOrLower)

        } else {
          this.setState({higherOrLower:'equal to'})
          console.log(this.state.higherOrLower)
        }

        tooltip
          // .attr("class", "tooltip")
          .style("display", "inline-block")
          .style("left", d3.event.pageX - 310 + "px")
          .style("top", d3.event.pageY - 50 + "px")
          .html(`
            <h3>${d.data.date}</h3>
            <h4>$${(d[1] - d[0]).toFixed(2)}</h4>
            <p>Total Monthly Spending: $${this.state.totalMonthlySpendingThisMonth}</br>

            This month had ${this.state.averagePercentHigerOrLower}% ${this.state.higherOrLower} average monthly spending.
            <hr/>
            <p id="comment">${d.data.comment}</p>
          `)

      })

    // ==================================
    // Tool Tip - off
    // tool tip needs to be turned off to start
    // ==================================
      chart.on("mouseout", (d) => { tooltip.style("display", "none");})

    // ==================================
    // Adding the left side label
    // (no label needed on bottom)
    // ==================================
    // left side label
      svg.append('text')
         .attr('class', 'left-chart-label')
         // adjust up and down
         .attr('x', -(innerHeight / 1.5) )
         // adjust side to side
         .attr('y', 15 )
         .attr('transform', 'rotate(-90)')
         .attr('text-anchor', 'middle')
         .text('US dollars adjusted for inflation')

    // ==================================
    // Legend in sidebar
    // ==================================
      let legend = sidebarSVG.selectAll("#legend-sidebar")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend-sidebar")
        .attr("transform", (d, index) => {
          return "translate(0," + index * 19 + ")";
        });

      // the tiny color swatches
      legend.append("rect")
        .attr("x", 0)
        .attr("width", 14)
        .attr("height", 14)
        .style("fill", (d, index) => {
          return colors.slice()[index];
        });

      legend.append("text")
        .attr("x", 18)
        .attr("y", 7)
        .attr("dy", ".35em")
        .attr("class", "legend-text")
        .style("text-anchor", "start")
        .text(function(d, index) {
          switch (index) {
            case 0: return spendingType[0];
            case 1: return spendingType[1] + " out";
            case 2: return spendingType[2] + " out";
            case 3: return spendingType[3] + " out";
            case 4: return spendingType[4] + " out";
            case 5: return spendingType[5] + " out";
          }
        });

    }

  //  ==================================
  //  And finally, the render
  //  ==================================
  render() {
    return (
      <div className="App row">

        <div className="sidebar-container col-xs-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">

          <Sidebar yearlyAverageTotal={this.state.yearlyAverageTotal}
                   monthlyAverageTotal={this.state.monthlyAverageTotal}
                   monthlyAverageGroceries={this.state.monthlyAverageGroceries}
                   monthlyAverageDinner={this.state.monthlyAverageDinner}
                   monthlyAverageLunch={this.state.monthlyAverageLunch}
                   monthlyAverageBreakfast={this.state.monthlyAverageBreakfast}
                   monthlyAverageSnack={this.state.monthlyAverageSnack}
                   monthlyAverageCoffee={this.state.monthlyAverageCoffee}
          />
        </div>

        <div className="chart-container col-xs-12 col-sm-9 col-md-9 col-lg-10 col-xl-10">
          <Chart />
          <br/>
          <Footer />
        </div>
      </div>
    );
  }
}
