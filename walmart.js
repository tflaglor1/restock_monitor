const axios = require('axios');
const cheerio = require('cheerio');

/**
 * currently this doesn't work well. Walmart tends to block requests and counter with captchas
 * The next move is implementing PhantomJS to try and overcome this problem
 */

// supplies the headers so Walmart doesn't block, headers may be out of date
const config ={
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        }
};

/**
 * Checks the status of the item to see if instock
 * @param {URL} url 
 * @return boolean
 */
async function checkStatus(url){
    const response = await axios.default.get(url,config)
    // if error it dislays the status
    .catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const status = $('#add-on-atc-container').find('button').children().html();
    return (status == 'Add to cart'? true: false);
}

/**
 * gets the name of the product
 * @param {URL} url 
 * @return String name
 */
async function getName(url){
    const response = await axios.default.get(url, config)
    // if error it dislays the status
    .catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const name = $('#product-overview').find('h1').text();
    return name;
}

/**
 * gets the price of the item
 * @param {URL} url 
 */
async function getPrice(url){
    const response = await axios.default.get(url, config)
    // if error it dislays the status
    .catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const price = $('.prod-PriceHero').find('.visuallyhidden').html();
    return price.substring(1);
}

/**
 * gets the image of the item
 * @param {URL} url 
 */
async function getImage(url){
    const response = await axios.default.get(url, config)
    // if error it dislays the status
    .catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const image = $('.prod-hero-image').find('img').attr('src');
    return 'https:'+image;
}

// test urls
//let url = 'https://www.walmart.com/ip/John-Wick-Blu-ray-DVD/40712445';
//let url = 'https://www.walmart.com/ip/2020-Panini-Prizm-NFL-Football-Trading-Cards-Hanger-Box-Feat-Rookies-Tua-Tagovailoa-Justin-Herbert-Joe-Burrow-20-Cards/155846463?selected=true';

/* test main method
(async () =>{
    console.log( await getName(url));
})();
*/



module.exports = {getName, getPrice, checkStatus, getImage};