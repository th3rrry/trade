let cooldowns = {}; // { pair: { endTime: ..., intervalId: ... } }
let currentPair = ""; // глобально

document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generate-btn");
    const signalResult = document.getElementById("signal-result");
    const signalTime = document.getElementById("signal-time");
    const currencySelect = document.getElementById("currency-pair");

    let signalUpdateTimeout = null;
    currentPair = currencySelect.value;

    generateButton.addEventListener("click", () => {
        generateButton.disabled = true;
        generateButton.textContent = "Waiting...";
        console.log("Button clicked, generating signal...");

        if (signalUpdateTimeout) clearTimeout(signalUpdateTimeout);

        signalUpdateTimeout = setTimeout(() => {
            const currencyPair = currencySelect.value;
            const timeframeText = document.getElementById("timeframe").value;
            const cooldownDuration = parseTimeframeToMs(timeframeText); // 🔁 конвертация

            const isBuy = Math.random() > 0.5;
            const accuracy = (Math.random() * 10 + 85).toFixed(2);
            const now = new Date().toLocaleTimeString("en-EN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            const language = document.getElementById("language").value;
            const signalDetails = `
                <div class="signal-details">
                    <div class="signal-pair">${currencyPair}</div>
                    <div class="signal-direction ${isBuy ? "green" : "red"}">
                        ${isBuy ? translations[language].buy : translations[language].sell}
                    </div>
                    <div class="signal-timeframe">${translations[language].timeframe}: ${timeframeText}</div>
                    <div class="signal-probability">${translations[language].accuracy}: ${accuracy}%</div>
                </div>
            `;
            signalResult.innerHTML = signalDetails;
            signalTime.textContent = now;

            const endTime = Date.now() + cooldownDuration;

            if (cooldowns[currencyPair]?.intervalId) {
                clearInterval(cooldowns[currencyPair].intervalId);
            }

            cooldowns[currencyPair] = { endTime };
            startCooldown(currencyPair);
        }, 1000);
    });

    currencySelect.addEventListener("change", () => {
        const newPair = currencySelect.value;

        if (cooldowns[currentPair]?.intervalId) {
            clearInterval(cooldowns[currentPair].intervalId);
        }

        currentPair = newPair;

        if (cooldowns[newPair] && cooldowns[newPair].endTime > Date.now()) {
            startCooldown(newPair);
        } else {
            generateButton.disabled = false;
            generateButton.textContent = translations[document.getElementById("language").value].generateButton;
        }
    });
});

function startCooldown(pair) {
    const generateButton = document.getElementById("generate-btn");
    const language = document.getElementById("language").value;
    const originalText = translations[language].generateButton;

    function updateCooldown() {
        const now = Date.now();
        const remaining = Math.ceil((cooldowns[pair].endTime - now) / 1000);

        if (remaining <= 0) {
            clearInterval(cooldowns[pair].intervalId);
            generateButton.disabled = false;
            generateButton.textContent = originalText;
            delete cooldowns[pair];
        } else {
            generateButton.disabled = true;
            generateButton.textContent = `${originalText} (${remaining}s)`;
        }
    }

    updateCooldown(); 
    cooldowns[pair].intervalId = setInterval(updateCooldown, 1000);
}

function parseTimeframeToMs(timeframeText) {
    const lowercase = timeframeText.toLowerCase();

    const numberMatch = lowercase.match(/\d+/);
    const value = numberMatch ? parseInt(numberMatch[0], 10) : 30; 

    if (lowercase.includes("second") || lowercase.includes("sekund")) {
        return value * 1000;
    }

    if (lowercase.includes("min")) {
        return value * 60 * 1000;
    }
    return 30000;
}

function resetSignalAndChart() {
    const signalResult = document.getElementById("signal-result");
    const signalTime = document.getElementById("signal-time");

    signalResult.innerHTML = `<div class="signal-placeholder">${translations[document.getElementById("language").value].signalPlaceholder}</div>`;
    signalTime.textContent = "";
}

const translations = {
    en: {
        logoText: "Trade Signal",
        currencyLabel: "Instrument",
        timeframeLabel: "Time",
        generateButton: "Get Signal",
        signalTitle: "Signal",
        signalPlaceholder: "Click 'Get Signal'",
        languageLabel: "Language",
        timeframes: ["15 seconds", "1 minute", "3 minutes", "5 minutes", "10 minutes"],
        buy: "Buy",
        sell: "Sell",
        timeframe: "Timeframe",
        accuracy: "Accuracy"
    },
    cz: {
        logoText: "Obchodní signál",
        currencyLabel: "Nástroj",
        timeframeLabel: "Čas",
        generateButton: "Získat signál",
        signalTitle: "Signál",
        signalPlaceholder: "Klikněte na 'Získat signál'",
        languageLabel: "Jazyk",
        timeframes: ["15 sekund", "1 minuta", "3 minuty", "5 minut", "10 minut"],
        buy: "Koupit",
        sell: "Prodat",
        timeframe: "Časový rámec",
        accuracy: "Přesnost"
    }
};

function changeLanguage() {
    const language = document.getElementById("language").value;

    const logoTextElement = document.getElementById("logo-text");
    if (logoTextElement) logoTextElement.textContent = translations[language].logoText;

    const currencyLabelElement = document.getElementById("currency-label");
    if (currencyLabelElement) currencyLabelElement.textContent = translations[language].currencyLabel;

    const timeframeLabelElement = document.getElementById("timeframe-label");
    if (timeframeLabelElement) timeframeLabelElement.textContent = translations[language].timeframeLabel;

    const generateButtonElement = document.getElementById("generate-btn");
    if (generateButtonElement) generateButtonElement.textContent = translations[language].generateButton;

    const signalTitleElement = document.getElementById("signal-title");
    if (signalTitleElement) signalTitleElement.textContent = translations[language].signalTitle;

    const signalResultElement = document.getElementById("signal-result");
    if (signalResultElement) {
        const signalPlaceholderElement = signalResultElement.querySelector(".signal-placeholder");
        if (signalPlaceholderElement) {
            signalPlaceholderElement.textContent = translations[language].signalPlaceholder;
        }
    }

    const languageLabelElement = document.querySelector('.language-selector label');
    if (languageLabelElement) languageLabelElement.textContent = translations[language].languageLabel;

    const timeframeSelect = document.getElementById("timeframe");
    const timeframes = translations[language].timeframes;

    timeframeSelect.innerHTML = "";
    timeframes.forEach(timeframe => {
        const option = document.createElement("option");
        option.textContent = timeframe;
        timeframeSelect.appendChild(option);
    });

    resetSignalAndChart();
}
