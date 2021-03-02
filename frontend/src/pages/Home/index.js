import React, { useState, useContext, useRef, useEffect } from 'react';
import { CloudUpload, Clear } from '@material-ui/icons';
import { NotificationManager } from 'react-notifications';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import ContentBox from '../../components/ContentBox';
import LinearProgress from '@material-ui/core/LinearProgress';
import api from '../../services/api';
import axios from 'axios';
import { LoginContext } from '../../contexts/LoginContext';
import { notifyError } from '../../utils';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';
import { Prompt } from 'react-router-dom';

export default function Home() {
    const [acceptedFiles, setAcceptedFiles] = useState([]);
    const [deniedFiles, setDeniedFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [blockSubmit, setBlockSubmit] = useState(false);
    const fileInputRef = useRef();
    const dropRegion = useRef();
    const runningTasksBar = useContext(RunningTasksBarContext);
    const notificationsContext = useContext(NotificationsContext);
    const loggedUser = useContext(LoginContext);
    const CancelToken = axios.CancelToken;
    const source = useRef(null);


    function fileListToArray(list) {
        const array = []
        for (var i = 0; i < list.length; i++) {
            array.push(list.item(i))
        }
        return array
    }

    function handleFilesCheck(input) {
        const files = fileListToArray(input);
        var newAcceptedFiles = [...acceptedFiles]
        var newDeniedFiles = [...deniedFiles]
        for (var i in files) {
            const extension = files[i].name.split('.')[files[i].name.split('.').length - 1]
            if (extension === "arff") {
                newAcceptedFiles.push(files[i])
            } else {
                newDeniedFiles.push(files[i])
            }
        }
        setAcceptedFiles(newAcceptedFiles)
        setDeniedFiles(newDeniedFiles)
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropRegion.current.classList.remove("background-secondary-color-light")
        handleFilesCheck(e.dataTransfer.files);
    }

    function handleClick(e) {
        fileInputRef.current.click();
    }

    function handleDragOver(e) {
        e.preventDefault();
        dropRegion.current.classList.add("background-secondary-color-light")
    }

    function handleDragLeave() {
        dropRegion.current.classList.remove("background-secondary-color-light")
    }

    function handleSelectedFiles() {
        if (fileInputRef.current.files.length) {
            handleFilesCheck(fileInputRef.current.files);
        }
    }

    useEffect(() => {
        return () => {
            source && source.current && source.current.cancel();
        }
    }, [])

    async function handleSubmit() {
        setShowProgress(true);
        setBlockSubmit(true);
        source.current = CancelToken.source();
        var formData = new FormData();
        acceptedFiles.forEach((value) => {
            formData.append("files", value);
        })

        let config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function (progressEvent) {
                setProgress(parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)))
            },
            cancelToken: source.current.token
        }

        try {
            const resp = await api.post('posts', formData, config);
            var newTasks = { ...runningTasksBar.tasks };
            newTasks[resp.data.id] = {
                description: "Starting..."
            };
            runningTasksBar.setTasks(newTasks);
            runningTasksBar.setActive(true);
            notificationsContext.setDelay(1000);
            setAcceptedFiles([]);
            setDeniedFiles([]);
            setShowProgress(false);
            setProgress(0);
            setBlockSubmit(false);
            NotificationManager.success("Upload successful. You can navigate while we process your datasets", "Finished", 10000)
        } catch (error) {
            if (!axios.isCancel(error)) {
                notifyError(error);
            }
        }
    }

    function handleRemoveItem(array, setter, index) {
        var newArray = [...array];
        newArray.splice(index, 1);
        setter(newArray);
    }

    function handleCancelSubmit() {
        source.current.cancel();
        setAcceptedFiles([]);
        setDeniedFiles([]);
        setShowProgress(false);
        setProgress(0);
        setBlockSubmit(false);
    }

    return (
        <>
            <OkaHeader />
            <div className="margin-auto width100 max-width-giant padding-small">
                <div className="content-box">
                    <div ref={dropRegion} className="padding-big border-dashed background-hover cursor-pointer" onDragOver={e => handleDragOver(e)} onDrop={e => handleDrop(e)} onClick={e => handleClick(e)} onDragLeave={e => handleDragLeave(e)}>
                        <input
                            ref={fileInputRef}
                            className="inactive"
                            type="file"
                            multiple
                            onChange={handleSelectedFiles}
                        />
                        <div className="flex-column flex-axis-center flex-crossaxis-center">
                            <h2>Upload your arff datasets here</h2>
                            <CloudUpload className="icon-secondary padding-top-small" style={{ fontSize: 80 }} />
                        </div>
                    </div>
                    {
                        (acceptedFiles.length > 0 || deniedFiles.length > 0) &&
                        <div className="padding-big">
                            {acceptedFiles.length > 0 &&
                                <>
                                    <h4 className="padding-small bold">Accepted files</h4>
                                    {acceptedFiles.map((file, index) =>
                                        <div key={index} className="flex-row flex-space-between padding-small box background-hover">
                                            <div>
                                                {file.name}
                                            </div>
                                            {
                                                blockSubmit ?
                                                    <Clear className="icon-primary-deactivated" /> :
                                                    <button onClick={() => handleRemoveItem(acceptedFiles, setAcceptedFiles, index)}>
                                                        <Clear />
                                                    </button>
                                            }
                                        </div>
                                    )}
                                </>
                            }
                            {deniedFiles.length > 0 &&
                                <>
                                    <h4 className="padding-small bold">Denied files</h4>
                                    {deniedFiles.map((file, index) =>
                                        <div key={index} className="flex-row flex-space-between padding-small box background-hover">
                                            <div>
                                                {file.name}
                                            </div>
                                            {
                                                blockSubmit ?
                                                    <Clear className="icon-primary-deactivated" /> :
                                                    <button onClick={() => handleRemoveItem(deniedFiles, setDeniedFiles, index)}>
                                                        <Clear />
                                                    </button>
                                            }
                                        </div>
                                    )}
                                </>
                            }
                            {
                                showProgress &&
                                <div className="flex-row flex-axis-center padding-small box width100">
                                    <Prompt
                                        when={blockSubmit}
                                        message="This will cancel your upload, are you sure?"
                                    />
                                    <LinearProgress className="padding-sides-small width100" variant="determinate" value={progress} />
                                    <h5 className="margin-sides-verysmall min-width-small">{progress}%</h5>
                                </div>
                            }
                            {
                                deniedFiles.length <= 0 && acceptedFiles.length > 0 && !blockSubmit ?
                                    <button className="margin-top-medium button-primary" onClick={() => handleSubmit()}>Submit</button> :
                                    <>
                                        <button className="margin-top-medium button-primary-disabled">Submit</button>
                                        <button className="margin-top-medium margin-sides-verysmall button-negative" onClick={handleCancelSubmit}>Cancel</button>
                                    </>

                            }
                        </div>
                    }
                </div>
                <ContentBox title="Feed" fetchUrl={`/users/${loggedUser.username}/feed`} className="margin-top-verysmall margin-bottom-huge" />
            </div>
        </>
    )
}