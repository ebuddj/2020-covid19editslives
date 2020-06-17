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
  '07': 'July'
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
      edits:0
    };

    // We need a ref for chart.js.
    this.lineChartRef = React.createRef();
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
            radius:0,
            order:99,
            yAxisID:'left'
          },{
            backgroundColor:'rgba(0, 174, 102, 1)',
            borderColor:'#00AE66',
            borderWidth:3,
            data:[self.state.lives],
            fill:true,
            label:'COVID-19 Lives',
            radius:0,
            order:99,
            yAxisID:'left'
          },{
            backgroundColor:'rgba(0, 174, 102, 1)',
            borderColor:'#000',
            borderWidth:4,
            data:[self.state.total_percent],
            fill:false,
            label:'COVID-19 Total percent',
            radius:0,
            order:77,
            yAxisID:'right'
          }],
          labels:[]
        },
        options:{
          hover:{
            enabled:false,
          },
          legend:{
            align:'left',
            display:false,
            position:'top',
            labels: {
              fontSize:20,
              fontStyle:'bold'
            }
          },
          title:{
            display:false,
            text:''
          },
          tooltips:{
            enabled:false,
          },
          aspectRatio:ratio,
          responsive:true,
          scales:{
            xAxes:[{
              display:true,
              gridLines:{
                display:false
              },
              ticks: {
                autoSkip:false,
                color:'#000',
                fontSize:20,
                fontStyle:'bold',
                maxRotation:0,
                minRotation:0
              },
              scaleLabel:{
                display:false,
                labelString:'month'
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
                display:false,
                labelString:'Covid-19'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                suggestedMax:10,
                suggestedMin:0
              }
            },{
              id:'right',
              display:true,
              gridLines:{
                display:false
              },
              position:'right',
              scaleLabel:{
                display:false,
                labelString:'Covid-19'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                callback: function(value, index, values) {
                  return value + '%';
                },
                suggestedMax:100,
                suggestedMin:0,
              }
            }]
          }
        },
        type:'line'
      };

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

          options.data.labels.push((values.date.split('-')[2]) === '01' ?  month_names[values.date.split('-')[1]] : '');
          options.data.datasets[0].data.push(values.edits);
          options.data.datasets[1].data.push(values.total);
          options.data.datasets[2].data.push(values.total_percent);
          line_chart.update();

          if (data.values.length < 1) {
            clearInterval(interval);
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
      <div className={style.app}>
        <div className={style.date}></div>
        <div className={style.legend}>
          <div><img src={path_prefix + 'img/ebu-logo.png'} className={style.logo}/></div>
          <div className={style.lives}>{this.state.lives_cumulative} COVID-19 Lives</div>
          <div className={style.edits}>{this.state.edits_cumulative} COVID-19 Edits</div>
        </div>
        <div style={(this.state.line_chart_rendered === true) ? {display:'block'} : {display:'none'}}>
          <div style={{position:'relative', margin:'auto auto'}}>
            <div className={style.line_chart_meta}>
              <div>{date[2] + ' ' + month_names[date[1]]}<br /><span className={style.explainer}>COVID-19 =</span> {(this.state.total_percent)}% <span className={style.explainer}>of News Exchange</span></div>
            </div>
            <canvas id={style.line_chart} ref={this.lineChartRef}></canvas>
          </div>
        </div>
      </div>
    );
  }
}
export default App;