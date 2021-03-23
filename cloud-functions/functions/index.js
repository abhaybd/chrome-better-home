const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const request = require("request").defaults({encoding: null});

exports.getIcon = functions.https.onRequest((httpReq, httpResp) => {
    if (httpReq.method.toUpperCase() !== "GET") {
        httpResp.status(403).send("Forbidden!");
    }

    return cors(httpReq, httpResp, () => {
        const domain = httpReq.query.domain;
        if ("string" === typeof (domain)) {
			const url = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`;
			request.get(url, function (err, resp, body) {
				if (!err && resp.statusCode === 200) {
					let data = "data:" + resp.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
					httpResp.send(data);
				} else {
				    httpResp.status(500).send("Some error occurred!");
                }
			});
        } else {
            httpResp.status(400).send("Must specify a domain!");
        }
    });
});
