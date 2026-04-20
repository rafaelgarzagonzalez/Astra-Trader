import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import yfinance as yf
from datetime import datetime, timedelta

# Importaciones locales (asumiendo estructura de módulos)
from indicators import calculate_indicators, get_latest_indicators
from strategies import apply_strategy

app = FastAPI(
    title="AstroTrader API",
    description="API para bot de trading con análisis técnico e IA",
    version="1.0.0"
)

# Modelos de Datos
class MarketData(BaseModel):
    symbol: str
    price: float
    timestamp: datetime

class IndicatorResponse(BaseModel):
    symbol: str
    indicators: dict

class RecommendationResponse(BaseModel):
    symbol: str
    price: float
    action: str
    confidence: float
    reasoning: str
    risk_level: str

# Endpoints Principales

@app.get("/")
async def root():
    return {"status": "online", "message": "AstroTrader AI Python Backend is running."}

@app.get("/api/v1/ticker/{symbol}", response_model=IndicatorResponse)
async def get_ticker(symbol: str):
    """
    Obtiene datos en tiempo real y calcula indicadores técnicos.
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1d", interval="5m")
        
        if df.empty:
            raise HTTPException(status_code=404, detail="Symbol not found or no data available")
            
        df_with_indicators = calculate_indicators(df)
        latest = get_latest_indicators(df_with_indicators)
        
        return {
            "symbol": symbol,
            "indicators": latest
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/recommendation/{symbol}", response_model=RecommendationResponse)
async def get_recommendation(symbol: str):
    """
    Genera una recomendación de inversión basada en la estrategia definida.
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="5d", interval="1h")
        
        if df.empty:
            raise HTTPException(status_code=404, detail="Symbol not found")
            
        df_with_indicators = calculate_indicators(df)
        latest = get_latest_indicators(df_with_indicators)
        
        decision = apply_strategy(latest)
        
        return {
            "symbol": symbol,
            "price": latest["price"],
            **decision
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/history/{symbol}")
async def get_history(
    symbol: str, 
    period: str = Query("1mo", description="Periodo de tiempo (1d, 5d, 1mo, 1y, etc.)"),
    interval: str = Query("1h", description="Intervalo de velas (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, etc.)")
):
    """
    Retorna datos históricos en formato JSON para visualización.
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found")
            
        # Limpiar datos para JSON
        df.reset_index(inplace=True)
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # En producción, usar variables de entorno para puerto y host
    uvicorn.run(app, host="0.0.0.0", port=8000)
