const OAuth = require('oauth').OAuth;
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path:path.join(__dirname,'.env')});


const {OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,MIDDLEWARE_URL,ACCOUNT_ID,FRONT_END,SUITELET,OAUTH_TOKEN_KEY,OAUTH_TOKEN_SECRET} = process.env;


const requestTokenUrl = `https://${ACCOUNT_ID}.restlets.api.netsuite.com/rest/requesttoken`;
const accessTokenUrl = `https://${ACCOUNT_ID}.restlets.api.netsuite.com/rest/accesstoken`;
const authorizeUrl = `https://${ACCOUNT_ID}.app.netsuite.com/app/login/secure/authorizetoken.nl`;
const CALLBACK_URL = MIDDLEWARE_URL + '/auth/callback'
const oauth = new OAuth(requestTokenUrl,accessTokenUrl,OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,'1.0',CALLBACK_URL,'HMAC-SHA256',20);

const staticVar = {
    OAUTH_CONSUMER_KEY:OAUTH_CONSUMER_KEY,
    OAUTH_CONSUMER_SECRET:OAUTH_CONSUMER_SECRET,
    MIDDLEWARE_URL:MIDDLEWARE_URL,
    ACCOUNT_ID:ACCOUNT_ID,
    requestTokenUrl:requestTokenUrl,
    accessTokenUrl:accessTokenUrl,
    authorizeUrl:authorizeUrl,
    FRONT_END:FRONT_END,
    SUITELET:SUITELET,
    OAUTH_TOKEN_KEY:OAUTH_TOKEN_KEY,
    OAUTH_TOKEN_SECRET:OAUTH_TOKEN_SECRET
}

module.exports = {
    oauth,
    staticVar
};