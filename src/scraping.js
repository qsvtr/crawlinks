global.fetch = require("node-fetch");
const wretch = require('wretch');
const cheerio = require('cheerio');
const fs = require('fs');
const Utils = require('./utils');
const chalk = require('chalk');

let numPagesVisited = 0;
const pagesToVisit = [];
const pagesVisited = {};
const config = {};

const startCrawling = (url, verbose = true, output = true, maxNumberPages = 500) => {
    config.verbose = verbose;
    config.output = output;
    config.max_pages_visit = maxNumberPages;
    url = new URL(url);
    pagesVisited['domain'] = url.href;
    pagesVisited['date'] = new Date();
    pagesVisited['links'] = {statistics: {}, internal: {}, external: {}};
    pagesToVisit.push(url.href);
    crawl();
};

const crawl =() =>{
    const reachedMax = numPagesVisited >= config.max_pages_visit;

    const nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited.links.internal || nextPage in pagesVisited.links.external) {
        crawl();
    } else if (nextPage) {
        visitPage(nextPage, crawl);
    } else {
        end()
    }
    if (reachedMax) {
        end();
        process.exit(0);
    }
};

const visitPage = (url, callback) => {
    url = new URL(url);
    const domain = new URL(pagesVisited.domain);
    if (url.host === domain.host) {
        numPagesVisited++;
        wretch(url)
            .get()
            .notFound(error => {
                if (config.output) {
                    console.error('>', url.href, chalk.red(error.response.status));
                }
                callback()
            })
            .unauthorized(error => {
                if (config.output) {
                    console.error('>', url.href, chalk.red(error.response.status));
                }
                callback()
            })
            .internalError(error => {
                if (config.output) {
                    console.error('>', url.href, chalk.red(error.response.status));
                }
                callback()
            })
            .text(html =>  {
                if (config.output) {
                    console.log('>', url.href, chalk.blue(200));
                }
                pagesVisited.links.internal[url.href] = 200;
                const $ = cheerio.load(html);
                const links = $('a').map( (i, element) => $(element).attr('href'));
                const rewriteLinks = Utils.rewriteAllLinks(links, url);
                rewriteLinks.forEach(link => {
                    pagesToVisit.push(link);
                });
                callback();
            })
            .catch(error => {
                console.error(chalk.red('>', error.message));
                callback();
            })
    } else {
        pagesVisited.links.external[url.href] = 200;
        if (config.output) {
            console.log('>', url.href, chalk.blue(200));
        }
        callback();
    }
};

const end = () => {
    const directory = './output/';
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }
    const domain = new URL(pagesVisited['domain']);
    pagesVisited.links.statistics['nbInternalLinks'] = Object.keys(pagesVisited.links.internal).length;
    pagesVisited.links.statistics['nbExternalLinks'] = Object.keys(pagesVisited.links.external).length;
    if (config.output) console.log(chalk.green('###############################################'));
    console.log(chalk.green('Done with', pagesVisited.links.statistics['nbInternalLinks'], 'internal links and', pagesVisited.links.statistics['nbExternalLinks'], 'external links'));
    if (config.output && (pagesVisited.links.statistics['nbInternalLinks'] > 0 || pagesVisited.links.statistics['nbExternalLinks'] > 0)) {
        fs.writeFileSync('output/' + domain.host + '.json', JSON.stringify(pagesVisited, null, 1), 'utf-8');
        console.log(chalk.green(`Save in ./output/${domain.host}.json`));
    }
};

module.exports = {
    startCrawling: startCrawling
};
