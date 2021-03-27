const fs = require('fs');
const bestbuy = require('./bestbuy');
const walmart = require('./walmart');
const webhook = require('webhook-discord');

/*
* Main class that represents a generic item
*/
class Item {
    constructor(url) {
        this.url = url;
        this.status = false;
        this.name = null;
        this.price = null;
        this.image = null;
    }

    setInStock(){
        this.status = true;
    }

    setOutOfStock(){
        this.status = false;
    }

    getName(){
        return this.name;
    }

    getPrice(){
        return this.price;
    }
    
    getImage(){
        return this.image;
    }

    async sendWebhook(){
        // need to hide webhook
        const hook = new webhook.Webhook(process.env.WEBHOOK_URL);
        const msg = new webhook.MessageBuilder()
            .setName('STOCK CHECKER')
            .setTitle(this.name)
            .setDescription('IN STOCK')
            .setURL(this.url)
            .setThumbnail(this.image)
            .setFooter('Provided by Tommy')
            .setTime()
            .setColor('#cc00cc');

        await hook.send(msg).catch(err => console.log(err.message));
    }
    
    /**
     * Checks to see if in stock status changed
     * @param {bool} tempStatus 
     */
    checkNewStatus(tempStatus){
        console.log(this.name +'          '+tempStatus);
        // checks to see if status changed and if in stock (represented by true), then sends Webhook
        if(tempStatus != this.status && this.status){
            this.sendWebhook();
        }
        this.status = tempStatus;
    }

}

// child of Item that represents Bestbuy
class BestBuy extends Item{

    constructor(url){
        super(url);
    }
     
    // gets info from Bestbuy website about the item
    async init(){
        await this.setName();
        await this.setPrice();
        await this.setImage();
    }
    // sets name
    async setName(){
        this.name = await bestbuy.getName(this.url);
    }
    // sets price
    async setPrice(){
        this.price = await bestbuy.getPrice(this.url);
    }
    // sets status
    async checkStatus(){
        let tempStatus = await bestbuy.checkStatus(this.url);
        this.checkNewStatus(tempStatus);
    }
    // sets image
    async setImage(){
        this.image = await bestbuy.getImage(this.url);
    }

}

// child of item that represents Walmart
class Walmart extends Item{
    constructor(url){
        super(url);
    }

    // gets info from the Walmart website about the item
    async init(){
        await this.setName();
        await this.setPrice();
        await this.setImage();
    }
    // sets name
    async setName(){
        this.name = await walmart.getName(this.url, this.config);
    }
    // sets price
    async setPrice(){
        this.price = await walmart.getPrice(this.url);
    }
    // sets status
    async checkStatus(){
        let tempStatus = await walmart.checkStatus(this.url);
        this.checkNewStatus(tempStatus);
    }
    // sets image
    async setImage(){
        this.image = await walmart.getImage(this.url);
    }
}

/**
 * Reads in the file line by line and returns an Array of string of that data
 */
function readFile(){
    try{
        const data = fs.readFileSync('config.txt','UTF-8');
        return data.split(',\r\n');

}   catch (err){
        console.error(err);
    }
}

/**
 * Creates the Map of urls and items
 * @param {*} urls: Array of urls from file
 * @return map of items (key: item Name, value: Item object)
 */
async function createSet(urls){
    let items = new Map(); // map of items, key is item name, value is Item object
    for(let  i in urls){
        let site = new URL(urls[i]).hostname; // finds the site
        // if bestbuy
        if(site === 'www.bestbuy.com'){
            let temp = new BestBuy(urls[i]); // creates Bestbuy Object
             await temp.init(); 
            items.set(temp.getName(), temp);
            
        // if walmart
        }else if(site === 'www.walmart.com'){
            let temp = new Walmart(urls[i]); // creates Walmart object
            await temp.init().catch(err => console.error());
            items.set(temp.getName(), temp);
            
        }
    }
    return items; // returns map
}
/**
 * checks status of items
 * @param {*} items Map of items
 * @return null
 */
async function checkAllStatus(items){
    // infinite loops that repeatedly checks to see if the item is instock
    while(true){
        for(let [key,value] of items){
            await value.checkStatus();
        }
        await sleep(5000);
    }

}
/**
 * sleeps for a certain amount of time
 * @param ms: time in ms
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

/* temp urls for testing
let url1 = 'https://www.bestbuy.com/site/razer-blackwidow-v3-pro-wireless-mechanical-gaming-keyboard-black/6425357.p?skuId=6425357';
let url2 = 'https://www.walmart.com/ip/John-Wick-Blu-ray-DVD/40712445';
*/

// main function
(async () =>{

    /*
    let bestbuyTest = new BestBuy(url1);
    await bestbuyTest.init();
    bestbuyTest.checkStatus(bestbuyTest.url);
    
    let walmartTest = new Walmart(url2);
    await walmartTest.init();
    console.log(walmartTest);
    */

    // reads the the config file and gets an Array of urls
    const urls = readFile();

    // creates set of items
    const items = await createSet(urls).catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });

    // calls method that loops and repeatedly checks to see if the item is in stock
    checkAllStatus(items);

})();


/*
 RUNNING INTO CAPTCHA ON WALMART FOR SOME reASON
*/