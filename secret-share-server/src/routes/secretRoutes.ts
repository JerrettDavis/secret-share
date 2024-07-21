import express, { Request, Response } from "express";
import Secret from "@models/Secret";
import { v4 as uuidv4 } from "uuid";
import { SecretDefaults } from "@models/SecretDefaults";
import { ICreateSecretRequest } from "@models/requests";
import {
  IApiResponse,
  ICreateSecretResponse,
  IGetSecretResponse,
  IDeleteSecretResponse,
  IGetSecretLogsResponse,
} from "@models/responses";
import { validateSecret } from "../validators/secretValidator";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateSecretRequest:
 *       type: object
 *       properties:
 *         encryptedSecret:
 *           type: string
 *         ipRestrictions:
 *           type: array
 *           items:
 *             type: string
 *         maxViews:
 *           type: number
 *         secretPassword:
 *           type: string
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         emailNotification:
 *           type: string
 *     ICreateSecretResponse:
 *       type: object
 *       properties:
 *         identifier:
 *           type: string
 *         creatorIdentifier:
 *           type: string
 *     SecretDefaults:
 *       type: object
 *       properties:
 *         maxViews:
 *           type: number
 *         defaultExpirationLength:
 *           type: number
 *     ISecretAccessLog:
 *       type: object
 *       properties:
 *         ipAddress:
 *           type: string
 *         accessDate:
 *           type: string
 *           format: date-time
 *         accessGranted:
 *           type: boolean
 *         referrer:
 *           type: string
 *         userAgent:
 *           type: string
 *         requestHeaders:
 *           type: array
 *           items:
 *             type: string
 *         requestBody:
 *           type: string
 *   responses:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Secret not found
 *     ForbiddenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Forbidden
 *     InternalServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Internal server error
 */

/**
 * @swagger
 * /api/secrets/:
 *   post:
 *     summary: Create a new secret
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ICreateSecretRequest'
 *     responses:
 *       201:
 *         description: Secret created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ICreateSecretResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 */
router.post(
  "/",
  async (
    req: Request<{}, {}, ICreateSecretRequest>,
    res: Response<IApiResponse<ICreateSecretResponse>>
  ): Promise<void> => {
    const {
      encryptedSecret: encryptedSecret,
      ipRestrictions,
      maxViews,
      secretPassword,
      expirationDate,
      emailNotification,
    } = req.body;

    const identifier = uuidv4().replace(/-/g, "").substring(0, 25);
    const creatorIdentifier = uuidv4().replace(/-/g, "").substring(0, 25);
    const secretDefaults = new SecretDefaults();
    const ipRestrictionsSet = new Set(ipRestrictions.filter((ip) => !!ip));

    // TODO: We should consider adding an additional encryption step to the encryptedSecret
    const password = new Secret({
      identifier,
      encryptedSecret: encryptedSecret,
      creatorIdentifier,
      ipRestrictions: Array.from(ipRestrictionsSet),
      maxViews: maxViews || secretDefaults.maxViews,
      secretPassword,
      expirationDate:
        expirationDate ||
        new Date(Date.now() + secretDefaults.defaultExpirationLength),
      emailNotification,
    });

    try {
      await password.save();
      res
        .status(201)
        .send({ success: true, data: { identifier, creatorIdentifier } });
    } catch (error: any) {
      res.status(400).send({ success: false, error: error });
    }
  }
);

/**
 * @swagger
 * /api/secrets/defaults:
 *   get:
 *     summary: Get the default settings for secrets
 *     responses:
 *       200:
 *         description: Default secret settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SecretDefaults'
 */
router.get(
  "/defaults",
  async (_: Request, res: Response<IApiResponse<SecretDefaults>>) => {
    const secretDefaults = new SecretDefaults();
    res.send({ success: true, data: secretDefaults });
  }
);

/**
 * @swagger
 * /api/secrets/{identifier}:
 *   get:
 *     summary: Retrieve a secret by its identifier
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier of the secret
 *       - in: query
 *         name: secretPassword
 *         schema:
 *           type: string
 *         required: false
 *         description: The secondary secret password
 *     responses:
 *       200:
 *         description: Secret retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *       404:
 *         description: Secret not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundResponse'
 *       403:
 *         description: Forbidden (expired, view limit reached, IP not allowed, or invalid secondary secret)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ForbiddenResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  "/:identifier",
  validateSecret,
  async (
    req: Request<{ identifier: string }, {}, any>,
    res: Response<IApiResponse<IGetSecretResponse>>
  ) => {
    const secret = req.body.secret;
    res.send({ success: true, data: { secret: secret.encryptedSecret } });
  }
);

/**
 * @swagger
 * /api/secrets/{identifier}:
 *   delete:
 *     summary: Delete a secret by its identifier
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier of the secret
 *     responses:
 *       200:
 *         description: Secret deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       404:
 *         description: Secret not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.delete(
  "/:creatorIdentifier",
  async (req: Request, res: Response<IApiResponse<IDeleteSecretResponse>>) => {
    const { creatorIdentifier } = req.params;

    try {
      const secret = await Secret.findOneAndDelete({ creatorIdentifier });
      if (!secret) {
        return res
          .status(404)
          .send({ success: false, error: "Secret not found" });
      }
      res.send({ success: true, data: { message: "Secret deleted" } });
    } catch (error: any) {
      res.status(500).send({ success: false, error });
    }
  }
);

/**
 * @swagger
 * /api/secrets/logs/{identifier}:
 *   get:
 *     summary: Get the access logs for a secret
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier of the secret
 *     responses:
 *       200:
 *         description: Access logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ISecretAccessLog'
 *       404:
 *         description: Secret not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundResponse'
 */
router.get(
  "/logs/:creatorIdentifier",
  async (req: Request, res: Response<IApiResponse<IGetSecretLogsResponse>>) => {
    const { creatorIdentifier } = req.params;
    const secret = await Secret.findOne({
      creatorIdentifier: creatorIdentifier,
    });

    if (!secret) {
      return res
        .status(404)
        .send({ success: false, error: "Secret not found" });
    }

    res.send({ success: true, data: { logs: secret.accessLogs || [] } });
  }
);

export default router;
