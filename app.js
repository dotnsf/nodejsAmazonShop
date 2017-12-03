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
    cors = require( 'cors' ),
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


//. item 一覧
//. https://stackoverflow.com/questions/2534376/how-do-i-do-the-sql-equivalent-of-distinct-in-couchdb
//. GET https://cloudant_username.cloudant.com/activities/_design/user_id_list/_view/user_id_list?group=true
app.get( '/items', function( req, res ){
  if( db ){
    var limit = app.query.limit ? app.query.limit : 30;
    var skip = app.query.skip ? app.query.skip : 0;

    db.list( { include_docs: true, limit: limit, skip: skip }, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var items = [];
        body.rows.forEach( function( element ){
          items.push( element.key );
        });
        res.write( JSON.stringify( { status: true, body: items }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'failed to initialize cloudant.' }, 2, null ) );
    res.end();
  }
});


app.listen( port );
console.log( "server starting on " + port + " ..." );
