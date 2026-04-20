from typing import Dict
import pandas as pd

def apply_strategy(indicators: dict) -> Dict:
    """
    Aplica una estrategia de trading simple basada en indicadores técnicos.
    Estrategia: Cruce de EMA + RSI.
    """
    rsi = indicators['rsi']
    price = indicators['price']
    ema_20 = indicators['ema_20']
    ema_50 = indicators['ema_50']
    
    action = "HOLD"
    confidence = 0.5
    reasoning = []

    # Lógica de compra
    if price > ema_20 and ema_20 > ema_50 and rsi < 70:
        action = "BUY"
        confidence = 0.8
        reasoning.append("Precio por encima de EMA 20 y tendencia alcista (EMA 20 > 50).")
        if rsi < 30:
            reasoning.append("RSI indica condiciones de sobreventa.")
            confidence = 0.9
    
    # Lógica de venta
    elif price < ema_20 and ema_20 < ema_50 and rsi > 30:
        action = "SELL"
        confidence = 0.8
        reasoning.append("Precio por debajo de EMA 20 y tendencia bajista (EMA 20 < 50).")
        if rsi > 70:
            reasoning.append("RSI indica condiciones de sobrecompra.")
            confidence = 0.9

    return {
        "action": action,
        "confidence": confidence,
        "reasoning": " ".join(reasoning) if reasoning else "Mercado en consolidación lateral.",
        "risk_level": "MEDIUM" if confidence < 0.8 else "LOW"
    }
