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
    if (data.method != "get")
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
    if (data.method != "get")
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
    if (data.method != "get")
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
    if (data.method == 'get') {
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
    if (data.method == 'get') {
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
    if (data.method != 'get')
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
    if (data.method != 'get')
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
    if (data.method != 'get')
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
    if (data.method == 'get') {
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
    var acceptableMethods = ['post', 'get', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
handlers._users = {}

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    let { name, phone } = data;
    name = typeof (name) === "string" && name.trim().length > 0 ? name.trim() : false;
    phone = typeof (phone) === "string" && phone.trim().length > 0 ? phone.trim() : false;
    // phone.trim().length > 0 -> TODO: improve this check

    if (!name || !phone)
        return callback(400, { 'Error': 'Missing required fields' });

    _data.read('users', phone, function (err, data) {
        if (err) {
            // Create the user object
            const userObject = {
                'name': name,
                'phone': phone,
            }

            // Store the user
            _data.create('users', phone, userObject, function (err) {
                if (!err) {
                    callback(200);
                } else {
                    callback(500, { 'Error': 'Could not create the new user' });
                }
            });

        } else {
            callback(400, { 'Error': 'A user with that phone number already exists' });
        }
    });
}

// Required data: phone
// Optional data: none
handlers._users.get = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let phone = params.get("phone");
    phone = typeof (phone) === "string" && phone.trim().length > 0 ? phone.trim() : false;

    if (!phone)
        return callback(400, { 'Error': 'Missing required field' })

    // Get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
            // Lookup the user
            db.queries.getUser(phone, function (err, data) {
                if (!err && data) {
                    callback(200, data);
                }
                else {
                    callback(404);
                }
            })
        } else {
            callback(403, { "Error": "Missing required token in header, or token is invalid." })
        }
    });

}

