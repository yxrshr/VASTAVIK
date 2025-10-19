import React, { useState, useRef } from "react";
import {
  Upload,
  AlertTriangle,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  FileIcon,
} from "lucide-react";

const DeepfakeDetectionInterface = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Demo result for visualization purposes
  const demoResult = {
    isDeepfake: true,
    confidenceScore: 87.5,
    heatmapUrl: "/api/placeholder/500/400",
    originalUrl: "/api/placeholder/500/400",
    processingTime: "2.3 seconds",
    anomalies: [
      {
        region: "Knee Joint",
        confidence: 92.4,
        description: "Inconsistent texture patterns",
      },
      {
        region: "Upper Knee",
        confidence: 85.2,
        description: "Abnormal edge characteristics",
      },
    ],
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFile(file);

    // Create preview for supported image types
    if (file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // const analyzeImage = () => {
  //   setIsAnalyzing(true);

  //   // Simulate API call with timeout
  //   setTimeout(() => {
  //     setIsAnalyzing(false);
  //     setResult(demoResult);
  //   }, 3000);
  // };

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/download-report/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "deepfake_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const resetDetection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        VASTAVIK - Medical Image Deepfake Detection
      </h1>

      {!file ? (
        <div
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            Drag and drop your medical image here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports JPEG, PNG, and DICOM formats
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Select File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept="image/jpeg,image/png,image/jpg,.dcm"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel - Original image */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h2 className="font-medium text-gray-700">Original Upload</h2>
            </div>
            <div className="p-4 flex justify-center items-center bg-gray-50 h-80">
              {preview ? (
                <img
                  src={preview}
                  alt="Original upload"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <p className="text-gray-500">
                  Preview not available for this file type
                </p>
              )}
            </div>
            <div className="p-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Filename: {file.name}</p>
              <p className="text-sm text-gray-600">
                File size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>

          {/* Right panel - Analysis results */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h2 className="font-medium text-gray-700">Analysis Results</h2>
            </div>

            {isAnalyzing ? (
              <div className="p-4 flex flex-col justify-center items-center h-80 bg-gray-50">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 font-medium">Analyzing image...</p>
                <p className="text-gray-500 text-sm mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : result ? (
              <div className="flex flex-col h-full">
                <div className="p-4 bg-gray-50 flex-grow">
                  <div
                    className={`rounded-md p-3 mb-4 flex items-center ${
                      result.isDeepfake
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {result.isDeepfake ? (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          Potential Deepfake Detected!
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          Image appears authentic
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-1">
                      Confidence Score:
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          result.isDeepfake ? "bg-red-600" : "bg-green-600"
                        }`}
                        style={{ width: `${result.confidenceScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">0%</span>
                      <span className="text-xs font-medium text-gray-700">
                        {result.confidenceScore}%
                      </span>
                      <span className="text-xs text-gray-500">100%</span>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-700 mb-2">
                    Detected Anomalies:
                  </h3>
                  {result.anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 bg-white rounded border border-gray-200"
                    >
                      <p className="text-sm font-medium">{anomaly.region}</p>
                      <p className="text-xs text-gray-600">
                        {anomaly.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {anomaly.confidence}%
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-100 border-t flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Processing time: {result.processingTime}
                  </div>
                  <button
                    onClick={downloadReport}
                    className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex flex-col justify-center items-center h-80 bg-gray-50">
                <Info className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-700">
                  Click "Analyze" to begin detection
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="col-span-1 lg:col-span-2 flex justify-center gap-4 mt-2">
            {!result && !isAnalyzing ? (
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={analyzeImage}
              >
                Analyze Image
              </button>
            ) : (
              <button
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                onClick={resetDetection}
              >
                Reset & Upload New Image
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          About Medical Image Deepfake Detection
        </h3>
        <p className="text-sm text-gray-600">
          This tool uses advanced AI to detect manipulated or synthetically
          generated medical images. The system analyzes image characteristics,
          pixel patterns, and anatomical inconsistencies that may not be visible
          to the human eye.
        </p>
        <div className="mt-3 flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-600">
            <span className="font-medium">Important:</span> This is a decision
            support tool and should be used alongside professional medical
            judgment. All results should be verified by qualified healthcare
            professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetectionInterface;
