import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect} from "react-router-dom";
import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';
import './App.css';
import WalletConnector from './WalletConnector';

const defaultTheme = createTheme();

const useStyles = makeStyles(
    (theme) => ({
        root: {
            background: "red",
            minHeight: "103vh",
            padding: 0
        },
    }),
    { defaultTheme },
);

function App() {

    const classes = useStyles();

    return (
        <div className={"app-background"}>
            <WalletConnector/>
            <Router>
                <Switch>
                    <Route exact path="/dashboard">
                    </Route>
                    <Route exact path="/home">
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
