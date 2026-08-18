let aiCoreModel = null;
let lectureTextBuffer = '';

async function bootCoreSystem() {
    const badge = document.getElementById('ai-system-badge');
    const runButton = document.getElementById('ai-btn');
    const commsStatus = document.getElementById('comms-status');
    try {
        badge.innerText = '📡 Connecting to AI Delivery Network...';
        
        const transformersModule = await import('https://unpkg.com');
        const pipeline = transformersModule.pipeline;

        badge.innerText = '🤖 Downloading lightweight AI model...';
        
        aiCoreModel = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');

        badge.style.borderColor = '#22c55e';
        badge.style.background = '#1b5e20';
        badge.innerText = '✓ Local AI Engine Ready';
        runButton.disabled = false;
        commsStatus.innerText = 'Microphone status: Ready to record.';
    } catch (err) {
        console.error(err);
        badge.innerText = `❌ Error: ${err.message || err}`;
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

aiBtn.addEventListener('click', async () => {
    const rawBuffer = transcriptView.value.trim();
    if (!rawBuffer) return alert("Please Record Some Notes First");

    aiOutput.innerText = "AI is reading and rewriting your notes locally...";

    try {
        const modelResponse = await aiCoreModel(rawBuffer, { 
            max_length: 90, 
            min_length: 30,
            do_sample: false 
        });
        
        if (modelResponse && modelResponse[0] && modelResponse[0].summary_text) {
            const aiText = modelResponse[0].summary_text;

            const sentences = aiText.match(/[^.!?]+[.!?]*/g) || [aiText];
            
            // The first sentence becomes the summary
            let summaryParagraph = sentences[0];
            
            let takeawayBullets = sentences.slice(1);

            if (takeawayBullets.length === 0) {
                takeawayBullets = [aiText];
                summaryParagraph = "Core discussion point extracted from lecture segment.";
            }

            let layoutDOM = `
                <div class="section-header">📝 Lecture Summary:</div>
                <p style="margin: 0 0 16px 0; color: #d4d4d8;">${summaryParagraph.trim()}</p>
                <div class="section-header">🎯 Key Points & Takeaways:</div>
                <ul style="margin: 0; padding-left: 20px; color: #d4d4d8;">
            `;
            
            takeawayBullets.forEach(bullet => {
                let cleanBullet = bullet.trim();
                if (cleanBullet.length > 3) {
                    cleanBullet = cleanBullet.charAt(0).toUpperCase() + cleanBullet.slice(1);
                    layoutDOM += `<li style="margin-bottom: 6px;">${cleanBullet}</li>`;
                }
            });
            layoutDOM += `</ul>`;
            aiOutput.innerHTML = layoutDOM;
        } else {
            aiOutput.innerText = "The local engine is processing. Please try clicking compile again.";
        }
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