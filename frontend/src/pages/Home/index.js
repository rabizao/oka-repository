import React, { useState, useContext, useRef } from 'react';
import { CloudUpload } from '@material-ui/icons';
import { NotificationManager } from 'react-notifications';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import ContentBox from '../../components/ContentBox';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function Home() {
    const [acceptedFiles, setAcceptedFiles] = useState([]);
    const [deniedFiles, setDeniedFiles] = useState([]);
    const fileInputRef = useRef();

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
                console.log("arff");
            } else {
                newDeniedFiles.push(files[i])
                console.log("not arff");
            }
        }
        setAcceptedFiles(newAcceptedFiles)
        setDeniedFiles(newDeniedFiles)
    }

    function handleDrop(e) {
        e.preventDefault();
        handleFilesCheck(e.dataTransfer.files);
    }

    function handleClick(e) {
        console.log("clicou");
        fileInputRef.current.click();
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleSelectedFiles() {
        if (fileInputRef.current.files.length) {
            handleFilesCheck(fileInputRef.current.files);
        }
    }

    async function handleSubmit() {
        const formData = new FormData();
        acceptedFiles.forEach((value) => {
            formData.append("files", value);
        })

        var headers = { 'Content-Type': "multipart/form-data;" }
        try {
            await api.post('posts', formData, { headers: headers });
            setAcceptedFiles([]);
            setDeniedFiles([]);
            NotificationManager.success("Upload successful", "Finished", 4000)
        } catch (error) {
            console.log(error)
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
    }

    return (
        <>
            <OkaHeader />
            <div className="row margin-top-medium">
                <div className="column">
                    <div className="content-box margin-very-small">
                        <div className="padding-big border-dashed background-hover cursor-pointer" onDragOver={e => handleDragOver(e)} onDrop={e => handleDrop(e)} onClick={e => handleClick(e)}>
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
                                <ul>
                                    {acceptedFiles.length > 0 && <h4>Accepted files</h4>}
                                    {acceptedFiles.map((file, index) =>
                                        <li key={index}>{file.name}</li>
                                    )}
                                </ul>
                                <ul className="margin-top-small">
                                    {deniedFiles.length > 0 && <h4>Denied files</h4>}
                                    {deniedFiles.map((file, index) =>
                                        <li key={index}>{file.name}</li>
                                    )}
                                </ul>
                                {acceptedFiles.length > 0 && <button className="margin-top-medium button-primary" onClick={() => handleSubmit()}>Submit</button>}
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