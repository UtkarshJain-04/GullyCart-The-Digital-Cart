import { useState, useEffect, useRef } from 'react';

const VoiceOnboarding = () => {
    const [isListening, setIsListening] = useState(false);
    const [rawText, setRawText] = useState('');
    const [currentItems, setCurrentItems] = useState([]);
    const [view, setView] = useState('edit'); // 'edit' or 'dashboard'
    const recognitionRef = useRef(null);

    // Smart Parsing Function (With Hindi Support)
    const parseInventory = (text) => {
        const wordToDigit = {
            "ek": 1, "one": 1, "do": 2, "two": 2, "teen": 3, "three": 3,
            "char": 4, "chaar": 4, "four": 4, "paanch": 5, "panch": 5, "five": 5,
            "chhe": 6, "che": 6, "six": 6, "saat": 7, "seven": 7, "aath": 8, "eight": 8,
            "nau": 9, "nine": 9, "das": 10, "ten": 10
        };
        const numWords = Object.keys(wordToDigit).join('|');
        const regex = new RegExp(`(\\d+(?:\\.\\d+)?|${numWords})\\s*(kg|kilo|kilos|grams|g|dozen|pcs|pieces)?\\s*(?:of\\s+)?([a-zA-Z\\s]+?)(?=\\s*(?:\\d|${numWords}|,|and|$))`, 'gi');
        
        let matches = [];
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            let rawNum = match[1].toLowerCase();
            let digit = wordToDigit[rawNum] !== undefined ? wordToDigit[rawNum] : rawNum;
            let quantity = digit + (match[2] ? ' ' + match[2] : '');
            let itemName = match[3].trim().replace(/\b(?:and|of)\b/gi, '').trim();
            
            if (itemName) matches.push({ quantity, itemName });
        }
        return matches;
    };

    // Update state when raw text changes
    useEffect(() => {
        setCurrentItems(parseInventory(rawText));
    }, [rawText]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
                }
                if (finalTranscript) {
                    setRawText(prev => prev + finalTranscript);
                }
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Speech recognition not supported.");
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Handlers for Inline Editing
    const handleEdit = (index, field, value) => {
        const updatedItems = [...currentItems];
        updatedItems[index][field] = value;
        setCurrentItems(updatedItems);
        // Sync back to raw text
        setRawText(updatedItems.map(item => `${item.quantity} ${item.itemName}`).join(', '));
    };

    const handleDelete = (index) => {
        const updatedItems = currentItems.filter((_, i) => i !== index);
        setCurrentItems(updatedItems);
        setRawText(updatedItems.map(item => `${item.quantity} ${item.itemName}`).join(', '));
    };

    const handleSave = async () => {
        if (currentItems.length === 0) return alert("Add items before saving.");
        
        // TODO: In the next step, we will add the fetch() call to POST this to your Express backend
        console.log("Saving to Backend:", currentItems);
        setView('dashboard');
    };

    // --- RENDER LOGIC ---
    if (view === 'dashboard') {
        return (
            <div className="max-w-xl mx-auto space-y-6 mt-10">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-blue-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Live Storefront</h2>
                            <p className="text-sm text-green-600 font-semibold mt-1">● Live in your neighborhood</p>
                        </div>
                        <button onClick={() => setView('edit')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            Edit
                        </button>
                    </div>
                    <ul className="space-y-3">
                        {currentItems.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-bold text-gray-800 capitalize text-lg">{item.itemName}</span>
                                <span className="bg-blue-100 text-blue-800 text-md font-bold px-4 py-1 rounded-full">{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Smart Voice Onboarding</h2>
                <textarea 
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-4 resize-none" 
                    placeholder="Transcribed text will appear here..."
                />
                <button 
                    onClick={toggleListening}
                    className={`w-full font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 text-white
                        ${isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Preview Storefront</h3>
                <ul className="space-y-3 mb-6">
                    {currentItems.length === 0 ? (
                        <li className="text-gray-400 text-sm italic">Items will appear here...</li>
                    ) : (
                        currentItems.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 w-full">
                                    <input type="text" value={item.quantity} onChange={(e) => handleEdit(index, 'quantity', e.target.value)} className="w-24 bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                                    <input type="text" value={item.itemName} onChange={(e) => handleEdit(index, 'itemName', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-semibold text-gray-800 capitalize focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                                </div>
                                <button onClick={() => handleDelete(index)} className="ml-2 p-2 text-red-400 hover:text-red-600">Delete</button>
                            </li>
                        ))
                    )}
                </ul>
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
                    Save & Publish Inventory
                </button>
            </div>
        </div>
    );
};

export default VoiceOnboarding;