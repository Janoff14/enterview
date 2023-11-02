import { useAppContext } from "@/Context";
import React, { useState, useEffect, useRef } from "react";

function Camera({ question }) {
  const { setVideos, videos } = useAppContext();
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState();
  const [videoU, setVideoUrl] = useState();
  const videoRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    async function startCamera() {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(userMediaStream);
        videoRef.current.srcObject = userMediaStream;
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    }

    startCamera();
  }, []);

  function startRecording() {
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        // Move this code inside the onstop event
        const recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
        setRecordedBlob(recordedBlob); // Set the recordedBlob

        // Create a video URL from the recordedBlob
        const videoUrl = URL.createObjectURL(recordedBlob);
        setVideoUrl(videoUrl);

        // Update the videos state with the new video URL
        setVideos((prev) => [videoUrl, ...prev]);
      };

      setMediaRecorder(mediaRecorder);
      mediaRecorder.start();
      setRecording(true);
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }

  const uploadHandler = () => {
    // No need to create a Blob here
    // The recordedBlob is already created when recording stops

    // Just update the videos state with the recordedBlob
    setVideos((prev) => [videoUrl, ...prev]);
  };

  return (
    <div className="rounded-lg flex-col flex items-center justify-center gap-5">
      <video
        className="w-[15rem] h-[15rem] rounded-lg"
        ref={videoRef}
        autoPlay={true}
      />
      <div className="h-6 w-6   bg-red-500 rounded-full animate-pulse"></div>
      <div className="flex flex-col gap-5">
        <button
          className="cursor-pointer"
          onClick={startRecording}
          hidden={recording}
        >
          Start Recording
        </button>
        <button
          className="cursor-pointer"
          onClick={stopRecording}
          hidden={!recording}
        >
          Stop Recording
        </button>

        <button className="cursor-pointer" onClick={uploadHandler}>
          Upload video
        </button>
      </div>

      {videos.length > 0 ? (
        <div>
          {videos.map((video) => (
            <video key={video} controls width="480" height="360">
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ))}
        </div>
      ) : (
        <p>No video available</p>
      )}
    </div>
  );
}

export default Camera;
