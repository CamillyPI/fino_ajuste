from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.schemas.clientes import ClienteCreate, ClienteUpdate, ClienteResponse
from backend.services import clientes as clientes_service
from backend.database import get_db

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.get("/", response_model=list[ClienteResponse])
def get_clientes(db: Session = Depends(get_db)):
    
    return clientes_service.get_clientes(db=db)


@router.post("/", response_model=ClienteResponse, status_code=201)
def create_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    
    return clientes_service.create_cliente(db=db, cliente=cliente)


@router.get("/{cliente_id}", response_model=ClienteResponse)
def get_cliente(cliente_id: int, db: Session = Depends(get_db)):
    
    db_cliente = clientes_service.get_cliente(db=db, cliente_id=cliente_id)
    
    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return db_cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def update_cliente(cliente_id: int, cliente: ClienteUpdate, db: Session = Depends(get_db)):
    
    db_cliente = clientes_service.update_cliente(db=db, cliente_id=cliente_id, cliente=cliente)
    
    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    return db_cliente


@router.delete("/{cliente_id}", status_code=204)
def delete_cliente(cliente_id: int, db: Session = Depends(get_db)):

    db_cliente = clientes_service.get_cliente(db=db, cliente_id=cliente_id)

    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    clientes_service.delete_cliente(db=db, cliente_id=cliente_id)

    return