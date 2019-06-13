import React, {Component} from 'react';
import {createMuiTheme, withStyles} from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import {ThemeProvider} from '@material-ui/styles';
import {LineChart} from './charts';
import {OrderChart} from "./orderChart";
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';


const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const displayStyles = {
    root: {
        width: '800px',
        height: '280px',
        zIndex: 10,
        position: 'absolute',
        right: '20px',
        bottom: '20px',
    },
    panel: {
        width: '100%',
        height: '100%',
        background: '#1b1c1d',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, 0.6)',
        padding: theme.spacing(3, 2)
    },
};


class Display extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes, linePlotData, addressData, display, onDisplayChange} = this.props;

        return (
            <ThemeProvider theme={theme}>
                {display.velocity &&
                <div className={classes.root}>
                    <Paper className={classes.panel}>
                        <Grid container spacing={1}>
                            <Grid item xs={11}>
                                <Typography variant='h5'
                                            style={{marginLeft: theme.spacing(3), marginTop: theme.spacing(1)}}>
                                    {addressData ? `${addressData.roads}往${addressData.direction}方向拥堵情况` : ''}
                                </Typography> </Grid>
                            <Grid item xs={1}>
                                {/*<Button onClick={() => onDisplayChange({...display, timePlot: false})}>*/}
                                {/*    关闭*/}
                                {/*</Button>*/}
                            </Grid>
                            <Grid item xs={12}>
                                <LineChart data={linePlotData}></LineChart>
                            </Grid>
                        </Grid>

                    </Paper>
                </div>}
                {display.orderChart && <div className={classes.root}>
                    <Paper className={classes.panel}>
                        <Grid container spacing={1}>
                            <Grid item xs={11}>
                                <Typography variant='h5'
                                            style={{marginLeft: theme.spacing(3), marginTop: theme.spacing(1)}}>
                                    订单走势
                                </Typography> </Grid>
                            <Grid item xs={1}>
                                {/*<Button onClick={() => onDisplayChange({...display, timePlot: false})}>*/}
                                {/*    关闭*/}
                                {/*</Button>*/}
                            </Grid>
                            <Grid item xs={12}>
                                <OrderChart></OrderChart>
                            </Grid>
                        </Grid>

                    </Paper>
                </div>}
            </ThemeProvider>
        )
    }
}

export default withStyles(displayStyles)(Display);