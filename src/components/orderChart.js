import React from 'react';
import ReactApexChart from 'react-apexcharts';


export class OrderChart extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
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
                    // min: 0,
                    // max: 60,
                    tickAmount: 5,
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
                },
            },
            series: [],
        }
    }

    componentDidMount() {
        const rawData = {
            'legends': ['运动餐厅', '华阳客运中心', '南湖公园', '南湖国际社区南区', '成都工业职业技术学院', '怡馨家园', '成都海昌极地海洋公园', '四川省人民医院天府新区医院'],
            'x_axis': ['0:0', '0:30', '1:0', '1:30', '2:0', '2:30', '3:0', '3:30', '4:0', '4:30', '5:0', '5:30', '6:0', '6:30', '7:0', '7:30', '8:0', '8:30', '9:0', '9:30', '10:0', '10:30', '11:0', '11:30', '12:0', '12:30', '13:0', '13:30', '14:0', '14:30', '15:0', '15:30', '16:0', '16:30', '17:0', '17:30', '18:0', '18:30', '19:0', '19:30', '20:0', '20:30', '21:0', '21:30', '22:0', '22:30'],
            'data': [{
                'name': '运动餐厅',
                'val': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 7, 2, 4, 4, 3, 2, 6, 5, 17, 24, 20, 8, 27, 23, 39, 33, 62, 87, 82, 73, 97, 75, 41, 23, 8, 4, 6, 4, 0, 1, 0]
            }, {
                'name': '华阳客运中心',
                'val': [1, 0, 0, 2, 0, 1, 0, 1, 0, 1, 3, 1, 1, 6, 18, 13, 12, 25, 17, 26, 13, 11, 12, 10, 15, 17, 27, 35, 27, 14, 22, 21, 19, 13, 8, 7, 5, 3, 2, 5, 7, 3, 1, 1, 1, 4, 1, 3]
            }, {
                'name': '南湖公园',
                'val': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 7, 8, 13, 24, 25, 19, 17, 15, 21, 15, 12, 15, 23, 27, 14, 16, 4, 7, 6, 3, 2, 7, 3, 1, 4, 1, 0, 2, 1, 0, 0, 0]
            }, {
                'name': '南湖国际社区南区',
                'val': [11, 5, 4, 4, 2, 2, 2, 0, 1, 0, 0, 3, 0, 0, 1, 4, 1, 3, 3, 2, 8, 2, 4, 9, 13, 9, 13, 8, 5, 3, 7, 8, 9, 3, 5, 8, 5, 15, 7, 8, 15, 9, 23, 18, 21, 22, 14, 12]
            }, {
                'name': '成都工业职业技术学院',
                'val': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 0, 1, 1, 4, 4, 8, 8, 6, 8, 8, 13, 15, 17, 5, 14, 21, 8, 10, 17, 15, 23, 14, 13, 24, 21, 14, 12, 9, 2, 1]
            }, {
                'name': '怡馨家园',
                'val': [4, 11, 5, 3, 2, 3, 2, 0, 2, 0, 0, 0, 1, 3, 1, 11, 6, 6, 12, 0, 7, 5, 10, 6, 7, 8, 14, 15, 11, 12, 5, 13, 5, 6, 11, 11, 10, 12, 12, 10, 8, 3, 7, 11, 12, 5, 8, 9]
            }, {
                'name': '成都海昌极地海洋公园',
                'val': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 11, 14, 24, 23, 20, 17, 14, 9, 10, 8, 10, 14, 8, 6, 1, 2, 1, 1, 0, 2, 1, 0, 1, 2, 2, 1, 0, 1, 0, 1, 0, 0]
            }, {
                'name': '四川省人民医院天府新区医院',
                'val': [1, 2, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 2, 11, 15, 14, 12, 22, 12, 15, 13, 6, 5, 2, 10, 5, 7, 7, 6, 7, 10, 9, 4, 2, 2, 2, 3, 3, 2, 2, 2, 3, 6, 2, 3, 3]
            }]
        };
        const data = rawData.legends.map((legend, idx) => {
            return {
                name: legend,
                data: rawData.data[idx].val.map((d, i) => {
                    return [new Date(2018, 4, 1, Math.floor(i / 2), (i % 2) * 30).getTime(), d]
                })
            }
        })
        this.setState({series: data})
    }

    render() {
        return (
            <div id="order-line-chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height='210'/>
            </div>
        );
    }
}
