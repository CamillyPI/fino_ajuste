from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.schemas.orcamentos import OrcamentoCreate, OrcamentoUpdate, OrcamentoResponse
from backend.schemas.clientes import ClienteCreate, ClienteResponse
from backend.services import orcamentos as orcamentos_service
from backend.services import clientes as clientes_service
from backend.database import get_db

router = APIRouter(prefix="/orcamentos", tags=["orcamentos"])

@router.get("/", response_model=list[OrcamentoResponse])
def get_orcamentos(db: Session = Depends(get_db)):

    return orcamentos_service.get_orcamentos(db=db)


@router.post("/", response_model=OrcamentoResponse, status_code=201)
def create_orcamento(orcamento: OrcamentoCreate, db: Session = Depends(get_db)):
    
    return orcamentos_service.create_orcamento(db=db, orcamento=orcamento)


@router.get("/{orcamento_id}", response_model=OrcamentoResponse)
def get_orcamento(orcamento_id: int, db: Session = Depends(get_db)):
    
    db_orcamento = orcamentos_service.get_orcamento(db=db, orcamento_id=orcamento_id)
    
    if db_orcamento is None:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    
    return db_orcamento

@router.put("/{orcamento_id}", response_model=OrcamentoResponse)
def update_orcamento(orcamento_id: int, orcamento: OrcamentoUpdate, db: Session = Depends(get_db)):
    
    db_orcamento = orcamentos_service.update_orcamento(db=db, orcamento_id=orcamento_id, orcamento=orcamento)
    
    if db_orcamento is None:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    
    return db_orcamento


@router.delete("/{orcamento_id}", status_code=204)
def delete_orcamento(orcamento_id: int, db: Session = Depends(get_db)):
    
    db_orcamento = orcamentos_service.get_orcamento(db=db, orcamento_id=orcamento_id)
    
    if db_orcamento is None:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    
    orcamentos_service.delete_orcamento(db=db, orcamento_id=orcamento_id)
    
    return
