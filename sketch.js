

let faceapi,
    video,
    detections;



let previousPixels;
let f;
let spectrum;
let buf;

let funcs = [];
let imgs = [];
let Giorno;
//how often should we switch the image
let imgThresh = 0.03;
//how much gaussian the images will have and how much we will invert them
let gausInv = 180;

let streamW = 640;
let streamH = 480;

// these are our options for detecting faces, provided by ml5.js
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}

//keep orginal copy of image to draw over
function copyImage(src, dst) {
    let n = src.length;
    if (!dst || dst.length != n) dst = new src.constructor(n);
    while (n--) dst[n] = src[n];
    return dst;
}

function drawCanny(showImg) {
    if (showImg < imgThresh && sound.isPlaying()) {
        buf.image(random(imgs), randomGaussian(0, gausInv), randomGaussian(0, gausInv));
    } else {
        buf.image(video, 0, 0);
    }

    buf.filter(ERODE);
}
//frame difference 
function drawDiffRGB(showImg) {
    video.loadPixels();
    let hasChanged = false;

    if (video.pixels.length > 0) { 
        if (!previousPixels || video.pixels.length != previousPixels.length) {
            previousPixels = copyImage(video.pixels, previousPixels);
        } else {
            let pixels = video.pixels;
            let diffThresh = 15;

            for (let i = 0; i < pixels.length; i += 4) {
                // calculate the differences
                let rdiff = Math.abs(pixels[i] - previousPixels[i]);
                let gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
                let bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);

                // copy the current pixels to previousPixels
                previousPixels[i] = pixels[i];
                previousPixels[i + 1] = pixels[i + 1];
                previousPixels[i + 2] = pixels[i + 2];

                let diffs = rdiff + gdiff + bdiff;

                if (!hasChanged || diffs > diffThresh) {
                    hasChanged = true;
                }

                pixels[i] = rdiff;
                pixels[i + 1] = gdiff;
                pixels[i + 2] = bdiff;
            }
        }
    }
    if (hasChanged) {
        video.updatePixels();
    }

    buf.image(video, 0, 0);
}


function drawDiffBW(showImg) {
    video.loadPixels();
    let hasChanged = false;

    if (video.pixels.length > 0) { 
        if (!previousPixels || video.pixels.length != previousPixels.length) {
            previousPixels = copyImage(video.pixels, previousPixels);
        } else {
            let pixels = video.pixels;
            let diffThresh = 15;

            for (let i = 0; i < pixels.length; i += 4) {
                // calculate the differences
                let rdiff = Math.abs(pixels[i] - previousPixels[i]);
                let gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
                let bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);

                // copy the current pixels to previousPixels
                previousPixels[i] = pixels[i];
                previousPixels[i + 1] = pixels[i + 1];
                previousPixels[i + 2] = pixels[i + 2];

                let diffs = rdiff + gdiff + bdiff;
                let output = 0;
                
                if (diffs > diffThresh) {
                    output = 255;
                    hasChanged = hasChanged || true;
                }
                
                pixels[i] = output;
                pixels[i + 1] = output;
                pixels[i + 2] = output;
            }
        }
    }

    if (hasChanged) {
        video.updatePixels();
    }

    buf.image(video, 0, 0);
}

// Invert colors
function drawInvert(showImg) {
    if (showImg < imgThresh && sound.isPlaying()) {
        buf.image(random(imgs), randomGaussian(0, gausInv), randomGaussian(0, gausInv));
    } else {
        buf.image(video, 0, 0);
        buf.filter(INVERT);
    }


}

// Draw image, no alterations
function drawNormal(showImg) {
    buf.image(video, 0, 0);
}

function togglePlay() {
    if (sound.isPlaying()) {
        background(0);
        sound.pause();
    } else {
        sound.loop();
    }
}

function preload() {
    
    sound = loadSound('Jojo.mp3');

   
    Giorno = loadImage('JOhoHead.png');
    imgs.push(loadImage('tree.jpg'));
    imgs.push(loadImage('hand.jpg'));
    imgs.push(loadImage('burned.jpg'));
    imgs.push(loadImage('cradle.jpg'));
    imgs.push(loadImage('way.jpg'));
    imgs.push(loadImage('night.jpg'));

    // Loading functions into func arr
    funcs.push(drawNormal);
    funcs.push(drawCanny);
    funcs.push(drawInvert);
    funcs.push(drawDiffBW);
    funcs.push(drawDiffRGB);
}

