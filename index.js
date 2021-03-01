const imageUpload = document.getElementById('uploadFile');
let spinnerWrapper = document.querySelector('.spinner-wrapper');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start)




//selecting all required elements
const dropArea = document.querySelector(".drag-area");
const dragText = dropArea.querySelector("header");
const button = dropArea.querySelector("button");
const input = dropArea.querySelector("input");
let file; //this is a global variable and we'll use it inside multiple functions
button.onclick = ()=>{
  input.click(); //if user click on the button then the input also clicked
}



async function start() {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  document.body.append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  spinnerWrapper.parentElement.removeChild(spinnerWrapper);
 

  input.addEventListener('change', async () => {
    file =imageUpload.files[0];
    let fileType = file.type; //getting selected file type
    let validExtensions = ["image/jpeg", "image/jpg", "image/png"]; //adding some valid image extensions in array
    if(!validExtensions.includes(fileType)){ //if user selected file is an image file
      alert("This is not an Image File!");
      dropArea.classList.remove("active");
      dragText.textContent = "Drag & Drop to Upload File";
    }
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    image.style.width ='700px';
    image.style.height = '510px';
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    canvas.style.width ='700px';
    canvas.style.height = '510px';
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
      drawBox.draw(canvas);
    })
    canvas.addEventListener('click',()=>{
      if (image) image.remove();
      if (canvas) canvas.remove();
    });
  })
}

function loadLabeledImages() {
  const labels = [  
    'Benjamin Netanyahu',
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
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/GuyArieli17/prime-minister-classification/main/labeled_images/${label}/${i}.png`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if(detections)descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
