const sources = [
    '4sesim',
    'airalo',
    'alosim',
    'esimx',
    'flexiroam',
    'gigsky',
    'holafly',
    'instabridge',
    'jambosim',
    'jetpac',
    'maya',
    'nomad',
    'roamic',
    'saily',
    'truphone',
    'ubigi',
    'yatelo',
    'yesim',
];

const totalProducts = document.getElementById('total-products');
const totalOver100 = document.getElementById('total-over-100');
const minPrice = document.getElementById('min-price');
const maxPrice = document.getElementById('max-price');
const averageGo = document.getElementById('average-go');
const averagePrice = document.getElementById('average-price');
const providersChart = document.getElementById('providers-chart');
const providersList = document.getElementById('providers-list');

let totalGo = 0;
let totalPrice = 0;

const providers = [];
const providersData = {};

function update(entry) {
    const total = parseInt(totalProducts.textContent) + 1;
    totalProducts.textContent = total;
    if (entry.price !== '') {
        const price = parseFloat(entry.price);
        if (price > 100)
            totalOver100.textContent = parseFloat(totalOver100.textContent) + 1;
        const min = parseFloat(minPrice.textContent);
        if (min === 0 || price < min)
            minPrice.textContent = price;
        const max = parseFloat(maxPrice.textContent);
        if (price > max)
            maxPrice.textContent = price;
        totalPrice += price;
        averagePrice.textContent = Math.round(totalPrice / total * 100) / 100;
    }
    if (entry.data_gb !== '') {
        totalGo += parseFloat(entry.data_gb);
        averageGo.textContent = Math.round(totalGo / total * 100) / 100;
    }
    if (entry.provider !== '') {
        if (!providers.includes(entry.provider)) {
            providers.push(entry.provider);
            providersData[entry.provider] = { n: 1 };
            const base = Math.ceil(providers.length ** (1 / 3));
            for (let i = 0; i < providers.length; i++) {
                const r = parseInt(255 / (base - 1) * (i % base));
                const b = parseInt(255 / (base - 1) * (Math.floor(i / base) % base));
                const g = parseInt(255 / (base - 1) * (Math.floor(i / base / base)));
                providersData[providers[i]].color = `rgb(${r}, ${g}, ${b})`;
            }
        } else {
            providersData[entry.provider].n++;
        }
        let order = [];
        let background = 'conic-gradient(';
        let percent = 0;
        for (let i = 0; i < providers.length; i++) {
            if (i > 0)
                background += ', ';
            background += providersData[providers[i]].color + ' ' + (percent * 100) + '% ';
            percent += providersData[providers[i]].n / total;
            background += (percent * 100) + '%';
            let j = 0;
            while (j < order.length && providersData[providers[i]].n / total < providersData[order[j]].n / total)
                j++;
            order = [...order.slice(0, j), providers[i], ...order.slice(j)];
        }
        background += ')';
        providersChart.style.backgroundImage = background;
        providersList.innerHTML = '';
        for (const provider of order) {
            const li = document.createElement('li');
            li.innerHTML = `
                <div></div>
                <span>${parseInt(providersData[provider].n / total * 10000) / 100}%</span>
                <span>${provider}</span>
                <span>(${providersData[provider].n})</span>
            `;
            li.firstElementChild.style.backgroundColor = providersData[provider].color;
            providersList.append(li);
        }
    }
}

for (const source of sources) {
    fetch(`data/${source}.csv`)
        .then(response => response.text())
        .then(response => {
            const lines = response.split('\n');
            const columns = lines.shift().split(',');
            for (const line of lines) {
                if (line === '')
                    continue;
                data = line.split(',');
                if (data.length !== columns.length)
                    continue;
                const entry = {};
                for (let i = 0; i < columns.length; i++)
                    entry[columns[i]] = data[i];
                update(entry);
            }
        })
        .catch(() => console.error(`Error: failed to fetch data for source '${source}'`));
}
