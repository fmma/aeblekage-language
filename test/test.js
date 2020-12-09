var x = require('../bundle.js');
console.log(x.typeParser.run("(a  -> b  )    -> f x -> (g y z w)")[0].show());
