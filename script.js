document.addEventListener('DOMContentLoaded', function() {
    // Camera capture functionality
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture');
    const classifyBtn = document.getElementById('classify');
    let imageData;

    // Check if the browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request access to the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
            });
    } else {
        console.error('getUserMedia not supported by this browser');
    }

    // Capture image from camera
    captureBtn.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageData = canvas.toDataURL('image/png');
        classifyBtn.disabled = false;
        displayImage(imageData);
    });

    // File input functionality
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            imageData = reader.result;
            classifyBtn.disabled = false;
            displayImage(imageData);
        };
        reader.readAsDataURL(file);
    });

    // Function to display image
    function displayImage(imageData) {
        resultImg.src = imageData;
        resultImg.style.display = 'block';
    }

    // Analyze image and display result
    const resultImg = document.getElementById('resultImg');
    const resultText = document.getElementById('result');


    classifyBtn.addEventListener('click', () => {
        analyzeImage(imageData);
    });

    const minConfidenceThreshold = 0.5;

    function analyzeImage(imageData) {
      const imageBase64 = imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
  
      axios({
        method: 'POST',
        url: 'https://classify.roboflow.com/banana-ripeness-classification/3',
        params: {
          api_key: 'YFsxXbmNN5dCelQ3Munn'
        },
        data: imageBase64,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {
        console.log('API Response:', response.data);
        const predictions = response.data.predictions;
        const maxConfidence = Math.max(...predictions.map(p => p.confidence));
  
        if (maxConfidence < minConfidenceThreshold) {
          resultText.textContent = 'The uploaded image does not seem to contain a banana.';
          resultImg.style.display = 'none';
        } else {
          const ripePrediction = predictions.find(p => p.confidence === maxConfidence);
          resultImg.src = imageData;
          resultImg.style.display = 'block';
          resultText.textContent = `The banana is ${ripePrediction.class}`;
        }
      })
      .catch(function (error) {
        console.log('API Error:', error);
        resultText.textContent = 'Error occurred while analyzing the image.';
      });
    }
  
});