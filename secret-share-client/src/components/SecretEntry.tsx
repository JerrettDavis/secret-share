/** @jsxImportSource theme-ui */
import React, {ChangeEvent, useState} from 'react';
import {Box, Button, Flex, Input, Textarea} from 'theme-ui';
import {ThemeUIStyleObject} from "@theme-ui/css";
import {Theme} from "@theme-ui/core";

interface SecretEntryProps {
    id?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    sx?: ThemeUIStyleObject<Theme>;
}

const SecretEntry: React.FC<SecretEntryProps> = ({
                                                     id = 'secret-entry',
                                                     value,
                                                     onChange,
                                                     placeholder,
                                                    sx
                                                 }) => {
    const [isMasked, setIsMasked] = useState<boolean>(true);

    const handleToggleMask = () => {
        setIsMasked(!isMasked);
    };

    return (
        <Box sx={{width: '100%', maxWidth: '500px', mx: 'auto', ...sx}}>
            <Flex sx={{alignItems: 'center', position: 'relative'}}>
                {isMasked ? (
                    <Input
                        type="password"
                        sx={{
                            width: '100%',
                            minHeight: '40px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            fontSize: 3,
                            p: 2,
                            pr: '60px',
                            borderRadius: 4,
                        }}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        id={id}
                    />
                ) : (
                    <Textarea
                        value={value}
                        onChange={onChange}
                        sx={{
                            width: '100%',
                            minHeight: '40px',
                            resize: 'both',
                            overflow: 'auto',
                            fontSize: 3,
                            pr: '40px', // Space for the toggle button
                        }}
                        placeholder={placeholder}
                        id={id}
                    />
                )}
                <Button
                    onClick={handleToggleMask}
                    sx={{
                        mr: '8px',
                        p: 0,
                        bg: 'transparent',
                        cursor: 'pointer',
                        border: 'none',
                        outline: 'none',
                        fontSize: 3,
                        position: 'absolute',
                        right: 0,
                    }}
                >
                    {isMasked ? 'Show' : 'Hide'}
                </Button>
            </Flex>
        </Box>
    );
};

export default SecretEntry;
