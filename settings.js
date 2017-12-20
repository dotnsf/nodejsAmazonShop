//. settings.js

//. settings for Cloudant
exports.cloudant_username = 'cloudant_username';
exports.cloudant_password = 'cloudant_password';
exports.cloudant_db = 'items';
exports.cloudant_db_wait = 2000;

//. settings for app
exports.basic_username = '';
exports.basic_password = '';

//. settings for amazon associate
exports.aws_tag = '';
exports.aws_key = 'aws_key';
exports.aws_secret = 'aws_secret';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.cloudantNoSQLDB ){
    exports.cloudant_username = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username;
    exports.cloudant_password = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password;
  }
}
