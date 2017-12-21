# nodejsAmazonShop

## Overview

Sample Web Shop with Amazon Affiliate

## Minimum requirement

- IBM Cloud( http://bluemix.net/ ) account

## Prefered requirement

- Node.js runtime

- Cloudant NoSQL database service

    - https://cloudant.com/

    - Cloudant username & password

- cf cli tool

    - https://github.com/cloudfoundry/cli/releases


## Advanced requirement

- Amazon Associate acount

    - for affilicate enabled.

- Amazon Web Service acount

    - for custom items crawling.

## Simplest web application install

- Login to IBM Cloud at first: http://bluemix.net/

- Folk this repository into yours, if needed.

- Click this button to deploy Node.js application server to IBM Cloud:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/dotnsf/nodejsAmazonShop)

    - Edit application name, if needed, before deployment.

- Create IBM Cloudant NoSQL DB service, and bind it to application.

## Optional Install

- If you have Amazon Associate account tag and/or Amazon Web Service key/secret, edit settings.js with them.

- Deploy application again, or run following command:

- `$ npm install`

## Load sample

- Git clone or Download this repository.

- Login to IBM Cloud, and create IBM Cloudant service instance, if you don't have one yet.

- Check your connection credentials of IBM Cloudant. You need username and password later.

- Edit settings.js with your Cloudant username & password

- Load sample items record again:

`$ node bulkload [items.json.txt]`

    - You can specify input file name.

    - If not, bulkload.js will use items.json.txt.


## How to use web application

- Deploy application into IBM Cloud,

`$ cf login -a https://api.ng.bluemix.net/` (in case you use USA-south region)

`$ cf push appname`

- or You can run application in your environment:

`$ node app`

- or Click this button to deploy to IBM Cloud:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/dotnsf/nodejsAmazonShop)


- Browse your application.

- Enjoy!


## Customize your items

If you don't want to use sample data, you can follow these instructions:

- Open crawl.js, and edit parameter lines:

    - nodes: 

        * crawler will search items with specified category(s).

        * See https://affiliate.amazon.co.jp/gp/associates/help/t100 for details.

    - min_price: 

        * crawler will search items with minimum price with this value.

    - max_price: 

        * crawler will search items with maximum price with this value.

    - max_page: 

        * crawler will repeat same search API this same condition with this value. If max_page == 5, then crawler will find maximum 50(=5x10) items in same category and price range.

    - price_step: 

        * crawler will repeat to search item information with this price step. If price_step == 1000, then crawler will find items with price 0-999(yen), next 1000-1999, 2000-2999, ..., and 99000-99999(if max_price == 100000).

    - If you set larger price_step(ex. 5000), then crawler would finish faster. But it would miss more items in same price level.

- Run following command:

`$ node crawl [items.json.txt]`

    - You can specify output file name.

    - If not, crawl.js will use items.json.txt.

- Load new sample file.

`$ node bulkload [items.json.txt]`

    - You can specify input file name.

    - If not, bulkload.js will use items.json.txt.

## (Option)How to get Amazon Associate ID(tag)

You can affiliate your shop with them. Refer following page:

http://dotnsf.blog.jp/archives/1062052263.html

## (Option)How to get Amazon Product Advertisement API key/secret

You can crawl and collect your prefered items with them. Refer following page:

http://dotnsf.blog.jp/archives/1064227473.html

## Licensing

This code islicensed under MIT.


## Copyright

2017 K.Kimura @ Juge.Me all rights reserved.



