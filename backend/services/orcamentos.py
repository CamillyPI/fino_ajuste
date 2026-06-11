from backend.schemas.orcamentos import OrcamentoCreate, OrcamentoUpdate
from backend.models.orcamentos import Orcamentos
from sqlalchemy.orm import Session

def create_orcamento(db: Session, orcamento: OrcamentoCreate) -> Orcamentos:
    db_orcamento = Orcamentos(**orcamento.model_dump())
    db.add(db_orcamento)
    db.commit()
    db.refresh(db_orcamento)
    return db_orcamento

def get_orcamento(db: Session, orcamento_id: int) -> Orcamentos | None:
    return db.query(Orcamentos).filter(Orcamentos.id == orcamento_id).first()

def get_orcamentos(db: Session):
    return db.query(Orcamentos).order_by(Orcamentos.id.desc()).all()

def update_orcamento(db: Session, orcamento_id: int, orcamento: OrcamentoUpdate) -> Orcamentos | None:
    db_orcamento = get_orcamento(db, orcamento_id)
    if db_orcamento is None:
        return None
    for key, value in orcamento.model_dump(exclude_unset=True).items():
        setattr(db_orcamento, key, value)
    db.commit()
    db.refresh(db_orcamento)
    return db_orcamento

def delete_orcamento(db: Session, orcamento_id: int) -> None:
    db_orcamento = get_orcamento(db, orcamento_id)
    if db_orcamento:
        db.delete(db_orcamento)
        db.commit()
    else:
        raise ValueError("Orçamento não encontrado")
