import React, { useState, useContext, useRef } from 'react';
import { CloudUpload, Clear } from '@material-ui/icons';
import { NotificationManager } from 'react-notifications';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import ContentBox from '../../components/ContentBox';
import LinearProgress from '@material-ui/core/LinearProgress';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function Home() {
    const [acceptedFiles, setAcceptedFiles] = useState([]);
    const [deniedFiles, setDeniedFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const fileInputRef = useRef();
    const dropRegion = useRef();

    const loggedUser = useContext(LoginContext);

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

    async function handleSubmit() {
        var formData = new FormData();
        setShowProgress(true);
        acceptedFiles.forEach((value) => {
            formData.append("files", value);
        })

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function (progressEvent) {
                setProgress(parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)))
            }
        }

        try {
            await api.post('posts', formData, config);
            setAcceptedFiles([]);
            setDeniedFiles([]);
            NotificationManager.success("Upload successful", "Finished", 4000)
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
    }

    function handleRemoveItem(array, setter, index) {
        var newArray = [...array];
        newArray.splice(index, 1);
        setter(newArray);
    }

    return (
        <>
            <OkaHeader />
            <div className="row margin-top-medium">
                <div className="column">
                    <div className="content-box margin-very-small">
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
                                                <button onClick={() => handleRemoveItem(acceptedFiles, setAcceptedFiles, index)}>
                                                    <Clear />
                                                </button>
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
                                                <button onClick={() => handleRemoveItem(deniedFiles, setDeniedFiles, index)}>
                                                    <Clear />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                }
                                {
                                    showProgress &&
                                    <div className="flex-row flex-axis-center padding-small box width100">
                                        <LinearProgress className="padding-sides-small width100" variant="determinate" value={progress} />
                                        <h5 className="margin-sides-verysmall min-width-small">{progress}%</h5>
                                    </div>
                                }
                                {(acceptedFiles.length > 0 && deniedFiles.length <= 0) && <button className="margin-top-medium button-primary" onClick={() => handleSubmit()}>Submit</button>}
                            </div>
                        }
                    </div>
                    <ContentBox title="Feed" fetchUrl={"posts"} maxWidth={700} />
                </div>
                <div className="column">
                    <ContentBox title="Uploads" titleLink={`/users/${loggedUser.username}/uploads`} fetchUrl={`/users/${loggedUser.username}/posts`} hideAvatar={true} hideAuthor={true} hideActions={true} maxWidth={400} />
                    <ContentBox title="Favorites" titleLink={`/users/${loggedUser.username}/favorites`} fetchUrl={`/users/${loggedUser.username}/favorites`} maxWidth={400} hideActions={true} />
                </div>
            </div>
        </>
    )
}