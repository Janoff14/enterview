import Camera from "@/components/Camera";
import RecordView from "@/components/RecordView";
import { useAppContext } from "@/Context";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { LoaderIcon } from "react-hot-toast";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";
import toast from "react-hot-toast";

const Record = () => {
  const { questions, loading, setLoading, setResults, setStep } =
    useAppContext();
  const [question, setQuestion] = useState(0);
  const [file, setFile] = useState(null);

  const blobToFile = (theBlob, fileName) => {
    return new File([theBlob], fileName, {
      lastModified: new Date().getTime(),
      type: theBlob.type,
    });
  };

  const {
    status,
    startRecording,
    stopRecording,
    previewStream,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    blobPropertyBag: {
      type: "video/webm",
    },
    onStop: async (blobUrl, blob) => {
      const fileMp4 = blobToFile(blob, "video.webm");
      console.log("blob", blob);
      console.log("blobURL", blobUrl);
      console.log("file", file);
      //   clearBlobUrl();
      setFile(fileMp4);
    },
  });

  const getJobId = () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const localOptions = {
      method: "POST",
      url: "http://127.0.0.1:5000/",
      headers: {
        "Content-Type": "multipart/form-data",
      },

      data: formData,
    };

    axios
      .request(localOptions)
      .then(function (response) {
        toast.success("We got your data");
        setLoading(false);       
         console.log(response.data);

        // const data =
        //   response.data[0]["results"]["predictions"][0]["models"]["face"][
        //     "grouped_predictions"
        //   ][0]["predictions"];
        // console.log(response.data);

        console.log(response.data)
        const predictions = response.data[0]["results"]["predictions"][0]["models"]["face"][
          "grouped_predictions"
        ][0]["predictions"];

        setResults(predictions);

        setStep(3);
      })
      .catch(function (error) {
        toast.error("We did not get your data");
        setLoading(false);
        console.error(error);
      });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col gap-4 items-center justify-center">
        <LoaderIcon style={{ width: "100px", height: "100px" }} />
        <p>Analyzing</p>
      </div>
    );
  } else {
    return (
      <div className="relative flex  justify-center w-full min-h-[80vh]">
        <div className="flex w-4/5 md:w-3/5  lg:w-1/2 gap-5 z-50 flex-col">
          <p className="text-center font-bold text-2xl">
            {questions[question]}
          </p>
          <div className="flex gap-5 z-50 flex-col">
            <button
              disabled={question === questions.length - 1}
              onClick={() => setQuestion((prev) => prev + 1)}
              className="rounded-md disabled:bg-gray-500 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Next Question
            </button>
            <button
              disabled={question === 0}
              onClick={() => setQuestion((prev) => prev - 1)}
              className="rounded-md disabled:bg-gray-500 bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Previous Question
            </button>
          </div>
        </div>
        <div>
          <button
            disabled={!file || status === "recording"}
            onClick={getJobId}
            className="rounded-md disabled:bg-gray-500 bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600  absolute right-0 top-0"
          >
            Submit results
          </button>
        </div>
        <div className=" absolute left-0 bottom-20">
          <RecordView
            file={file}
            clearBlobUrl={clearBlobUrl}
            mediaBlobUrl={mediaBlobUrl}
            status={status}
            getJobId={getJobId}
            startRecording={startRecording}
            stopRecording={stopRecording}
            previewStream={previewStream}
          />
        </div>
      </div>
    );
  }
};

export default Record;
