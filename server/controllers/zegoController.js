import dotenv from 'dotenv';

dotenv.config();  // Load variables from .env file

export const generateZegoToken = (req, res) => {
  const { roomID, userID } = req.body;

  const appID = process.env.REACT_APP_ZEGO_APP_ID;  // Access the environment variable
  const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET;  // Access the environment variable

  const effectiveTimeInSeconds = 3600;
  const payload = '';

  const token = generateToken04(appID, userID, serverSecret, effectiveTimeInSeconds, payload);
  res.json({ token });
};
