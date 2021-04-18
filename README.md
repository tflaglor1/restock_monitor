# restock_monitor
## Notes
Currently the BestBuy module works fully and Gamestop module which are the only suggested sites to use.
Walmart gets blocked by captcha quickly so it's not recommended. Discord webhooks are only sent if the item was previously out of stock and then went back in stock.
## Setup Instructions
Create a `.env` file with:

	WEBHOOK_URL=''

With the proper Discord Webhook URL

In the `config.txt` file you add the urls to links you want to monitor:

	random_url
	random_url2

Must have one url per line, and you can add as much as you want