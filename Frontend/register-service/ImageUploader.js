// components/ImageUploader.js
import React, { useState } from 'react';
import axios from 'axios';

export const ImageUploader = () => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploaded, setUploaded] = useState([]);

  const handleUpload = async () => {
    const uploads = Array.from(files).map((file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('description', 'Uploaded from UI');
      formData.append('creatorId', 'sample-user-id');

      return axios.post('/portfolios', formData, {
        onUploadProgress: (event) => {
          setProgress((prev) => ({ ...prev, [file.name]: Math.round((event.loaded * 100) / event.total) }));
        },
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((res) => setUploaded((prev) => [...prev, res.data]))
        .catch((err) => console.error(`Upload failed for ${file.name}:`, err));
    });

    await Promise.all(uploads);
  };

  return (
    <div>
      <h2>Upload Images</h2>
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        {Array.from(files).map((file) => (
          <div key={file.name}>
            {file.name}: {progress[file.name] || 0}%
          </div>
        ))}
      </div>
      <div>
        <h3>Uploaded:</h3>
        {uploaded.map((u, i) => <div key={i}>{u.portfolio?.title || 'Untitled'} uploaded!</div>)}
      </div>
    </div>
  );
};
