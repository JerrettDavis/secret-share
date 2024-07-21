import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';

interface Log {
    _id: string;
    accessDate: string;
    accessGranted: boolean;
    ipAddress: string;
    referrer: string;
    requestBody: string;
    requestHeaders: string[];
    userAgent: string;
}

const ManagementPage: React.FC = () => {
    const {creatorIdentifier} = useParams<{ creatorIdentifier: string }>();
    const [logs, setLogs] = useState<Log[]>([]);
    
    useEffect(() => {
        const getAccessLogs = async () => {
            const response = await fetch(`http://localhost:5000/api/secrets/logs/${creatorIdentifier}`);
            const data = await response.json();
            setLogs(data.data.logs);
            console.log(data);
        }

        getAccessLogs().then(r => console.log(r));

    }, [creatorIdentifier])

    return (
        <div>
            <h1>Management Page</h1>

            <h2>Access Logs</h2>
            <ul>
                {logs && logs.map(log => (
                    <li key={log._id}>
                        <p>Access Date: {log.accessDate}</p>
                        <p>Access Granted: {log.accessGranted ? 'Yes' : 'No'}</p>
                        <p>IP Address: {log.ipAddress}</p>
                        <p>Referer: {log.referrer}</p>
                        <p>Request Body: {log.requestBody}</p>
                        <p>Request Headers: {log.requestHeaders.join(', ')}</p>
                        <p>User Agent: {log.userAgent}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ManagementPage;