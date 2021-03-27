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

// test urls
//let url = 'https://www.bestbuy.com/site/razer-blackwidow-v3-pro-wireless-mechanical-gaming-keyboard-black/6425357.p?skuId=6425357';
//let url = 'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149';
//let url = 'https://www.bestbuy.com/site/nvidia-geforce-rtx-3060-ti-8gb-gddr6-pci-express-4-0-graphics-card-steel-and-black/6439402.p?skuId=6439402';

/* test main function
(async () =>{
    console.log( await getPrice(url));
})(); 
*/


module.exports = {getName, getPrice, checkStatus, getImage};