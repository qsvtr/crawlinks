const scraping = require('./src/scraping');
const yargs = require("yargs");
const utils = require('./src/utils');

const options = yargs
    .usage('Usage: nodejs $0 --url [url] --verbose [true/false] --output [true/false]')
    .demandOption(['url'])
    .help('h').alias('h', 'help')
    .alias('u', 'url').describe('u', 'format: https://example.com')
    .alias('o', 'output').describe('o','save in ./output/ folder, by default [true]').boolean('o')
    .alias('v', 'verbose').describe('v','display the console, by default [true]').boolean('v')
    .alias('m', 'maximum').describe('n','max of links crawled, by default 500')
    .epilog('@qsvtr 2019 - https://quentin-sauvetre.fr')
    .argv;

if (utils.validUrl(options.url)) {
    scraping.startCrawling(options.url, options.verbose, options.output, options.maximum);
} else {
    console.error('Invalid url, please use the good format: https://example.com')
}
