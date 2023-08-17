# uptime monitoring

## description
Start monitoring a website.
When the website goes down, I'll let you know by sms

### notes
To test this app you need to substitute my process.env.<SECRET_KEYS> with your own.
So, you need a [postgresql](https://www.postgresql.org/) database to store information 
and a [Twilio](https://www.twilio.com/en-us) account to send sms.
For the second one, you also need to enable at least 2 phone numbers: 1 as sender and 1 as receiver,
 to test the sms feature

#### p.s.
I know the authentication process is shitty. I just need a way to mantain the session, nothing more.