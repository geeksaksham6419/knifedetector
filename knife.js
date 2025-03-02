import React, { useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Button } from "@/components/ui/button";

export default function KnifeDetector() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState("");
  const fileInputRef = useRef(null);
  let model;

  const loadModel = async () => {
    model = await mobilenet.load();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        classifyImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async (imageSrc) => {
    if (!model) {
      await loadModel();
    }
    const img = document.createElement("img");
    img.src = imageSrc;
    img.onload = async () => {
      const tensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
      const predictions = await model.classify(tensor);
      const isKnife = predictions.some((p) => p.className.toLowerCase().includes("knife"));
      setPrediction(isKnife ? "It's a Knife" : "It's not a Knife");
    };
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-xl font-bold mb-4">Knife Detector</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
      <Button onClick={() => fileInputRef.current.click()} className="mb-4">Upload Image</Button>
      {image && <img src={image} alt="Uploaded" className="max-w-xs mt-4 rounded-lg" />}
      {prediction && <p className="mt-4 text-lg font-semibold">{prediction}</p>}
    </div>
  );
}
