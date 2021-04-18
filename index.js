const fs = require('fs');
const bestbuy = require('./bestbuy');
const walmart = require('./walmart');
const gamestop = require('./gamestop');
const webhook = require('webhook-discord');
const { Puppeteer } = require('puppeteer');
const pptrFirefox = require('puppeteer-firefox');
const { error } = require('console');
require('dotenv').config();

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
     * Checks to see if stock status changed
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

/**
 * child of Item that represents Bestbuy
 */
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

/**
 * child of item that represents Walmart
 */
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
 * child of Item that represents Gamestop
 */
class Gamestop extends Item{
    constructor(url){
        super(url);
        this.browser;
        this.page;
    }

    // initializes the object name, price, and image
    async init(){
        try{
            this.browser = await pptrFirefox.launch();
            this.page = await this.browser.newPage();
            await this.setName(this.page);
            await this.setPrice(this.page);
            await this.setImage();
        }catch{
            throw error;
        }
    }
    // sets name
    async setName(temp_page){
        this.name = await gamestop.getName(this.url, temp_page);
    }
    // sets price
    async setPrice(temp_page){
        this.price = await gamestop.getPrice(this.url, temp_page);
    }
    // sets image
    async setImage(){
        this.image = gamestop.getImage(this.url);
    }
    // checks if in stock or not
    async checkStatus(temp_page){
        try{
            let tempStatus = await gamestop.checkStatus(this.url, temp_page);
            this.checkNewStatus(tempStatus); // checks if status changed
        }catch (error){
            throw error;
        }
    }

}

/**
 * Reads in the file line by line and returns an Array of string of that data
 */
function readFile(){
    try{
        const data = fs.readFileSync('config.txt','UTF-8');
        return data.split("\n"); // fixed byb changing from ",\r\n"

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
    const items = new Map(); // map of items, key is item name, value is Item object
    for(let  i in urls){
        let site = new URL(urls[i]).hostname; // finds the site
        
        // if bestbuy
        if(site === 'www.bestbuy.com'){
            console.log("ligma");
            let temp = new BestBuy(urls[i]); // creates Bestbuy Object
            await temp.init().catch(err => console.error(err)); 
            items.set(temp.getName(), temp);
        // if walmart
        }else if(site === 'www.walmart.com'){
            let temp = new Walmart(urls[i]); // creates Walmart object
            await temp.init().catch(err => console.error());
            items.set(temp.getName(), temp);
        
        // if gamestop
        }else if(site === 'www.gamestop.com'){
            let temp = new Gamestop(urls[i]); // creates Gamestop object
            await temp.init().catch(err=> console.error(err));
            items.set(temp.getName(), temp);
        }

        console.log("Initialized: "+temp.getName());
    }

    for(let value of Object.values(items)){
        console.log(value);
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
    browser = await pptrFirefox.launch();
    const page = await browser.newPage();
    while(true){
        for(let value of Object.values(items)){
            if( value instanceof Gamestop){ 
                await value.checkStatus(page);
                value.sendWebhook();
            }else{
                await value.checkStatus();
                value.sendWebhook();
            }
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

// main function
(async () =>{

    // reads the the config file and gets an Array of urls
    const urls = readFile();
    
    
    // creates set of items
    const items = await createSet(urls).catch(function (error){
        if(error.response){
            console.log("ERROR STATUS: "+error.response.status);
        }
    });

    if(items === undefined){
        console.log("undefined");
        return process.exit(0);
    }

    //debugging

    // calls method that loops and repeatedly checks to see if the item is in stock
    try{
        checkAllStatus(items);
    }catch (error){
        console.error(error);
        return process.exit(0);
    }finally{
        for(let value of Object.values(items)){
            
            if(value instanceof Gamestop){
                await value.browser.close();
            }
        }
    }

})();