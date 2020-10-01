import React, { useContext } from 'react';
import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';

export default function RunningTasksBar() {
    const runningTasksBarContext = useContext(RunningTasksBarContext);

    return (
        <div className="background-primary-color width-huge fixed-bottom-right margin-sides-verysmall">
            <div className={`${!runningTasksBarContext.active && "inactive"} flex-column content-box padding-medium width100`}>
                {
                    !runningTasksBarContext.tasks.lenght || runningTasksBarContext.tasks.lenght === 0 ?
                        <h3>No running tasks</h3> :
                        <>
                            {
                                runningTasksBarContext.tasks.map(task =>
                                    <>
                                        <div>{task.name}</div>
                                        <div>{task.description}</div>
                                    </>
                                )
                            }
                        </>
                }
            </div>
            <button onClick={() => runningTasksBarContext.setActive(!runningTasksBarContext.active)} className="flex-row flex-crossaxis-center box padding-medium width100">
                <h3 className="color-tertiary">Running tasks</h3>
            </button>

        </div>
    );
}