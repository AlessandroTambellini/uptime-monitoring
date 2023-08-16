/*
 * Request Handlers
 *
 */

const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const dns = require('dns');
const _url = require('url');
require('dotenv').config({ path: "./KEYS.env" });
const db = require('../db/index');

// Define all the handlers
let handlers = {}

// TODO: IN MOST OF THE CASES THE METHOD IS ENOUGH, YOU DO NOT NEED TO PASS ALL THE DATA
handlers.index = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, 'html');

    const templateData = {
        'head.title': 'Uptime Monitoring - Made Simple',
        'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
        'body.id': 'index'
    }

    // Read in a template as a string
    helpers.getTemplate("index", templateData, function (err, str) {
        if (!err && str) {
            // Add the common header and footer
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    // Return that page as HTML
                    callback(200, str, "html");
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

// Create Account
handlers.accountCreate = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, 'html');

    const templateData = {
        'head.title': 'Create an Account',
        'body.class': 'accountCreate'
    }

    helpers.getTemplate('account_create', templateData, function (err, str) {
        if (!err && str) {
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

handlers.accountDelete = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, "html");

    const templateData = {
        'head.title': 'delete account',
        'body.class': 'accountDelete' // should I change this to account_delete?
    }

    helpers.getTemplate('account_delete', templateData, function (err, str) {
        if (!err && str) {
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    callback(200, str, "html");
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

handlers.sessionCreate = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Login to your account.',
            'head.description': 'Please enter your phone number and password to access your account.',
            'body.class': 'sessionCreate'
        };
        // Read in a template as a string
        helpers.getTemplate('session_create', templateData, function (err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addCommonTemplate(str, templateData, function (err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Session has been deleted
handlers.sessionDeleted = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account.',
            'body.class': 'sessionDeleted'
        };
        // Read in a template as a string
        helpers.getTemplate('session_deleted', templateData, function (err, str) {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addCommonTemplate(str, templateData, function (err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};


// Create a new check
handlers.checksCreate = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, 'html');

    const templateData = {
        'head.title': 'Create a New Check',
        'body.class': 'checksCreate'
    }
    // Read in a template as a string
    helpers.getTemplate('check_create', templateData, function (err, str) {
        if (!err && str) {
            // Add the universal header and footer
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    callback(200, str, "html");
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

// Dashboard (view all checks)
handlers.checksList = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, 'html');

    const templateData = {
        'head.title': 'dashboard',
        'body.class': 'checksList'
    }

    helpers.getTemplate('checks_list', templateData, function (err, str) {
        if (!err && str) {
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    callback(200, str, "html");
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

handlers.checksDelete = function (data, callback) {
    if (data.method !== "GET")
        callback(405, undefined, 'html');

    const templateData = {
        'head.title': 'checks delete',
        'body.class': 'checksDelete'
    }

    helpers.getTemplate('check_delete', templateData, function (err, str) {
        if (!err && str) {
            helpers.addCommonTemplate(str, templateData, function (err, str) {
                if (!err && str) {
                    callback(200, str, "html");
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
}

/*
 * JSON API Handlers
 *
 */

// Public assets
handlers.public = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === "GET") {
        // Get the filename being requested
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function (err, data) {
                if (!err && data) {

                    // Determine the content type (default to plain text)
                    var contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    // Callback the data
                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(404);
        }

    } else {
        callback(405);
    }
};

// Not-Found
handlers.notFound = function (data, callback) {
    callback(404);
}

// Users
handlers.users = function (data, callback) {
    var acceptableMethods = ["POST", "GET", "DELETE"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
handlers._users = {}

handlers._users.POST = function (data, callback) {

    let { name, phone } = data.payload;
    name = typeof (name) === "string" && name.trim().length > 0 ? name.trim() : false;
    phone = typeof (phone) === "string" && phone.trim().length >= 5 && phone.trim().length <= 15 ? phone.trim() : false;

    if (!name || !phone)
        return callback(400, { 'Error': 'Missing required fields' });

    db.queries.getUser(phone, function (err, data) {
        if (err && !data)
            return callback(520, { "Error": "unknown error" });
        if (!err && data)
            return callback(400, { 'Error': 'A user with that phone number already exists' });

        if (!err && !data) {
            const userObj = { name, phone };
            // Store the user
            db.queries.postUser(userObj, function (err) {
                if (!err) {
                    callback(200);
                }
                else {
                    callback(500, { 'Error': 'Could not create the new user' });
                }
            });
        }
    })
}

// Required data: phone
// Optional data: none
handlers._users.GET = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let phone = params.get("phone");
    phone = typeof (phone) === "string" && phone.trim().length >= 5 && phone.trim().length <= 15 ? phone.trim() : false;

    if (!phone)
        return callback(400, { 'Error': 'Missing required field' })

    let { token } = data.headers;
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (!tokenIsValid)
            return callback(403, { "Error": "Missing required token in header, or token is invalid." })

        db.queries.getUser(phone, function (err, data) {
            if (!err && data) {
                callback(200, data);
            }
            else {
                callback(404);
            }
        })
    });
}

handlers._users.DELETE = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let phone = params.get("phone");
    phone = typeof (phone) === "string" && phone.trim().length >= 5 && phone.trim().length <= 15 ? phone.trim() : false;
    if (!phone)
        return callback(400, { 'Error': 'Missing required field' });

    let { token } = data.headers;
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (!tokenIsValid)
            return callback(403, { "Error": "Missing required token in header, or token is invalid." });

        db.queries.getUser(phone, function (err, userData) {
            if (err && !userData)
                return callback(520, { "Error": "unknown error" });
            if (!err && !userData)
                return callback(404, { 'Error': 'user not found' });

            if (!err && userData) {
                db.queries.deleteUser(phone, function (err) {
                    if (err)
                        return callback(500, { 'Error': 'Could not delete the specified user' });

                    const userChecks = typeof (userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : [];
                    const checksToDelete = userChecks.length;
                    let checksDeleted = 0;
                    let errorDeleting = false;

                    if (checksToDelete === 0)
                        return callback(200);

                    userChecks.forEach(function (checkId) {
                        db.queries.deleteCheck(checkId, function (err) {
                            if (err)
                                errorDeleting = true;
                            checksDeleted++;
                            if (checksDeleted === checksToDelete) {
                                if (!errorDeleting)
                                    return callback(200);
                                else
                                    return callback(500, { 'Error': "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully." })
                            }
                        });
                    });
                });
            }
        });
    });
}

handlers.tokens = function (data, callback) {
    var acceptableMethods = ["POST", "GET", "DELETE"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._tokens = {};


handlers._tokens.POST = function (data, callback) {

    let { phone } = data.payload;
    phone = typeof (phone) === "string" && phone.trim().length >= 5 && phone.trim().length <= 15 ? phone.trim() : false;

    if (!phone)
        return callback(400, { 'Error': 'Missing required field.' })

    db.queries.getUser(phone, function (err, data) {
        if (!err && data) {
            var tokenId = helpers.createRandomString(20);
            var expires = Date.now() + 1000 * 60 * 60 * 24; // the token last for 1 day

            var tokenObject = {
                'phone': phone,
                'id': tokenId,
                'expires': expires
            };
            db.queries.postToken(tokenObject, function (err) {
                if (!err) {
                    callback(200, tokenObject);
                }
                else {
                    callback(500, { 'Error': 'Could not create the new token' });
                }
            })
        }
        else {
            callback(400, { 'Error': 'Could not find the specified user.' });
        }
    })
};

handlers._tokens.GET = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length === 20 ? id.trim() : false;

    if (!id)
        return callback(400, { 'Error': 'Missing required field, or field invalid' });

    db.queries.getToken(id, function (err, data) {
        if (!err && data) {
            callback(200, data);
        }
        else {
            callback(404);
        }
    })
};

handlers._tokens.verifyToken = function (id, phone, callback) {

    id = typeof (id) === "string" && id.trim().length === 20 ? id.trim() : false;
    if (!id)
        return callback(false); // malformed token 

    db.queries.getToken(id, function (err, data) {
        if (!err && data) {
            if (data.phone === phone && data.expires > Date.now()) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    })
};

handlers._tokens.DELETE = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length === 20 ? id.trim() : false;

    if (!id)
        return callback(400, { 'Error': 'Missing required field' })

    db.queries.getToken(id, function (err, data) {
        if (!err && data) {
            db.queries.deleteToken(id, function (err) {
                if (!err) {
                    callback(200);
                }
                else {
                    callback(500, { "ERROR": err });
                }
            })
        }
        else {
            callback(400, { 'Error': 'Could not find the specified token.' });
        }
    })
};

// Checks
handlers.checks = function (data, callback) {
    var acceptableMethods = ["POST", "GET", "DELETE"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the checks methods
handlers._checks = {}

// Checks - post
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.POST = function (data, callback) {

    let { url, method, successCodes } = data.payload;
    url = typeof (url) === "string" && url.trim().length > 0 ? url.trim() : false;
    // I don't need to validate again the method. It's already validated to route to _checks.POST
    method = typeof (method) === "string" ? method : false;
    successCodes = typeof (successCodes) === "object" && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;

    if (!url || !successCodes || !method)
        return callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' });

    let { token } = data.headers;
    token = typeof (token) === "string" && token.trim().length === 20 ? token.trim() : false;

    if (!token)
        return callback(400, { "Error": "bad token" });

    console.log("I passed the sanitation tests");
    db.queries.getToken(token, function (err, tokenData) {
        if (!err && tokenData) {
            const phone = tokenData.phone;

            db.queries.getUser(phone, function (err, userData) {
                if (!err && userData) {

                    if (!userData.checks)
                        userData.checks = [];
                    if (userData.checks.length >= process.env.MAX_CHECKS)
                        return callback(400, { 'Error': 'The user already has the maximum number of checks (' + process.env.MAX_CHECKS + ').' })

                    // Verify that the URL given has DNS entries (and therefore can resolve)
                    // TODO: in future is gonna accept more than the base url
                    const websiteURL = new URL("", "https://" + url);
                    const hostName = typeof (websiteURL.hostname) === "string" && websiteURL.hostname.length > 0 ? websiteURL.hostname : false;

                    dns.resolve(hostName, function (err, records) {
                        if (!err && records) {

                            const checkId = helpers.createRandomString(20);

                            const checkObject = {
                                'id': checkId,
                                'userphone': userData.phone,
                                'protocol': "https",
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                            }

                            db.queries.postCheck(checkObject, function (err) {
                                if (!err) {

                                    userData.checks.push(checkId);

                                    db.queries.putUser(userData, function (err) {
                                        if (!err) {
                                            callback(200, checkObject);
                                        }
                                        else {
                                            callback(500, { "ERROR": err });
                                        }
                                    });
                                }
                                else {
                                    callback(500, { "ERROR": err });
                                }
                            });
                        } else {
                            callback(400, { 'Error': 'The hostname of the URL entrered did not resolve to any DNS entries' });
                        }
                    });
                }
                else {
                    callback(403);
                }
            })
        }
        else {
            callback(403);
        }
    });
}

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.GET = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length === 20 ? id.trim() : false;

    if (!id)
        return callback(400, { 'Error': 'Missing required field, or field invalid' })

    db.queries.getCheck(id, function (err, checkData) {
        if (!err && checkData) {
            let { token } = data.headers;
            handlers._tokens.verifyToken(token, checkData.userphone, function (tokenIsValid) {
                if (tokenIsValid)
                    return callback(200, checkData);
                else
                    return callback(403);
            });
        }
        else {
            callback(404);
        }
    });
}

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.DELETE = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("uid");
    id = typeof (id) === "string" && id.trim().length === 20 ? id.trim() : false;

    if (!id)
        return callback(400, { "Error": "Missing valid id" });

    db.queries.getCheck(id, function (err, checkData) {
        if (!err && checkData) {
            let { token } = data.headers;
            handlers._tokens.verifyToken(token, checkData.userphone, function (tokenIsValid) {
                if (!tokenIsValid)
                    return callback(403);

                db.queries.deleteCheck(id, function (err) {
                    if (err)
                        return callback(500, { "Error": "Could not delete the check data." })

                    db.queries.getUser(checkData.userphone, function (err, userData) {
                        if (err)
                            return callback(500, { "Error": "Could not find the user who created the check, so could not remove the check from the list of checks on their user object." });

                        let userChecks = typeof (userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : [];

                        // Remove the deleted check from their list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition === -1)
                            return callback(500, { "Error": "Could not find the check on the user's object, so could not remove it." });

                        userChecks.splice(checkPosition, 1);

                        // Re-save the user's data
                        userData.checks = userChecks;
                        db.queries.putUser(userData, function (err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, { 'Error': 'Could not update the user.' });
                            }
                        });
                    });

                });
            });
        }
        else {
            callback(400, { "Error": "The check ID specified could not be found" });
        }
    });
}


// Export the handlers
module.exports = handlers;
