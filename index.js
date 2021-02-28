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
  const labeledFaceDescription = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescription,0.6);
  let convertedImage;
  let canvas;
  fileUpload.addEventListener('change',async()=>{
      if(convertedImage)convertedImage.remove();
      if(canvas)canvas.remove();
      convertedImage = await faceapi.bufferToImage(fileUpload.files[0]);
      container.append(convertedImage);
      canvas = faceapi.createCanvasFromMedia(convertedImage);
      container.append(canvas);
      const displaySize = { width: convertedImage.width, height: convertedImage.height};
      faceapi.matchDimensions(canvas,displaySize);
      const detection = await faceapi.detectAllFaces(convertedImage).withFaceLandmarks().withFaceDescriptors();
      const resizeDetection = faceapi.resizeResults(detection,displaySize);
      const results = resizeDetection.map(d=>faceMatcher.findBestMatch(d.descriptor));
      results.forEach((result,index) =>{
        const box = resizeDetection[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box,{label: result.toString()});
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
  return Promise.all([
    labels.map(async label =>{
      const description = [];
      for(let i=0; i<=2;i++){
          const image = await faceapi.fetchImages(`https://github.com/GuyArieli17/prime-minister-classification/tree/main/labeled_images/${label}/${i}.png`);
          const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptors();
          description.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label,detections.descriptor)
    })
  ]);
  
}
