'user strict'

module.exports = {
    smtpConfig: function() {
      return {
        host: "email-smtp.us-east-1.amazonaws.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        pool: true,
        requireTLS: true,
        logger: true,
        auth: {
          user: 'AKIAQYPXCYQR2WA56SXX', // generated ethereal user
          pass: 'BKfznplhcLWg+6aTrvFzTZJ2A8gLUAYwrdI+xGUnRmY8', // generated ethereal password
        }
      }
    }
};