//. app.js


//. Cloudant REST APIs
//. https://console.bluemix.net/docs/services/Cloudant/api/database.html#databases

//. npm cloudant
//. https://www.npmjs.com/package/cloudant

//. References
//. http://www.atmarkit.co.jp/ait/articles/0910/26/news097.html

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    cloudantlib = require( 'cloudant' ),
    multer = require( 'multer' ),
    basicAuth = require( 'basic-auth-connect' ),
    bodyParser = require( 'body-parser' ),
    ejs = require( 'ejs' ),
    fs = require( 'fs' ),
    request = require( 'request' ),
    app = express();
var settings = require( './settings' );
var cloudant = cloudantlib( { account: settings.cloudant_username, password: settings.cloudant_password } );
var appEnv = cfenv.getAppEnv();

app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.json( { limit: '10mb' } ) );
app.use( express.static( __dirname + '/public' ) );
//app.use( cors() );

if( settings.basic_username && settings.basic_password ){
  app.all( '*', basicAuth( function( user, pass ){
    return( user === settings.basic_username && pass === settings.basic_password );
  }));
}

var port = appEnv.port || 3000;

/*
app.get( '/', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/list.ejs', 'utf-8' );
  res.write( ejs.render( template, {} ) );
  res.end();
});
*/

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


//. item 追加
app.post( '/item', function( req, res ){
  if( db ){
    var item = req.body; // { code: "code", name: "name", price: 1000, brand: "brand", maker: "maker", image_url: "image_url", asin: "asin" }
    if( item ){
      db.insert( item, function( err, body, header ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
          res.end();
        }else{
          res.write( JSON.stringify( { status: true, body: body }, 2, null ) );
          res.end();
        }
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'POST body required.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'failed to initialize cloudant.' }, 2, null ) );
    res.end();
  }
});

app.post( '/items', function( req, res ){
  if( db ){
    var docs = req.body;  //. { docs: [ { _id; "0", value: 0 }, .. ] }
    if( docs ){
      db.bulk( docs, function( err, body, header ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
          res.end();
        }else{
          res.write( JSON.stringify( { status: true, aws_tag: aws_tag, body: body }, 2, null ) );
          res.end();
        }
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'POST body required.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'failed to initialize cloudant.' }, 2, null ) );
    res.end();
  }
});


//. item 一覧
app.get( '/items', function( req, res ){
  if( db ){
    db.list( {}, function( err0, body0 ){
      if( err0 ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err0 }, 2, null ) );
        res.end();
      }else{
        var cnt = body0.rows.length;
        
        var limit = req.query.limit ? req.query.limit : 30;
        var skip = req.query.skip ? req.query.skip : 0;

        db.list( { include_docs: true, limit: limit, skip: skip }, function( err, body ){
          if( err ){
            res.status( 400 );
            res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
            res.end();
          }else{
            var items = [];
            body.rows.forEach( function( element ){
              items.push( element );
            });
            res.write( JSON.stringify( { status: true, aws_tag: settings.aws_tag, cnt: cnt, items: items }, 2, null ) );
            res.end();
          }
        });
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'failed to initialize cloudant.' }, 2, null ) );
    res.end();
  }
});


//. 検索
//app.post( '/search', function( req, res ){
app.get( '/search', function( req, res ){
  if( db ){
    var cnt = 200; //body0.rows.length; //. db.search の上限値

    //var q = req.body.q;
    var q = req.query.q;
    if( q ){
      var limit = req.query.limit ? req.query.limit : 30;
      var skip = req.query.skip ? req.query.skip : 0;
      //db.search( 'ftsearch', 'itemsIndex', { q: q, limit: limit, skip: skip }, function( err, result ){
      db.search( 'ftsearch', 'itemsIndex', { q: q, limit: cnt }, function( err, result ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
          res.end();
        }else{
          var items = result.rows;
          cnt = items.length;
          if( skip ){
            if( skip < items.length ){
              items = items.slice( skip ); 
            }else{
              items = [];
            }
          }
          if( limit ){
            if( limit < items.length ){
              items = items.slice( 0, limit ); 
            }
          }

          res.write( JSON.stringify( { status: true, aws_tag: settings.aws_tag, cnt: cnt, items: items }, 2, null ) );
          res.end();
        }
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'parameter q needed.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'failed to initialize cloudant.' }, 2, null ) );
    res.end();
  }
});

app.listen( port );
console.log( "server starting on " + port + " ..." );
