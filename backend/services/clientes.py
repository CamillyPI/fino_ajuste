from backend.schemas.clientes import ClienteCreate, ClienteUpdate, ClienteResponse
from backend.models.clientes import Clientes
from sqlalchemy.orm import Session

def create_cliente(db: Session, cliente: ClienteCreate) -> Clientes:

    db_cliente = Clientes(**cliente.model_dump())
    
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)

    return db_cliente


def get_cliente(db: Session, cliente_id: int) -> Clientes | None:

    return db.query(Clientes).filter(Clientes.id == cliente_id).first()


def get_clientes(db: Session):

    return db.query(Clientes).order_by(Clientes.id.desc()).all()


def update_cliente(db: Session, cliente_id: int, cliente: ClienteUpdate) -> Clientes | None:
    
    db_cliente = get_cliente(db, cliente_id)
    
    if db_cliente is None:
        return None
    
    for key, value in cliente.model_dump(exclude_unset=True).items():
        setattr(db_cliente, key, value)
    
    db.commit()
    db.refresh(db_cliente)
    
    return db_cliente


def delete_cliente(db: Session, cliente_id: int) -> None:
    
    db_cliente = get_cliente(db, cliente_id)
    
    if db_cliente:
        db.delete(db_cliente)
        db.commit()
    
    else:
        raise ValueError("Cliente não encontrado")