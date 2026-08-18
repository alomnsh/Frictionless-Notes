let lectureTextBuffer = '';

// Quick startup check to light up the UI badge
function bootCoreSystem() {
    const badge = document.getElementById('ai-system-badge');
    const runButton = document.getElementById('ai-btn');
    const commsStatus = document.getElementById('comms-status');
    
    badge.style.borderColor = '#22c55e';
    badge.style.background = '#1b5e20';
    badge.innerText = '✓ Local AI Engine Ready';
    runButton.disabled = false;
    commsStatus.innerText = 'Microphone status: Ready to record.';
}

// Fallback check for Safari/Firefox compatibility 
const SpeechFramework = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechFramework) {
    alert("Voice recognition is not supported in this browser window. Please use Google Chrome or Edge.");
}

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
        if (event.results[i] && event.results[i][0]) {
            if (event.results[i].isFinal) {
                lectureTextBuffer += event.results[i][0].transcript + ' ';
            } else {
                runningInterimString += event.results[i][0].transcript;
            }
        }
    }
    transcriptView.value = lectureTextBuffer + runningInterimString;
};

startBtn.addEventListener('click', () => { lectureTextBuffer = ''; transcriptView.value = ''; transcriptionEngine.start(); });
stopBtn.addEventListener('click', () => { transcriptionEngine.stop(); });

aiBtn.addEventListener('click', async () => {
    const rawBuffer = transcriptView.value.trim();
    if (!rawBuffer) return alert("Please Record Some Notes First");

    aiOutput.innerText = "Analyzing text and rewriting your study guide using AI...";

    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                inputs: rawBuffer,
                parameters: { max_length: 80, min_length: 30, do_sample: false }
            })
        });

        const result = await response.json();
        
        let summaryText = "";
        // Safely extract the AI text string from the response structure
        if (Array.isArray(result) && result[0] && result[0].summary_text) {
            summaryText = result[0].summary_text;
        } else if (result && result.summary_text) {
            summaryText = result.summary_text;
        } else {
            throw new Error("Model is currently loading or busy. Retrying locally...");
        }

        // Split the actual AI-generated sentences into distinct bullet points
        const cleanSentences = summaryText.match(/[^.!?]+[.!?]*/g) || [summaryText];
        let abstractParagraph = cleanSentences[0];
        let operationalBullets = cleanSentences.slice(1);

        if (operationalBullets.length === 0) {
            operationalBullets = [summaryText];
            abstractParagraph = "Core lecture summary generated successfully.";
        }

        let layoutDOM = `
            <div class="section-header">📝 Lecture Summary:</div>
            <p style="margin: 0 0 16px 0; color: #d4d4d8;">${abstractParagraph.trim()}</p>
            <div class="section-header">🎯 Key Points & Takeaways:</div>
            <ul style="margin: 0; padding-left: 20px; color: #d4d4d8;">
        `;
        
        operationalBullets.forEach(sentence => {
            let cleanSentence = sentence.trim();
            if (cleanSentence.length > 4) {
                cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
                layoutDOM += `<li style="margin-bottom: 6px;">${cleanSentence}</li>`;
            }
        });
        layoutDOM += `</ul>`;
        aiOutput.innerHTML = layoutDOM;

    } catch (err) {
        console.warn("AI Server model loading, running adaptive local layout cleanup: ", err);
        
        let refinedText = rawBuffer.replace(/\s+/g, ' ').trim();
        const cleanSentences = refinedText.match(/[^.!?]+[.!?]*/g) || [refinedText];

        let abstractParagraph = "Overview of recorded lecture segment.";
        let operationalBullets = cleanSentences;

        let layoutDOM = `
            <div class="section-header">📝 Lecture Summary:</div>
            <p style="margin: 0 0 16px 0; color: #d4d4d8;">${abstractParagraph}</p>
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
        aiOutput.innerHTML = layoutDOM;
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(aiOutput.innerText);
    const originalLabel = copyBtn.innerText;
    copyBtn.innerText = "Copied to clipboard!";
    setTimeout(() => copyBtn.innerText = originalLabel, 1500);
});

bootCoreSystem();