import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Link, Heading} from 'theme-ui';
import {strFromU8, unzlibSync} from 'fflate';
import {SwipeableButton} from "react-swipeable-button";
import {ApiClient} from '@generated/ApiClient';
import ReadOnlyInputWithCopy from './ReadOnlyInputWithCopy';

const RetrieveForm: React.FC = () => {
    const {identifier} = useParams<{ identifier: string }>();
    const [secret, setSecret] = useState('');
    const [error, setError] = useState('');

    const apiClient = new ApiClient({
        BASE: 'http://localhost:5000'
    });


    const onUnlock = async () => {
        try {
            const decodedIdentifier = atob(identifier!);
            const serverIdentifier = decodedIdentifier.split('?')[0];
            const urlParts = decodedIdentifier.split('?')[1].split('&');
            const urlDict = urlParts.reduce((acc: { [key: string]: string }, part) => {
                const [key, value] = part.split('=');
                acc[key] = value;
                return acc;
            }, {});

            const keyParam = urlDict['key'];
            const ivParam = urlDict['iv'];

            if (keyParam && ivParam) {
                const compressedKey = Uint8Array.from(atob(decodeURIComponent(keyParam)), c => c.charCodeAt(0));
                const keyString = strFromU8(unzlibSync(compressedKey));
                const key = JSON.parse(keyString);
                const iv = Uint8Array.from(atob(decodeURIComponent(ivParam)), c => c.charCodeAt(0));

                const response = await apiClient.default.getApiSecrets(serverIdentifier);
                const encryptedData = Uint8Array.from(atob(response.data!.secret!), c => c.charCodeAt(0));

                const importedKey = await window.crypto.subtle.importKey(
                    'jwk',
                    key,
                    {
                        name: 'AES-GCM',
                    },
                    false,
                    ['decrypt']
                );

                const decrypted = await window.crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv,
                    },
                    importedKey,
                    encryptedData
                );

                const decoder = new TextDecoder();
                setSecret(decoder.decode(decrypted));
            }
        } catch (e: unknown) {
            let error = 'An error occurred while retrieving the secret.';
            console.warn(e)
            setError(error);
        }
    }

    return (
      <Box sx={{ maxWidth: 500, mx: "auto", px: 3, py: 4 }}>
        <Heading as="h1">Retrieving Secret</Heading>
        <Box sx={{mt:2, mb: 4}}>Slide the slider below to fetch and view the secret.</Box>
        {secret && <ReadOnlyInputWithCopy value={secret} />}
        {!secret && (
          <Box>
            <SwipeableButton
              onSuccess={onUnlock}
              text="Slide to view secret"
              text_unlocked="Secret Accessed"
            />
            <Box sx={{clear: 'both'}}></Box>
          </Box>
        )}
        {error && <p style={{ whiteSpace: "pre-wrap" }}>{error}</p>}
        <Box sx={{ mt: 4}}>
          <Link href="/">Create Your Own Secret Share Link</Link>
        </Box>
      </Box>
    );
};

export default RetrieveForm;
