//. crawl.js


//. Cloudant REST APIs
//. https://console.bluemix.net/docs/services/Cloudant/api/database.html#databases

//. npm cloudant
//. https://www.npmjs.com/package/cloudant

//. References
//. http://www.atmarkit.co.jp/ait/articles/0910/26/news097.html

var cloudantlib = require( 'cloudant' ),
    fs = require( 'fs' ),
    request = require( 'request' ),
var settings = require( './settings' );
var cloudant = cloudantlib( { account: settings.cloudant_username, password: settings.cloudant_password } );


function getCodesFromAmazonAPI( node ){
  for( var i = 0; i < 100000; i += 1000 ){
    getCodesAmazonNodeMinMax( $node, i, i + 999 );
  }
}

function getCodesFromAmazonNodeMinMax( node, min, max ){
  //. Page 1
  setTimeout( function(){
    var totalpages = getItemSearchAmazonAPI( node, min, max );
    if( totalpages < 11 || max - min == 9 ){
      if( totalpages > 1 ){
        //. Page 2+
        var m = ( totalpages > 10 ) ? 10 : totalpages;
        for( var p = 2; p < m; p ++ ){
          setTimeout( function(){
            getItemSearchAmazonAPI( node, min, max, p );
          }, 1300 );
        }
      }
    }else{
      //. Page 1+
      if( max - min == 999 ){
        for( var i = min; i < max; i += 100 ){
          getCodesAmazonNodeMinMax( node, i, i + 99 );
        }
      }else if( max - min == 99 ){
        for( var i = min; i < max; i += 10 ){
          getCodesAmazonNodeMinMax( node, i, i + 9 );
        }
      }else{
        for( var i = min; i <= max; i ++ ){
          getCodesAmazonNodeMinMax( node, i, i );
        }
      }
    }
  }, 1300 );
}


//. DB追加
cloudant.db.get( settings.cloudant_db, function( err, body ){
  if( err ){
    if( err.statusCode == 404 ){
      cloudant.db.create( settings.cloudant_db, function( err, body ){
        if( err ){
          db = null;
        }else{
          db = cloudant.db.use( settings.cloudant_db );
        }
      });
    }else{
      db = null;
    }
  }else{
    db = cloudant.db.use( settings.cloudant_db );
  }
});


if( settings.nodes ){
  for( var i = 0; i < settings.nodes.length; i ++ ){
    var node = settings.nodes[i];
    getCodesFromAmazonAPI( node );
  }
}


function getCodesFromAmazonAPI( node ){
  for( var i = 0; i < 100000; i += 1000 ){ //. １カテゴリで上限10万円まで調べる
    getCodesAmazonNodeMinMax( node, i, i + 999 );
  }
}

function getCodesAmazonNodeMinMax( node, min, max ){
  getItemSearchAmazonAPIms( node, min, max, 1300 );
}

function getItemSearchAmazonAPIms( node, min, max, ms ){
  //. Page 1
  setTimeout( function(){
    console.log( 'node = ' + node + ' : min = ' + min + ', max = ' + max + ', page = 1 ' );
    var totalpages = getItemSearchAmazonAPI( node, min, max, 0 );
    if( totalpages < 11 || max - min == 9 ){
      if( totalpages > 1 ){
        //. Page 2+
        var m = ( totalpages > 10 ) ? 10 : totalpages;
        for( var p = 2; p <= m; p ++ ){
          setTimeout( function(){
            console.log( 'node = ' + node + ' : min = ' + min + ', max = ' + max + ', page = ' + p + ' / ' + totalpages );
            getItemSearchAmazonAPI( node, min, max, p );
          }, ms );
        }
    }else{
      //. Page 1+
      if( max - min == 999 ){
        for( var i = min; i < max; i += 100 ){
          getCodesAmazonNodeMinMax( node, i, i + 99 );
        }
      }else if( max - min == 99 ){
        for( var i = min; i < max; i += 10 ){
          getCodesAmazonNodeMinMax( node, i, i + 9 );
        }
      }else{
        for( var i = min; i < max; i ++ ){
          getCodesAmazonNodeMinMax( node, i, i );
        }
      }
    }
  }, ms );

  return totalpages;
}

//. https://github.com/dotnsf/phpAmazonShop/blob/master/crawler/common.php
function getItemSearchAmazonAPI( node, min, max, page ){
  return new Promise( function( resolve ){
    var totalpages = 0;
    var request_url = 'http://ecs.amazonaws.jp/onca/xml?';
    var timestamp = 
    
  });
}




