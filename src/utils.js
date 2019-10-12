const valueExists = (jsObj, value) => {
    for (let key in jsObj){
        if (jsObj[key] === value) {
            return true;
        }
    }
    return false;
};

const rewriteAllLinks = (json, url) => {
    let rewrittenLinks = [];
    let index = 0;
    json.map( (i, link) => {
        link = rewriteLink(link, url);
        if (link && !valueExists(rewrittenLinks, link)) {
            rewrittenLinks[index] = link;
            index++;
        }
    });
    return rewrittenLinks;
};

const rewriteLink = (link, url) => {
    url = new URL(url);
    //remove parameters
    if (link) {
        link = link.replace('www.','');
        if (link.charAt(0) !== '#') {
            if (link.charAt(0) === '/') {
                link = url.protocol + '//' + url.host + link
            } else if (link.substring(0, 4) !== 'http') {
                link = url.protocol + '//' + url.host + '/' + link
            }
            return link
        }
    } else {
        return null
    }
};

const validUrl = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(url)
};

const stripTrailingSlash = (str) => {
    if(str && str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
};

const validBoolean = (boolean) => {
    return boolean === true || boolean === false;
};

module.exports = {
    rewriteAllLinks: rewriteAllLinks,
    rewriteLink: rewriteLink,
    validUrl: validUrl,
    stripTrailingSlash: stripTrailingSlash,
    validBoolean: validBoolean
};