// Required data: phone
// Cleanup old checks associated with the user
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    let params = new URLSearchParams(data.searchParams);
    let phone = params.get("phone");
    phone = typeof (phone) === "string" && phone.trim().length > 0 ? phone.trim() : false;
    if (phone) {

        // Get token from headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function (err, userData) {
                    if (!err && userData) {
                        // Delete the user's data
                        _data.delete('users', phone, function (err) {
                            if (!err) {
                                // Delete each of the checks associated with the user
                                var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                var checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    var checksDeleted = 0;
                                    var deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(function (checkId) {
                                        // Delete the check
                                        _data.delete('checks', checkId, function (err) {
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'Error': "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully." })
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, { 'Error': 'Could not delete the specified user' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'Could not find the specified user.' });
                    }
                });
            } else {
                callback(403, { "Error": "Missing required token in header, or token is invalid." });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

handlers.tokens = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._tokens = {};


handlers._tokens.post = function (data, callback) {
    const phone = typeof (data.payload.phone) === "string" ? data.payload.phone.trim() : false;

    if (!phone)
        return callback(400, { 'Error': 'Missing required field(s).' })

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

handlers._tokens.get = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length == 20 ? id.trim() : false;

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
    // Lookup the token
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

handlers._tokens.delete = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length == 20 ? id.trim() : false;

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
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
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
handlers._checks.post = function (data, callback) {

    let { url, method, successCodes } = data.payload;
    url = typeof (url) === "string" && url.trim().length > 0 ? url.trim() : false;
    method = typeof (method) === "string" && ["post", "get", "put", "delete"].indexOf(method) > -1 ? method : false;
    successCodes = typeof (successCodes) === "object" && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;

    if (!url || !successCodes || !method)
        return callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' });

    const token = typeof (data.headers.token) === "string" ? data.headers.token : false;

    console.log(token);
    // Lookup the user phone by reading the token
    _data.read('tokens', token, function (err, tokenData) {
        if (!err && tokenData) {
            var userPhone = tokenData.phone;

            // Lookup the user data
            _data.read('users', userPhone, function (err, userData) {
                if (!err && userData) {
                    var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                    // Verify that user has less than the number of max-checks per user
                    if (userChecks.length < process.env.MAX_CHECKS) {

                        // Verify that the URL given has DNS entries (and therefore can resolve)
                        var parsedUrl = _url.parse("https" + '://' + url, true);
                        var hostName = typeof (parsedUrl.hostname) == 'string' && parsedUrl.hostname.length > 0 ? parsedUrl.hostname : false;
                        dns.resolve(hostName, function (err, records) {
                            if (!err && records) {

                                // Create random id for check
                                var checkId = helpers.createRandomString(20);

                                // Create check object including userPhone
                                var checkObject = {
                                    'id': checkId,
                                    'userPhone': userPhone,
                                    'protocol': "https",
                                    'url': url,
                                    'method': method,
                                    'successCodes': successCodes,
                                }

                                // Save the object
                                _data.create('checks', checkId, checkObject, function (err) {
                                    if (!err) {
                                        // Add check id to the user's object
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);

                                        // Save the new user data
                                        _data.update('users', userPhone, userData, function (err) {
                                            if (!err) {
                                                callback(200, checkObject);
                                            } else {
                                                callback(500, { 'Error': 'Could not update the user with the new check.' });
                                            }
                                        });
                                    } else {
                                        callback(500, { 'Error': 'Could not create the new check' });
                                    }
                                });
                            } else {
                                callback(400, { 'Error': 'The hostname of the URL entrered did not resolve to any DNS entries' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'The user already has the maximum number of checks (' + process.env.MAX_CHECKS + ').' })
                    }
                } else {
                    callback(403);
                }
            });
        } else {
            callback(403);
        }
    });
}

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("id");
    id = typeof (id) === "string" && id.trim().length == 20 ? id.trim() : false;

    if (!id)
        return callback(400, { 'Error': 'Missing required field, or field invalid' })

    // Lookup the check
    _data.read('checks', id, function (err, checkData) {
        if (!err && checkData) {
            // Get the token that sent the request
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid and belongs to the user who created the check
            handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                if (tokenIsValid) {
                    // Return check data
                    callback(200, checkData);
                } else {
                    callback(403);
                }
            });
        } else {
            callback(404);
        }
    });
}

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function (data, callback) {

    let params = new URLSearchParams(data.searchParams);
    let id = params.get("uid");
    id = typeof (id) === "string" && id.trim().length == 20 ? id.trim() : false;

    if (!id)
        return callback(400, { "Error": "Missing valid id" });

    _data.read('checks', id, function (err, checkData) {
        if (!err && checkData) {
            // Get the token that sent the request
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid and belongs to the user who created the check
            handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                if (tokenIsValid) {

                    // Delete the check data
                    _data.delete('checks', id, function (err) {
                        if (!err) {
                            // Lookup the user's object to get all their checks
                            _data.read('users', checkData.userPhone, function (err, userData) {
                                if (!err) {
                                    var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                    // Remove the deleted check from their list of checks
                                    var checkPosition = userChecks.indexOf(id);
                                    if (checkPosition > -1) {
                                        userChecks.splice(checkPosition, 1);
                                        // Re-save the user's data
                                        userData.checks = userChecks;
                                        _data.update('users', checkData.userPhone, userData, function (err) {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback(500, { 'Error': 'Could not update the user.' });
                                            }
                                        });
                                    } else {
                                        callback(500, { "Error": "Could not find the check on the user's object, so could not remove it." });
                                    }
                                } else {
                                    callback(500, { "Error": "Could not find the user who created the check, so could not remove the check from the list of checks on their user object." });
                                }
                            });
                        } else {
                            callback(500, { "Error": "Could not delete the check data." })
                        }
                    });
                } else {
                    callback(403);
                }
            });
        } else {
            callback(400, { "Error": "The check ID specified could not be found" });
        }
    });
}


// Export the handlers
module.exports = handlers;
