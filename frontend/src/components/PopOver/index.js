import React from 'react';
import Popover from '@material-ui/core/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';

export default function PopOver({ component: Icon, componentClasses, content, center, onClick, id }) {
    return (
        <PopupState variant="popover" popupId={id}>
            {(popupState) => (
                <div>
                    <Icon className={componentClasses} {...bindTrigger(popupState)} />
                    { center ?
                        <Popover
                            {...bindPopover(popupState)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            onClick={onClick}                            
                        >
                            {content}
                        </Popover>
                        :
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
                            onClick={onClick}
                        >
                            {content}
                        </Popover>
                    }
                </div>
            )}
        </PopupState>
    );
}