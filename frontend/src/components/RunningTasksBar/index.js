import React, { useContext } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';

export default function RunningTasksBar() {
    const runningTasksBarContext = useContext(RunningTasksBarContext);

    return (
        runningTasksBarContext.show &&
        <div className="background-primary-color width-huge fixed-bottom-right">
            <div className={`${!runningTasksBarContext.active && "inactive"} flex-column content-box width100 max-height-70vh overflow-y-auto`}>
                {
                    Object.keys(runningTasksBarContext.tasks).length === 0 ?
                        <h3>No running tasks</h3> :
                        Object.entries(runningTasksBarContext.tasks).map(([id, task]) =>
                            <div key={id} className="flex-row flex-axis-center box">
                                <div className="padding-medium"><CircularProgress className="icon-primary" variant={task.progress !== 0 ? "determinate" : "indeterminate"} value={task.progress} /></div>
                                <h5 className="padding-medium">{task.description}</h5>
                            </div>
                        )
                }
            </div>
            <button onClick={() => runningTasksBarContext.setActive(!runningTasksBarContext.active)} className="flex-row flex-crossaxis-center box padding-medium width100">
                <h4 className="color-tertiary">Running tasks</h4>
            </button>
        </div>
    );
}