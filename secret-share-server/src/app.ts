import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import favicon from "serve-favicon";
import path from "path";
import { logger } from "@middleware/logger";
import routes from "./routes";
import http from "http";
import { appState, ServiceState } from "src/appState";
import errorMiddleware from "@middleware/errorMiddleware";
import process from "node:process";
const app: Application = express();
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5001", // Replace with client's Docker hostname or IP
    methods: ["GET", "POST", "PUT", "DELETE"], // Adjust based on your API's methods
    allowedHeaders: ["Content-Type", "Authorization"], // Include any custom headers
    credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));
app.options("*", cors());
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use("/", routes);
app.use((_: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        status: "error",
        message: "Resource not found",
    });
    next();
});
app.use(errorMiddleware);
const startServer = (app: Application): Promise<http.Server> => {
    const PORT = process.env.PORT || 5000;
    appState.ExpressServer = ServiceState.STARTING;
    console.log("<API> Starting server...");
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(PORT, () => {
                console.log(`<API> Server is running on port ${PORT}`);
                appState.ExpressServer = ServiceState.RUNNING;
                resolve(server);
            });
        } catch (e) {
            console.error("<API> Server startup error:", e);
            appState.ExpressServer = ServiceState.ERROR;
            reject(e);
            throw e;
        }
    });
};
const stopServer = (server: http.Server): Promise<void> => {
    console.log("<API> Stopping server...");
    appState.ExpressServer = ServiceState.STOPPING;
    return new Promise((resolve, _) => {
        server.close(() => {
            appState.ExpressServer = ServiceState.STOPPED;
            resolve();
        });
    });
};
export default { startServer, stopServer, app };
