from fastapi import FastAPI

from .routers import projects, users

app = FastAPI()
app.include_router(projects.router)
app.include_router(users.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
