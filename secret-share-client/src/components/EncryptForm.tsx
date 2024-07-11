import React, {useEffect, useState} from 'react';
import {Box, Button, Input, Label, Switch, Text, Heading} from 'theme-ui';
import {strToU8, zlibSync} from 'fflate';
import SecretEntry from "./SecretEntry.tsx";
import ReadOnlyInputWithCopy from './ReadOnlyInputWithCopy.tsx';
import { ApiClient } from '@generated/ApiClient';
import { toast } from 'react-toastify';



interface ISecretDefaults {
    maxViews: number;
    defaultExpirationLength: number;
    destroyOnFailedAccess: boolean;
}

const EncryptForm: React.FC = () => {
    const [secret, setSecret] = useState('');
    const [link, setLink] = useState('');
    const [creatorIdentifier, setcreatorIdentifier] = useState('');
    const [options, setOptions] = useState({
        ipRestrictions: '',
        maxViews: Infinity,
        secretPassword: '',
        expirationDate: new Date(Date.now() + 3600),
        emailNotification: ''
    });

    const client = new ApiClient({
        BASE: 'http://localhost:5000'
    });

    const [showIpRestrictions, setShowIpRestrictions] = useState(false);
    const [showMaxViews, setShowMaxViews] = useState(false);
    const [showSecretPassword, setShowSecretPassword] = useState(false);
    const [showExpirationDate, setShowExpirationDate] = useState(false);
    const [showEmailNotification, setShowEmailNotification] = useState(false);
    
    useEffect(() => {
        const getDefaults = async (): Promise<ISecretDefaults> => {
            const output = (await client.default.getApiSecretsDefaults()).data!;
                
            return {
              maxViews: output.maxViews || 1,
              defaultExpirationLength: output.defaultExpirationLength || 3600,
              destroyOnFailedAccess: false,
            };
        };

        getDefaults().then((response: ISecretDefaults) => {
            if (!response) {
              return;
            }
            setOptions({
                ipRestrictions: '',
                maxViews: response.maxViews,
                secretPassword: '',
                expirationDate: new Date(Date.now() + response.defaultExpirationLength),
                emailNotification: ''
            
            });
        });
    }, []);


    const handleEncrypt = async () => {
        const encoder = new TextEncoder();
        const secretBuffer = encoder.encode(secret);

        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );

        const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            secretBuffer
        );

        const compressedKey = zlibSync(strToU8(JSON.stringify(exportedKey)));
        const keyBase64 = btoa(String.fromCharCode(...compressedKey));
        const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        const ivBase64 = btoa(String.fromCharCode(...iv));

        let hashedPassword = '';
        if (options.secretPassword) {
            const encoder = new TextEncoder();
            const data = encoder.encode(options.secretPassword);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        const response = await client.default.postApiSecrets({
            encryptedSecret: encryptedBase64,
            ipRestrictions: options.ipRestrictions.split(','),
            maxViews: options.maxViews,
            secretPassword: hashedPassword,
            expirationDate: options.expirationDate.toISOString(),
            emailNotification: options.emailNotification
        });

        const identifier = response.data!.identifier;
        const urlData = btoa(`${identifier}?key=${keyBase64}&iv=${ivBase64}`);

        setLink(`${window.location.origin}/retrieve/${urlData}`);
        setcreatorIdentifier(`${window.location.origin}/manage/${response.data!.creatorIdentifier}`);

        toast.success('Secret encrypted and ready to share!');

        setSecret('');
    };

    return (
      <Box sx={{ maxWidth: 500, mx: "auto", px: 3, py: 4 }}>
        <h1>Share a Secret with a Link</h1>
        <Label htmlFor="secret">Secret</Label>
        <SecretEntry
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          sx={{
            mb: "8px",
          }}
        />
        <Switch
          label="Enhance Secret Protection with a Password"
          checked={showSecretPassword}
          onChange={() => setShowSecretPassword(!showSecretPassword)}
        />
        {showSecretPassword && (
          <>
            <Label htmlFor="secretPassword">Secret Password</Label>
            <Input
              id="secretPassword"
              type="text"
              value={options.secretPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOptions({ ...options, secretPassword: e.target.value })
              }
              placeholder="Password Protect Secret"
            />
            <Text
              sx={{
                fontSize: 1,
                color: "text",
                fontStyle: "italic",
                mt: "8px",
              }}
            >
              This password will be hashed before transmission to the server.
            </Text>
          </>
        )}

        <Switch
          label="Restrict to Specified IPs"
          checked={showIpRestrictions}
          onChange={() => setShowIpRestrictions(!showIpRestrictions)}
        />
        {showIpRestrictions && (
          <>
            <Label htmlFor="ipRestrictions">
              IP Restrictions (comma-separated)
            </Label>
            <Input
              id="ipRestrictions"
              type="text"
              value={options.ipRestrictions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOptions({ ...options, ipRestrictions: e.target.value })
              }
              placeholder="IP Restrictions"
            />
          </>
        )}

        <Switch
          label="Set Custom View Limit"
          checked={showMaxViews}
          onChange={() => setShowMaxViews(!showMaxViews)}
        />
        {showMaxViews && (
          <>
            <Label htmlFor="maxViews">Max Views</Label>
            <Input
              id="maxViews"
              type="number"
              value={options.maxViews}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOptions({ ...options, maxViews: parseInt(e.target.value) })
              }
              placeholder="Max Views"
            />
          </>
        )}

        <Switch
          label="Set Custom Expiration Date"
          checked={showExpirationDate}
          onChange={() => setShowExpirationDate(!showExpirationDate)}
        />
        {showExpirationDate && (
          <>
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={options.expirationDate.toISOString().split("T")[0]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOptions({
                  ...options,
                  expirationDate: new Date(e.target.value),
                })
              }
            />
          </>
        )}

        <Switch
          label="Receive Emails Notifications"
          checked={showEmailNotification}
          onChange={() => setShowEmailNotification(!showEmailNotification)}
        />
        {showEmailNotification && (
          <>
            <Label htmlFor="emailNotification">Email for Notifications</Label>
            <Input
              id="emailNotification"
              type="email"
              value={options.emailNotification}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOptions({ ...options, emailNotification: e.target.value })
              }
              placeholder="Email for Notifications"
            />
          </>
        )}
        <Button onClick={handleEncrypt} disabled={!secret} sx={{mt: 2}}>
          Encrypt and Get Share Link
        </Button>
        {link && creatorIdentifier && (
          <Box sx={{ borderStyle: "solid", borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', padding: 3, mt: 4 }}>
            <Heading as='h3' sx={{color: 'primary'}}>
                Success!
            </Heading>
            <Text sx={{ mt: 4 }}>
              Your secret is now encrypted and ready to share!
            </Text>
            <Box sx={{mt: 2}}>
              <strong>Share this link with the recipient:</strong>
              <ReadOnlyInputWithCopy value={link} />
            </Box>
            <Box sx={{mt: 2}}>
              <strong>Creator Management Link:</strong>
              <ReadOnlyInputWithCopy value={creatorIdentifier} />
            </Box>
          </Box>
        )}
      </Box>
    );
};

export default EncryptForm;
