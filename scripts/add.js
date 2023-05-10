const axios = require('axios'),
    ens = process.argv[2];

async function main() {
    if (!ens) throw new Error('Missing argument: ens');
    const response = await axios.post('http://localhost:8080/add', { ens });
    console.log(response.data);
    return response.data;
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
