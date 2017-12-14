# nodejsAmazonShop

## Overview

Sample Web Shop with Amazon Affiliate

## Minimum requirement

- IBM Cloud( http://bluemix.net/ ) account

    - Node.js runtime

    - Cloudant NoSQL database service

        - Cloudant username & password

    - cf tool need to be installed

        - https://github.com/cloudfoundry/cli/releases


## Prefered requirement

- Amazon Associate acount

- Amazon Web Serivice acount

## Install

- Edit settings.js with your Cloudant username & password

- (Option)If you have Amazon Associate account tag and/or Amazon Web Service key/secret, edit settings.js with them.

- `$ npm install`

## Load sample

- Load sample items record:

`$ node bulkload`


## How to use web application

- Deploy application into IBM Cloud,

`$ cf login -a https://api.ng.bluemix.net/` (in case you use USA region)

`$ cf push appname`

- or You can run application in your environment:

`$ node app`

- Browse your application.

- Enjoy!


## Customize your items

** Not implemented yet. **

<!--

If you don't want to use sample data, you can follow these instructions:

- Edit setttings.js, and edit prefered nodes from here: https://affiliate.amazon.co.jp/gp/associates/help/t100

- Run following command:

`$ node crawl`

- Load new sample file.

`$ node bulkload`

-->

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



