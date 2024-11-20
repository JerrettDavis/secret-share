import "src/config/dotenv";
import app from "src/app";
import { connectToDatabase, stopMongoDB } from "src/config/db";
import { connectToRabbitMQ, stopRabbitMQ } from "src/config/rabbitmq";
import http from "http";
const handleShutdown = (server: http.Server) => {
    const shutdown = async () => {
        console.log("Shutting down...");
        await Promise.all([
            stopMongoDB(),
            stopRabbitMQ(),
            app.stopServer(server),
        ]);
        process.exit(0);
    };
    process.on("SIGINT", async () => await shutdown());
    process.on("SIGTERM", async () => await shutdown());
};
const startup = async () => {
    console.log("<APP> Starting up...");
    try {
        await Promise.all([
            connectToDatabase(process.env.MONGO_URI || ""),
            connectToRabbitMQ(),
        ]);
        console.log("<APP> Connected to depedencies. Starting API...");
        const server = await app.startServer(app.app);
        handleShutdown(server);
        console.log("<APP> App startup completed");
    } catch (err) {
        console.error("<APP> Startup error:", err);
        throw err;
    }
};
export default startup;

