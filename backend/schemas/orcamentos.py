from pydantic import BaseModel
from typing import Optional

class OrcamentoBase(BaseModel):
    cor: str
    material: str
    corte: str
    quadril: str
    ombros: str
    comp_tronco: str
    comp_perna: str
    comp_bracos: str

class OrcamentoCreate(OrcamentoBase):
    cliente_id: int

class OrcamentoUpdate(BaseModel):
    cor: Optional[str] = None
    material: Optional[str] = None
    corte: Optional[str] = None
    quadril: Optional[str] = None
    ombros: Optional[str] = None
    comp_tronco: Optional[str] = None
    comp_perna: Optional[str] = None
    comp_bracos: Optional[str] = None

class OrcamentoResponse(OrcamentoBase):
    id: int
    cliente_id: int

    class Config:
        from_attributes = True