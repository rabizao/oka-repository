import React, { useState } from 'react';

export default function Dropdown({ title, items, multiSelect = false }) {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState([]);
    const toggle = () => setOpen(!open);

    function handleOnClick(item) { }

    return (
        <div className="dd-wrapper">
            <div
                tabIndex={0}
                className="dd-header"
                role="button"
                onKeyPress={() => toggle(!open)}
                onClick={() => togle(!open)}>
                    <div className="dd-header__title">
                        <p className="dd-header__title--bold">{title}</p>
                    </div>
            </div>
        </div>
    )
}