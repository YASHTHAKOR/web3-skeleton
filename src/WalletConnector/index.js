import React, {Fragment} from 'react';
import {Web3ReactProvider, useWeb3React, UnsupportedChainIdError} from '@web3-react/core';
import {
    NoEthereumProviderError,
    UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector';
import {UserRejectedRequestError as UserRejectedRequestErrorWalletConnect} from '@web3-react/walletconnect-connector';
import {UserRejectedRequestError as UserRejectedRequestErrorFrame} from '@web3-react/frame-connector';
import {Web3Provider} from '@ethersproject/providers';
import {CircularProgress} from '@mui/material';

import {useEagerConnect, useInactiveListener} from './hooks';
import {
    injected,
    walletconnect,
    walletlink,
    ledger,
    trezor,
} from './connectors';
import {
    loadWeb3,
    loadAccount
} from '../store/interactions';
import {useDispatch} from "react-redux";
import {withStyles, makeStyles, alpha} from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import {
    DialogTitle as MuiDialogTitle,
    DialogContent as MuiDialogContent,
    // DialogActions as MuiDialogActions,
    Typography,
    IconButton,
    Dialog,
    Button,
    createTheme,
    Grid
} from "@mui/material";

import SecureLogo from '../assets/commons/secureLogo.png';

const theme = createTheme();

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },

});

const ConnectWalletButtonStyle = withStyles(() => ({
    root: {
        background: "#0D99B8",
        borderRadius: "13px",
        width: "100%"
    }
}))(Button);

const ConnectorNames = {
    Injected: 'Injected',
    Network: 'Network',
    WalletConnect: 'WalletConnect',
    WalletLink: 'WalletLink',
    Ledger: 'Ledger',
    Trezor: 'Trezor',
    Lattice: 'Lattice',
    Frame: 'Frame',
    Authereum: 'Authereum',
    Fortmatic: 'Fortmatic',
    Magic: 'Magic',
    Portis: 'Portis',
    Torus: 'Torus'
}

const walletDetails = [
    {
        name: 'Metamask',
        path: 'metaMask',
        connectorName: [ConnectorNames.Injected]
    },
    {
        name: 'Wallet Connect',
        path: 'walletConnect',
        connectorName: [ConnectorNames.WalletConnect]

    },
    {
        name: 'Ledger',
        path: 'ledger',
        connectorName: [ConnectorNames.Ledger]
    },
    {
        name: 'Trezor',
        path: 'trezor',
        connectorName: [ConnectorNames.Trezor]

    },
    {
        name: 'Coinbase Wallet',
        path: 'coinbaseWallet',
        connectorName: [ConnectorNames.WalletLink]

    }
];

const connectorsByName = {
    [ConnectorNames.Injected]: injected,
    [ConnectorNames.WalletConnect]: walletconnect,
    [ConnectorNames.WalletLink]: walletlink,
    [ConnectorNames.Ledger]: ledger,
    [ConnectorNames.Trezor]: trezor,
}

const useStyles = makeStyles((theme) => ({

    walletLabel: {
        fontFamily: "Ambit",
        fontStyle: "normal",
        fontWeight: "normal",
        display: "flex",
        alignItems: "center",
        color: "#FFFFFF",

    },
    welcomeLabel: {
        fontFamily: "Ambit",
        fontStyle: "normal",
        fontWeight: "normal",
        display: "flex",
        alignItems: "center",
        color: "#39C6E4",
        fontSize: "36px",
        lineHeight: "41px"
    },
    connectWalletMessage: {
        fontFamily: "Ambit",
        fontStyle: "normal",
        fontWeight: "normal",
        display: "flex",
        alignItems: "center",
        color: "#FFFFFF",
        fontSize: "24px",
        lineHeight: "28px"
    },
    securityMessage: {
        fontFamily: "Ambit",
        fontStyle: "normal",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        color: "#39C6E4",
        padding: "20px"
    },
    securityMessageInfo: {
        fontFamily: "Ambit",
        fontStyle: "normal",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        color: "#FFFFFF",
        fontSize: "18px",
        lineHeight: "20px"
    },
    connectWalletButtonLabel: {
        fontFamily: "Ambit",
        fontWeight: "900",
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: "16px",
        lineHeight: "16px"
    },
    connected: {
        background: "#0D99B8 !important"
    }

}));



function getLibrary(provider) {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
}

export default function ({loadContracts}) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <App loadContracts={loadContracts}/>
        </Web3ReactProvider>
    )
}


