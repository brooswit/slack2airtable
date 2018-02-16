var Airtable = require('airtable');

var base = new Airtable({apiKey: 'keyEXB5LaC0ty1DEx'}).base('app4DDAvWKFmHSPI0');

base('Table 1').create({}, function(err, record) {
    if (err) { console.error(err); return; }
    console.log(record.getId());
});
