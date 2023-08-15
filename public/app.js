/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {}

// Config
app.config = {
    'sessionToken': false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function (headers, path, method, searchParams, payload, callback) {
    // Set defaults
    headers = typeof (headers) == 'object' && headers !== null ? headers : {}
    path = typeof (path) == 'string' ? path : '/';
    method = typeof (method) == 'string' && ['POST', 'GET', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    searchParams = typeof (searchParams) == 'object' && searchParams !== null ? searchParams : {}
    payload = typeof (payload) == 'object' && payload !== null ? payload : {}
    callback = typeof (callback) == 'function' ? callback : false;

    // For each query string parameter sent, add it to the path
    var requestUrl = path + '?';
    var counter = 0;
    for (var queryKey in searchParams) {
        if (searchParams.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string parameter has already been added, preprend new ones with an ampersand
            if (counter > 1) {
                requestUrl += '&';
            }
            // Add the key and value
            requestUrl += queryKey + '=' + searchParams[queryKey];
        }
    }

    // Form the http request as a JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");

    // For each header sent, add it to the request
    for (var headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // When the request comes back, handle the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // Callback if requested
            if (callback) {
                try {
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }

            }
        }
    }

    // Send the payload as JSON
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);

}

app.bindLogoutButton = function () {
    document.getElementById("logoutButton").addEventListener("click", function (e) {

        e.preventDefault();

        app.logUserOut();
    });
};

app.getSessionToken = function () {
    var tokenString = localStorage.getItem('token');
    if (typeof (tokenString) == 'string') {
        try {
            var token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == 'object') {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

app.setSessionToken = function (token) {
    app.config.sessionToken = token;
    var tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (typeof (token) == 'object') {
        console.log("token set");
        app.setLoggedInClass(true);
    } else {
        console.log("token not set");
        app.setLoggedInClass(false);
    }
};

app.setLoggedInClass = function (add) {
    var target = document.querySelector("body");
    if (add) {
        target.classList.add('loggedIn');
    } else {
        target.classList.remove('loggedIn');
    }
}

app.logUserOut = function () {
    const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;
    const searchParams = {
        'id': tokenId
    }

    app.client.request(undefined, 'api/tokens', 'DELETE', searchParams, undefined, function (statusCode, responsePayload) {

        app.setSessionToken(false);
        window.location = '/session/deleted';
    });
}

// Bind the forms
app.bindForms = function () {
    const form = document.querySelector("form");

    if (form === null)
        return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();
        const formId = this.id;
        const path = this.action;
        let method = this.method.toUpperCase();
        if (formId === "checksDelete")
            method = "DELETE";

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#" + formId + " .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector("#" + formId + " .formSuccess")) {
            document.querySelector("#" + formId + " .formSuccess").style.display = 'none';
        }

        // Turn the inputs into a payload
        var payload = {}
        var elements = this.elements;
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].type !== 'submit') {
                var elementName = elements[i].name;
                var elementClassList = elements[i].classList.value;
                var elementValue = elements[i].value;

                if (elementName == 'https-method') {
                    elementName = 'method';
                }
                if (elementName == "check-id-input") {
                    elementName = "id";
                }

                if (elementClassList.indexOf('multiselect') > -1) {
                    if (elements[i].checked) {
                        payload[elementName] = typeof (payload[elementName]) == 'object' && payload[elementName] instanceof Array ? payload[elementName] : [];
                        payload[elementName].push(elementValue);
                    }
                } else {
                    payload[elementName] = elementValue;
                }

            }
        }
        // If the method is DELETE, the payload should be a searchParams instead
        const searchParams = method == 'DELETE' ? payload : {}

        // Call the API
        app.client.request(undefined, path, method, searchParams, payload, function (statusCode, responsePayload) {
            if (statusCode !== 200) {
                if (statusCode == 403) {
                    app.logUserOut();
                } else {
                    const error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
                    document.querySelector("#" + formId + " .formError").innerText = error;
                    document.querySelector("#" + formId + " .formError").style.display = 'block';
                }
            } else {
                // If successful, send to form response processor
                app.formResponseProcessor(formId, payload, responsePayload);
            }

        });
    });
}

