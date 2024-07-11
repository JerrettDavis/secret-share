import React from 'react';
import {Box, Button, Flex, Input} from 'theme-ui';
import {ThemeUIStyleObject} from "@theme-ui/css";
import {Theme} from "@theme-ui/core";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface ReadOnlyInputWithCopyProps {
    value: string;
    sx?: ThemeUIStyleObject<Theme>;
}

const ReadOnlyInputWithCopy: React.FC<ReadOnlyInputWithCopyProps> = ({ value, sx }) => {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        toast.success('Item copied to clipboard!');
    }

    return (
      <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", ...sx }}>
        <Flex sx={{ alignItems: "center", position: "relative" }}>
          <Input
            sx={{
              width: "100%",
              minHeight: "40px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              p: 2,
              pr: "60px",
              borderRadius: 4,
            }}
            readOnly
            value={value}
          />
          <Button
            onClick={copyToClipboard}
            sx={{
              mr: "8px",
              p: 0,
              bg: "transparent",
              cursor: "pointer",
              border: "none",
              outline: "none",
              position: "absolute",
              right: 0,
            }}
          >
            Copy
          </Button>
        </Flex>
      </Box>
    );
};

export default ReadOnlyInputWithCopy;