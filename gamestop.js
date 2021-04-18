/**
 * Gamestop module uses Puppeteer to get the site and then cheerio to parse html to find info about item
 */

const cheerio = require('cheerio');
const { Puppeteer } = require('puppeteer');
const pptrFirefox = require('puppeteer-firefox');
const { Browser } = require('puppeteer-firefox/lib/api');

/**
 * Checks to see if the item is instock or not
 * @param {String} url 
 * @param {puppeteer-firefox} page
 * @return boolean: true instock or false in stock 
 */
async function checkStatus(url, page){
    
    try{
        await page.goto(url);
        const content = await page.content();
        $ = cheerio.load(content);
        let temp = $('[class="add-to-cart-buttons tulsa-atcbutton-toggle"]').find("button").text();
        let status = temp === 'Add to CartAdd to Cart' || temp === 'Pre-OrderPre-Order';
        return status;
    }catch (error){
        throw error;
    }
} 

async function getBrowser(){
    return await pptrFirefox.launch();
}

/**
 * Gets the name of the item
 * @param {String} url 
 * @param {puppeteer-firefox} page 
 * @returns String: name of the product
 */
async function getName(url, page){
    await page.goto(url);
    const content = await page.content();
    $ = cheerio.load(content);
    let name = $('#primary-details').find('h2').text();
    return name;
}

/**
 * Gets the price of the item
 * @param {String} url 
 * @param {puppeteer-firefox} page 
 * @returns String: price of the item
 */
async function getPrice(url, page){
    await page.goto(url);
    const content = await page.content();
    $ = cheerio.load(content);
    let price = $('[class="prices has-condition"]').find('[class="actual-price null"]').text();
    return price.trim().substring(1);
}

/**
 * Gets the url of the image of the item
 * @param {String} url 
 * @returns String: url of the image
 */
function getImage(url){
    let img = 'https://media.gamestop.com/i/gamestop/';
    let temp = url.split('/');
    temp = temp[temp.length-1].split('.')[0];
    return img + temp;
}

module.exports = {getName, getPrice, checkStatus, getImage, getBrowser};