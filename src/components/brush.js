import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import {createMuiTheme, withStyles} from "@material-ui/core";
import {ThemeProvider} from '@material-ui/styles';
import * as d3 from 'd3';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const brushStyles = {
    root: {
        width: 600,
        zIndex: 10,
        position: 'absolute',
        right: '20px',
        bottom: '20px',
    },
    panel: {
        background: '#1b1c1d',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, 0.6)',
        padding: theme.spacing(3, 2)
    },
};


class Brush extends Component {

    constructor(props) {
        super(props);
        this.rendered = false;
    }

    //
    // prepareData() {
    //     const {orderData} = this.props;
    //     this.pickUp = d3.nest()
    //         .key(d => d.startTime)
    //         .
    // }

    drawChart(data, selectedPeriod, onSelectedPeriodChange) {
        function brushcentered() {
            var dx = x(new Date(2018, 4, 1, 2)) - x(new Date(2018, 4, 1, 0)), // Use a fixed width when recentering.
                cx = d3.mouse(this)[0],
                x0 = cx - dx / 2,
                x1 = cx + dx / 2;
            d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }

        function brushed() {
            let extent = d3.event.selection,
                minTime = Math.floor(24 * 60 * extent[0] / width),
                maxTime = Math.floor(24 * 60 * extent[1] / width);
            let minResult = new Date(selectedPeriod[0]), maxResult = new Date(selectedPeriod[1]);
            minResult.setHours(0);
            minResult.setMinutes(minTime);
            maxResult.setHours(0);
            maxResult.setMinutes(maxTime);
            onSelectedPeriodChange([minResult, maxResult]);
        }

        var container = d3.select("#d3-brush-container"),
            margin = {top: 0, right: 0, bottom: 10, left: 0},
            width = +container.node().getBoundingClientRect().width - margin.left - margin.right,
            height = +container.node().getBoundingClientRect().height - margin.top - margin.bottom;
        let svg = container.append('svg').attr('width', width).attr('height', height),
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
                .domain(d3.range(0, 48).map(i => new Date(2018, 4, 1, Math.floor(i / 2), i % 2 * 30)))
                .range([0, width]),
            y = d3.scaleLinear()
                .domain([0, 2500])
                .range([height, 0]);

        let startData = d3.nest()
                .key(d => {
                    let tmp = new Date(d.startTime * 1000);
                    tmp.setMinutes(tmp.getMinutes() - tmp.getMinutes() % 30);
                    tmp.setSeconds(0);
                    return tmp;
                })
                .entries(data)
                .map(d => {
                    return {time: d.key, count: d.values.length};
                }),
            endData = d3.nest()
                .key(d => {
                    let tmp = new Date(d.endTime * 1000);
                    tmp.setMinutes(tmp.getMinutes() - tmp.getMinutes() % 30);
                    tmp.setSeconds(0);
                    return tmp;
                })
                .entries(data)
                .map(d => {
                    return {time: d.key, count: d.values.length};
                });

        var brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("start brush", brushed);


        let padRatio = 0.2;
        let bars = g.selectAll("rect")
            .data(startData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.time) + x.bandwidth() * padRatio)
            .attr("y", d => y(d.count))
            .attr("rx", x.bandwidth() * (0.5 - padRatio))
            .attr("ry", x.bandwidth() * (0.5 - padRatio))
            .attr("width", x.bandwidth() * (1 - padRatio * 2))
            .attr("height", d => height - y(d.count))
            .style("fill", "#de235b");

        g.append("g")
            .call(brush)
            .call(brush.move, [selectedPeriod[0], selectedPeriod[1]].map(x))
            .selectAll(".overlay")
            .each(function (d) {
                d.type = "selection";
            }) // Treat overlay interaction as move.
            .on("mousedown touchstart", brushcentered); // Recenter before brushing.

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
    }

    render() {
        const {classes, height = '100px', data, selectedPeriod, onSelectedPeriodChange} = this.props;
        if (!this.rendered && data.length !== 0) {
            this.rendered = true;
            this.drawChart(data, selectedPeriod, onSelectedPeriodChange);
        }

        return (
            <div></div>
        )
    }
}

export default withStyles(brushStyles)(Brush);