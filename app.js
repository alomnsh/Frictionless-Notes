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
