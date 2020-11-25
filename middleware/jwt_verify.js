
// module.exports =  function verifyToken(req, res, next) {
//     //get auth header value
//     const bearerHeader = req.headers['uthorization'];   //the token is stored in the authorizathin part of the haeader.
//     console.log(bearerHeader);
//     //check if bearer is undefined
//     if(typeof bearerHeader !== 'undefined') {
//         //split at the space
//         const bearer = bearerHeader.split(' ');
//         //get token from array
//         const bearerToken = bearer[1];
//         //set the token
//         req.token = bearerToken;
//         //next middleware
//         next();
//     } else {
//         //forbidden
//         res.sendStatus(403);
//     }
// }
