import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import {AmbientLight, PointLight, LightingEffect, LinearInterpolator} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import Control from './components/control';
import Brush from './components/brush';
import Display from './components/display';
import Rank from './components/rank';
import * as moment from 'moment';
import _ from 'lodash';
import './App.css'
import renderLayers from './components/layers';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoieWlmemhhbmciLCJhIjoiY2p3NG1wdGU2MWp4aTQ4cXE0cDY2cW10OSJ9.MO1caW9zRx5ixTyi_8HSeQ'; // eslint-disable-line

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0
});

const pointLight = new PointLight({
    color: [255, 255, 255],
    intensity: 2.0,
    position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const mapOnLoadHandler = (event) => {
    const map = event && event.target;
    if (map) {
        map.addControl(new MapboxLanguage({
            defaultLanguage: 'zh',
        }));
        map.setLayoutProperty('country-label-lg', 'text-field', ['get', 'name_zh']);
    }

    // map.getLayer('road-label-small').setLayoutProperty('visibility', 'none');
    // map.getLayer('road-label-medium').setLayoutProperty('visibility', 'none');
    // map.getLayer('road-label-large').setLayoutProperty('visibility', 'none');
    // map.getLayer('country-label-lg').setLayoutProperty('visibility', 'none');

    // Insert the layer beneath any symbol layer.
    let layers = map.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    // 3D building
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6,
            'fill-extrusion-vertical-gradient': true
        }
    }, labelLayerId);
};

