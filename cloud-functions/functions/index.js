const functions = require("firebase-functions");
const cors = require("cors")({origin: true});

const bent = require("bent");
const get = bent("GET");

const API_URL = "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=16&url=";

exports.getIcon = functions.https.onRequest((httpReq, httpResp) => {
    if (httpReq.method.toUpperCase() !== "GET") {
        httpResp.status(403).send("Forbidden!");
    }

    return cors(httpReq, httpResp, () => {
        const domain = httpReq.query.domain;
        if ("string" === typeof (domain)) {
			const url = API_URL + domain;
			get(url).then(resp => {
			    resp.arrayBuffer().then(buffer => {
                    let data = "data:" + resp.headers["content-type"] + ";base64," + buffer.toString('base64');
                    httpResp.send(data);
                }).catch(err => {
                    let errMessage = `An error occurred while parsing favicon data: ${err}`;
                    httpResp.status(500).send(errMessage);
                    console.error(new Error(errMessage));
                });
            }).catch(err => {
                if (err.statusCode === 404) {
                    // don't signal error, just signal no content
                    httpResp.status(204).send("Favicon not found!");
                } else {
                    let errMessage = `An error occurred while fetching favicon data: ${err}`;
                    httpResp.status(500).send(errMessage);
                    console.error(new Error(errMessage));
                }
            });
        } else {
            httpResp.status(400).send("Must specify a domain!");
        }
    });
});
