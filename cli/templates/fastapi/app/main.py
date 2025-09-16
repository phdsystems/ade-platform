from fastapi import FastAPI
import os
app = FastAPI(title=os.getenv("SERVICE_NAME","{serviceName}"))
@app.get("/health")
async def health(): return {"status":"ok"}
