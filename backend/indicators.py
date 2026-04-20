import pandas as pd
import pandas_ta as ta

def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula indicadores técnicos comunes usando la biblioteca pandas-ta.
    """
    # Asegurarse de que el índice sea temporal
    df.index = pd.to_datetime(df.index)
    
    # RSI (Relative Strength Index)
    df['rsi'] = ta.rsi(df['Close'], length=14)
    
    # MACD (Moving Average Convergence Divergence)
    macd = ta.macd(df['Close'], fast=12, slow=26, signal=9)
    df = pd.concat([df, macd], axis=1)
    
    # EMAs (Exponential Moving Averages)
    df['ema_20'] = ta.ema(df['Close'], length=20)
    df['ema_50'] = ta.ema(df['Close'], length=50)
    
    # Bandas de Bollinger
    bbands = ta.bbands(df['Close'], length=20, std=2)
    df = pd.concat([df, bbands], axis=1)
    
    return df

def get_latest_indicators(df: pd.DataFrame) -> dict:
    """
    Retorna los valores más recientes de los indicadores calculados.
    """
    latest = df.iloc[-1]
    return {
        "price": float(latest['Close']),
        "rsi": float(latest['rsi']),
        "macd": float(latest['MACD_12_26_9']),
        "macd_signal": float(latest['MACDs_12_26_9']),
        "ema_20": float(latest['ema_20']),
        "ema_50": float(latest['ema_50']),
        "bb_upper": float(latest['BBU_20_2.0']),
        "bb_lower": float(latest['BBL_20_2.0'])
    }
