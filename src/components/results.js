import { useAppContext } from "@/Context";
import React, { useEffect, useState } from "react";
import { OpenAI } from "openai";


function getTop5Objects(inputArray) {
  // Sort the input array in descending order of scores
  const sortedArray = inputArray.sort((a, b) => b.score - a.score);

  // Slice the first 5 elements to get the top 5 objects
  const top5Objects = sortedArray.slice(0, 5);

  return top5Objects;
}

export default function Results() {
  const { results } = useAppContext();

  const [feedback, setFeedback] = useState("Loading feedback")

  console.log(results)
  const [topFive, setTopFive] = useState([]);
  useEffect( () => {

    const emotionSums = {};  // Sum of scores for each emotion
    const emotionCounts = {};  // Number of occurrences for each emotion

    for (const pred of results) {
      const emotions = pred.emotions;
      for (const emotion of emotions) {
        const name = emotion.name;
        const score = emotion['score'];
        if (!emotionSums[name]) {
          emotionSums[name] = 0;
        }
        if (!emotionCounts[name]) {
          emotionCounts[name] = 0;
        }

        emotionSums[name] += score;
        emotionCounts[name] = (emotionCounts[name]) + 1;
      }
      // console.log(emotionSums)

    }

    const emotionAvgs = {};
    for (const [name, total] of Object.entries(emotionSums)) {
      emotionAvgs[name] = total / emotionCounts[name];
    }

    const sortedEmotions = Object.entries(emotionAvgs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

    // console.log(sortedEmotions)

    
    setTopFive(sortedEmotions);
    console.log(sortedEmotions)
  

    

  }, [results])

  useEffect(()=> {

    const handleSubmit = async () => {
    const prompt = `this is the result given by a tool that detects emotion during a interview 
        '''${topFive}'''
    now analyse the data and give useful tips or feedback for the user to improve. I strictly want the feedback only no extra info and no data that i provided.
    
    output the text in single para in 100 words`
    
    console.log(prompt)

    // const readline = rl.default;
    // i have removed the api key, so add the api key before running
    const openai = new OpenAI({apiKey: '', dangerouslyAllowBrowser: true});


 const completion = await openai.chat.completions.create({
    model:"gpt-3.5-turbo",
    messages:[{role:"user", content:prompt}]
})
const promptResponse = completion.choices[0].message.content;
setFeedback(promptResponse)}
handleSubmit()
  }, [topFive])

  

  // Example usage:

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <p className="font-semibold text-lg">
      Your leading emotions
      </p>
      <div className="w-64">
        {topFive.map((item) => (
          <div key={item[0]} className="mb-4">
            <div className="flex justify-between items-center gap-4">
            <p className="text-gray-800">{item[0]}</p>
            <p> {Math.round(item[1] * 100)} / 100</p>
            </div>

            <div className="bg-gray-600 rounded-md h-4">
              <div
                className="bg-blue-600 rounded-l-md h-full w-[calc(100%*var(--score))]"
                style={{ "--score": item[1] }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <p>{feedback}</p>
    </div>
  );
}
