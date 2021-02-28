const fileUpload = document.getElementById('fileUpload');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  document.body.append('Loading');
  const container = document.createElement('div');
  container.style.position = 'relative';
  document.body.append(container);
  fileUpload.addEventListener('change',async()=>{
      const image = fileUpload.files[0];
      const convertedImage = await faceapi.bufferToImage(image);
      container.append(convertedImage);
      const canvas = faceapi.createCanvasFromMedia(convertedImage);
      container.append(canvas);
      const displaySize = { width: convertedImage.width, height: convertedImage.height};
      faceapi.matchDimensions(canvas,displaySize);
      const detection = await faceapi.detectAllFaces(convertedImage).withFaceLandmarks().withFaceDescriptors();
      const resizeDetection = faceapi.resizeResults(detection,displaySize);
      resizeDetection.forEach(detection =>{
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box,{label: 'Face'});
        drawBox.draw(canvas);
      })
     
  });
}

function loadLabeledImages(){
  const labels = [  'Benjamin Netanyahu',
                    'Ehud Olmert',
                    'Ariel Sharon',
                    'Ehud Barak',
                    'Shimon Peres',
                    'Yitzhak Rabin',
                    'Yitzhak Shamir',
                    'Menachem Begin',
                    'Golda Meir',
                    'David Ben-Gurion',
                    'Moshe Sharett',
                  ];
                  
  
}