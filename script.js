
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
    expression = expression.replace(/[^0-9.€$£+]/g, "");     // Στο μέλλον: [^0-9.€$£+-/*]
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

    /** το διάνυσμα με τα ποσά της έκφρασης (μαζί με το σύμβολό τους) */
    const amounts = expression.match(/(?:[€$£]?\d+\.\d+[€$£]?|[€$£]?\d+[€$£]?)/g) || [];
    // console.log(amounts);

    /** Το διάνυσμα με τα ποσά της έκφρασης, σε Euro */
    const convertedAmounts = amounts.map(convertToEuro);
    // console.log(convertedAmounts);

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
    Q("#result").set( euroSum(expression).toFixed(2) + " €" );
    focusInput();
}



////////   Event Listeners   ////////

Q("#expression").on("input", calculator);

Q(".btn-insert").on("click", function() {
    Q("#expression").value += this.innerText;
    calculator();
});

Q(".btn-clear").on("click", function() {
    Q("#expression").value = "";
    calculator();
});



////////   freecurrencyapi.com API KEY    ////////

if (window.localStorage.getItem("API_KEY") === null) {
    Q("#api").show();
    Q("#apikey").on("input", function() {
        window.localStorage.setItem("API_KEY", this.value);
    });
    console.warn("No API key found. Please enter your API key.");
}
else {
    apiKey = window.localStorage.getItem("API_KEY");
    let url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=USD%2CGBP&base_currency=EUR`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        fx.EURUSD = data.data.USD;
        fx.EURGBP = data.data.GBP;
        console.log(fx);
    })
    .catch(error => console.error(error));
}
