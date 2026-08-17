let aiCoreModel = null;
let lectureTextBuffer = '';
let videoMediaStream = null;

//Initialize lightweight text processor
async function bootCoreSystem() {
    const badge = document.getElementById('ai-system-badge');
    const runButton = document.getElementById('ai-btn');
    const commsStatus = document.getElementById('comms-status')
    try {
        //Loads a 4-bit quantized verison
        aiCoreModel = await window.pipeline('summarization', 'Xenova/distillbart-cnn-6-6', {
            quantized: true,
            revison: 'main'
        });

        badge.style.borderColor = '#22c55e';
        badge.innerText = '✓ Local AI Engine Ready';
        runButton.disabled = false;
        commsStatus.innerText = 'Microphone status: Ready to record.';
    } catch (err) {
        console.error(err);
        badge.innerText = '❌ Failed to load local analyzer tools';
    }
}
setTimeout(bootCoreSystem, 400);

//Setup Speech tracking modules
const SpeechFramework = window.SpeechRecognition || window.webkitSpeechRecognition;
const transcriptionEngine = new SpeechFramework();
transcriptionEngine.continuous = true;
transcriptionEngine.intermResults = true;
transcriptionEngine.lang = 'en-US';

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptView = document.getElementById('transcript');
const commsStatus = document.getElementById('comms-status');
const aiBtn = document.getElementById('ai-btn');
const aiOutput = document.getElementById('ai-output');
const copyBtn = document.getElementById('copy-btn');

audioCaptureUnit.onstart = () => { commsStatus.innerText = "Microphone status: Listening..."; startBtn.disabled = true; stopBtn.disabled = false; };
audioCaptureUnit.onend = () => { commsStatus.innerText = "Microphone status: Stopped."; startBtn.disabled = false; stopBtn.disabled = true; };
audioCaptureUnit.onerror = (err) => { commsStatus.innerText = "Recording error: " + err.error; };

audioCaptureUnit.onresult = (event) => {
    let runningInterimString = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            lectureTextBuffer += event.results[i].transcript + ' ';
        } else {
            runningInterimString += event.results[i].transcript;
        }
    }
    transcriptView.value = lectureTextBuffer + runningInterimString;
};

startBtn.addEventListener('click', () => { lectureTextBuffer = ''; transcriptView.value = ''; audioCaptureUnit.start(); });
stopBtn.addEventListener('click', () => { audioCaptureUnit.stop(); });