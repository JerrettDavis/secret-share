import { Request, Response, NextFunction } from "express";
import Secret, { ISecret, SecretAccessLog } from "@models/Secret";
import { IApiResponse, IGetSecretResponse } from "@models/responses";
import { rabbitMQ } from "@services/rabbitmq";

export const validateSecret = async (
  req: Request<{ identifier: string }, {}, any>,
  res: Response<IApiResponse<IGetSecretResponse>>,
  next: NextFunction
) => {
  const { identifier } = req.params;
  const { secretPassword } = req.query;

  const saveAccessLog = async (
    accessGranted: boolean,
    secret?: ISecret | null | undefined
  ) => {
    const log = new SecretAccessLog(
      req.ip!,
      new Date(),
      accessGranted,
      req.get("referrer"),
      req.get("user-agent"),
      Object.entries(req.headers).map(([key, value]) => `${key}: ${value}`),
      JSON.stringify(req.body)
    );

    if (secret) {
      if (!secret.accessLogs) {
        secret.accessLogs = [];
      }
      secret.accessLogs.push(log);

      if (accessGranted) {
        secret.currentViews = (secret.currentViews || 0) + 1;

        // Enqueue an email request if the secret has an email address
        if (secret.emailNotification) {
          const message = {
            to: secret.emailNotification,
            subject: 'Secret Accessed',
            body: `The secret with identifier ${identifier} has been accessed.`,
          };
          await rabbitMQ.publishToQueue('emailQueue', JSON.stringify(message));
        }
      }

      await secret.save();
    }
  };

  try {
    const secret = await Secret.findOne({ identifier });
    if (!secret) {
      await saveAccessLog(false);
      return res
        .status(404)
        .send({ success: false, error: "Secret not found" });
    }

    // Check expiration
    if (secret.expirationDate && new Date(secret.expirationDate) < new Date()) {
      await saveAccessLog(false, secret);
      return res.status(403).send({ success: false, error: "Secret expired" });
    }

    // Check view limit
    if (secret.maxViews && secret.currentViews! >= secret.maxViews) {
      await saveAccessLog(false, secret);
      return res
        .status(403)
        .send({ success: false, error: "View limit reached" });
    }

    // Check IP restriction
    if (
      secret.ipRestrictions!.length &&
      !secret.ipRestrictions!.includes(req.ip!)
    ) {
      await saveAccessLog(false, secret);
      return res.status(403).send({ success: false, error: "IP not allowed" });
    }

    // Check secondary secret
    if (secret.secretPassword && secret.secretPassword !== secretPassword) {
      await saveAccessLog(false, secret);
      return res
        .status(403)
        .send({ success: false, error: "Invalid secret password" });
    }

    // If all validations pass, save a successful access log and attach the secret to the request
    await saveAccessLog(true, secret);
    req.body.secret = secret;
    next();
  } catch (error: any) {
    res.status(500).send({ success: false, error });
  }
};
