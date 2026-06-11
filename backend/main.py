import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import clientes, orcamentos
import backend.models.clientes
import backend.models.orcamentos

# criando api
app = FastAPI(title="Fino Ajuste API", version="1.0.0")

# cria tabelas no db automaticamente
Base.metadata.create_all(bind=engine)

# permite que o frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(orcamentos.router)

# inicia o servidor
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)