// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "@babel/polyfill";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

// Number of classes to classify
const NUM_CLASSES = 4;
// Webcam Image size. Must be 227.
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

let myObj = {};

$.get("https://erdemoflaz.com/money.json", function( data ) {
  setTimeout(function(){
     myObj = data;
     console.log(myObj);
   }, 2000);

});

class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Create video element that will contain the webcam image
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    // Add video element to DOM
    document.body.appendChild(this.video);

    // Create training buttons and info texts
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      div.style.marginBottom = '10px';

      // Create training button
      const button = document.createElement('button')
      if(i == 0){
        button.innerText = " 5 ₺ ";
      }
      if(i == 1){
        button.innerText = " 10 ₺ ";
      }
      if(i == 2){
        button.innerText = " 20 ₺ ";
      }
      if(i == 3){
        button.innerText = "Tanımsız";
        button.classList.add("last");
      }
      div.appendChild(button);

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);

      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = " öğret";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }


    // Setup webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();
    //const model = await tf.loadModel('/Users/erdemoflaz/Desktop/my-model-1');

    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  async animate() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training)
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          $.get("https://erdemoflaz.com/money.json", function( data ) {
             myObj = data;
             console.log(myObj);
          });
          if (res.classIndex == i) { // 5 lira okutulduğunda
            if (i==0) {
              if(myObj["1"]["adet"]>=5){
                document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";
                document.getElementById("ten").innerHTML = "";
                document.getElementById("five").innerHTML = "";
              }
              if(myObj["1"]["adet"]<5){
                document.getElementById("one").innerHTML = "kasada yeterli bozukluk yok";
                document.getElementById("ten").innerHTML = "";
                document.getElementById("five").innerHTML = "";
              }
            }
            if (i==1) { // 10 lira okutulduğunda
              if(myObj["5"]["adet"]>=1 && myObj["1"]["adet"]>=5){
                document.getElementById("five").innerHTML = "5 (1 adet 5₺)";
                document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";
                document.getElementById("ten").innerHTML = "";
              }
              if(myObj["5"]["adet"]<1 && myObj["1"]["adet"]>=10){
                document.getElementById("five").innerHTML = "";
                document.getElementById("one").innerHTML = "1 1 1 1 1 1 1 1 1 1 (10 adet 1₺)";
                document.getElementById("ten").innerHTML = "";
              }
              if(myObj["5"]["adet"]>=1 && myObj["1"]["adet"]<5){
                document.getElementById("five").innerHTML = "5 5 (2 adet 5₺)";
                document.getElementById("one").innerHTML = "";
                document.getElementById("ten").innerHTML = "";
              }

              document.getElementById("five").innerHTML = "5 (1 adet 5₺)";
              document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";

            }
            if (i==2) { // 20 lira okutulduğunda

              if(myObj["10"]["adet"]<1 && myObj["5"]["adet"]>=3){
                document.getElementById("five").innerHTML = "5 5 5 (3 adet 5₺)";
                document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";
                document.getElementById("ten").innerHTML = "";
              }
              if(myObj["10"]["adet"]>=1 && myObj["5"]["adet"]<2){
                document.getElementById("five").innerHTML = "5 (1 adet 5₺)";
                document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";
                document.getElementById("ten").innerHTML = "10 (1 adet 10₺)";
              }
              if(myObj["10"]["adet"]<1 && myObj["5"]["adet"]<1 && myObj["1"]["adet"]>=20){
                document.getElementById("one").innerHTML = "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 (20 adet 1₺)";
                document.getElementById("ten").innerHTML = "";
                document.getElementById("five").innerHTML = "";
              }

              document.getElementById("ten").innerHTML = "10 (1 adet 10₺)";
              document.getElementById("five").innerHTML = "5 (1 adet 5₺)";
              document.getElementById("one").innerHTML = "1 1 1 1 1 (5 adet 1₺)";
            }
            if(i==3){
              document.getElementById("one").innerHTML = "tanımlanamayan para";
              document.getElementById("five").innerHTML = "";
              document.getElementById("ten").innerHTML = "";
            }

            this.infoTexts[i].style.fontWeight = 'bold';
          } else {

            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (exampleCount[i] > 0) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} örnek - ${res.confidences[i] * 100}%`
          }
        }
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

window.addEventListener('load', () => new Main());
