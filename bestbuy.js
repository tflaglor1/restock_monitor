/**
 * Bestbuy module gets info about product and checks in stock using requests through axios and then uses cheerio to parse html
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * checks the status of the item to see if in stock
 * @param {Item} url 
 */
async function checkStatus(url){
    const response = await axios.default.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // old way const status = $('.fulfillment-add-to-cart-button').children('div').children().children().text();

    const status = $('.fulfillment-add-to-cart-button').find('button').text();
    return (status.length>8 ? true: false);    // length of 8 is the length of 'Sold Out'
}

/**
 * Gets the name of the item
 * @param {URL} url 
 */
async function getName(url){
    const response = await axios.default.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const name = $('.sku-title').children('h1').text();
    return name;
}

/*
 * Gets the price of the item
 * @param {URL} url 
 */
async function getPrice(url){
    const response = await axios.default.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    let price = $('.pricing-price').find('[aria-hidden="true"]').html();
    if(price.charAt(0) != '$'){
        return null;
    }
    else{
        return price.substring(1);
    }
}

/**
 * Gets the image of the item
 * @param {URL} url 
 */
async function getImage(url){
    const response = await axios.default.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    let image = $('.primary-image').attr('src');
    return image
}

module.exports = {getName, getPrice, checkStatus, getImage};