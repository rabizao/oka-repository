import React, { useState, createContext } from 'react';

export const RunningTasksBarContext = createContext();

const RunningTasksBarProvider = ({ children }) => {
    const [active, setActive] = useState(false);
    const [tasks, setTasks] = useState([]);

    return (
        <RunningTasksBarContext.Provider value={{ active, setActive, tasks, setTasks}}>
            {children}
        </RunningTasksBarContext.Provider>
    )
}

export default RunningTasksBarProvider;