app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    // If account creation was successful, try to immediately log the user in
    if (formId == 'accountCreate') {
        // Take the phone and password, and use it to log the user in
        var newPayload = {
            'phone': requestPayload.phone
        }

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // Display an error on the form if needed
            if (newStatusCode !== 200) {

                // Set the formError field with the error text
                document.querySelector("#" + formId + " .formError").innerText = 'Sorry, an error has occured. Please try again.';

                // Show (unhide) the form error field on the form
                document.querySelector("#" + formId + " .formError").style.display = 'block';

            } else {
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all';
            }
        });
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == 'sessionCreate') {
        app.setSessionToken(responsePayload);
        window.location = '/checks/list';
    }

    // If the user just created a new check successfully, redirect back to the dashboard
    if (formId == 'checkCreate') {
        window.location = '/checks/list';
    }

    // If the user just deleted a check, redirect them to the dashboard
    if (formId == 'checksDelete') {
        window.location = '/checks/list';
    }
}


// Load data on the page
app.loadDataOnPage = function () {
    // Get the current page from the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;
    // Logic for dashboard page
    if (primaryClass == 'checksList') {
        app.loadChecksListPage();
    }

    if (primaryClass == "checksDelete")
        app.loadChecksDeletePage();
}

// Load the dashboard page specifically
app.loadChecksListPage = function () {

    const searchParams = {
        "phone": app.config.sessionToken.phone
    }

    app.client.request(undefined, 'api/users', 'GET', searchParams, undefined, function (statusCode, responsePayload) {
        if (statusCode !== 200)
            return app.logUserOut();

        const { checks } = responsePayload;
        if (!checks || checks.length === 0) {
            document.getElementById("no-checks-msg").style.display = 'table-row';
            document.getElementById("create-check-wrapper").style.display = 'block';
            return;
        }

        // load data for each check
        checks.forEach(function (checkId) {
            const newSearchParams = {
                'id': checkId
            }
            app.client.request(undefined, 'api/checks', 'GET', newSearchParams, undefined, function (statusCode, responsePayload) {
                if (statusCode !== 200)
                    return console.log("Error trying to load check ID: ", checkId);

                const { method, protocol, url, state, id } = responsePayload;
                const table = document.getElementById("checks-list-table");
                const tr = table.insertRow(-1);

                tr.insertCell(0).innerText = method;
                tr.insertCell(1).innerText = protocol;
                tr.insertCell(2).innerText = url;
                tr.insertCell(3).innerHTML = `<div class="loader animated-loader ${state === "up" ? "up" : state === "down" ? "down" : "unknown"}"></div>`;
                tr.insertCell(4).innerHTML = `<a href=/checks/delete?id=${id}>View / Delete</a>`;
            });
        });

        if (checks.length < 5) {
            document.getElementById("create-check-wrapper").style.display = 'block';
        }
    });
}

app.loadChecksDeletePage = function () {

    const id = window.location.href.split('=')[1];

    if (!id)
        return window.location = '/checks/all';

    const searchParams = { id };
    app.client.request(undefined, 'api/checks', 'GET', searchParams, undefined, function (statusCode, responsePayload) {

        if (statusCode !== 200)
            return window.location = "checks/all";

        // Put the hidden id field into both forms
        var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for (var i = 0; i < hiddenIdInputs.length; i++) {
            hiddenIdInputs[i].value = responsePayload.id;
        }

        document.querySelector("#checksDelete .displayIdInput").value = responsePayload.id;
        document.querySelector("#checksDelete .displayStateInput").value = responsePayload.state;
        document.querySelector("#checksDelete .protocolInput").value = responsePayload.protocol;
        document.querySelector("#checksDelete .urlInput").value = responsePayload.url;
    });
}

// Init (bootstrapping)
app.init = function () {
    app.bindForms();

    app.bindLogoutButton();

    app.getSessionToken();

    app.loadDataOnPage();
}

// Call the init processes after the window loads
window.onload = function () {
    app.init();
}
