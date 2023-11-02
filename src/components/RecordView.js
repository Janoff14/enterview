import { AppProvider, useAppContext } from "@/Context";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const VideoPreview = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return <video ref={videoRef} width={500} height={500} autoPlay controls />;
};

function Camera() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Check for browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    // Access the user's camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    startCamera();
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay={true} />
    </div>
  );
}

const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  {
    ssr: false,
  }
);

function RecordView({
  status,
  startRecording,
  stopRecording,
  previewStream,
  mediaBlobUrl,
  file,
  getJobId,
  clearBlobUrl,
}) {
  // Your component code remains mostly the same
  // ...

  const [blob, setBlob] = useState();
  const { loading, setLoading, results, setResults } = useAppContext();

  const videoRef = useRef(null);

  return (
    <>
      <div className="rounded-lg flex items-center justify-center gap-5"></div>

      <div>
        <div className="flex gap-3">
          {/* <p>{status}</p> */}
          <button
            hidden={status === "recording"}
            className="rounded-md disabled:bg-gray-500 bg-cyan-600 mb-3 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 mb-3"
            onClick={startRecording}
          >
            Start Recording
          </button>
          <button
            className="rounded-md disabled:bg-gray-500 bg-cyan-600 mb-3 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 mb-3"
            hidden={status !== "recording"}
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        </div>

        <div className="w-[10rem]">
          {status === "idle" && <Camera />}

          {file && status !== "recording" && (
            <button className="bg-green-600 cursor-auto p-4 text-white">
              Your video interview is ready! Click start recording to restart.
            </button>
          )}

          <div className="relative">

            {status === "recording" && (
              <div className="h-6 ml-2 mt-2 w-6 absolute bg-red-500 rounded-full animate-pulse"></div>
            )}

            {status === "recording" && <VideoPreview stream={previewStream} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default RecordView;
