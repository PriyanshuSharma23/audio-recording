import { useCallback, useEffect, useState } from "react";

function App() {
  const [currFreq, setCurrFreq] = useState<any[]>([]);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        console.log("Audio stream:", stream);

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        // Monitor the microphone stream for disconnection
        const track = stream.getTracks()[0];
        track.onended = function () {
          console.error("Microphone has been disconnected");
        };

        // Create a ScriptProcessorNode
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

        scriptProcessor.onaudioprocess = function (audioProcessingEvent) {
          // Get the input buffer
          const inputBuffer = audioProcessingEvent.inputBuffer;

          // Get the audio data (PCM data) from the input buffer
          const inputData = inputBuffer.getChannelData(0);

          // Convert the Float32Array to Int16Array (optional, depending on your needs)
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Data[i] = Math.min(1, inputData[i]) * 0x7fff;
          }

          // Do something with the audio data (e.g., send to a server)
          console.log("Audio data (Int16Array):", int16Data);
          setCurrFreq(Array.from(int16Data));
        };

        // Connect the source to the script processor and the script processor to the destination
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
      })
      .catch((err) => {
        // Handle errors (e.g., user denied permission)
        console.error("Error accessing microphone:", err);
      });
  }, []);
  return (
    <div>
      {currFreq.length > 0
        ? currFreq.reduce((acc, curr) => acc + curr) / currFreq.length
        : "init"}
    </div>
  );
}

export default App;
