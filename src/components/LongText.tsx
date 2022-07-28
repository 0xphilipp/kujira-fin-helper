import { Tooltip, Typography } from "antd";
import React from "react";
import { TooltipPlacement } from "antd/lib/tooltip";

interface AddressProps {
    text: string;
    width: number;
    placement?: TooltipPlacement
}
const LongText = ({text, width, placement}: AddressProps) => {
    return (
        <Typography.Text ellipsis={true} style={{width}}>
            <Tooltip title={text} placement={placement || 'bottomLeft'}>
                <span>{text}</span>
            </Tooltip>
        </Typography.Text>
    )
}

export default LongText;