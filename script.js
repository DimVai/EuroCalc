
////////   Variables   ////////

let apiKey = null;
let fx = {
    EUREUR: 1,
    EURUSD: NaN,
    EURGBP: NaN,
};



////////   Functions   ////////

function sanitize(expression) {
    // Μετατρέπει τα κόμματα σε τελείες
    expression = expression.replace(/,/g, ".");
    // Αφαιρεί όλα τα χαρακτήρες εκτός από αριθμούς, τελείες και νομίσματα
    expression = expression.replace(/[^0-9.€$£+-/*]/g, "");     // Στο μέλλον: [^0-9.€$£+-/*]
    return expression;
}

function euroSum(expression) {
    
    /** Λαμβάνει ένα ποσό (με το σύμβολό του) και επιστρέφει την αξία του σε Euro (αριθμός) */
    function convertToEuro(value) {
        let amount = parseFloat(value.replace(/[^0-9.]/g, ""));
        if (value.includes("€")) return amount / fx.EUREUR;
        if (value.includes("$")) return amount / fx.EURUSD;
        if (value.includes("£")) return amount / fx.EURGBP;
        return 0; // Αν δεν αναγνωριστεί νόμισμα
    }

    /** Το διάνυσμα με τους προσθετέους, δηλαδή τα ποσά της έκφρασης (μαζί με το σύμβολό τους) */
    const terms = expression.match(/(?:\d+\*)?[€$£]?\d+\.\d+[€$£]?|(?:\d+\*)?[€$£]?\d+[€$£]?/g) || [];
    
    
    /** Μετατροπή των όρων σε διάνυσμα [multiplier, amount] */
    const parsedTerms = terms.map(term => {
        let parts = term.split('*');
        let multiplier = parts.length === 2 ? parseInt(parts[0], 10) : 1;
        let amount = parts.length === 2 ? parts[1] : parts[0];
        return [multiplier, amount];
    });
    
    /** Υπολογισμός των ποσών σε Euro */
    const convertedAmounts = parsedTerms.map(([multiplier, amount]) => multiplier * convertToEuro(amount));
    
    
    /** Το άθροισμα των ποσών σε Euro */
    const totalSum = Q.sum(convertedAmounts);
    return totalSum;
}

function focusInput() {
    Q("#expression").element.focus();
}
focusInput();

function calculator() {
    let expression = Q("#expression").value;
    expression = sanitize(expression);
    Q("#expression").value = expression;
    Q("#result").set( euroSum(expression).toFixed(2) );
    focusInput();
}



////////   Event Listeners   ////////

Q("#expression").on("input", calculator);

Q(".btn-insert").on("click", function() {
    const input = Q("#expression").element;
    const cursorPos = input.selectionStart; // Get the cursor position
    const textBefore = input.value.substring(0, cursorPos); // Text before the cursor
    const textAfter = input.value.substring(cursorPos); // Text after the cursor

    // Insert the button's text at the cursor position
    input.value = textBefore + this.innerText + textAfter;
    // Move the cursor to the end of the inserted text
    input.selectionStart = input.selectionEnd = cursorPos + this.innerText.length;

    calculator();
});

Q(".btn-clear").on("click", function() {
    Q("#expression").value = "";
    calculator();
});

Q("#copy").on("click", function(){
    navigator.clipboard.writeText(Q("#result").element.innerText);
});



////////   freecurrencyapi.com API KEY    ////////

function noApiActions(){
    Q("#api").show();
    Q("#apikey").on("input", function() {
        window.localStorage.setItem("API_KEY", this.value);
    });
    console.warn("No API or wrong API key found. Please enter your API key.");
}

if (window.localStorage.getItem("API_KEY") === null) {
    noApiActions();
}
else {
    apiKey = window.localStorage.getItem("API_KEY");
    let url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=USD%2CGBP&base_currency=EUR`;
    Q("#apikey").value = apiKey;
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        fx.EURUSD = data.data.USD;
        fx.EURGBP = data.data.GBP;
        console.log(fx);
        Q("~EURUSD").set((1/fx.EURUSD).toFixed(4))
        Q("~EURGBP").set((1/fx.EURGBP).toFixed(4))
        Q("#rates").show();
    })
    .catch(error => {
        console.error(error);
        noApiActions();
    });
}
