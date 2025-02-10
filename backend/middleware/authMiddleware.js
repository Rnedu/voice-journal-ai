import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";

dotenv.config();

// Cognito JWKS URL
const COGNITO_JWKS_URL = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

// Set up JWKS client
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URL,
});

// Get signing key function
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error retrieving signing key:", err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const tokenString = token.replace("Bearer ", "").trim();
  console.log("🔍 Received Token:", tokenString);

  jwt.verify(tokenString, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      console.error("❌ JWT Verification Failed:", err);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    console.log("✅ Token Verified:", decoded);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  });
};

export default authMiddleware;
