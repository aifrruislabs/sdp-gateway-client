var apiServerUrl = "http://sdpapi.aifrruislabs.com"

var clientId = ""

var clientToken = ""

var clientPublicIp = ""

//Get Client Public Ip
function getClientPublicIp() {
	$.get('https://api.ipify.org?format=json', function (data) {

		var jsonData = JSON.parse(JSON.stringify(data));

		clientPublicIp = jsonData['ip'];

	});
}

$(document).ready(function () {

	//Get Client Public IP
	getClientPublicIp();

});