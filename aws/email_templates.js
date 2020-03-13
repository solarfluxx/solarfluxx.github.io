const fs = require('fs');

//#region Classes

/**
 * EmailTemplate must be used asynchronously
 * @constructor
 * @param  {Number} template The index for the template you want to use.
 * @param  {Object} data Data that the template uses.
 */
class EmailTemplate {
	constructor(template, data) {
		this.data = (data && data.constructor == Object) && data || undefined;
		this.template_index = (template && Number.isInteger(template)) && template || 0;
		this.template_names = ['invite', 'shiftnoti'];
		this.template = this.template_names[this.template_index];
		this.html = new Promise((resolve, reject) => {
			fs.readFile(`../solarfluxx.github.io/aws/templates/${this.template}.html`, 'utf8', (err, html) => {
				if (err) {
					reject(err);
					throw err;
				}
				let email_html = html;
				let regex = [
					/\${(.+?)}/g,
					/(\w+)\./
				];
				let matches = html.match(regex[0]);
				matches.forEach(match => {
					let capture = match.split(regex[0])[1];
					let value = this.data;
					capture.split('.').forEach(snapshot => {
						value = value[snapshot];
					});
			
					email_html = email_html.replace(match, value);
				});
				resolve(email_html);
			});
		});
	}
}

//#endregion Classes

// Email Parse
async function EmailComeIn(data) {
	let template = new EmailTemplate(data.template, data.data);
	let output = await template.html;
	console.log(output);
}

// Psudo Email Sent
EmailComeIn({
	template: 0,
	data: {
		name: {
			prefix: 'Brother',
			first: 'Robert',
			last: 'Impellitteri'
		},
		location: {
			town: 'Wakefield',
			state: 'RI'
		}
	}
});

EmailComeIn({
	template: 1,
	data: {
		name: {
			prefix: 'Brother',
			first: 'Robert',
			last: 'Impellitteri'
		},
		location: {
			town: 'Wakefield',
			state: 'RI'
		},
		shift: {
			location: 'Main Street',
			time: '8AM - 10AM',
			data: 'February 20'
		}
	}
});
