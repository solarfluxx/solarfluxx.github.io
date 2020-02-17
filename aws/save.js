//#region Old

const aws = require('aws-sdk');
const ses = new aws.SES();

exports.handler = (event, context, callback) => {
	
	 var params = {
		Destination: {
			ToAddresses: ["cartchart@impells.com"]
		},
		Message: {
			Body: {
				Text: {
                    Data: "Test"
				}
				
			},
			
			Subject: {
				Data: "Test Email"
			}
		},
		Source: "cartchart@impells.com"
	};

	
	 ses.sendEmail(params, function (err, data) {
		callback(null, {err: err, data: data});
		if (err) {
			console.log(err);
			context.fail(err);
		} else {
			
			console.log(data);
			context.succeed(event);
		}
	});
};

//#endregion Old


//#region New

const EMT = require('./email_templates');

const AWS = require('aws-sdk');
const ses = new AWS.SES();

function generateApiResponse(data) {
    return {
        "statusCode": (data.success ? 200 : 500),
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
        "body": JSON.stringify(data),
        "isBase64Encoded": false
    };
}

exports.handler = async (event, context, callback) => {
   
    let ret = {
        success: false,
        message: '',
        response: '',
        //raw: event,
    };
   
    if (!event) {
        ret.message = 'event is falsey';
        return callback(null, generateApiResponse(ret));
    }
   
    if (!event.body) {
        ret.message = 'request body is falsey';
        return callback(null, generateApiResponse(ret));
    }
   
    const bodyData = JSON.parse(event.body);
   
    if (!bodyData.addresses) {
        ret.message = 'body is missing addresses';
        return callback(null, generateApiResponse(ret));
    }
    
    if (!bodyData.message) {
        ret.message = 'body is missing message';
        return callback(null, generateApiResponse(ret));
    }
    
    if (!(bodyData.message.template >= 0)) {
        ret.message = 'message is missing template';
        return callback(null, generateApiResponse(ret));
    }
    
    if (!bodyData.message.data) {
        ret.message = 'message is missing data';
        return callback(null, generateApiResponse(ret));
    }
    
    if (!bodyData.subject) {
        ret.message = 'message is missing subject';
        return callback(null, generateApiResponse(ret));
    }
    
    var temporary = await new EMT.EmailTemplate(bodyData.message.template, bodyData.message.data).html;
    
    const params = {
		Destination: {
			ToAddresses: bodyData.addresses
		},
		Message: {
			Body: {
				Text: {
                    Data: temporary
				}
			},
			
			Subject: {
				Data: bodyData.subject
			}
		},
		Source: "cartchart@impells.com"
	};
   
    try {
    	const data = await ses.sendEmail(params).promise();
        console.log(data);           // successful response
    }
    catch (err) {
        console.log(err, err.stack); // an error occurred
    }
   
    ret.success = true;
    return callback(null, generateApiResponse(ret));
};

//#endregion New
