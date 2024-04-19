import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const auth = (req, res, next) => {
    let token =
      req.body.token || req.query.token || req.headers["x-access-token"];

    const authHeader = req.headers.authorization;
    if(!token && authHeader){
        token = authHeader.split(" ")[1].trim()
    }
    if (!token) {
      return res.status(403).send({message: 'Sorry Unauthorized access token needed'});
    }
    try {
      const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
      req.user = decoded_user_payload;
    } catch (err) {
      return res.status(401).send({message: "Invalid token make sure its not expired"});
    }
    return next();
  };
  
 