function Balance({
                     loadContracts
                 }) {
    const {account, library, chainId, connector} = useWeb3React()
    const dispatch = useDispatch();

    const [balance, setBalance] = React.useState()

    const initFunction = async (provider) => {

        let connectorName = null;

        walletDetails.some((wallet) => {
            const currentConnector = connectorsByName[wallet.connectorName]
            const connected = currentConnector === connector;
            if (connected) {
                connectorName = wallet.path;
                return true;
            }
        });

        let web3 = await loadWeb3(dispatch, provider);
        await loadAccount(dispatch, account, chainId, connectorName);
        await loadContracts(web3, chainId);
    }

    React.useEffect(() => {
        if (!!account && !!library) {
            let stale = false
            // let web3 = new Web3(library.provider);
            initFunction(library.provider);
            library
                .getBalance(account)
                .then((balance) => {
                    if (!stale) {
                        setBalance(balance)
                    }
                })
                .catch(() => {
                    if (!stale) {
                        setBalance(null)
                    }
                })

            return () => {
                stale = true
                setBalance(undefined)
            }
        } else {

        }
    }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

    return (
        <>

        </>
    )
}

function Header({
                    loadContracts
                }) {
    const {active, error} = useWeb3React()

    return (
        <>
            <Balance loadContracts={loadContracts}/>
        </>
    )
}

function App({
                 loadContracts
             }) {
    const context = useWeb3React();
    const classes = useStyles();
    const {connector, library, chainId, account, activate, deactivate, active, error} = context

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = React.useState();
    const [walletImages, setWalletImages] = React.useState({});
    const [open, setOpen] = React.useState(true)
    React.useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])


    React.useEffect(async () => {
        let walletNameImages = {};
        for (let i = 0; i < walletDetails.length; i++) {
            let imageData = await import(`../assets/commons/${walletDetails[i].path}.png`);
            walletNameImages[walletDetails[i].name] = imageData.default;
        }
        setWalletImages({...walletNameImages});
    }, [])

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect();

    const openWalletConnectorOptions = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector)

    return (
        <>
            <Header loadContracts={loadContracts}/>
            <Grid
                container
                direction="row"
                spacing={3}
            >
                {walletDetails.map((wallet) => {
                    const currentConnector = connectorsByName[wallet.connectorName]
                    const activating = currentConnector === activatingConnector
                    const connected = currentConnector === connector
                    const disabled = !triedEager || !!activatingConnector || connected || !!error
                    return <Grid item
                                 xs={12} sm={6}

                    >

                        {connected && <ConnectWalletButtonStyle
                            key={wallet.name}
                            onClick={() => {
                                deactivate();
                            }}
                            className={classes.connected}
                        >
                            {activating ? <CircularProgress/> : <Fragment>
                                <img style={{height: "20px", marginRight: "10px"}}
                                     src={walletImages[wallet.name] ? walletImages[wallet.name] : ''}
                                     alt=""/>
                                <Typography variant="body" className={classes.walletLabel}>
                                    Deactivate
                                </Typography>
                            </Fragment>}
                        </ConnectWalletButtonStyle>}
                        {!connected && <ConnectWalletButtonStyle
                            key={wallet.name}
                            onClick={() => {
                                setActivatingConnector(currentConnector)
                                activate(connectorsByName[wallet.connectorName])
                            }}
                            className={connected ? classes.connected : ''}
                        >
                            {activating ? <CircularProgress/> : <Fragment>
                                <img style={{height: "20px", marginRight: "10px"}}
                                     src={walletImages[wallet.name] ? walletImages[wallet.name] : ''}
                                     alt=""/>
                                <Typography variant="body" className={classes.walletLabel}>
                                    {wallet.name}
                                </Typography>
                            </Fragment>}
                        </ConnectWalletButtonStyle>}
                    </Grid>
                })}


            </Grid>
            <div>
                <Grid container
                      direction="column"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}>
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}
                    >
                        <Typography variant="body" className={classes.connectWalletMessage}>
                            Connect a wallet to invest and Manage your Defi Portfolio
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>


                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>

                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                        <img src={SecureLogo} alt=""/> <br/>
                    </Grid>
                    <Grid>
                        <Typography variant="body" className={classes.securityMessage}>
                            Non-custodial & Secure
                        </Typography>
                    </Grid>
                    <Grid>
                        <Typography variant="body" className={classes.securityMessageInfo}>
                            We do not own your private keys and cannot access your funds.
                        </Typography>
                    </Grid>
                    <Grid>
                        <Typography variant="body" className={classes.securityMessageInfo}>
                            *Crypto is volatile, DeFi is new and risky. Please use it at your own risk.
                        </Typography>
                    </Grid>


                </Grid>
            </div>
        </>
    )
}
