import React, {Component} from 'react';
import {withStyles, createMuiTheme, styled} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {fade} from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as moment from 'moment';

import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/lab/Slider';

const StyledSlider = withStyles({
    thumb: {
        backgroundColor: '#de235b',
        '&$focused, &:hover': {
            boxShadow: `0px 0px 0px ${8}px ${fade('#de235b', 0.16)}`,
        },
        '&$activated': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        },
        '&$jumped': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        },
    },
    track: {
        backgroundColor: '#de235b',
    },
    trackAfter: {
        backgroundColor: '#d0d7dc',
    },
})(Slider);

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const styles = {
    root: {
        width: 280,
        zIndex: 10,
        position: 'absolute',
        left: '20px',
        top: '20px',
    },
    heading: {
        fontSize: '15px',
        fontWeight: 'bold'
    },
    singlePanel: {
        background: '#1b1c1d',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, 0.6)'
    },
    picksTimePicker: {
        // marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
        width: 100,
    }
};

function convertPercentageTime(d) {
    if (typeof (d) === 'object') {
        return (60 * d.getHours() + d.getMinutes()) / (24 * 60) * 100;
    } else {
        const hh = Math.floor(d / 100 * 24),
            mm = Math.floor(d / 100 * 24 * 60 - hh * 60);
        return [hh, mm];
    }
}

class Control extends Component {
    constructor(props) {
        super(props);
        this.state = {
            panelOpen: {
                trips: false,
                picks: true,
                velocity: true
            }
        }

    }

    handlePanelChange(panel) {
        return (event, isExpanded) => {
            let panelOpen = {...this.state.panelOpen};
            panelOpen[panel] = isExpanded;
            this.setState({panelOpen});
        }
    }

    handleDisplayChange(layer, value) {
        return (event, isDisplay) => {
            const {display, onDisplayChange} = this.props;
            display[layer] = isDisplay;
            onDisplayChange({...display});
        }
    }

    handleSelectedPeriodChange(type) {
        if (type === 'from') {
            return event => {
                const {selectedPeriod, onSelectedPeriodChange} = this.props,
                    fromTime = event.target.value.split(':'),
                    currTime = selectedPeriod[0];
                currTime.setHours(+fromTime[0]);
                currTime.setMinutes(+fromTime[1]);
                onSelectedPeriodChange([currTime, selectedPeriod[1]])
            }
        } else if (type === 'to') {
            return event => {
                const {selectedPeriod, onSelectedPeriodChange} = this.props,
                    fromTime = event.target.value.split(':'),
                    currTime = selectedPeriod[1];
                currTime.setHours(+fromTime[0]);
                currTime.setMinutes(+fromTime[1]);
                onSelectedPeriodChange([selectedPeriod[0], currTime]);
            }
        }
    }

    handleSelectedTimeChange() {
        return (event, value) => {
            const {selectedTime, onSelectedTimeChange} = this.props,
                [hh, mm] = convertPercentageTime(value),
                time = new Date(selectedTime);
            time.setHours(hh);
            time.setMinutes(mm);
            onSelectedTimeChange(time);
        }
    }

    handleLabelChange(event, isDisplay) {
        const {display, onDisplayChange, map} = this.props;
        // const keys = Object.keys(map.style._layers).filter(s => s.indexOf('label') !== -1);
        map.style.stylesheet.layers.forEach(function (layer) {
            if (layer.type === 'symbol') {
                map.getLayer(layer.id).setLayoutProperty('visibility', isDisplay ? 'visible' : 'none');
            }
        });
        display['labels'] = isDisplay;
        onDisplayChange({...display});
    }

