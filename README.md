# restock_monitor
## Notes
Currently the BestBuy module works fully and is the only suggested site to use.
Walmart ges blocked by captcha quickly so not recommend, and Gamestop is super slow.
## Setup Instructions
Create a `.env` file with:

	WEBHOOK_URL=''

With the proper Discord Webhook URL

In the `config.txt` file you add the urls to links you want to monitor:

	random_url,

Must have comma after if multiple, then enter to next line. The final line does not need a comma