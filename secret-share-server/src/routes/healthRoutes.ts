import express, {Request, Response} from "express";
import {appState, ServiceState} from "src/app";

const router = express.Router();

router.get('', (_: Request, res: Response) => {
    const allServicesRunning = Object.values(appState).every(state => state === ServiceState.RUNNING);
    const status = allServicesRunning ? 'ok' : 'error';
    res.status(allServicesRunning ? 200 : 500).json({
        status,
        services: appState
    })
});

export default router;