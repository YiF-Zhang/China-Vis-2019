import {TripsLayer, HexagonLayer, IconLayer, ColumnLayer, ScatterplotLayer} from 'deck.gl';
import ArcBrushingLayer from './arc-layers/arc-brushing-layer';
// import mydata from './17.json';
import _ from 'lodash';
import {PhongMaterial} from '@luma.gl/core';
import gradstop from 'gradstop';
import chroma from 'chroma-js';

export function gradColorGenerator(colors, len, alpha = [20, 255]) {
    const gradient = gradstop({
        stops: len,
        inputFormat: 'hex',
        colorArray: colors
    });
    return gradient.map((rgb, i) => _.concat(
        rgb.replace(/[^\d,]/g, '').split(',').map(d => parseInt(d)),
        (alpha[1] - alpha[0]) / len * i + alpha[0])
    );
}

export default function renderLayers(props) {
    const {
        tripsData, pickUpData, pickDownData, velocityData, arcData, majorCongestionData,
        display, currTime, selectedPeriod, mousePosition,
        apiServer = 'http://127.0.0.1:5000/api/',
        trailLength = 100, enableBrushing = true,
        colorScale = chroma.scale(["#0198bd", "#49e3ce", "#d8feb5", "#feedb1", "#fead54", "#d1374e"]),
        startColor = chroma('#0198bd').rgb(), endColor = chroma('#ff910c').rgb(),
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
        },
        velocityClickHandler,
        iconMapping = {
            marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
        }
    } = props;

    const isMouseover = mousePosition !== null;
    const startBrushing = Boolean(isMouseover && enableBrushing);

    return [
        display.trips && new TripsLayer({
            id: 'trips',
            data: tripsData,
            pickable: true,
            autoHighlight: true,
            visible: display.trips,
            // getPath: order => order.track.map(d => [d[0], d[1], d[2] % (3600 * 24)]),
            getPath: order => order.track.map(d => {
                const date = new Date(d[2] * 1000),
                    timestamp = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
                // console.log([d[0], d[1], timestamp]);
                return [d[0], d[1], timestamp];
            }),
            getColor: [253, 128, 93],
            opacity: 1,
            widthMinPixels: 2,
            rounded: false,
            trailLength,
            // currTime: new Date(2018,4,1,17,30),
            currentTime: currTime,
            onHover: (info, event) => {
                console.log(info.object);
                console.log(event);
            }
        }),
        new ColumnLayer({
            id: 'velocity',
            data: velocityData,
            pickable: true,
            autoHighlight: true,
            visible: display.velocity,
            diskResolution: 6,
            radius: 10,
            coverage: 0.8,
            extruded: false,
            elevationScale: 1000,
            getPosition: d => d.slice(0, 2),
            getColor: d => colorScale(trafficIndex(d[2]) / 5).rgb(),
            getElevation: d => trafficIndex(d[2]),
            opacity: 1,
            onClick: velocityClickHandler
        }),
        new ScatterplotLayer({
            id: 'pick-up',
            data: pickUpData,
            pickable: true,
            visible: display.pickUp,
            opacity: 0.5,
            stroked: false,
            filled: true,
            radiusScale: 10,
            radiusMinPixels: 0.8,
            radiusMaxPixels: 3,
            getPosition: d => d.slice(1,),
            getRadius: d => 1,
            getFillColor: d => startColor
        }),
        new ScatterplotLayer({
            id: 'pick-down',
            data: pickDownData,
            pickable: true,
            visible: display.pickDown,
            opacity: 0.5,
            stroked: false,
            filled: true,
            radiusScale: 10,
            radiusMinPixels: 0.8,
            radiusMaxPixels: 3,
            getPosition: d => d.slice(1,),
            getRadius: d => 1,
            getFillColor: d => endColor
        }),
        new ArcBrushingLayer({
            id: 'arc',
            data: arcData,
            getWidth: 0.5,
            opacity: 0.5,
            visible: display.arc,
            brushRadius: 300,
            enableBrushing: startBrushing,
            mousePosition,
            getSourcePosition: d => [...d.startPosition, 0],
            getTargetPosition: d => [...d.endPosition, 0],
            getSourceColor: startColor,
            getTargetColor: endColor
        }),
        new IconLayer({
            id: 'icon',
            data: majorCongestionData,
            pickable: true,
            visible: display.majorCongestion,
            // iconAtlas and iconMapping are required
            // getIcon: return a string
            iconAtlas: iconPic,
            iconMapping: iconMapping,
            getIcon: d => 'marker',
            getPosition: d => d.coordinate,
            getSize: d => 5,
            sizeMaxPixels: 100,
            sizeMinPixels: 1,
            sizeScale: 8,
            getColor: d => d.trafficIndex >= 6 ? chroma('#e10050').rgb(): chroma('#f44336').rgb(),
            onHover: ({object, x, y}) => {
            }
        })
    ]
};