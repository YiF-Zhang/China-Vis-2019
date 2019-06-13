import React, {Component} from 'react';
import {createMuiTheme, withStyles} from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import {ThemeProvider} from '@material-ui/styles';
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
        width: '500px',
        // height: '280px',
        zIndex: 10,
        position: 'absolute',
        right: '20px',
        top: '20px',
    },
    panel: {
        width: '100%',
        height: '100%',
        background: '#1b1c1d',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, 0.6)',
        padding: theme.spacing(3, 2)
    },
    trafficIndex: {
        marginRight: theme.spacing(3),
        fontWeight: 'bold',
        width: '80px'
    }
};


class Rank extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes, majorCongestionData, addressData, display} = this.props;

        return (
            <ThemeProvider theme={theme}>
                {display.majorCongestion &&
                <div className={classes.root}>
                    <Paper className={classes.panel}>
                        <Typography variant='h5' style={{marginLeft: theme.spacing(2), marginTop: theme.spacing(1)}}>
                            主要拥堵点
                        </Typography>
                        <List style={{maxHeight: '300px', overflow: 'auto'}}>
                            {majorCongestionData
                                .sort((a, b) => b.trafficIndex - a.trafficIndex)
                                .map(d => <ListItem>
                                    <ListItemAvatar>
                                        <Typography
                                            variant='h3'
                                            color={d.trafficIndex >= 6 ? 'secondary' : 'error'}
                                            className={classes.trafficIndex}>
                                            {d.trafficIndex.toFixed(1)}
                                        </Typography>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={d ? `${d.address.roads}往${d.address.direction}方向` : ''}
                                        secondary={d ? `${d.address.address} 附近`.slice(6,) : ''}
                                    />
                                </ListItem>)}
                        </List>
                    </Paper>
                </div>}
            </ThemeProvider>
        )
    }
}

export default withStyles(displayStyles)(Rank);