token = "2yfKaNXfF36dnbm2sgApbga03pC_7THc56fxzTKGn2tdqzzhe"
const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect(
    {
      authtoken: token,
      port: 3000
    }
  );

  console.log(url)
})();