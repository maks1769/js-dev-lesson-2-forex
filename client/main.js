document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const rates = [];

    const ctx = document.getElementById('rate').getContext('2d');

    const chartConfig = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: rates.map(row => {
                    return {
                        x: new Date(row.date),
                        y: Number(row.rate)
                    };
                }),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time'
                }]
            }
        }
    };

    const myLineChart = new Chart(ctx, chartConfig);

    const buttons = document.querySelectorAll('button');

    const date = new Date().toLocaleString();

    buttons.forEach(item => item.disabled = true);


    socket.on('balance-changed', (balance) => {
        socket.balance = balance;

        document.querySelector('#usd').innerText = balance.usd;
        document.querySelector('#facebook').innerText = balance.facebook;
    });

    socket.on('currency-rate', (payload) => {
        buttons.forEach(item => item.disabled = false);

        rates.push(payload);
        chartConfig.data.datasets[0].data = rates.map(row => {
            return {
                x: new Date(row.date),
                y: Number(row.rate)
            };
        });

        myLineChart.update();
    });

    document.querySelector('#buy').addEventListener('click', (e) => {
        e.preventDefault();

        const amount = Number(document.querySelector('#buy-amount').value);
        const rate = rates[rates.length - 1].rate;

        socket.emit('buy', {amount, rate});
        document.querySelector('#buy-amount').value = '';
        document.querySelector('.buy').insertAdjacentHTML('beforeend', `
            <li> 
                ${date} - amount: <b>${amount}</b>;
                price: <b>${rate}\$</b> / per share;
            </li>
        `);
    });

    document.querySelector('#sell').addEventListener('click', (e) => {
        e.preventDefault();

        const amount = Number(document.querySelector('#sell-amount').value);
        const rate = rates[rates.length - 1].rate;

        socket.emit('sell', {amount, rate});
        document.querySelector('#sell-amount').value = '';
        document.querySelector('.sell').insertAdjacentHTML('beforeend', `
            <li> 
                ${date} - amount: <b>${amount}</b>;
                price: <b>${rate}\$</b> / per share;
            </li>
        `);
    })
});
