import React from 'react';
import Popover from '@material-ui/core/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';

export default function PopOver({ component: Icon, componentClasses, content }) {
    return (
        <PopupState variant="popover" popupId="demo-popup-popover">
            {(popupState) => (
                <div>
                    <Icon className={componentClasses} {...bindTrigger(popupState)} />
                    <Popover
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        {content}
                    </Popover>
                </div>
            )}
        </PopupState>
    );
}