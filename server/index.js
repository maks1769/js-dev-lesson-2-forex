const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
    console.log('Server listening at %s:%d', host, port);
});

app.use(express.static(path.join(__dirname, '../client')));

const getCurrentRate = () => {
    return Math.floor(Math.random() * 300) + 220;
};

setInterval(() => {

    io.sockets.emit('currency-rate', {
        date: new Date().toISOString(),
        rate: getCurrentRate(),
    })
}, 10000);


io.on('connection', (socket) => {
    socket.balance = {usd: 10000, facebook: 10};

    socket.emit('balance-changed', socket.balance);

    socket.on('buy', (payload) => {
        const sum = payload.rate * payload.amount;
        const newBalanceUsd = socket.balance.usd - sum;

        if (newBalanceUsd > 0) {
            socket.balance = {
                usd : newBalanceUsd,
                facebook: socket.balance.facebook + Number(payload.amount)
            };

            socket.emit('balance-changed', socket.balance);
        }
    });

    socket.on('sell', (payload) => {
        const newBalanceFacebook = socket.balance.facebook - payload.amount;

        if (newBalanceFacebook >= 0) {
            socket.balance = {
                usd: socket.balance.usd +  (payload.rate * payload.amount),
                facebook: newBalanceFacebook
            };

            socket.emit('balance-changed', socket.balance);
        }
    });
});
