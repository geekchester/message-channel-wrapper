import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import WrapperConnection from './WrapperConnection';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const wrapperPublisher = new WrapperConnection("ios", "ios-wrapper-dev");
const wrapperSubscriber = new WrapperConnection("ios", "ios-wrapper-dev");

const messageHandler = (value: any) => {
    console.log(`>>> MessageHandler successfully received msg: ${JSON.stringify(value)}`);
};

const closeHandler = () => {
    console.log("Post close action to execute");
}

wrapperPublisher.init((data) => { }, closeHandler);

wrapperSubscriber.init(
    messageHandler,
    closeHandler,
);

/* eslint-disable no-param-reassign, no-magic-numbers, no-native-reassign */
(window as any).wrapperPublisher = wrapperPublisher;
(window as any).wrapperSubscriber = wrapperSubscriber;


window.addEventListener("beforeunload", () => {
    if ((window as any).wrapperConnection) {
        (window as any).wrapperPublisher.close();
        (window as any).wrapperSubscriber.close();
    }
    return null;
});
