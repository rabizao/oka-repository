import React, { useState, createContext } from 'react';
import { useEffect } from 'react';

export const RunningTasksBarContext = createContext();

const RunningTasksBarProvider = ({ children }) => {
    const [active, setActive] = useState(false);
    const [show, setShow] = useState(false);
    const [tasks, setTasks] = useState({});

    useEffect(()=> {
        if (Object.keys(tasks).length === 0) {
            setShow(false);
            setActive(false);            
        } else {
            setShow(true);
        }
    }, [tasks])

    return (
        <RunningTasksBarContext.Provider value={{ active, setActive, tasks, setTasks, show, setShow}}>
            {children}
        </RunningTasksBarContext.Provider>
    )
}

export default RunningTasksBarProvider;