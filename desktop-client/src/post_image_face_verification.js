	//https://stackoverflow.com/questions/47630163/axios-post-request-to-send-form-data

	var fs = require('fs')
	var axios = require('axios')
	var FormData = require('form-data')
	const args = process.argv.slice(2);

	var img_capture_path = args[0]
	var clientId = args[1]
	var clientToken = args[2]

	var capturedImgName = "image.jpg"
	// var server = "http://127.0.0.1:8000"
	var server = "https://sdpapi.aifrruislabs.com"

	// var capturedImgFS = fs.createReadStream("C:\\Users\\ELIJAH\\Pictures\\hacker.jpg")
	var capturedImgFS = fs.createReadStream(img_capture_path)
	
	const form_data = new FormData();
	form_data.append("client_unknown_face", capturedImgFS, capturedImgName);
	  
    axios.post(server + "/api/v1/client/face/recognition/verification", form_data, {
      
	    headers: {
	      "Content-Type": `multipart/form-data; boundary=${form_data._boundary}`,
	      "clientId": clientId,
	      "clientToken": clientToken
	    },

    }).then((response) => {
      
      var resData = response.data
     
      //Write Response to Json File
      let data = JSON.stringify(resData);
      fs.writeFileSync('src/data_face_rec_data.json', data);

      console.log(resData)

    }).catch((error) => {
      
      console.log(error)

    });