from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO detection model
model = YOLO("best.pt")

@app.post("/analyze/")
async def analyze_image(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))

    # Run detection
    results = model(image)

    detections = []
    for box in results[0].boxes:
        cls_id = int(box.cls.item())
        conf = float(box.conf.item()) * 100
        label = model.names[cls_id]  # e.g. "real" or "fake"
        detections.append({
            "label": label,
            "confidence": round(conf, 2)
        })

    # If at least one fake detected → mark deepfake
    is_deepfake = any(d["label"].lower() == "fake" for d in detections)
    avg_confidence = round(sum(d["confidence"] for d in detections) / len(detections), 2) if detections else 0

    return {
        "isDeepfake": is_deepfake,
        "confidenceScore": avg_confidence,
        "processingTime": "0.5 seconds",
        "anomalies": detections
    }
