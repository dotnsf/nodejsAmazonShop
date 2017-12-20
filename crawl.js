//. crawl.js

const wait = 3000000;      //. ウェイト（マイクロ秒）
const min_price = 0;       //. 下限この額までの商品を検索する
const max_price = 100000;  //. 上限この額までの商品を検索する
const max_page = 5;        //. 上限このページまでの商品を検索する
const price_step = 1000;   //. この額刻みで商品を検索する
const outputfilename = 'items.json.txt';

/* 最後にこのエラー
<?xml version="1.0"?>
<ItemSearchErrorResponse xmlns="http://ecs.amazonaws.com/doc/2009-01-06/"><Error><Code>RequestThrottled</Code><Message>AWS Access Key ID: AKIAJM3XACYDDRGTGZXQ. You are submitting requests too quickly. Please retry your requests at a slower rate.</Message></Error><RequestID>d092794d-6ac4-4435-b4a9-06486162eef2</RequestID></ItemSearchErrorResponse>
 */

//. Cloudant REST APIs
//. https://console.bluemix.net/docs/services/Cloudant/api/database.html#databases

//. npm cloudant
//. https://www.npmjs.com/package/cloudant

var cloudantlib = require( 'cloudant' ),
    crypto = require( 'crypto' ),
    fs = require( 'fs' ),
    request = require( 'sync-request' ),
    sleep = require( 'sleep' ),
    urlencode = require( 'urlencode' ),
    xml2js = require( 'xml2js-parser' );
var settings = require( './settings' );
var cloudant = cloudantlib( { account: settings.cloudant_username, password: settings.cloudant_password } );


function getCodesFromAmazonAPI( node ){
  return new Promise( function( resolve, reject ){
    getCodesWalkThrough( node, min_price, price_step - 1, max_price );
    resolve( 0 );
  });
}

function getCodesWalkThrough( node, min, max, ceil ){
//  return new Promise( function( resolve, reject ){
    if( max < ceil ){
      getCodesAmazonNodeMinMax( node, min, max ).then( function( x ){
        var diff = max - min + 1;
        getCodesWalkThrough( node, min + diff, max + diff, ceil );
//        resolve( 0 );
      });
    }else{
//      resolve( 0 );
    }
//  });
}


function getCodesAmazonNodeMinMaxWalkThrough( node, min, max, page, maxpage ){
//  return new Promise( function( resolve, reject ){
    if( page <= maxpage ){
      sleep.usleep( wait );
      console.log( 'node = ' + node + ' : min = ' + min + ', max = ' + max + ', page = ' + page );
      getItemSearchAmazonAPI( node, min, max, page ).then( function( totalpage ){
        if( page < totalpage && page < maxpage ){
          getCodesAmazonNodeMinMaxWalkThrough( node, min, max, page + 1, maxpage );
        }
//        resolve( 0 );
      });
    }else{
//      resolve( 0 );
    }
//  });
}

function getCodesAmazonNodeMinMax( node, min, max ){
  return new Promise( function( resolve, reject ){
    getCodesAmazonNodeMinMaxWalkThrough( node, min, max, 1, max_page );
    resolve( 0 );
  });
}

//. https://github.com/dotnsf/phpAmazonShop/blob/master/crawler/common.php
function getItemSearchAmazonAPI( node, min, max, page ){
  return new Promise( function( resolve, reject ){
    var request_url = 'http://ecs.amazonaws.jp/onca/xml?';
    var local_dt = new Date();
    var dt = local_dt.toISOString();
//    var n = dt.indexOf( '.' );
//    if( n > -1 ){
//      dt = dt.substring( 0, n ) + 'Z';  //. "Y-m-d\TH:i:s\Z"
//    }

    var params = "AWSAccessKeyId=" + settings.aws_key + "&AssociateTag=" + settings.aws_tag + "&BrowseNode=" + node;
    if( page > 0 ){
      params += ( "&ItemPage=" + page );
    }
    params += ( "&MaximumPrice=" + max + "&MinimumPrice=" + min + "&Operation=ItemSearch&ResponseGroup=ItemAttributes%2CSmall%2CImages&SearchIndex=Beauty&Service=AWSECommerceService&Timestamp=" + urlencode( dt ) + "&Version=2009-01-06" );

    var str = 'GET\necs.amazonaws.jp\n/onca/xml\n' + params;

    var hash = crypto.createHmac( 'sha256', settings.aws_secret );
    hash.update( str );
    var hashed_str = hash.digest( 'base64' );
    
    request_url += ( params + '&Signature=' + urlencode( hashed_str ) );

    var options = {
      url: request_url,
      headers: {
        'User-Agent': 'XXXX (Linux)',
        'Host': 'ecs.amazonaws.jp'
      },
      method: 'GET'
    };

    var response = request( 'GET', request_url );
    var body = response.getBody();

    try{
      var xml = xml2js.parseStringSync( body );

      if( xml && xml.ItemSearchResponse && xml.ItemSearchResponse.Items ){
        var Items = xml.ItemSearchResponse.Items[0];
        var totalpages = Items.TotalPages[0];
        if( Items.Item && Items.Item.length ){
          for( var idx = 0; idx < Items.Item.length; idx ++ ){
            var Item = Items.Item[idx];
            var image_url = '';
            var manufacturer = '';
            var brand = '';
            var title = '';
            var listprice = '';
            var ean = '';
            var asin = '';

            try{
              image_url = Item.MediumImage[0].URL[0];
            }catch(e){
            }
            try{
              manufacturer = Item.ItemAttributes[0].Manufacturer[0];
            }catch(e){
            }
            try{
              brand = Item.ItemAttributes[0].Brand[0];
            }catch(e){
            }
            try{
              title = Item.ItemAttributes[0].Title[0];
            }catch(e){
            }
            try{
              listprice = Item.ItemAttributes[0].ListPrice[0].Amount[0];
            }catch(e){
            }
            try{
              ean = Item.ItemAttributes[0].EAN[0];
            }catch(e){
            }
            try{
              asin = Item.ASIN[0];
            }catch(e){
            }
 
            if( listprice == '' ){
              listprice = 0;
            }

            if( asin ){
              var item = { asin: asin };
              if( ean ){ item['code'] = ean; }
              if( title ){ item['name'] = title; }
              if( listprice ){ item['price'] = listprice; }
              if( brand ){ item['brand'] = brand; }
              if( manufacturer ){ item['maker'] = manufacturer; }
              if( image_url ){ item['image_url'] = image_url; }

              var line = JSON.stringify( item, 2, null );
              console.log( line );

              fs.appendFileSync( outputfilename, line + "\n" );
            }
          }

          resolve( totalpages );
        }else{
          resolve( 0 );
        }
      }else{
          resolve( 0 );
      }
    }catch( err ){
      //console.log( err ); //. エラーはここ？
      resolve( -1 );
    }
  });  //. Promise
}

function isExistFile( file ){
  try{
    fs.statSync( file );
    return true;
  }catch( err ){
    return false;
  }
}

function nodeWalkThrough( idx ){
  if( settings.nodes.length > idx ){
    var node = settings.nodes[idx];
    getCodesFromAmazonAPI( node ).then( function( x ){
      nodeWalkThrough( idx + 1 );
    });
  }
}

//. メイン
if( settings.nodes ){
  if( isExistFile( outputfilename ) ){
    fs.writeFileSync( outputfilename, "" );
  }

  if( settings.nodes.length > 0 ){
    nodeWalkThrough( 0 );
  }
}





