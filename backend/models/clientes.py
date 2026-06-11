from sqlalchemy import Column, String, Date, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Clientes(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(100))
    cpf = Column(String(14))
    contato = Column(String(20))
    cep = Column(String(8))
    rua = Column(String(200))
    numero = Column(String(20))
    bairro = Column(String(100))
    cidade = Column(String(100))
    pais = Column(String(50))