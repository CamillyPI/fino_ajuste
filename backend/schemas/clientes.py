from pydantic import BaseModel
from typing import Optional

class ClienteBase(BaseModel):
    nome_completo: str
    cpf: str
    contato: str
    cep: str
    rua: str
    numero: str
    bairro: str
    cidade: str
    pais: str

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome_completo: Optional[str] = None
    cpf: Optional[str] = None
    contato: Optional[str] = None
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    pais: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: int

    class Config:
        from_attributes = True