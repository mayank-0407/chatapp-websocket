import bcrypt from "bcryptjs";
import type {
  SignupInterface,
  LoginInterface,
  UserModel,
} from "../types/Types.js";
import User from "../models/User.model.js";
import jwt, { type SignOptions } from "jsonwebtoken";

const saltRounds = process.env.SALT_ROUNDS || 10;

export const signupController = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    if (
      password === undefined ||
      password === null ||
      email === null ||
      email === undefined
    )
      res.status(400).json({
        message: "Email and Password are Required!",
      });
    if (!email.includes("@") || !email.includes("."))
      res.status(400).json({
        message:
          "Please Enter a valid Email(means it should contain '@ 'and '.')",
      });

    const userQueried = await User.findOne({ email });
    if (userQueried) res.status(400).json({ message: "User Already exists!" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const thisUser: SignupInterface = {
      name,
      email,
      password: hashedPassword,
    };

    await User.create(thisUser);

    return res.status(200).json({
      message: "Signup Successfull",
      user: { thisUser },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Unexpected error encountered during Signing Up",
      error: e,
    });
  }
};

export const loginController = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      req.status(400).json({ message: "Email and Password are Required" });

    const thisUser: UserModel | null = await User.findOne({ email });
    if (!thisUser)
      req.status(403).json({ message: "User Does not exists, please Signup!" });

    const passwordMatch = bcrypt.compare(password, thisUser!.password);
    if (!passwordMatch)
      res.status(403).json({ message: "Password is Incorrect!" });

    const JWT_SECRET_TOKEN: string = process.env.JWT_SECRET_TOKEN!;
    const JWT_EXPIRATION_TIME: string = process.env.JWT_EXPIRATION_TIME!;

    const loginToken = jwt.sign(
      { _id: thisUser?._id, email: thisUser?.email, name: thisUser?.name },
      JWT_SECRET_TOKEN!,
      { expiresIn: JWT_EXPIRATION_TIME! } as SignOptions
    );

    res.status(200).json({ message: "Login Successfull!", token: loginToken });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Error Logging In", error: e });
  }
};

export const verifyToken = async (req: any, res: any) => {
  try {
    const authHeader = req.headers["authorization"];

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const tokenData: any = jwt.verify(token, process.env.JWT_SECRET_TOKEN!);

      const userQueried = await User.findOne({ email: tokenData.email });
      if (!userQueried)
        res
          .status(403)
          .json({ message: "User in Authorisation headers is not present" });

      res.status(200).json({ message: "User is Authorised", user: tokenData });
    }
    res.status(403).json({ message: "Authorisation headers not present" });
  } catch (error) {
    res.status(403).json({ message: "Authorisation headers not present" });
  }
};
