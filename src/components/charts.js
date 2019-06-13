import React from 'react';
import ReactApexChart from 'react-apexcharts';


export class LineChart extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    background: '#1b1c1d',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false,
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: 3,
                    curve: 'smooth',
                },
                fill: {
                    colors: undefined,
                    opacity: 0.9,
                    type: 'gradient',
                    gradient: {
                        shade: 'light',
                        type: "vertical",
                        shadeIntensity: 0.5,
                        gradientToColors: undefined,
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 50, 100],
                        colorStops: []
                    },
                    image: {
                        src: [],
                        width: undefined,
                        height: undefined
                    },
                    pattern: {
                        style: 'verticalLines',
                        width: 6,
                        height: 6,
                        strokeWidth: 2,
                    },
                },
                title: {
                    // text: 'Product Trends by Month',
                    // align: 'left'
                },
                grid: {},
                xaxis: {
                    type: 'datetime',
                    labels: {
                        show: true,
                        rotate: -45,
                        rotateAlways: false,
                        hideOverlappingLabels: true,
                        showDuplicates: false,
                        trim: true,
                        minHeight: undefined,
                        maxHeight: 120,
                        style: {
                            colors: [],
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            cssClass: 'apexcharts-xaxis-label',
                        },
                        offsetX: 0,
                        offsetY: 0,
                        format: undefined,
                        datetimeFormatter: {
                            year: 'yyyy',
                            month: "MMM 'yy",
                            day: 'dd MMM',
                            hour: 'H:mm',
                        },
                    },
                    axisTicks: {
                        show: false,
                        borderType: 'solid',
                        color: '#78909C',
                        height: 6,
                        offsetX: 0,
                        offsetY: 0
                    },
                },
                yaxis: {
                    // eslint-disable-next-line no-undef
                    min: 0,
                    max: 60,
                    tickAmount: 6,
                    labels: {
                        show: true,
                        align: 'right',
                        minWidth: 0,
                        maxWidth: 160,
                        style: {
                            color: undefined,
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            cssClass: 'apexcharts-yaxis-label',
                        },
                        offsetX: 0,
                        offsetY: 0,
                        rotate: 0,
                        formatter: (value) => {
                            return parseInt(value)
                        },
                    },
                },
                theme: {
                    mode: 'dark',
                },
                tooltip: {
                    enabled: true,
                    shared: true,
                    followCursor: true,
                    intersect: false,
                    inverseOrder: false,
                    custom: undefined,
                    fillSeriesColor: false,
                    theme: 'dark',
                    style: {
                        fontSize: '12px',
                        fontFamily: undefined
                    },
                    onDatasetHover: {
                        highlightDataSeries: false,
                    },
                    x: {
                        show: true,
                        format: 'HH:mm',
                        formatter: undefined,
                    },
                    y: {
                        formatter: value => value.toFixed(2),
                        title: {
                            formatter: (seriesName) => seriesName,
                        },
                    },
                    z: {
                        formatter: undefined,
                        title: 'Size: '
                    },
                    marker: {
                        show: true,
                    },
                    fixed: {
                        enabled: false,
                        position: 'topRight',
                        offsetX: 0,
                        offsetY: 0,
                    },
                }
            },
        }
    }

    // componentDidMount() {
    //   fetch("velocity_time_plot.json")
    //       .then(response => response.json())
    //       .then(d => {
    //         this.setState({
    //           series: [{
    //             data: d["103.9828 30.4163"]
    //           }]
    //         })
    //       })
    // }

    render() {
        const {
            data,
            trafficIndex = v => {
                let _v;
                if (v === 0) {
                    _v = 60
                } else if (v > 60) {
                    _v = 60;
                } else if (v < 1) {
                    _v = 1;
                } else {
                    _v = v;
                }
                return 60 / _v
            }
        } = this.props;
        const series = [{
                name: "拥堵系数",
                data: data ?
                    data.map((d, i) => [new Date(2018, 4, 1, Math.floor(i / 6), (i % 6) * 10).getTime(),
                        trafficIndex(d)]) : undefined
            }];
        return (
            <div id="line-chart">
                <ReactApexChart options={this.state.options} series={series} type="line" height='210'/>
            </div>
        );
    }
}