function setup() {
    let cnv = createCanvas(600, 338); // I use these to downsize a 720p stream
    buf = createGraphics(streamW, streamH);
    cnv.mouseClicked(togglePlay); 
    fft = new p5.FFT();
    sound.amp(0.2);
    // ask for webcam access - with webcamReady() callback for when we have access
    video = createCapture(VIDEO, webcamReady);
    video.size(streamW, streamH); // set size to be equal to canvas
    f = funcs[0];
    imageMode(CENTER);
    video.hide(); // hide DOM element

}



function webcamReady(stream) {
    // load the faceapi model - with modelReady() callback
    // - NOTE: this time we provide video as the first parameter
    faceapi = ml5.faceApi(video, detection_options, modelReady)
}



function draw() {
    background(0);


    //using fast fourier  transform 
    spectrum = fft.analyze();

    let bass = fft.getEnergy("bass");

    video.loadPixels();
//rounding bass,highMid,treble so that our functions would change according to the type of sound frequency playing  mid,high
    let x = round(map(round(bass), 150, 210, 0, funcs.length - 1, true));
    let showImg = random()
    f = funcs[x];


    let mid = round(fft.getEnergy("highMid", "treble"));
    let p = round(map(mid, 50, 100, 30, 4, true));

    let high = round(fft.getEnergy("treble"));
if(high>40&&high<=50)
        {
            tint(195,100,113);
        }
        else if(high>30&&high<=40)
        {
            tint(219,100,204);
        }
        
        else if(high>=20&&high<=30)
        {
            tint(255,255,169);
        }
    
    if (high > 50 && high <=70) {
        let randImg = (showImg < imgThresh);
 tint(248,197,75);
       

//changing image proportions 
        let num = round(map(high, 60, 70, 1, round(height / 50)));

        for (let i = 0; i < num; i++) {
            let x = round(random(0, 3 * buf.width / 4));
            let y = round(random(0, 3 * buf.height / 4));
            let w = round(random(20, buf.width / 4));
            let h = round(random(20, buf.height / 4));

            if (randImg) {
                
                copy(random(imgs), x, y, w, h, round(random(0, width)), round(random(0, height)), round(random(10, width / 4)), round(random(10, height / 4)));
            } else {
                copy(buf, x, y, w, h, round(random(0, width)), round(random(0, height)), round(random(10, width / 4)), round(random(10, height / 4)));
            }
        }
        //else show orginal image
    }
      
    
    else {
        f(showImg);
       
        buf.filter(POSTERIZE, p);
        image(buf, width / 2, height / 2, streamW, streamH);
    }

    // if we have detections, draw them on the image
    if (detections) {
        // when we call detect, we are looking for potentially multiple faces, so ml5.js returns an array of objects, therefore here we use a for loop to get each 'person'.
        for (let person of detections) {
            drawBox(person);
            drawLandmarks(person);
        }
    }
}


// callback for when ml5.js has loaded the model
function modelReady() {
    console.log("Model is ready...");

    // ask ml5 to detect a faces in the video stream previously provided - gotResults() callback
    faceapi.detect(gotResults);
}

// ml5.js has determined if there's a face
function gotResults(err, result) {
    // check if ml5.js returned an error - if so print to console and stop
    if (err) {
        console.log(err)
        return
    }

    // if it gets here we are okay, so store results in the detections variable, this is an OBJECT of detections - see the console
    //console.log(result);
    detections = result;
    /* detection was kept turning off at the slightest move
    if(result==false)
    {
        sound.stop();
    }
    */
    

    // we recursively call face detect
    faceapi.detect(gotResults)
}


// *** Draw our elements on the image, a box and face feature locations ***  
function drawBox(detections) {
    const alignedRect = detections.alignedRect;
    const {
        _x,
        _y,
        _width,
        _height
    } = alignedRect._box;
    // fill(51);
    noFill();
    let random01 = random(0, 180);
    let random02 = random(0, 200);
    let random03 = random(0, 244);
    let r = map(random01, 0, 600, 0, 255);
    let g = map(random01, 0, 600, 0, 255);
    let b = map(random01, 0, 600, 0, 255);
    stroke(r, g, b);
    strokeWeight(f)
    image(Giorno, _x + 75, _y - 60, _width + 50, _height + 80);
    //rect(_x + 30, _y - 90, _width - 50, _height);

    //textSize(20);
    //text("Who Am I?", _x + 30, _y - 40)

}

function drawLandmarks(detections) {
   /*
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2)
    
    push()
    // mouth
    beginShape();
    detections.parts.mouth.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // nose
    beginShape();
    detections.parts.nose.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // left eye
    beginShape();
    detections.parts.leftEye.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // right eye
    beginShape();
    detections.parts.rightEye.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // right eyebrow
    beginShape();
    detections.parts.rightEyeBrow.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape();

    // left eye
    beginShape();
    detections.parts.leftEyeBrow.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape();

    pop();
*/
}
