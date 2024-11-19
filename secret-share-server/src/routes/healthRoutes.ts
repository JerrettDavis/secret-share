import express, {Request, Response} from "express";
import {appState, ServiceState} from "src/appState";

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the status of all services
 *     description: Returns the status of all services and indicates if all are running.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services are running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: object
 *                   properties:
 *                     MongoConnection:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: RUNNING
 *                     RabbitMQConnection:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: RUNNING
 *                     ExpressServer:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: RUNNING
 *       500:
 *         description: Some or all services are not running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 services:
 *                   type: object
 *                   properties:
 *                     MongoConnection:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: UNKNOWN
 *                     RabbitMQConnection:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: UNKNOWN
 *                     ExpressServer:
 *                       type: string
 *                       enum: [STARTING, RUNNING, STOPPING, STOPPED, ERROR, UNKNOWN]
 *                       example: UNKNOWN
 */
router.get('', (_: Request, res: Response) => {
    const allServicesRunning = Object.values(appState).every(state => state === ServiceState.RUNNING);
    const success = allServicesRunning;
    res.status(allServicesRunning ? 200 : 500).json({
        success,
        services: appState
    })
});

export default router;