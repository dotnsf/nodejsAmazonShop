//. crawl.js

var wait = 2000000;   //. ウェイト（マイクロ秒）
var outputfilename = 'items.json.txt';

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
    for( var i = 0; i < 100000; i += 1000 ){ //. １カテゴリで上限10万円まで調べる
      sleep.usleep( wait );
      getCodesAmazonNodeMinMax( node, i, i + 999 );
    }
    resolve( 0 );
  });
}

function getCodesAmazonNodeMinMax( node, min, max ){
  return new Promise( function( resolve, reject ){
    //. Page 1
    console.log( 'node = ' + node + ' : min = ' + min + ', max = ' + max + ', page = 1 ' );
    getItemSearchAmazonAPI( node, min, max, 0 ).then( function( totalpages ){
      console.log( ' totalpages = ' + totalpages );
      if( totalpages < 11 || max - min == 9 ){
        if( totalpages > 1 ){
          //. Page 2+
          var m = ( totalpages > 10 ) ? 10 : totalpages;
          for( var p = 2; p <= m; p ++ ){
            sleep.usleep( wait );
            console.log( 'node = ' + node + ' : min = ' + min + ', max = ' + max + ', page = ' + p + ' / ' + totalpages );
            getItemSearchAmazonAPI( node, min, max, p ).then( function( tp ){
              if( p == m ){
                resolve( totalpages );
              }
            });
          }
        }else{
          resolve( totalpages );
        }
      }else{
        //. Page 1+
        if( max - min == 999 ){
          for( var i = min; i < max; i += 100 ){
            sleep.usleep( wait );
            getCodesAmazonNodeMinMax( node, i, i + 99 );
          }
        }else if( max - min == 99 ){
          for( var i = min; i < max; i += 10 ){
            sleep.usleep( wait );
            getCodesAmazonNodeMinMax( node, i, i + 9 );
          }
        }else{
          for( var i = min; i < max; i ++ ){
            sleep.usleep( wait );
            getCodesAmazonNodeMinMax( node, i, i );
          }
        }
        resolve( 0 );
      }
    });
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
      console.log( err );
      resolve( 0 );
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


//. メイン
if( settings.nodes ){
  if( isExistFile( outputfilename ) ){
    fs.writeFileSync( outputfilename, "" );
  }

  for( var i = 0; i < settings.nodes.length; i ++ ){
    sleep.usleep( wait );
    var node = settings.nodes[i];
    getCodesFromAmazonAPI( node );
  }
}





