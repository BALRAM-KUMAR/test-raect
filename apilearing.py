3. Request and Response Handling in FastAPI

FastAPI makes handling requests and responses easy by allowing you to work with:

Path Parameters (/items/{id})

Query Parameters (/items?name=xyz)

Request Body (sending JSON data in POST, PUT, etc.)

Response Models (to structure and validate responses)



---

1️⃣ Path Parameters (Dynamic URLs)

Path parameters are used when we need to pass data as part of the URL.

Example: Get an item by ID

from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

✅ Explanation:

{item_id} in the route makes it a dynamic path.

FastAPI automatically converts item_id into an integer (int).

Example request: GET /items/10 → Response: {"item_id": 10}



---

2️⃣ Query Parameters (Optional Parameters)

Query parameters are passed after the ? in the URL (/items?name=abc).

Example: Search items by name and price

@app.get("/items")
async def search_items(name: str = None, price: float = None):
    return {"name": name, "price": price}

✅ Example requests:

GET /items?name=laptop&price=50000 → {"name": "laptop", "price": 50000}

GET /items (no params) → {"name": null, "price": null}



---

3️⃣ Request Body (Sending JSON Data in POST)

When creating or updating data, we need to send a JSON request body. FastAPI uses Pydantic for validation.

Example: Creating an Item

from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool

@app.post("/items")
async def create_item(item: Item):
    return {"message": "Item created", "data": item}

✅ Example Request (POST /items)

{
    "name": "Laptop",
    "price": 50000,
    "in_stock": true
}

✅ Response

{
    "message": "Item created",
    "data": {
        "name": "Laptop",
        "price": 50000,
        "in_stock": true
    }
}

🚀 FastAPI automatically validates the request body using Pydantic. If a required field is missing or incorrect, FastAPI returns an error.


---

4️⃣ Response Models (Defining API Response Format)

You can control the response format using Pydantic models.

Example: Define a response model

from fastapi import Response

class ItemResponse(BaseModel):
    name: str
    price: float

@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    return {"name": "Laptop", "price": 50000, "extra_field": "ignored"}

✅ Response (GET /items/1)

{
    "name": "Laptop",
    "price": 50000
}

🚀 FastAPI automatically removes unwanted fields (extra_field is ignored).


---

🔥 Summary

✔ Path Parameters → /items/{id} (used for required data in URL)
✔ Query Parameters → /items?name=abc (optional filtering/sorting)
✔ Request Body → Used in POST/PUT (sends structured JSON data)
✔ Response Models → Control API response format

Let me know if you want examples with a database or more details! 🚀

