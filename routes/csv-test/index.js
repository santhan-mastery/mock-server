const fs = require('fs')
const path = require("path");

function GET(req, res){
    const fileBuffer = fs.readFileSync(path.join(__dirname, './country.csv'))
    res.type('text/csv').send(fileBuffer)
}

module.exports = {
    GET
}