//index.js

import Image from "next/image";
import { Inter } from "next/font/google";
import Form from "@/components/form";
import { useState } from "react";
import { LoaderIcon } from "react-hot-toast";
import Camera from "@/components/Camera";
import Step2 from "@/components/Step2";
import Step3 from "@/components/Step3";
import { useAppContext } from "@/Context";
import { OpenAI } from "openai";
import Record from "@/components/Record";
import Results from "@/components/results";
// import readline from "readline";
// import rl from "readline-promise";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { step, setStep, setQuestions } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [promptQuestion, setPrompt] = useState("");

  const handleSendToLLM = async (role, job) => {
    setLoading(true);
    console.log(role, job);
    //api call to llm
    
    const prompt = `You're playing the role of an interviewer at ${job} and you're interviewing a person applying as a ${role}, now provide 5 questions in a single string format ie. ["1question", "2question", "3question", "4question", "5question"]. Stricly only array with questions no other text or explanation required`
    
    console.log(prompt)

    // const readline = rl.default;
    // i have removed the api key, so add the api key before running
    const openai = new OpenAI({apiKey: '', dangerouslyAllowBrowser: true});


 const completion = await openai.chat.completions.create({
    model:"gpt-3.5-turbo",
    messages:[{role:"user", content:prompt}]
})
const promptResponse = JSON.parse(completion.choices[0].message.content);
setQuestions(promptResponse)


    setLoading(false);
    setStep(2);
  };


  const handleBeginRecord = () => {
    setLoading(true);

    console.log(loading);
    // After 3 seconds, set startLoading back to false
    setTimeout(() => {
      setLoading(false);
    }, 3000); // 3

    setStep(3);
  };

  console.log(loading);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex-col gap-4 flex items-center justify-center">
        <LoaderIcon style={{ width: "100px", height: "100px" }} />
        <p>Generating questions...</p>
      </div>
    );
  } else {
    return (
      <main className="w-full min-h-screen flex flex=col items-center justify-center">
        {step === 1 && <Form handleSendToLLM={handleSendToLLM} />}
        {step === 2 && <Record handleBeginRecord={handleBeginRecord} />}
        {step === 3 && <Results />}
      </main>
    );
  }
}