export const INITIAL_VIEW_STATE = {
    longitude: 104.036107,
    latitude: 30.461111,
    zoom: 12,
    pitch: 60,
    bearing: 0
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.config = {
            velocityTimePrecision: 10,
            rotateInterpolator: new LinearInterpolator(['bearing'])
        };
        this.rawData = {
            trips: {},
            pickUpData: {},
            pickDownData: {},
            velocityData: {},
            arcData: [],
            addressData: [],
            majorCongestionData: {}
        };
        this.state = {
            // Data
            pickUpData: [],
            pickDownData: [],
            velocityData: [],
            arcData: [],
            addressData: {},
            majorCongestionData: [],
            usePickUpTime: true,
            // Time
            currTime: 17 * 3600,
            selectedTime: new Date(2018, 4, 1, 17),
            selectedPeriod: [
                new Date(2018, 4, 1, 14, 0),
                new Date(2018, 4, 1, 16, 0)
            ],
            congestionStep: {
                critical: 5
            },
            // Display
            display: {
                trips: false,
                pickUp: false,
                pickDown: false,
                velocity: false,
                arc: false,
                // timePlot: false,
                enableBrushing: true,
                fixedBrushing: false,
                majorCongestion: false,
                orderChart: true,
                labels: true
            },
            viewState: INITIAL_VIEW_STATE,
            // Interactive
            mousePosition: null,
        };

        this._rotateCamera = this._rotateCamera.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseClick = this._onMouseClick.bind(this);
        this.velocityClickHandler = this.velocityClickHandler.bind(this);
    }

    componentDidMount() {
        const promises = [
            fetch('data/pickup.json')
                .then(response => response.json())
                .then(json => this.rawData.pickUpData = json),
            fetch('data/pickdown.json')
                .then(response => response.json())
                .then(json => this.rawData.pickDownData = json),
            fetch('data/velocity_divide.json')
                .then(response => response.json())
                .then(json => this.rawData.velocityData = json),
            fetch('data/address.json')
                .then(response => response.json())
                .then(json => this.rawData.addressData = json)
                .then(() => this.setState({addressData: this.rawData.addressData['104.0530 30.5078']})),
            fetch('data/velocity_divide_larger_scale_with_specific_point.json')
                .then(response => response.json())
                .then(json => this.rawData.majorCongestionData = json),
            fetch('data/17.json')
                .then(response => response.json())
                .then(json => this.rawData.trips = json),
            fetch('data/velocity_time_plot.json')
                .then(response => response.json())
                .then(json => this.rawData.timePlotData = json)
                .then(() => this.setState({timePlotData: this.rawData.timePlotData['104.0530 30.5078']})),
            fetch('data/arc.json')
                .then(response => response.json())
                .then(json => this.rawData.arcData = json)
        ];
        Promise.all(promises)
            .then(() => this.selectedPeriodChangeHandler())
            .then(() => this.selectedTimeChangeHandler())
            .then(() => this._animate());
    }

    componentWillUnmount() {
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
        }
    }

    _animate() {
        const {
            loopLength = 3600, // unit corresponds to the timestamp in source data
            animationSpeed = 10 // unit time per second
        } = this.props;
        const timestamp = Date.now() / 1000;
        const loopTime = loopLength / animationSpeed;
        const time = this.state.currTime >= 18 * 3600 ? 17 * 3600 : this.state.currTime + 1;

        this.setState({
            currTime: time
        });
        this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
    }

    _initialize(gl) {
        gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
        gl.blendEquation(gl.FUNC_ADD);
    }

    _rotateCamera() {
        // change bearing by 120 degrees.
        const bearing = this.state.viewState.bearing + 120;
        this.setState({
            viewState: {
                ...this.state.viewState,
                bearing,
                transitionDuration: 80000,
                transitionInterpolator: this.config.rotateInterpolator,
                onTransitionEnd: this._rotateCamera
            }
        });
    }

    _onMouseClick(evt) {
        if (this.state.display.fixedBrushing && evt.nativeEvent) {
            this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
        }
    }

    _onMouseMove(evt) {
        if (!this.state.display.fixedBrushing && evt.nativeEvent) {
            this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
        }
    }

    _onMouseLeave() {
        if (!this.state.display.fixedBrushing) {
            this.setState({mousePosition: null});
        }
    }

    velocityClickHandler(d) {
        const coords = d.object;
        const idx = `${coords[0].toFixed(4)} ${coords[1].toFixed(4)}`;
        this.setState({timePlotData: this.rawData.timePlotData[idx]});
        this.setState({addressData: this.rawData.addressData[idx]});
        // this.setState({
        //     display: {
        //         ...this.state.display,
        //         timePlot: true
        //     }
        // })
    }

    displayChangeHandler(newState) {
        this.setState({display: newState});
    }

    selectedPeriodChangeHandler(newPeriod) {
        if (newPeriod) {
            this.setState({selectedPeriod: newPeriod});
        } else {
            newPeriod = this.state.selectedPeriod;
        }

        // refresh data
        const minTime = moment(newPeriod[0]).format('HH mm'),
            maxTime = moment(newPeriod[1]).format('HH mm');
        const fltFunc = this.state.usePickUpTime ? d => newPeriod[0] <= d.startTime * 1000 && d.startTime * 1000 < newPeriod[1] :
            d => newPeriod[0] <= d.endTime * 1000 && d.endTime * 1000 < newPeriod[1];
        const pickUpData = Object.keys(this.rawData.pickUpData)
                .filter(k => minTime <= k && k < maxTime)
                .map(k => this.rawData.pickUpData[k]),
            pickDownData = Object.keys(this.rawData.pickDownData)
                .filter(k => minTime <= k && k < maxTime)
                .map(k => this.rawData.pickDownData[k]),
            arcData = this.rawData.arcData.filter(fltFunc);
        this.setState({
            pickUpData: _.flatten(pickUpData),
            pickDownData: _.flatten(pickDownData),
            arcData: arcData
        });
    }

    selectedTimeChangeHandler(newTime) {
        if (newTime) {
            this.setState({selectedTime: newTime});
        } else {
            newTime = this.state.selectedTime;
        }

        // refresh data
        newTime.setMinutes(Math.floor(
            newTime.getMinutes() / this.config.velocityTimePrecision) * this.config.velocityTimePrecision);
        const time = moment(newTime).format('HH mm');
        const velocityData = this.rawData.velocityData[time];
        this.setState({velocityData});

        let majorCongestionData = this.rawData.majorCongestionData[time]
            .filter(d => d[2] > this.state.congestionStep.critical)
            .map(d => {
                const coords = `${d[3].toFixed(4)} ${d[4].toFixed(4)}`,
                    address = this.rawData.addressData[coords];
                return {
                    coordinate: [d[3], d[4]],
                    trafficIndex: d[2],
                    address: address
                }
            });
        this.setState({majorCongestionData})
    }


    render() {
        const {controller = true} = this.props,
            {viewState} = this.state;

        return (
            <div onMouseMove={this._onMouseMove} onMouseLeave={this._onMouseLeave} onClick={this._onMouseClick}>
                <Control
                    map={this.map}
                    display={this.state.display}
                    currTime={this.state.currTime}
                    selectedPeriod={this.state.selectedPeriod}
                    selectedTime={this.state.selectedTime}
                    onDisplayChange={this.displayChangeHandler.bind(this)}
                    onSelectedPeriodChange={this.selectedPeriodChangeHandler.bind(this)}
                    onSelectedTimeChange={this.selectedTimeChangeHandler.bind(this)}
                />
                <Brush
                    data={this.rawData.arcData}
                    selectedPeriod={this.state.selectedPeriod}
                    onSelectedPeriodChange={this.selectedPeriodChangeHandler.bind(this)}
                />
                <Display
                    display={this.state.display}
                    onDisplayChange={this.displayChangeHandler.bind(this)}
                    linePlotData={this.state.timePlotData}
                    addressData={this.state.addressData}
                />
                <Rank
                    display={this.state.display}
                    majorCongestionData={this.state.majorCongestionData}
                />
                <DeckGL
                    layers={renderLayers({
                        tripsData: this.rawData.trips,
                        pickUpData: this.state.pickUpData,
                        pickDownData: this.state.pickDownData,
                        velocityData: this.state.velocityData,
                        arcData: this.state.arcData,
                        majorCongestionData: this.state.majorCongestionData,
                        display: this.state.display,
                        currTime: this.state.currTime,
                        hour: this.state.hour,
                        selectedPeriod: this.state.selectedPeriod,
                        mousePosition: this.state.mousePosition,
                        enableBrushing: this.state.display.enableBrushing,
                        velocityClickHandler: this.velocityClickHandler,
                    })}
                    effects={[lightingEffect]}
                    initialViewState={INITIAL_VIEW_STATE}
                    viewState={viewState}
                    controller={controller}
                    onWebGLInitialized={this._initialize}
                    onLoad={() => this._rotateCamera()}
                    onViewStateChange={({viewState}) => this.setState({viewState})}
                    fp64={true}
                >
                    <StaticMap
                        reuseMaps
                        attributionControl={false}
                        ref={ref => {
                            this.map = ref && ref.getMap();
                        }}
                        mapStyle="mapbox://styles/mapbox/dark-v9"
                        preventStyleDiffing={true}
                        mapboxApiAccessToken={MAPBOX_TOKEN}
                        onLoad={mapOnLoadHandler}
                    />
                </DeckGL>
            </div>
        );
    }
}
