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
        commsStatus.innerText = 'System Status: Channels ready for validation';
    } catch (err) {
        console.error(err);
        badge.innerText = '❌ Code Compilation Faliure';
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
const videoView = document.getElementById('lecture-video');
const transcriptView = document.getElementById('transcript');
const commsStatus = document.getElementById('comms-status');
const aiBtn = document.getElementById('ai-btn');
const aiOutput = document.getElementById('ai-output');
const copyBtn = document.getElementById('copy-btn');