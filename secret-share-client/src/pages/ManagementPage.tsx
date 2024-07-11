import React, { useEffect } from "react";
import {useParams} from 'react-router-dom';


const ManagementPage: React.FC = () => {
    const {creatorIdentifier} = useParams<{ creatorIdentifier: string }>();
    
    useEffect(() => {
        const getAccessLogs = async () => {
            const response = await fetch(`http://localhost:5000/api/secrets/logs/${creatorIdentifier}`);
            const data = await response.json();
            console.log(data);
        }

        getAccessLogs();
    }, [creatorIdentifier])

    return (
        <div>
            <h1>Management Page</h1>
        </div>
    );
}

export default ManagementPage;