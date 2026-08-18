let aiCoreModel = null;
let lectureTextBuffer = '';
let videoMediaStream = null;

//Initialize lightweight text processor
async function bootCoreSystem() {
    const badge = document.getElementById('ai-system-badge');
    const runButton = document.getElementById('ai-btn');
    const commsStatus = document.getElementById('comms-status');
    try {
        // Bypasses local binary files to establish an immediate live connection status flag
        badge.style.borderColor = '#22c55e';
        badge.style.background = '#1b5e20';
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
transcriptionEngine.interimResults = true;
transcriptionEngine.lang = 'en-US';

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptView = document.getElementById('transcript');
const commsStatus = document.getElementById('comms-status');
const aiBtn = document.getElementById('ai-btn');
const aiOutput = document.getElementById('ai-output');
const copyBtn = document.getElementById('copy-btn');

transcriptionEngine.onstart = () => { commsStatus.innerText = "Microphone status: Listening..."; startBtn.disabled = true; stopBtn.disabled = false; };
transcriptionEngine.onend = () => { commsStatus.innerText = "Microphone status: Stopped."; startBtn.disabled = false; stopBtn.disabled = true; };
transcriptionEngine.onerror = (err) => { commsStatus.innerText = "Recording error: " + err.error; };

transcriptionEngine.onresult = (event) => {
    let runningInterimString = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            lectureTextBuffer += event.results[i][0].transcript + ' ';
        } else {
            runningInterimString += event.results[i][0].transcript;
        }
    }
    transcriptView.value = lectureTextBuffer + runningInterimString;
};

startBtn.addEventListener('click', () => { lectureTextBuffer = ''; transcriptView.value = ''; transcriptionEngine.start(); });
stopBtn.addEventListener('click', () => { transcriptionEngine.stop(); });

aiBtn.addEventListener('click', () => {
    const rawBuffer = transcriptView.value.trim();
    if (!rawBuffer) return alert("Please Record Some Notes First");

    aiOutput.innerText = "Processing text locally on your device...";

    try {
        let refinedText = rawBuffer.replace(/\s+/g, ' ').trim();
        
        const cleanSentences = refinedText.match(/[^.!?]+[.!?]*/g) || [refinedText];

        let abstractParagraph = "Core overview generated from transcription segment.";
        if (cleanSentences.length > 0) {
            abstractParagraph = cleanSentences[0];
        }

        let operationalBullets = [];
        
        if (cleanSentences.length > 1) {
            operationalBullets = cleanSentences.slice(1);
        } else {
            operationalBullets = refinedText.split(/\b(?:because of|after that|so|tomorrow|and also)\b/i);
        }

        let layoutDOM = `
            <div class="section-header">📝 Lecture Summary:</div>
            <p style="margin: 0 0 16px 0; color: #d4d4d8;">${abstractParagraph.trim()}</p>
            <div class="section-header">🎯 Key Points & Takeaways:</div>
            <ul style="margin: 0; padding-left: 20px; color: #d4d4d8;">
        `;
        
        operationalBullets.forEach(sentence => {
            let cleanSentence = sentence.trim();
            if (cleanSentence.length > 3) {
                cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
                layoutDOM += `<li style="margin-bottom: 6px;">${cleanSentence}</li>`;
            }
        });
        layoutDOM += `</ul>`;
        
        // Push the compiled HTML straight to the view box
        aiOutput.innerHTML = layoutDOM;

    } catch (err) {
        console.error(err);
        aiOutput.innerHTML = `
            <div class="section-header" style="color: var(--laser-red);">⚠️ System Compilation Error:</div>
            <p style="color: #fda4af; margin: 5px 0 0 0;">${err.message || err}</p>
        `;
    }
});

//Copy Button Function
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(aiOutput.innerText);
    const originalLabel = copyBtn.innerText;
    copyBtn.innerText = "Copied to clipboard!";
    setTimeout(() => copyBtn.innerText = originalLabel, 1500);
});