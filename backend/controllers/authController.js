import AWS from "aws-sdk";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize AWS Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
});

// 📌 Function to Compute `SECRET_HASH`
const generateSecretHash = (username) => {
  const hmac = crypto.createHmac("sha256", process.env.AWS_COGNITO_CLIENT_SECRET);
  hmac.update(username + process.env.AWS_COGNITO_CLIENT_ID);
  return hmac.digest("base64");
};

// 📌 Check if User Exists
const checkIfUserExists = async (email) => {
    const params = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      Filter: `email = "${email}"`,
      Limit: 1,
    };
  
    try {
      const data = await cognito.listUsers(params).promise();
      return data.Users.length > 0; // Returns true if user exists
    } catch (err) {
      console.error("Error checking user existence:", err);
      return false;
    }
  };

// 📌 Signup Route (Includes `SECRET_HASH`)
export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const userExists = await checkIfUserExists(email);
  if (userExists) {
    return res.status(400).json({ error: "User already exists. Please log in instead." });
  }

  const params = {
    ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
    SecretHash: generateSecretHash(email),
  };

  try {
    const data = await cognito.signUp(params).promise();
    res.status(201).json({ message: "User registered successfully. Please verify your email.", data });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(400).json({ error: err.message });
  }
};

export const confirmSignup = async (req, res) => {
    const { email, code } = req.body;
  
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required." });
    }
  
    const params = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: generateSecretHash(email),
    };
  
    try {
      await cognito.confirmSignUp(params).promise();
      res.json({ message: "User confirmed successfully. You can now log in." });
    } catch (err) {
      console.error("Error confirming user:", err);
      res.status(400).json({ error: err.message });
    }
  };
  

// 📌 Login Route (Includes `SECRET_HASH`)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email),
    },
  };

  try {
    const data = await cognito.initiateAuth(params).promise();
    res.json({ message: "Login successful", token: data.AuthenticationResult.IdToken });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(400).json({ error: err.message });
  }
};
