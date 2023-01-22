import { NextFunction, Request, Response } from "express";
import ShortUniqueId from "short-unique-id";
import { logger } from "../../../logs/logger.log";
import User from "../../../models/user.model";
import Otp from "../../../models/otp.model";
import { generateOTP } from "../../../utils/generateOtp.util";
import { sendEmail } from "../../../utils/sendEmail.util";
import { TYPE } from "../../../types/default";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { nama, email, password, ip } = req.body;
  try {
    let id = new ShortUniqueId().randomUUID(16);
    let cekId = true;
    while (cekId) {
      const findUser = await User.findOne({
        where: {
          id,
        },
      });
      if (!findUser) {
        cekId = false;
      } else {
        id = new ShortUniqueId().randomUUID(8);
      }
    }

    const findUser = await User.findOne({
      where: {
        email,
      },
    });

    if (findUser)
      return res
        .status(400)
        .json({ success: false, error: { message: "user already exists" } });
    const user = await User.create({
      id,
      nama: nama as string,
      email: email as string,
      password: password as string,
    });

    const findUserInTableOtp = await Otp.findOne({
      where: { email, type: "register" },
    });
    if (findUserInTableOtp)
      return res
        .status(400)
        .json({ success: false, error: { message: "otp already exists" } });
    const otp = await generateOTP(4);
    const createOtp = await Otp.create({
      ip,
      email: user.email as string,
      otp: otp as string,
      type: "register" as unknown as TYPE,
    });

    const valid: Boolean = await sendEmail(
      email as string,
      createOtp.otp as string
    );
    if (!valid) {
      throw new Error("failed to send email");
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
};

export default register;
