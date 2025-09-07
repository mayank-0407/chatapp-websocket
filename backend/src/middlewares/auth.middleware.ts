import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const tokenData: any = jwt.verify(token, process.env.JWT_SECRET_TOKEN!);

    const userQueried = await User.findOne({ email: tokenData.email });
    if (!userQueried)
      res
        .status(403)
        .json({ message: "User in Authorisation headers is not present" });

    req.user = tokenData;
    next();
  }
  res.status(403).json({ message: "Authorisation headers not present" });
};
