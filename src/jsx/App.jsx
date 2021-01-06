import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://www.chartjs.org/
import Chart from 'chart.js';

const month_names = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      line_chart_rendered:false,
      line_chart_rendered_16_9:false,
      line_chart_show_meta:false,
      lives:0,
      total:0,
      edits:0,
      total_percent:0
    };

    // We need a ref for chart.js.
    this.appRef = React.createRef();
    this.lineChartRef = React.createRef();
    this.totalRef = React.createRef();
    this.lineChartMetaRef = React.createRef();
  }
  componentDidMount() {
    setTimeout(() => {
      this.createLineChart(16/9);
    }, 1000);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  createLineChart(ratio) {
    // Check if chart has been rendered and fail if it is.
    if (this.state.line_chart_rendered === false) {
      this.setState((state, props) => ({
        line_chart_rendered:true
      }));
    }
    else {
    }

    // Define constants.
    const self = this;
    let line_chart = false;
    function display(error, data) {

      if (error) {
        console.log(error)
        return false;
      }

      // console.log(data)
      data.values = data.map((values) => {
        return {
          date:values.date,
          edits:values.covid_edits,
          lives:values.covid_lives,
          edits_percent:values.covid_edits_percent,
          lives_percent:values.covid_lives_percent,
          edits_cumulative:values.culumative_edits,
          lives_cumulative:values.culumative_lives,
          total:(values.covid_lives + values.covid_edits),
          total_percent:(values.covid_lives_percent + values.covid_edits_percent)
        }
      });

      // Define options.
      let options = {
        data:{
          datasets:[{
            backgroundColor:'rgba(27, 64, 152, 1)',
            borderColor:'#1b4098',
            borderWidth:3,
            data:[self.state.edits],
            fill:true,
            label:'COVID-19 Edits',
            order:99,
            radius:0,
            yAxisID:'left'
          },{
            backgroundColor:'rgba(0, 174, 102, 1)',
            borderColor:'#00ae66',
            borderWidth:3,
            data:[self.state.lives],
            fill:true,
            label:'COVID-19 Lives',
            order:99,
            radius:0,
            yAxisID:'left'
          },{
            backgroundColor:'rgba(0, 174, 102, 1)',
            borderColor:'#ff9900',
            borderWidth:4,
            data:[self.state.total_percent],
            hidden:true,
            fill:false,
            label:'COVID-19 percentage',
            order:77,
            radius:0,
            yAxisID:'right'
          }],
          labels:['']
        },
        options:{
          aspectRatio:ratio,
          hover:{
            enabled:false,
          },
          legend:{
            align:'left',
            display:false,
            labels: {
              fontSize:20,
              fontStyle:'bold'
            },
            onClick:false,
            position:'top'
          },
          responsive:true,
          scales:{
            xAxes:[{
              display:true,
              gridLines:{
                display:false
              },
              ticks: {
                autoSkip:false,
                fontColor:'#444',
                fontSize:20,
                fontStyle:'bold',
                maxRotation:0,
                minRotation:0
              },
              scaleLabel:{
                display:false,
              }
            }],
            yAxes:[{
              id:'left',
              display:true,
              gridLines:{
                display:true
              },
              position:'left',
              scaleLabel:{
                display:true,
                fontColor:'#444',
                fontSize:14,
                fontStyle:'bold',
                labelString:'Number of COVID-19 Items in the News Exchange'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                fontColor:'#444',
                fontSize:16,
                fontStyle:'bold',
                suggestedMax:10,
                suggestedMin:0
              }
            },{
              id:'right',
              display:false,
              gridLines:{
                display:false
              },
              position:'right',
              scaleLabel:{
                fontColor:'#FF9900',
                display:true,
                fontSize:14,
                fontStyle:'bold',
                labelString:'COVID-19 Items\' Percentage of News Exchange'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                callback: function(value, index, values) {
                  return value + '%';
                },
                fontColor:'#444',
                fontSize:16,
                fontStyle:'bold',
                suggestedMax:100,
                suggestedMin:0,
              }
            }]
          },
          title:{
            display:false,
            text:''
          },
          tooltips:{
            enabled:false
          }
        },
        type:'line'
      };

      self.appRef.current.style.display = 'block';

      function updateChart() {
        // Update chart.
        let interval = setInterval(() => {
          let values = data.values.shift();
          self.setState((state, props) => ({
            date:values.date,
            edits:values.edits,
            lives:values.lives,
            edits_percent:values.edits_percent,
            lives_percent:values.lives_percent,
            edits_cumulative:values.edits_cumulative,
            lives_cumulative:values.lives_cumulative,
            total:values.total,
            total_percent:values.total_percent
          }));
          if (values.date.split('-')[2] === '03') {
            options.data.labels[options.data.labels.length - 2] = '|'
            options.data.labels.push('');
          }
          else if (values.date.split('-')[2] === '18') {
            options.data.labels[options.data.labels.length - 2] = month_names[values.date.split('-')[1]]
            options.data.labels.push('');
          }
          else {
            options.data.labels.push('');
          }
          // options.data.labels.push((values.date.split('-')[2]) === '01' ?  month_names[values.date.split('-')[1]] : '');
          options.data.datasets[0].data.push(values.edits);
          options.data.datasets[1].data.push(values.total);
          options.data.datasets[2].data.push(values.total_percent);
          line_chart.update();

          if (data.values.length < 1) {
            clearInterval(interval);
            setTimeout(() => {
              options.data.datasets[2].hidden = false;
              options.options.scales.yAxes[1].display = true;
              self.totalRef.current.style.display = 'block';
              self.lineChartMetaRef.current.style.right = '110px';
              line_chart.update(0);
            }, 3000);
          }
        }, 200);
      }

      // Get context from ref.
      let ctx = self.lineChartRef.current.getContext('2d');

      line_chart = new Chart(ctx, options);

      updateChart();
    }
    // Load the data.
    d3.json('./data/data.json', display);
  }
  render() {
    let date = (this.state.date) ? this.state.date.split('-') : ['2020','01','09'];
    let path_prefix;
    if (location.href.match('localhost')) {
      path_prefix = './';
    }
    else {
      path_prefix = 'https://raw.githubusercontent.com/ebuddj/2020-covid19stories/master/public/';
    }
    return (
      <div className={style.app} ref={this.appRef}>
        <div className={style.date}></div>
        <div className={style.legend}>
          <div><img src={path_prefix + 'img/ebu-logo.png'} className={style.logo}/></div>
          <div className={style.lives}><span className={style.legend_value}>{this.state.lives_cumulative}</span> COVID-19 Lives</div>
          <div className={style.edits}><span className={style.legend_value}>{this.state.edits_cumulative}</span> COVID-19 Edits</div>
          <div ref={this.totalRef} className={style.total}><span className={style.legend_value}>{this.state.edits_cumulative + this.state.lives_cumulative + ''}</span> COVID-19 Total</div>
        </div>
        <div style={(this.state.line_chart_rendered === true) ? {display:'block'} : {display:'none'}}>
          <div style={{position:'relative', margin:'auto auto'}}>
            <div className={style.line_chart_meta} ref={this.lineChartMetaRef}>
              <div>{parseInt(date[2]) + ' ' + month_names[date[1]]}<br /><span className={style.explainer}>COVID-19 =</span> {(this.state.total_percent)}% <span className={style.explainer}>of News Exchange</span></div>
            </div>
            <canvas id={style.line_chart} ref={this.lineChartRef}></canvas>
          </div>
        </div>
      </div>
    );
  }
}
export default App;