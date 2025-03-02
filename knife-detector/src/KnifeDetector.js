import React, { useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

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
        setPrediction(""); // Reset prediction when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!model) {
      await loadModel();
    }
    if (!image) return;

    const img = document.createElement("img");
    img.src = image;
    img.onload = async () => {
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();

      const predictions = await model.classify(tensor);
      console.log(predictions); // Debug output

      const isKnife = predictions.some((p) => 
        p.className.toLowerCase().includes("knife") ||
        p.className.toLowerCase().includes("cleaver") ||
        p.className.toLowerCase().includes("dagger") ||
        p.className.toLowerCase().includes("blade")
      );

      setPrediction(isKnife ? "It's a Knife" : "It's not a Knife");
    };
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f3f4f6" }}>
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", textAlign: "center", width: "400px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Knife Detector</h1>
        <p style={{ color: "#4b5563", marginBottom: "20px" }}>Please select an image to analyze</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {!image && (
          <button
            onClick={() => fileInputRef.current.click()}
            style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}
          >
            Choose File
          </button>
        )}
        {image && (
          <>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
              <img src={image} alt="Uploaded" style={{ width: "300px", height: "300px", objectFit: "contain", borderRadius: "10px", border: "1px solid #e5e7eb" }} />
            </div>
            <button
              onClick={classifyImage}
              style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#16a34a", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}
            >
              Analyze Image
            </button>
          </>
        )}
        {prediction && <p style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold" }}>{prediction}</p>}
      </div>
    </div>
  );
}
