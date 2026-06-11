from sqlalchemy import Column, String, Integer, ForeignKey
from .clientes import Clientes
from backend.database import Base

class Orcamentos(Base):
    __tablename__ = "orcamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    cor = Column(String(50))
    material = Column(String(50))
    corte = Column(String(50))
    quadril = Column(String(10))
    ombros = Column(String(10))
    comp_tronco = Column(String(10))
    comp_perna = Column(String(10))
    comp_bracos = Column(String(10))