    render() {
        const {classes, display, selectedPeriod, selectedTime, currTime} = this.props;
        return (
            <ThemeProvider theme={theme}>
                <div className={classes.root}>
                    <ExpansionPanel
                        id='trips'
                        className={classes.singlePanel}
                        expanded={this.state.panelOpen.trips}
                        onChange={this.handlePanelChange('trips')}
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>轨迹</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FormGroup>
                                <Typography variant='h3' style={{marginBottom: theme.spacing(3)}}>
                                    {`${Math.floor(currTime / 3600).toString().padStart(2, '0')}` +
                                    `:${Math.floor((currTime % 3600) / 60).toString().padStart(2, '0')}` +
                                    `:${Math.floor(currTime % 60).toString().padStart(2, '0')}`}
                                </Typography>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.trips}
                                                      onChange={this.handleDisplayChange('trips')}/>
                                        }
                                        label="显示车辆轨迹"
                                    />
                                </FormGroup>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.labels}
                                                      onChange={this.handleLabelChange.bind(this)}/>
                                        }
                                        label="显示地图标签"
                                    />
                                </FormGroup>
                            </FormGroup>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel
                        id='picks'
                        className={classes.singlePanel}
                        expanded={this.state.panelOpen.picks}
                        onChange={this.handlePanelChange('picks')}
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>订单</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FormGroup>
                                <FormGroup row style={{marginBottom: theme.spacing(2)}}>
                                    <FormControl
                                        className={classes.col}
                                        children={
                                            <TextField
                                                label="From"
                                                type="time"
                                                value={moment(selectedPeriod[0]).format('HH:mm')}
                                                className={classes.picksTimePicker}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                inputProps={{
                                                    step: 300, // 5 min
                                                }}
                                                onChange={this.handleSelectedPeriodChange('from')}
                                            />
                                        }
                                    />
                                    <FormControl
                                        className={classes.col}
                                        children={
                                            <TextField
                                                label="To"
                                                type="time"
                                                value={moment(selectedPeriod[1]).format('HH:mm')}
                                                className={classes.picksTimePicker}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                inputProps={{
                                                    step: 300, // 5 min
                                                }}
                                                onChange={this.handleSelectedPeriodChange('to')}
                                            />
                                        }
                                    />
                                </FormGroup>
                                <FormGroup row>
                                    <div id="d3-brush-container" style={{width: '100%', height: '50px'}}></div>
                                </FormGroup>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.pickUp}
                                                      onChange={this.handleDisplayChange('pickUp')}/>
                                        }
                                        label="上车点"
                                    />
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.pickDown}
                                                      onChange={this.handleDisplayChange('pickDown')}/>
                                        }
                                        label="下车点"
                                    />
                                </FormGroup>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.arc}
                                                      onChange={this.handleDisplayChange('arc')}/>
                                        }
                                        label="Arc"
                                    />
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.orderChart}
                                                      onChange={this.handleDisplayChange('orderChart')}/>
                                        }
                                        label="订单走势"
                                    />
                                </FormGroup>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Switch checked={display.enableBrushing}
                                                    onChange={this.handleDisplayChange('enableBrushing')}/>
                                        }
                                        label="Brushing"
                                    />
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Switch checked={display.fixedBrushing}
                                                    onChange={this.handleDisplayChange('fixedBrushing')}/>
                                        }
                                        label="Fix"
                                    />
                                </FormGroup>
                            </FormGroup>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel
                        id='velocity'
                        className={classes.singlePanel}
                        expanded={this.state.panelOpen.velocity}
                        onChange={this.handlePanelChange('velocity')}
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>道路拥堵</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FormGroup>
                                <Typography variant='h3' style={{marginBottom: theme.spacing(4)}}>
                                    {moment(selectedTime).format('HH:mm')}
                                </Typography>
                                <FormGroup row style={{marginBottom: theme.spacing(4)}}>
                                    <StyledSlider
                                        className={classes.slider}
                                        value={convertPercentageTime(selectedTime)}
                                        onChange={this.handleSelectedTimeChange()}
                                    />
                                </FormGroup>
                                <FormGroup row>
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.velocity}
                                                      onChange={this.handleDisplayChange('velocity')}/>
                                        }
                                        label="显示道路拥堵情况"
                                    />
                                    <FormControlLabel
                                        className={classes.col}
                                        control={
                                            <Checkbox checked={display.majorCongestion}
                                                      onChange={this.handleDisplayChange('majorCongestion')}/>
                                        }
                                        label="显示主要拥堵点"
                                    />
                                </FormGroup>
                            </FormGroup>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </div>
            </ThemeProvider>
        )
    }
}

export default withStyles(styles)(Control);